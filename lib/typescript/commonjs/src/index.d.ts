import React, { type PropsWithChildren } from 'react';
import { NativeEventEmitter, type EmitterSubscription } from 'react-native';
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
    ItemsChanged = "ProximiioItemsChanged",
    EnteredGeofence = "ProximiioEnteredGeofence",
    ExitedGeofence = "ProximiioExitedGeofence",
    EnteredPrivacyZone = "ProximiioEnteredPrivacyZone",
    ExitedPrivacyZone = "ProximiioExitedPrivacyZone",
    FoundIBeacon = "ProximiioFoundIBeacon",
    UpdatedIBeacon = "ProximiioUpdatedIBeacon",
    LostIBeacon = "ProximiioLostIBeacon",
    FoundEddystoneBeacon = "ProximiioFoundEddystoneBeacon",
    UpdatedEddystoneBeacon = "ProximiioUpdatedEddystoneBeacon",
    LostEddystoneBeacon = "ProximiioLostEddystoneBeacon"
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
    requestPermissions(useBluetooth?: boolean): void;
    checkAndRequestBluetooth(): Promise<void>;
    isBluetoothEnabled(): Promise<boolean>;
    onPermissionResult(granted: boolean): void;
    enable(): void;
    disable(): void;
    subscribe(event: string, fn: (data: any) => void): EmitterSubscription | undefined;
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
export type ProximiioInitState = {
    ready: boolean;
    visitorId: string;
    location?: ProximiioLocation;
};
export type FlatCoordinates = [number, number];
export type ProximiioDepartment = {
    id: string;
    name: string;
    floor_id: string;
    floor: ProximiioFloor;
    place_id: string;
    place: ProximiioPlace;
};
export type ProximiioFloor = {
    id: string;
    name: string;
    anchors: FlatCoordinates[];
    place_id: string;
    place: ProximiioPlace;
    level: number;
};
export type ProximiioPlace = {
    id: string;
    name: string;
    address: string;
    location: ProximiioLocation;
};
export type ProximiioGeofence = {
    id: string;
    name: string;
    isPolygon: boolean;
    location: ProximiioLocation;
};
export type ProximiioLocation = {
    lng: number;
    lat: number;
    sourceType?: string;
    accuracy?: number;
};
export type ProximiioInput = {
    id: string;
    name: string;
    type: 'iBeacon' | 'eddystone' | 'custom';
    department_id: string;
    floor_id: string;
    place_id: string;
    triggersFloorChange: boolean;
    triggersPlaceChange: boolean;
    uuid?: string;
    major?: number;
    minor?: number;
    namespaceId?: string;
    instanceId?: string;
};
export interface ProximiioContextType {
    location?: ProximiioLocation;
    floor?: ProximiioFloor;
    level?: number;
}
export declare const ProximiioContext: React.Context<ProximiioContextType>;
export declare const ProximiioContextProvider: ({ children, }: PropsWithChildren<{}>) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map