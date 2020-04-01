package com.reactnativeproximiio;

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.*
import java.util.concurrent.CopyOnWriteArrayList

import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class RNProximiioReactModule internal constructor(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener, ActivityEventListener {
    private val options: ProximiioOptions
    private var proximiioAPI: ProximiioAPI? = null
    private var emitter: DeviceEventManagerModule.RCTDeviceEventEmitter? = null
    private val reactContext: ReactApplicationContext
    private var authPromise: Promise? = null
    private var lastFloor: ProximiioFloor? = null
    private val geofences: MutableList<ProximiioGeofence> = CopyOnWriteArrayList()

    @ReactMethod
    fun setNotificationMode(mode: Int) {
        options.notificationMode = ProximiioOptions.NotificationMode.fromInt(mode)
    }

    @ReactMethod
    fun setNotificationTitle(title: String?) {
        options.notificationTitle = title
    }

    @ReactMethod
    fun setNotificationText(text: String?) {
        options.notificationText = text
    }

    @ReactMethod
    fun setNotificationIcon(icon: String?) {
        val identifier: Int = reactContext.getResources().getIdentifier(icon, "drawable", reactContext.getPackageName())
        if (identifier != 0) {
            options.notificationIcon = identifier
        }
    }

    @ReactMethod
    fun updateOptions() {
        if (proximiioAPI != null) {
            proximiioAPI!!.updateNotificationOptions(options)
        }
    }

    @ReactMethod
    fun setNativeAccuracy(accuracy: Int) {
        if (proximiioAPI != null) {
            proximiioAPI!!.setNativeAccuracy(ProximiioApplication.NativeAccuracy.fromInt(accuracy))
        }
    }

    @ReactMethod
    fun requestPermissions() {
    }

    @ReactMethod
    fun currentFloor(promise: Promise) {
        if (lastFloor == null) {
            promise.resolve(null)
        } else {
            promise.resolve(convertFloor(lastFloor))
        }
    }

    @ReactMethod
    fun currentGeofences(promise: Promise) {
        val converted: WritableArray = Arguments.createArray()
        for (geofence in geofences) {
            converted.pushMap(convertArea(geofence))
        }
        promise.resolve(converted)
    }

    private fun convertLocation(lat: Double, lon: Double, accuracy: Double, type: ProximiioGeofence.EventType?): WritableMap {
        val map: WritableMap = Arguments.createMap()
        map.putDouble("lat", lat)
        map.putDouble("lng", lon)
        map.putDouble("accuracy", accuracy)
        if (type != null) {
            var typeString = ""
            typeString = if (type == ProximiioGeofence.EventType.NATIVE) {
                "native"
            } else if (type == ProximiioGeofence.EventType.BEACON) {
                "beacon"
            } else if (type == ProximiioGeofence.EventType.TRILATERATED) {
                "trilaterated"
            } else if (type == ProximiioGeofence.EventType.INDOORATLAS) {
                "indooratlas"
            } else if (type == ProximiioGeofence.EventType.DISCONNECT) {
                "disconnect"
            } else if (type == ProximiioGeofence.EventType.CUSTOM) {
                "custom"
            } else {
                "unknown"
            }
            map.putString("sourceType", typeString)
        }
        return map
    }

    private fun convertArea(area: ProximiioArea): WritableMap {
        val map: WritableMap = Arguments.createMap()
        map.putString("id", area.id)
        map.putString("name", area.name)
        map.putMap("area", convertLocation(area.lat, area.lon, area.radius, null))
        map.putDouble("radius", area.radius)
        map.putBoolean("isPolygon", area.polygon != null)
        if (area.polygon != null) {
            val polygon: WritableArray = Arguments.createArray()
            for (i in area.polygon!!.indices) {
                val coords: WritableArray = Arguments.createArray()
                coords.pushDouble(area.polygon!![i][0])
                coords.pushDouble(area.polygon!![i][1])
                polygon.pushArray(coords)
            }
            map.putArray("polygon", polygon)
        }
        return map
    }

    private fun convertDevice(device: ProximiioBLEDevice): WritableMap {
        val map: WritableMap = Arguments.createMap()
        val inputMap: WritableMap = Arguments.createMap()
        val input = device.input
        if (device.getType() == ProximiioInput.InputType.IBEACON) {
            val beacon = device as ProximiioIBeacon
            map.putString("uuid", beacon.uuid)
            map.putString("type", "ibeacon")
            map.putString("identifier", beacon.uuid + "/" + beacon.major + "/" + beacon.minor)
            map.putInt("major", beacon.major)
            map.putInt("minor", beacon.minor)
            if (beacon != null && beacon.distance != null) {
                map.putDouble("accuracy", beacon.distance)
            } else {
                map.putDouble("accuracy", 50.0)
            }
            inputMap.putString("type", "ibeacon")
        } else if (device.getType() == ProximiioInput.InputType.EDDYSTONE) {
            val beacon = device as ProximiioEddystone
            map.putString("type", "eddystone")
            map.putString("namespace", beacon.namespace)
            map.putString("instanceId", beacon.instanceID)
            map.putString("identifier", beacon.namespace + "/" + beacon.instanceID)
            inputMap.putString("type", "eddystone")
        } else if (device.getType() == ProximiioInput.InputType.GENERIC_BLE ||
                device.getType() == ProximiioInput.InputType.CUSTOM) {
            inputMap.putString("type", "custom")
        }
        if (input != null) {
            inputMap.putString("id", input.id)
            inputMap.putString("name", input.name)
        }
        map.putMap("input", inputMap)
        return map
    }

    private fun convertFloor(floor: ProximiioFloor?): Any {
        val map: WritableMap = Arguments.createMap()
        if (floor != null) {
            map.putString("id", floor.id)
            map.putString("name", floor.name)
            if (floor.floorNumber != null) {
                map.putInt("level", floor.floorNumber)
            } else {
                map.putInt("level", 0)
            }
            if (floor.place != null) {
                map.putString("place_id", floor.place!!.id)
            }
            if (floor.floorPlanURL != null) {
                map.putString("floorplan", floor.floorPlanURL)
            }
            if (floor.anchors != null) {
                val anchors: WritableArray = Arguments.createArray()
                for (i in floor.anchors!!.indices) {
                    val coords: WritableArray = Arguments.createArray()
                    coords.pushDouble(floor.anchors!![i][0])
                    coords.pushDouble(floor.anchors!![i][1])
                    anchors.pushArray(coords)
                }
                map.putArray("anchors", anchors)
            } else {
                map.putArray("anchors", Arguments.createArray())
            }
        }
        return map
    }

    @ReactMethod
    fun authWithToken(auth: String?, promise: Promise?) {
        authPromise = promise
        if (proximiioAPI != null) {
            proximiioAPI!!.setActivity(null)
            proximiioAPI!!.onStop()
        }
        proximiioAPI = ProximiioAPI(TAG, reactContext, options)
        proximiioAPI!!.setListener(object : ProximiioListener() {
            override fun positionExtended(lat: Double, lon: Double, accuracy: Double, type: ProximiioGeofence.EventType?) {
                sendEvent(EVENT_POSITION_UPDATED, convertLocation(lat, lon, accuracy, type))
            }

            override fun changedFloor(floor: ProximiioFloor?) {
                lastFloor = floor
                sendEvent(EVENT_FLOOR_CHANGED, convertFloor(floor))
            }

            override fun geofenceEnter(geofence: ProximiioGeofence) {
                if (!geofences.contains(geofence)) {
                    geofences.add(geofence)
                }
                sendEvent(EVENT_GEOFENCE_ENTER, convertArea(geofence))
            }

            override fun geofenceExit(geofence: ProximiioGeofence, dwellTime: Long?) {
                val map: WritableMap = convertArea(geofence)
                if (dwellTime != null) {
                    map.putInt("dwellTime", dwellTime.toInt())
                } else {
                    map.putNull("dwellTime")
                }
                if (geofences.contains(geofence)) {
                    geofences.remove(geofence)
                }
                sendEvent(EVENT_GEOFENCE_EXIT, map)
            }

            override fun privacyZoneEnter(area: ProximiioArea) {
                sendEvent(EVENT_PRIVACY_ZONE_ENTER, convertArea(area))
            }

            override fun privacyZoneExit(area: ProximiioArea) {
                sendEvent(EVENT_PRIVACY_ZONE_EXIT, convertArea(area))
            }

            override fun foundDevice(device: ProximiioBLEDevice, registered: Boolean) {
                val map: WritableMap = convertDevice(device)
                if (device.getType() == ProximiioInput.InputType.IBEACON) {
                    sendEvent(EVENT_FOUND_IBEACON, map)
                } else if (device.getType() == ProximiioInput.InputType.EDDYSTONE) {
                    sendEvent(EVENT_FOUND_EDDYSTONE, map)
                }
            }

            override fun lostDevice(device: ProximiioBLEDevice, registered: Boolean) {
                val map: WritableMap = convertDevice(device)
                if (device.getType() == ProximiioInput.InputType.IBEACON) {
                    sendEvent(EVENT_LOST_IBEACON, map)
                } else if (device.getType() == ProximiioInput.InputType.EDDYSTONE) {
                    sendEvent(EVENT_LOST_EDDYSTONE, map)
                }
            }

            override fun loggedIn(online: Boolean, auth: String) {
                if (authPromise != null && online) {
                    val map: WritableMap = Arguments.createMap()
                    map.putString("visitorId", proximiioAPI!!.visitorID)
                    authPromise.resolve(map)
                    val initMap: WritableMap = Arguments.createMap()
                    initMap.putString("visitorId", proximiioAPI!!.visitorID)
                    initMap.putBoolean("ready", true)
                    sendEvent(EVENT_INITIALIZED, initMap)
                }
            }

            override fun loginFailed(error: LoginError) {
                if (authPromise != null) {
                    if (error == LoginError.LOGIN_FAILED) {
                        authPromise.reject("403", "Proximi.io authorization failed")
                    } else {
                        authPromise.reject("404", "Proximi.io connection failed")
                    }
                }
            }
        })
        proximiioAPI!!.setAuth(auth!!, true)
        trySetActivity()
        proximiioAPI!!.onStart()
    }

    @ReactMethod
    fun destroy(eraseData: Boolean) {
        if (proximiioAPI != null) {
            proximiioAPI!!.onStop()
            proximiioAPI!!.destroy()
        }
        destroyService(eraseData)
    }

    @ReactMethod
    fun destroyService(eraseData: Boolean) {
        if (proximiioAPI != null) {
            proximiioAPI!!.destroyService(eraseData)
            proximiioAPI = null
        }
    }

    fun onHostResume() {
        if (proximiioAPI != null) {
            trySetActivity()
            proximiioAPI!!.onStart()
        }
    }

    fun onHostPause() {
        if (proximiioAPI != null) {
            proximiioAPI!!.setActivity(null)
            proximiioAPI!!.onStop()
        }
    }

    fun onHostDestroy() {
        if (proximiioAPI != null) {
            proximiioAPI!!.destroy()
        }
    }

    fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String?>, grantResults: IntArray) {
        if (proximiioAPI != null) {
            proximiioAPI!!.onRequestPermissionsResult(requestCode, permissions, grantResults)
        }
        // super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    val name: String
        get() = "ProximiioNative"

    val constants: Map<String, Any>?
        get() {
            val constants = HashMap<String, Any>()
            for (mode in ProximiioOptions.NotificationMode.values()) {
                constants["NOTIFICATION_MODE_$mode"] = mode.toInt()
            }
            return constants
        }

    private fun sendEvent(event: String, data: Any) {
        if (emitter == null) {
            emitter = reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        }
        emitter.emit(event, data)
    }

    private fun trySetActivity() {
        val activity: Activity = getCurrentActivity()
        if (activity != null) {
            proximiioAPI!!.setActivity(activity)
        }
    }

    fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (proximiioAPI != null) {
            proximiioAPI!!.onActivityResult(requestCode, resultCode, data)
        }
    }

    fun onNewIntent(intent: Intent?) {}

    companion object {
        private const val TAG = "ProximiioReact"
        private const val EVENT_INITIALIZED = "ProximiioInitialized"
        private const val EVENT_POSITION_UPDATED = "ProximiioPositionUpdated"
        private const val EVENT_FLOOR_CHANGED = "ProximiioFloorChanged"
        private const val EVENT_GEOFENCE_ENTER = "ProximiioEnteredGeofence"
        private const val EVENT_GEOFENCE_EXIT = "ProximiioExitedGeofence"
        private const val EVENT_PRIVACY_ZONE_ENTER = "ProximiioEnteredPrivacyZone"
        private const val EVENT_PRIVACY_ZONE_EXIT = "ProximiioExitedPrivacyZone"
        private const val EVENT_FOUND_IBEACON = "ProximiioFoundIBeacon"
        private const val EVENT_LOST_IBEACON = "ProximiioLostIBeacon"
        private const val EVENT_FOUND_EDDYSTONE = "ProximiioFoundEddystoneBeacon"
        private const val EVENT_LOST_EDDYSTONE = "ProximiioLostEddystoneBeacon"
    }

    init {
        this.reactContext = reactContext
        reactContext.addLifecycleEventListener(this)
        reactContext.addActivityEventListener(this)
        options = ProximiioOptions()
    }
}
