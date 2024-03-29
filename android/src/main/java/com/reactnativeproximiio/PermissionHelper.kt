package com.reactnativeproximiio

import android.Manifest
import android.app.Activity
import android.bluetooth.BluetoothAdapter
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import io.proximi.proximiiolibrary.ProximiioAPI
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import io.proximi.proximiiolibrary.ProximiioAPI.BLUETOOTH_REQUEST
import io.proximi.proximiiolibrary.ProximiioAPI.BLUETOOTH_REQUEST_S

private const val TAG = "PermissionHelper"

class PermissionHelper {

  private var alreadyChecked = false

  fun onCreate() {
    alreadyChecked = false
  }

  fun checkAndRequest(activity: Activity, permissionListener: PermissionListener, force: Boolean = false, useBluetooth: Boolean = true) {
    if (hasLocationPermission(activity) && useBluetooth) {
      if (isBluetoothEnabled()) {
        return
      } else {
        checkAndRequestBluetooth(activity)
      }
    }

    if (!alreadyChecked || force) {
      alreadyChecked = true
      checkAndRequestLocationPermission(activity, permissionListener, useBluetooth)
    }
  }

  fun onPermissionResult(activity: Activity, permissions: Array<out String>, grantResults: IntArray) {
    val locationPermissionIndex = permissions.indexOfFirst { it == Manifest.permission.ACCESS_FINE_LOCATION }
    if (locationPermissionIndex == -1) return
//    if (grantResults[locationPermissionIndex] == PackageManager.PERMISSION_GRANTED) {
//      //      checkAndRequestBluetooth(activity)
//    }
  }

  private fun checkAndRequestLocationPermission(activity: Activity, permissionListener: PermissionListener, useBluetooth: Boolean = true) {
    Log.d("PermissionHelper", "checkAndRequestLocationPermission: $useBluetooth")
    if (!hasLocationPermission(activity)) {
      (activity as PermissionAwareActivity).requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), ProximiioAPI.PERMISSION_REQUEST, permissionListener);
    } else {
      if (useBluetooth) {
        Log.d("PermissionHelper", "bluetooth requested, checking and requesting")
        Log.d("PermissionHelper", "checkAndRequestBluetooth call3")
        checkAndRequestBluetooth(activity)
      }
    }
  }

  /**
   * Check if bluetooth is enabled and request to enable it if not.
   */
  fun checkAndRequestBluetooth(mainActivity: Activity) {
    Log.d("PermissionHelper", "checkAndRequestBluetooth called")
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      if (ActivityCompat.checkSelfPermission(
          mainActivity,
          Manifest.permission.BLUETOOTH_SCAN
        ) != PackageManager.PERMISSION_GRANTED
      ) {
        ActivityCompat.requestPermissions(
          mainActivity,
          arrayOf(
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.BLUETOOTH_CONNECT
          ),
          BLUETOOTH_REQUEST_S
        )
        return
      }

      if (!isBluetoothEnabled()) {
        ActivityCompat.startActivityForResult(
          mainActivity,
          Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE),
          BLUETOOTH_REQUEST,
          null
        )
      }
    } else {
      if (!isBluetoothEnabled()) {
        ActivityCompat.startActivityForResult(
          mainActivity,
          Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE),
          BLUETOOTH_REQUEST,
          null
        )
        return
      }
    }
  }

  private fun hasLocationPermission(activity: Activity): Boolean {
    return ActivityCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
  }

  fun isBluetoothEnabled(): Boolean {
    return BluetoothAdapter.getDefaultAdapter()?.isEnabled == true
  }
}
