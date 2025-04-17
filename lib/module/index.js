"use strict";

import React, { useEffect, useState } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { jsx as _jsx } from "react/jsx-runtime";
const {
  ProximiioNative
} = NativeModules;
export let BufferSize = /*#__PURE__*/function (BufferSize) {
  BufferSize[BufferSize["MINI"] = 0] = "MINI";
  BufferSize[BufferSize["SMALL"] = 1] = "SMALL";
  BufferSize[BufferSize["MEDIUM"] = 2] = "MEDIUM";
  BufferSize[BufferSize["LARGE"] = 3] = "LARGE";
  BufferSize[BufferSize["XLARGE"] = 4] = "XLARGE";
  return BufferSize;
}({});
export let NotificationMode = /*#__PURE__*/function (NotificationMode) {
  NotificationMode[NotificationMode["Disabled"] = 0] = "Disabled";
  NotificationMode[NotificationMode["Enabled"] = 1] = "Enabled";
  NotificationMode[NotificationMode["Required"] = 2] = "Required";
  return NotificationMode;
}({});
export let NativeAccuracy = /*#__PURE__*/function (NativeAccuracy) {
  NativeAccuracy[NativeAccuracy["Cellular"] = 1] = "Cellular";
  NativeAccuracy[NativeAccuracy["WIFI"] = 2] = "WIFI";
  NativeAccuracy[NativeAccuracy["GPS"] = 3] = "GPS";
  NativeAccuracy[NativeAccuracy["Navigation"] = 4] = "Navigation";
  return NativeAccuracy;
}({});
export let ProximiioEvents = /*#__PURE__*/function (ProximiioEvents) {
  ProximiioEvents["Initialized"] = "ProximiioInitialized";
  ProximiioEvents["PositionUpdated"] = "ProximiioPositionUpdated";
  ProximiioEvents["FloorChanged"] = "ProximiioFloorChanged";
  ProximiioEvents["ItemsChanged"] = "ProximiioItemsChanged";
  ProximiioEvents["EnteredGeofence"] = "ProximiioEnteredGeofence";
  ProximiioEvents["ExitedGeofence"] = "ProximiioExitedGeofence";
  ProximiioEvents["EnteredPrivacyZone"] = "ProximiioEnteredPrivacyZone";
  ProximiioEvents["ExitedPrivacyZone"] = "ProximiioExitedPrivacyZone";
  ProximiioEvents["FoundIBeacon"] = "ProximiioFoundIBeacon";
  ProximiioEvents["UpdatedIBeacon"] = "ProximiioUpdatedIBeacon";
  ProximiioEvents["LostIBeacon"] = "ProximiioLostIBeacon";
  ProximiioEvents["FoundEddystoneBeacon"] = "ProximiioFoundEddystoneBeacon";
  ProximiioEvents["UpdatedEddystoneBeacon"] = "ProximiioUpdatedEddystoneBeacon";
  ProximiioEvents["LostEddystoneBeacon"] = "ProximiioLostEddystoneBeacon";
  return ProximiioEvents;
}({});
export class Proximiio {
  emitter = new NativeEventEmitter(ProximiioNative);
  state = {
    ready: true,
    visitorId: ''
  };
  level = 0;
  constructor() {
    this.authorize = this.authorize.bind(this);
    this.getContext = this.getContext.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }
  isAuthorized() {
    return this.state.visitorId.length > 0;
  }
  async authorize(token) {
    const state = await ProximiioNative.authWithToken(token);
    this.state.ready = true;
    this.state.visitorId = state.visitorId;
    this.subscribe(ProximiioEvents.PositionUpdated, location => {
      this.location = location;
    });
    this.subscribe(ProximiioEvents.FloorChanged, floor => {
      this.floor = floor;
      this.level = floor?.level || 0;
    });
    await new Promise(resolve => {
      setTimeout(async () => {
        this.disable();
        await new Promise(resolve => setTimeout(resolve, 500));
        this.enable();
        resolve(true);
      }, 2500);
    });
    return state;
  }
  async currentFloor() {
    return await ProximiioNative.currentFloor();
  }
  async currentGeofences() {
    return await ProximiioNative.currentGeofences();
  }
  getContext = () => {
    return {
      location: this.location,
      floor: this.floor,
      level: this.floor?.level
    };
  };
  departments() {
    return ProximiioNative.getDepartments();
  }
  getDepartment(id) {
    return ProximiioNative.getDepartment(id);
  }
  getFloor(id) {
    return ProximiioNative.getFloor(id);
  }
  floors() {
    return ProximiioNative.getFloors();
  }
  getGeofence(id) {
    return ProximiioNative.getGeofence(id);
  }
  geofences() {
    return ProximiioNative.getGeofences();
  }
  getPlace(id) {
    return ProximiioNative.getPlace(id);
  }
  places() {
    return ProximiioNative.getPlaces();
  }
  setBufferSize(buffer) {
    if (Platform.OS === 'ios') {
      ProximiioNative.setBufferSize(buffer);
    }
  }
  requestPermissions(useBluetooth = true) {
    ProximiioNative.requestPermissions(false, useBluetooth);
  }
  checkAndRequestBluetooth() {
    return ProximiioNative.checkAndRequestBluetooth();
  }
  isBluetoothEnabled() {
    return ProximiioNative.isBluetoothEnabled();
  }
  onPermissionResult(granted) {
    if (Platform.OS === 'android') {
      ProximiioNative.onPermissionResult(granted ? 1 : 0);
    }
  }
  enable() {
    ProximiioNative.enable();
  }
  disable() {
    ProximiioNative.disable();
  }
  subscribe(event, fn) {
    if (event) {
      return this.emitter.addListener(event, fn);
    } else {
      return;
      // console.warn(`ignored native emitter subscribe request, event: ${event}, fn: ${fn.toString()}`);
    }
  }
  setNotificationMode(mode) {
    if (Platform.OS === 'android') {
      ProximiioNative.setNotificationMode(mode);
    }
  }
  setNotificationTitle(title) {
    if (Platform.OS === 'android') {
      ProximiioNative.setNotificationTitle(title);
    }
  }
  setNotificationText(text) {
    if (Platform.OS === 'android') {
      ProximiioNative.setNotificationText(text);
    }
  }
  setNotificationIcon(icon) {
    if (Platform.OS === 'android') {
      ProximiioNative.setNotificationIcon(icon);
    }
  }
  setPdr(enabled, pdrCorrectionThreshold) {
    ProximiioNative.setPdr(enabled, pdrCorrectionThreshold);
  }
  setSnapToRoute(enabled, pdrCorrectionThreshold) {
    ProximiioNative.setSnapToRoute(enabled, pdrCorrectionThreshold);
  }
  updateOptions() {
    if (Platform.OS === 'android') {
      ProximiioNative.updateOptions();
    }
  }
  setNativeAccuracy(accuracy) {
    ProximiioNative.setNativeAccuracy(accuracy);
  }
  destroy(erase) {
    if (Platform.OS === 'android') {
      ProximiioNative.destroy(erase);
    } else {
      ProximiioNative.destroy();
    }
  }
}
const instance = new Proximiio();
export default instance;
export const ProximiioContext = /*#__PURE__*/React.createContext(instance.getContext());
export const ProximiioContextProvider = ({
  children
}) => {
  const [context, setContext] = useState({});
  useEffect(() => {
    const contextSetter = () => {
      setContext(instance.getContext());
    };
    const positionSub = instance.subscribe(ProximiioEvents.PositionUpdated, contextSetter);
    const floorsSub = instance.subscribe(ProximiioEvents.FloorChanged, contextSetter);
    return () => {
      positionSub?.remove();
      floorsSub?.remove();
    };
  }, []);
  return /*#__PURE__*/_jsx(ProximiioContext.Provider, {
    value: context,
    children: children
  });
};
//# sourceMappingURL=index.js.map