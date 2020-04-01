package com.reactnativeproximiio

import java.util.Arrays
import java.util.Collections

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.bridge.JavaScriptModule

class ProximiioPackage : ReactPackage {
    val proximiioModule: ProximiioModule
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        if (proximiioModule == null) {
          proximiioModule = RNProximiioReactModule(reactContext);
        }
        return Arrays.asList<NativeModule>(proximiioModule)
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList<ViewManager<*, *>>()
    }

    // public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
    //   if (proximiioModule != null) {
    //       proximiioModule.onRequestPermissionsResult(requestCode, permissions, grantResults);
    //   }
    // }
}

z
