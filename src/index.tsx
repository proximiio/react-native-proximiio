import React, { useEffect, useState, PropsWithChildren } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
const { ProximiioNative } = NativeModules;

import {
  ProximiioContextType,
  ProximiioInitState,
  ProximiioFloor,
  ProximiioGeofence,
  ProximiioDepartment,
  ProximiioPlace,
  ProximiioLocation,
} from './types';

export enum BufferSize {
  MINI = 0,
  SMALL = 1,
  MEDIUM = 2,
  LARGE = 3,
  XLARGE = 4,
}

export enum NotificationMode {
  Disabled = 0,
  Enabled = 1,
  Required = 2,
}

export enum NativeAccuracy {
  Cellular = 1,
  WIFI = 2,
  GPS = 3,
  Navigation = 4,
}

export enum ProximiioEvents {
  Initialized = 'ProximiioInitialized',
  PositionUpdated = 'ProximiioPositionUpdated',
  FloorChanged = 'ProximiioFloorChanged',
  ItemsChanged = 'ProximiioItemsChanged',
  EnteredGeofence = 'ProximiioEnteredGeofence',
  ExitedGeofence = 'ProximiioExitedGeofence',
  EnteredPrivacyZone = 'ProximiioEnteredPrivacyZone',
  ExitedPrivacyZone = 'ProximiioExitedPrivacyZone',
  FoundIBeacon = 'ProximiioFoundIBeacon',
  UpdatedIBeacon = 'ProximiioUpdatedIBeacon',
  LostIBeacon = 'ProximiioLostIBeacon',
  FoundEddystoneBeacon = 'ProximiioFoundEddystoneBeacon',
  UpdatedEddystoneBeacon = 'ProximiioUpdatedEddystoneBeacon',
  LostEddystoneBeacon = 'ProximiioLostEddystoneBeacon',
}

export class Proximiio {
  emitter: NativeEventEmitter = new NativeEventEmitter(ProximiioNative);
  state: ProximiioInitState = {
    ready: true,
    visitorId: '',
  };

  location?: ProximiioLocation;
  floor?: ProximiioFloor;
  level = 0;

  constructor() {
    this.authorize = this.authorize.bind(this);
    this.getContext = this.getContext.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  isAuthorized() {
    return this.state.visitorId.length > 0;
  }

  async authorize(token: string): Promise<ProximiioInitState> {
    const state = await ProximiioNative.authWithToken(token);
    this.state.ready = true;
    this.state.visitorId = state.visitorId;
    this.subscribe(
      ProximiioEvents.PositionUpdated,
      (location: ProximiioLocation) => {
        this.location = location;
      }
    );

    this.subscribe(ProximiioEvents.FloorChanged, (floor?: ProximiioFloor) => {
      this.floor = floor;
      this.level = floor?.level || 0;
    });
    return state;
  }

  async currentFloor(): Promise<ProximiioFloor> {
    return await ProximiioNative.currentFloor();
  }

  async currentGeofences(): Promise<ProximiioGeofence[]> {
    return await ProximiioNative.currentGeofences();
  }

  getContext = () => {
    return {
      location: this.location,
      floor: this.floor,
      level: this.floor?.level,
    } as ProximiioContextType;
  };

  departments(): Promise<ProximiioDepartment[]> {
    return ProximiioNative.getDepartments();
  }

  getDepartment(id: string): Promise<ProximiioDepartment> {
    return ProximiioNative.getDepartment(id);
  }

  getFloor(id: string): Promise<ProximiioFloor | null> {
    return ProximiioNative.getFloor(id);
  }

  floors(): Promise<ProximiioFloor[]> {
    return ProximiioNative.getFloors();
  }

  getGeofence(id: string): Promise<ProximiioGeofence | null> {
    return ProximiioNative.getGeofence(id);
  }

  geofences(): Promise<ProximiioGeofence[]> {
    return ProximiioNative.getGeofences();
  }

  getPlace(id: string): Promise<ProximiioPlace | null> {
    return ProximiioNative.getPlace(id);
  }

  places(): Promise<ProximiioPlace[]> {
    return ProximiioNative.getPlaces();
  }

  setBufferSize(buffer: BufferSize) {
    if (Platform.OS === 'ios') {
      ProximiioNative.setBufferSize(buffer);
    }
  }

  requestPermissions() {
    if (Platform.OS === 'ios') {
      ProximiioNative.requestPermissions(false);
    }
  }

  onPermissionResult(granted: boolean) {
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

  subscribe(event: string, fn: (data: any) => void): any {
    if (event) {
      return this.emitter.addListener(event, fn);
    } else {
      // console.warn(`ignored native emitter subscribe request, event: ${event}, fn: ${fn.toString()}`);
    }
  }

  unsubscribe(event: string, fn: (data: any) => void): any {
    if (event) {
      return this.emitter.removeListener(event, fn);
    } else {
      // console.warn(`ignored native emitter unsubscribe request, event: ${event}, fn: ${fn.toString()}`);
    }
  }

  setNotificationMode(mode: NotificationMode) {
    if (Platform.OS === 'android') {
      ProximiioNative.setNotificationMode(mode);
    }
  }

  setNotificationTitle(title: string) {
    if (Platform.OS === 'android') {
      ProximiioNative.setNotificationTitle(title);
    }
  }

  setNotificationText(text: string) {
    if (Platform.OS === 'android') {
      ProximiioNative.setNotificationText(text);
    }
  }

  setNotificationIcon(icon: string) {
    if (Platform.OS === 'android') {
      ProximiioNative.setNotificationIcon(icon);
    }
  }

  setPdr(enabled: boolean, pdrCorrectionThreshold: number) {
    ProximiioNative.setPdr(enabled, pdrCorrectionThreshold);
  }

  setSnapToRoute(enabled: boolean, pdrCorrectionThreshold: number) {
    ProximiioNative.setSnapToRoute(enabled, pdrCorrectionThreshold);
  }

  updateOptions() {
    if (Platform.OS === 'android') {
      ProximiioNative.updateOptions();
    }
  }

  setNativeAccuracy(accuracy: NativeAccuracy) {
    ProximiioNative.setNativeAccuracy(accuracy);
  }

  destroy(erase: boolean) {
    if (Platform.OS === 'android') {
      ProximiioNative.destroy(erase);
    } else {
      ProximiioNative.destroy();
    }
  }
}

const instance = new Proximiio();
export default instance;

export {
  ProximiioContextType,
  ProximiioInitState,
  ProximiioFloor,
  ProximiioGeofence,
  ProximiioDepartment,
  ProximiioPlace,
  ProximiioLocation,
};

export const ProximiioContext = React.createContext(instance.getContext());

export const ProximiioContextProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const [context, setContext] = useState({} as ProximiioContextType);

  useEffect(() => {
    const contextSetter = () => {
      setContext(instance.getContext());
    };

    instance.subscribe(ProximiioEvents.PositionUpdated, contextSetter);
    instance.subscribe(ProximiioEvents.FloorChanged, contextSetter);

    return () => {
      instance.unsubscribe(ProximiioEvents.PositionUpdated, contextSetter);
      instance.unsubscribe(ProximiioEvents.FloorChanged, contextSetter);
    };
  }, []);

  return (
    <ProximiioContext.Provider value={context}>
      {children}
    </ProximiioContext.Provider>
  );
};
