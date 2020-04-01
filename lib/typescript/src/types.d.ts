export declare type ProximiioInitState = {
    ready: boolean;
    visitorId: string;
    location?: ProximiioLocation;
};
export declare type FlatCoordinates = [number, number];
export declare type ProximiioDepartment = {
    id: string;
    name: string;
    floor_id: string;
    floor: ProximiioFloor;
    place_id: string;
    place: ProximiioPlace;
};
export declare type ProximiioFloor = {
    id: string;
    name: string;
    anchors: FlatCoordinates[];
    place_id: string;
    place: ProximiioPlace;
    level: number;
};
export declare type ProximiioPlace = {
    id: string;
    name: string;
    address: string;
    location: ProximiioLocation;
};
export declare type ProximiioGeofence = {
    id: string;
    name: string;
    isPolygon: boolean;
    location: ProximiioLocation;
};
export declare type ProximiioLocation = {
    lng: number;
    lat: number;
    sourceType?: string;
    accuracy?: number;
};
export declare type ProximiioInput = {
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
