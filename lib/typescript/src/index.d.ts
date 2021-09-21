import React, { PropsWithChildren } from 'react';
import { NativeEventEmitter } from 'react-native';
import { ProximiioContextType, ProximiioInitState, ProximiioFloor, ProximiioGeofence, ProximiioDepartment, ProximiioPlace, ProximiioLocation } from './types';
export declare enum BufferSize {
    MINI = 0,
    SMALL = 1,
    MEDIUM = 2,
    LARGE = 3,
    XLARGE = 4
}
export declare enum NotificationMode {
    Disabled = 0,
    Enabled = 1,
    Required = 2
}
export declare enum NativeAccuracy {
    Cellular = 1,
    WIFI = 2,
    GPS = 3,
    Navigation = 4
}
export declare enum ProximiioEvents {
    Initialized = "ProximiioInitialized",
    PositionUpdated = "ProximiioPositionUpdated",
    FloorChanged = "ProximiioFloorChanged",
    EnteredGeofence = "ProximiioEnteredGeofence",
    ExitedGeofence = "ProximiioExitedGeofence",
    EnteredPrivacyZone = "ProximiioEnteredPrivacyZone",
    ExitedPrivacyZone = "ProximiioExitedPrivacyZone",
    FoundIBeacon = "ProximiioFoundIBeacon",
    UpdatedIBeacon = "ProximiioUpdatedIBeacon",
    LostIBeacon = "ProximiioLostIBeacon",
    FoundEddystoneBeacon = "ProximiioFoundEddystoneBeacon",
    UpdatedEddystoneBeacon = "ProximiioUpdatedEddystoneBeacon",
    LostEddystoneBeacon = "ProximiioLostEddystoneBeacon",
    ItemsChanged = "ProximiioItemsChanged"
}
export declare class Proximiio {
    emitter: NativeEventEmitter;
    state: ProximiioInitState;
    location?: ProximiioLocation;
    floor?: ProximiioFloor;
    level: number;
    constructor();
    isAuthorized(): boolean;
    authorize(token: string): Promise<ProximiioInitState>;
    currentFloor(): Promise<ProximiioFloor>;
    currentGeofences(): Promise<ProximiioGeofence[]>;
    getContext: () => ProximiioContextType;
    departments(): Promise<ProximiioDepartment[]>;
    getDepartment(id: string): Promise<ProximiioDepartment>;
    getFloor(id: string): Promise<ProximiioFloor | null>;
    floors(): Promise<ProximiioFloor[]>;
    getGeofence(id: string): Promise<ProximiioGeofence | null>;
    geofences(): Promise<ProximiioGeofence[]>;
    getPlace(id: string): Promise<ProximiioPlace | null>;
    places(): Promise<ProximiioPlace[]>;
    setBufferSize(buffer: BufferSize): void;
    requestPermissions(): void;
    onPermissionResult(granted: boolean): void;
    enable(): void;
    disable(): void;
    subscribe(event: string, fn: (data: any) => void): import("react-native").EmitterSubscription;
    unsubscribe(event: string, fn: (data: any) => void): void;
    setNotificationMode(mode: NotificationMode): void;
    setNotificationTitle(title: string): void;
    setNotificationText(text: string): void;
    setNotificationIcon(icon: string): void;
    setPdr(enabled: boolean, pdrCorrectionThreshold: number): void;
    setSnapToRoute(enabled: boolean, pdrCorrectionThreshold: number): void;
    updateOptions(): void;
    setNativeAccuracy(accuracy: NativeAccuracy): void;
    destroy(erase: boolean): void;
}
declare const instance: Proximiio;
export default instance;
export { ProximiioContextType, ProximiioInitState, ProximiioFloor, ProximiioGeofence, ProximiioDepartment, ProximiioPlace, ProximiioLocation, };
export declare const ProximiioContext: React.Context<ProximiioContextType>;
export declare const ProximiioContextProvider: ({ children, }: PropsWithChildren<{}>) => JSX.Element;
