package com.reactnativeproximiio

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.util.Log
import com.facebook.react.bridge.*
import java.util.concurrent.CopyOnWriteArrayList

import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import io.proximi.proximiiolibrary.*
import kotlin.math.acos

class RNProximiioReactModule internal constructor(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener, ActivityEventListener, PermissionListener {
    private val permissionHelper = PermissionHelper()
    private val options: ProximiioOptions
    private var proximiioAPI: ProximiioAPI? = null
    private var emitter: DeviceEventManagerModule.RCTDeviceEventEmitter? = null
    private var authPromise: Promise? = null
    private var lastFloor: ProximiioFloor? = null
    private val geofences: MutableList<ProximiioGeofence> = CopyOnWriteArrayList()
    private val departments: MutableList<ProximiioDepartment> = CopyOnWriteArrayList()
    private val floors: MutableList<ProximiioFloor> = CopyOnWriteArrayList()
    private val places: MutableList<ProximiioPlace> = CopyOnWriteArrayList()
    private var auth: String? = null
    private var pdrEnabled = false

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
        val identifier: Int = reactContext.resources.getIdentifier(icon, "drawable", reactContext.packageName)
        if (identifier != 0) {
            options.notificationIcon = identifier
        }
    }

    @ReactMethod
    fun updateOptions() {
        proximiioAPI?.updateNotificationOptions(options)
    }

    @ReactMethod
    fun setPdr(enable: Boolean, thresholdInMeters: Double) {
      this.pdrEnabled = enable
      proximiioAPI!!.pdrEnabled(enable)
      proximiioAPI!!.pdrCorrectionThreshold(thresholdInMeters)
    }

    @ReactMethod
    fun setSnapToRoute(enable: Boolean, thresholdInMeters: Double) {
      proximiioAPI!!.snapToRouteEnabled(enable)
      proximiioAPI!!.snapToRouteThreshold(thresholdInMeters)
    }

    @ReactMethod
    fun setNativeAccuracy(accuracy: Int) {
        proximiioAPI?.setNativeAccuracy(ProximiioApplication.NativeAccuracy.fromInt(accuracy))
    }

    @ReactMethod
    fun requestPermissions() {
      permissionHelper.checkAndRequest(currentActivity!!, this,true)
    }

    @ReactMethod
    fun currentFloor(promise: Promise) {
        if (lastFloor == null) {
            promise.resolve(null)
        } else {
            promise.resolve(convertFloor(lastFloor)!!)
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

    @ReactMethod
    fun getPlaces(promise: Promise) {
        val converted: WritableArray = Arguments.createArray()
        places.forEach {
            converted.pushMap(this.convertPlace(it))
        }
        promise.resolve(converted)
    }

    @ReactMethod
    fun getFloors(promise: Promise) {
        val converted: WritableArray = Arguments.createArray()
        this.floors.forEach {
            converted.pushMap(this.convertFloor(it)!!)
        }
        promise.resolve(converted)
    }

    @ReactMethod
    fun getDepartments(promise: Promise) {
        val converted: WritableArray = Arguments.createArray()
        departments.forEach {
            converted.pushMap(this.convertDepartment(it))
        }
        promise.resolve(converted)
    }

    private fun convertLocation(lat: Double, lon: Double, accuracy: Double, type: ProximiioGeofence.EventType?): WritableMap {
        val map: WritableMap = Arguments.createMap()
        map.putDouble("lat", lat)
        map.putDouble("lng", lon)
        map.putDouble("accuracy", accuracy)
        if (type != null) {
            val typeString = when (type) {
                ProximiioGeofence.EventType.NATIVE -> {
                    "native"
                }
                ProximiioGeofence.EventType.BEACON -> {
                    "beacon"
                }
                ProximiioGeofence.EventType.STEP -> {
                    "step"
                }
                ProximiioGeofence.EventType.TRILATERATED -> {
                    "trilaterated"
                }
                ProximiioGeofence.EventType.INDOORATLAS -> {
                    "indooratlas"
                }
                ProximiioGeofence.EventType.DISCONNECT -> {
                    "disconnect"
                }
                ProximiioGeofence.EventType.CUSTOM -> {
                    "custom"
                }
                else -> {
                    "unknown"
                }
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
            if (beacon.distance != null) {
                map.putDouble("accuracy", beacon.distance!!)
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

    private fun convertFloor(floor: ProximiioFloor?): ReadableMap? {
        return if (floor != null) {
            val map: WritableMap = Arguments.createMap()
            map.putString("id", floor.id)
            map.putString("name", floor.name)
            if (floor.floorNumber != null) {
                map.putInt("level", floor.floorNumber!!)
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
          map
        } else {
          null
        }
    }

    private fun convertPlace(place: ProximiioPlace?): ReadableMap {
        val map: WritableMap = Arguments.createMap()
        if (place != null) {
            map.putString("id", place.id)
            map.putString("name", place.name)
            val location = Arguments.createMap()
            location.putDouble("lat", place.lat)
            location.putDouble("lng", place.lon)
            map.putMap("location", location)
        }
        return map
    }

    private fun convertDepartment(department: ProximiioDepartment?): ReadableMap {
        val map: WritableMap = Arguments.createMap()
        if (department != null) {
            map.putString("id", department.id)
            map.putString("name", department.name)
            if (department.place != null) {
                map.putString("place_id", department.place!!.id)
            }
            if (department.floor != null) {
                map.putString("floor_id", department.floor!!.id)
            }
        }
        return map
    }

    @ReactMethod
    fun authWithToken(auth: String?, promise: Promise?) {
        if (auth != null) {
            this.auth = auth
        }

        authPromise = promise
        proximiioAPI?.setActivity(null)
        proximiioAPI?.onStop()
        proximiioAPI = ProximiioAPI(TAG, reactContext, options)
        proximiioAPI!!.setListener(object : ProximiioListener() {

            private var itemsLoaded = false

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
                    authPromise!!.resolve(map)
                    val initMap: WritableMap = Arguments.createMap()
                    initMap.putString("visitorId", proximiioAPI!!.visitorID)
                    initMap.putBoolean("ready", true)
                    sendEvent(EVENT_INITIALIZED, initMap)
                }
            }

            override fun addedFloor(floor: ProximiioFloor?) {
                if (floor != null) {
                    floors.add(floor)
                    triggerItemsChangedEvent()
                }
            }

            override fun updatedFloor(floor: ProximiioFloor?) {
                if (floor == null) {
                    return
                }

                val index = floors.indexOfFirst {
                    it.id === floor.id
                }

                if (index >= 0) {
                    floors[index] = floor
                    triggerItemsChangedEvent()
                }
            }

            override fun removedFloor(floor: ProximiioFloor?) {
                if (floor == null) {
                    return
                }

                val index = floors.indexOfFirst {
                    it.id === floor.id
                }

                if (index >= 0) {
                    floors.removeAt(index)
                    triggerItemsChangedEvent()
                }
            }

            override fun addedPlace(place: ProximiioPlace?) {
                if (place != null) {
                    places.add(place)
                    triggerItemsChangedEvent()
                }
            }

            override fun updatedPlace(place: ProximiioPlace?) {
                if (place == null) {
                    return
                }

                val index = places.indexOfFirst {
                    it.id === place.id
                }

                if (index >= 0) {
                    places[index] = place
                    triggerItemsChangedEvent()
                }
            }

            override fun removedPlace(place: ProximiioPlace?) {
                if (place == null) {
                    return
                }

                val index = places.indexOfFirst {
                    it.id === place.id
                }

                if (index >= 0) {
                    places.removeAt(index)
                    triggerItemsChangedEvent()
                }
            }

            override fun addedDepartment(department: ProximiioDepartment?) {
                if (department != null) {
                    departments.add(department)
                    triggerItemsChangedEvent()
                }
            }

            override fun updatedDepartment(department: ProximiioDepartment?) {
                if (department == null) {
                    return
                }

                val index = departments.indexOfFirst {
                    it.id === department.id
                }

                if (index >= 0) {
                    departments[index] = department
                    triggerItemsChangedEvent()
                }
            }

            override fun removedDepartment(department: ProximiioDepartment?) {
                if (department == null) {
                    return
                }

                val index = departments.indexOfFirst {
                    it.id === department.id
                }

                if (index >= 0) {
                    departments[index] = department
                    triggerItemsChangedEvent()
                }
            }

            override fun itemsLoaded() {
              itemsLoaded = true
              sendEvent(EVENT_ITEMS_CHANGED)
            }

            private fun triggerItemsChangedEvent() {
              if (itemsLoaded) {
                sendEvent(EVENT_ITEMS_CHANGED)
              }
            }

            override fun loginFailed(error: LoginError) {
                if (error == LoginError.LOGIN_FAILED) {
                    authPromise?.reject("403", "Proximi.io authorization failed")
                } else {
                    authPromise?.reject("404", "Proximi.io connection failed")
                }
            }
        })
        proximiioAPI!!.setAuth(auth!!, true)
//        proximiioAPI!!.setActivity(currentActivity!!)
        permissionHelper.checkAndRequest(currentActivity!!, this)
//        trySetActivity()
    }

    @ReactMethod
    fun destroy(eraseData: Boolean) {
        proximiioAPI?.onStop()
        proximiioAPI?.destroy()
        destroyService(eraseData)
    }

    @ReactMethod
    fun destroyService(eraseData: Boolean) {
        proximiioAPI?.destroyService(eraseData)
        proximiioAPI = null
    }

    override fun onHostResume() {
        proximiioAPI?.let {
          it.pdrEnabled(pdrEnabled)
          permissionHelper.checkAndRequest(currentActivity!!, this)
        }
    }

    override fun onHostPause() {
        proximiioAPI?.pdrEnabled(false)
        proximiioAPI?.setActivity(null)
        proximiioAPI?.onStop()
    }

    override fun onHostDestroy() {
        proximiioAPI?.destroy()
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray): Boolean {
        proximiioAPI?.onRequestPermissionsResult(requestCode, permissions, grantResults)
        permissionHelper.onPermissionResult(currentActivity!!, permissions, grantResults)
        return true
    }


//    val constants: Map<String, Any>?
//        get() {
//            val constants = HashMap<String, Any>()
//            for (mode in ProximiioOptions.NotificationMode.values()) {
//                constants["NOTIFICATION_MODE_$mode"] = mode.toInt()
//            }
//            return constants
//        }

    private fun sendEvent(event: String, data: Any? = null) {
        if (emitter == null) {
            emitter = reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        }
        emitter!!.emit(event, data)
    }

    @ReactMethod()
    fun enable(promise: Promise) {
        this.authWithToken(this.auth, promise)
    }

    @ReactMethod
    fun disable() {
        proximiioAPI?.destroyService(false)
    }

    @ReactMethod
    fun trySetActivity() {
        (currentActivity as PermissionAwareActivity).requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), ProximiioAPI.PERMISSION_REQUEST, this);
        proximiioAPI?.setActivity(currentActivity)
        proximiioAPI?.onStart()
    }

    @ReactMethod
    fun onPermissionResult(granted: Int) {
        var grantResults = IntArray(1);
        if (proximiioAPI != null) {
            if (granted == 0) {
                grantResults[0] = PackageManager.PERMISSION_DENIED;
            } else {
                grantResults[0] = PackageManager.PERMISSION_GRANTED;
            }
            proximiioAPI!!.onRequestPermissionsResult(ProximiioAPI.PERMISSION_REQUEST, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), grantResults)
        }
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
      proximiioAPI?.onActivityResult(requestCode, resultCode, data)
    }

    override fun onCatalystInstanceDestroy() {
        Log.d("ProximiioModule", "onCatalystInstanceDestroy")
        super.onCatalystInstanceDestroy()
    }

    override fun onNewIntent(intent: Intent?) {}

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
        private const val EVENT_ITEMS_CHANGED = "ProximiioItemsChanged"
    }

    init {
        reactContext.addLifecycleEventListener(this)
        reactContext.addActivityEventListener(this)
        options = ProximiioOptions()
        permissionHelper.onCreate()
    }

    override fun getName(): String {
        return "ProximiioNative"
    }
}
