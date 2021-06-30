package com.reactnativeproximiio

import android.Manifest
import android.app.Activity
import android.bluetooth.BluetoothAdapter
import android.content.Intent
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import io.proximi.proximiiolibrary.ProximiioAPI

import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener

private const val TAG = "PermissionHelper"

class PermissionHelper {

  private var alreadyChecked = false

  fun onCreate() {
    alreadyChecked = false
  }

  fun checkAndRequest(activity: Activity, permissionListener: PermissionListener, force: Boolean = false) {
    if (hasLocationPermission(activity) && isBluetoothEnabled()) {
      return
    }
    if (!alreadyChecked || force) {
      alreadyChecked = true
      checkAndRequestLocationPermission(activity, permissionListener)
    }
  }

  fun onPermissionResult(activity: Activity, permissions: Array<out String>, grantResults: IntArray) {
    val locationPermissionIndex = permissions.indexOfFirst { it == Manifest.permission.ACCESS_FINE_LOCATION }
    if (locationPermissionIndex == -1) return
    if (grantResults[locationPermissionIndex] == PackageManager.PERMISSION_GRANTED) {
      checkAndRequestBluetooth(activity)
    }
  }

  private fun checkAndRequestLocationPermission(activity: Activity, permissionListener: PermissionListener) {
    if (!hasLocationPermission(activity)) {
      (activity as PermissionAwareActivity).requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), ProximiioAPI.PERMISSION_REQUEST, permissionListener);
    } else {
      checkAndRequestBluetooth(activity)
    }
  }

  private fun checkAndRequestBluetooth(activity: Activity) {
    if (!isBluetoothEnabled()) {
      ActivityCompat.startActivityForResult(activity, Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE), ProximiioAPI.BLUETOOTH_REQUEST, null)
    }
  }

  private fun hasLocationPermission(activity: Activity): Boolean {
    return ActivityCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
  }

  private fun isBluetoothEnabled(): Boolean {
    return BluetoothAdapter.getDefaultAdapter()?.isEnabled == true
  }
}
