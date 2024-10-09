package com.proximiio

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import java.util.Arrays

class ProximiioPackage : ReactPackage {
  private var proximiioModule: RNProximiioReactModule? = null

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
      if (proximiioModule == null) {
        proximiioModule = RNProximiioReactModule(reactContext);
      }
      return Arrays.asList<NativeModule>(proximiioModule)
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
