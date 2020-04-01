import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
const { ProximiioNative } = NativeModules;
import { ProximiioContextProvider, ProximiioContext } from './context';

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

    this.subscribe(ProximiioEvents.FloorChanged, (floor: ProximiioFloor) => {
      this.floor = floor;
      this.level = floor.level;
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
    ProximiioNative.requestPermissions();
  }

  enable() {
    if (Platform.OS === 'ios') {
      ProximiioNative.enable();
    }
  }

  disable() {
    if (Platform.OS === 'ios') {
      ProximiioNative.disable();
    }
  }

  subscribe(event: string, fn: (data: any) => void) {
    return this.emitter.addListener(event, fn);
  }

  unsubscribe(event: string, fn: (data: any) => void) {
    return this.emitter.removeListener(event, fn);
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

  updateOptions() {
    if (Platform.OS === 'android') {
      ProximiioNative.updateOptions();
    }
  }

  setNativeAccuracy(accuracy: NativeAccuracy) {
    ProximiioNative.setNativeAccuracy(accuracy);
  }

  destroy(erase: boolean) {
    ProximiioNative.destroy(erase);
  }
}

const instance = new Proximiio();
export default instance;

export {
  ProximiioContext,
  ProximiioContextProvider,
  ProximiioContextType,
  ProximiioInitState,
  ProximiioFloor,
  ProximiioGeofence,
  ProximiioDepartment,
  ProximiioPlace,
  ProximiioLocation,
};
