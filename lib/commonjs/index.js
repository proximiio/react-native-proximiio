"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ProximiioEvents = exports.ProximiioContextProvider = exports.ProximiioContext = exports.Proximiio = exports.NotificationMode = exports.NativeAccuracy = exports.BufferSize = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _jsxRuntime = require("react/jsx-runtime");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const {
  ProximiioNative
} = _reactNative.NativeModules;
let BufferSize = exports.BufferSize = /*#__PURE__*/function (BufferSize) {
  BufferSize[BufferSize["MINI"] = 0] = "MINI";
  BufferSize[BufferSize["SMALL"] = 1] = "SMALL";
  BufferSize[BufferSize["MEDIUM"] = 2] = "MEDIUM";
  BufferSize[BufferSize["LARGE"] = 3] = "LARGE";
  BufferSize[BufferSize["XLARGE"] = 4] = "XLARGE";
  return BufferSize;
}({});
let NotificationMode = exports.NotificationMode = /*#__PURE__*/function (NotificationMode) {
  NotificationMode[NotificationMode["Disabled"] = 0] = "Disabled";
  NotificationMode[NotificationMode["Enabled"] = 1] = "Enabled";
  NotificationMode[NotificationMode["Required"] = 2] = "Required";
  return NotificationMode;
}({});
let NativeAccuracy = exports.NativeAccuracy = /*#__PURE__*/function (NativeAccuracy) {
  NativeAccuracy[NativeAccuracy["Cellular"] = 1] = "Cellular";
  NativeAccuracy[NativeAccuracy["WIFI"] = 2] = "WIFI";
  NativeAccuracy[NativeAccuracy["GPS"] = 3] = "GPS";
  NativeAccuracy[NativeAccuracy["Navigation"] = 4] = "Navigation";
  return NativeAccuracy;
}({});
let ProximiioEvents = exports.ProximiioEvents = /*#__PURE__*/function (ProximiioEvents) {
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
class Proximiio {
  emitter = new _reactNative.NativeEventEmitter(ProximiioNative);
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
    if (_reactNative.Platform.OS === 'ios') {
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
    if (_reactNative.Platform.OS === 'android') {
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
    if (_reactNative.Platform.OS === 'android') {
      ProximiioNative.setNotificationMode(mode);
    }
  }
  setNotificationTitle(title) {
    if (_reactNative.Platform.OS === 'android') {
      ProximiioNative.setNotificationTitle(title);
    }
  }
  setNotificationText(text) {
    if (_reactNative.Platform.OS === 'android') {
      ProximiioNative.setNotificationText(text);
    }
  }
  setNotificationIcon(icon) {
    if (_reactNative.Platform.OS === 'android') {
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
    if (_reactNative.Platform.OS === 'android') {
      ProximiioNative.updateOptions();
    }
  }
  setNativeAccuracy(accuracy) {
    ProximiioNative.setNativeAccuracy(accuracy);
  }
  destroy(erase) {
    if (_reactNative.Platform.OS === 'android') {
      ProximiioNative.destroy(erase);
    } else {
      ProximiioNative.destroy();
    }
  }
}
exports.Proximiio = Proximiio;
const instance = new Proximiio();
var _default = exports.default = instance;
const ProximiioContext = exports.ProximiioContext = /*#__PURE__*/_react.default.createContext(instance.getContext());
const ProximiioContextProvider = ({
  children
}) => {
  const [context, setContext] = (0, _react.useState)({});
  (0, _react.useEffect)(() => {
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
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(ProximiioContext.Provider, {
    value: context,
    children: children
  });
};
exports.ProximiioContextProvider = ProximiioContextProvider;
//# sourceMappingURL=index.js.map