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
  // iBeacon specific
  uuid?: string;
  major?: number;
  minor?: number;
  // Eddystone specific
  namespaceId?: string;
  instanceId?: string;
};

export interface ProximiioContextType {
  location?: ProximiioLocation;
  floor?: ProximiioFloor;
  level?: number;
}
