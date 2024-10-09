---
title: API Reference

language_tabs:
  - objc

toc_footers:
  - <a href='https://proximi.io/'>Proximi.io Website</a>

search: true
---

# Introduction

Welcome to the Proximi.io React Native Library, this library provides indoor positioning support for both IOS and Android platforms.

# Version

Current public version is: `5.3.0`

# Installation

Installation is managed by npm, the library provides autolinking methods to simplify the platform integration.

Run the following inside the project folder to install the library:

```bash
npm install https://github.com/proximiio/react-native-proximiio
```

After the installation is finished, edit the Podfile in ios directory and increase the deployment target at first line:
```
platform :ios, '9.0'
```

to

```
platform :ios, '13.0'
```

After that run "pod install" command in the ios directory

```bash
pod install
```

For IOS its also necessary to configure location permissions

- switch to 'Capabilities' tab, enable 'Background Modes' and enable both 'Location Updates' & 'Uses Bluetooth LE accessories' to allow beacon operation while application is in background
- locate 'Info.plist' file belonging to the project, right-click it and select 'Open As' -> 'Source File'
- copy & paste following lines to the bottom of the Info.plist file, but above the last '/<dict></dict></plist>' lines, modify the text to suit your application

```diff
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Allow Background Location updates for Event triggering while the App is in background</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Allow Location Updates for basic Proximi.io SDK operation</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>Allow always usage for permanent positioning support</string>
<key>NSMotionUsageDescription</key>
<string>Allow motion detection for improved positioning</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>Allow bluetooth for improved beacon operation</string>
```

For android edit your appliction build.gradle file, minSdkVersion needs to be 19 or higher and new repositories need to be added for proper installation.
Since Version 5.0.4, compileSdkVersion and targetSdkVersion need to be 29 at least.
```
...
buildscript {
    ext {
        buildToolsVersion = "28.0.3"
        minSdkVersion = 19
        compileSdkVersion = 29
        targetSdkVersion = 29
    }
...

allprojects {
    repositories {
        ...
        maven {
            url "http://proximi-io.bintray.com/proximiio-android"
        }
        maven {
            url “https://dl.cloudsmith.io/public/indooratlas/mvn-public/maven/”
        }
        maven {
            url 'https://maven.google.com'
        }
    }
}
```

Edit app/src/main/AndroidManifest.xml and set android:allowBackup="true"

# Usage

## General

The library needs to be authenticated at first, in your application you should call the authorize method, once per app start, ideally in componentDidMount method or inside useEffect(() => {}, []) if you use functional components. After authorization is successfuly finished, you can subscribe to various events or fetch data from Proximi.io SDK.

To use the location from the Proximiio.SDK you can either subscribe to ProximiioEvents.ProximiioEvents.PositionUpdated events or use ProximiioContext Provider within your application structure.

This repository contains also an example application showcasing the implementation in simple form.

## Quick Sample usage

```ts
import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Proximiio, {
  ProximiioEvents,
  ProximiioFloor,
  ProximiioLocation,
  NativeAccuracy,
  ProximiioGeofence,
} from 'react-native-proximiio';

const TOKEN = 'insert-proximiio-token-here';

export default function App() {
  const [visitorId, setVisitorId] = React.useState('');
  const [floor, setFloor] = React.useState({} as ProximiioFloor);
  const [location, setLocation] = React.useState({
    lng: 0,
    lat: 0,
    sourceType: '',
  } as ProximiioLocation);
  const [geofences, setGeofences] = React.useState([] as ProximiioGeofence[]);

  const onProximiioInit = (state: any) => {
    setVisitorId(state.visitorId);

    Proximiio.subscribe(ProximiioEvents.FloorChanged, setFloor);

    Proximiio.subscribe(
      ProximiioEvents.PositionUpdated,
      (_location: ProximiioLocation) => setLocation(_location)
    );

    const updateGeofences = async (_geofence: ProximiioGeofence) => {
      const current = await Proximiio.currentGeofences();
      setGeofences(current);
    };

    Proximiio.requestPermissions();
    Proximiio.subscribe(ProximiioEvents.EnteredGeofence, updateGeofences);
    Proximiio.subscribe(ProximiioEvents.ExitedGeofence, updateGeofences);
    Proximiio.setNativeAccuracy(NativeAccuracy.GPS);
  };

  React.useEffect(() => {
    Proximiio.authorize(TOKEN).then(onProximiioInit);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Visitor ID: {visitorId}</Text>
      <Text>Latitude: {location.lat.toFixed(8)}</Text>
      <Text>Longitude: {location.lng.toFixed(8)}</Text>
      <Text>Source: {location.sourceType}</Text>
      <Text>
        Geofences: {geofences.map(geofence => geofence.name).join(', ')}
      </Text>
      <Text>Floor: {floor.name ? floor.name : ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});
```

## ContextProvider example

### Setup provider
In your application component add ProximiioContextProvider to your component tree

```ts
import { ProximiioContextProvider } from 'react-native-proximiio'

export default class App extends React.Component<Props, State> {
  // ...

  render() {
    return (
      <ProximiioContextProvider>
        // ... rest of your application components that will receive proximiio context updates
      </ProximiioContextProvider>
    )
  }
}
```

### Class context consumer example
```ts
export class UserLocationSource extends React.Component<Props, State> {
  static contextType = ProximiioContext

  render() {
    if (!this.context.location) {
      return <Text>Location not available yet</Text>
    }

    return (
      <Text>
        Lat: { this.context.location.lat }
        Lng: { this.context.location.lng }
        Level: { this.context.level }
      </Text>
    )
  }
}
```

### Functional component context consumer example
```ts
export () => {
  const context = useContext(ProximiioContext)

  return (
    <Text>
      Lat: { context.location.lat }
      Lng: { context.location.lng }
      Level: { context.level }
    </Text>
  )
}
```

## Methods

### Proximiio.authorize(token: string) -> void
authorizes Proximi.io SDK

### Proximiio.requestPermissions(useAlways?: boolean) -> void
this method is relevant for IOS only

useAlways parameter is *optional* and defaults to *true*

If your application is fine with "When in Use" permission only, call:
Proximiio.requestPermissions(false);


### Proximiio.enable(): void
enables Proximi.io positioning engine

### Proximiio.disable(): void
disables Proximi.io positioning engine

### Proximiio.currentFloor(): Promise<ProximiioFloor>
returns current ProximiioFloor object

### Proximiio.departments(): Promise<ProximiioDepartment[]>
returns all available departments

### Proximiio.getDepartment(id: string): Promise<ProximiioDepartment>
returns department by id

### Proximiio.floors(): Promise<ProximiioFloor[]>
returns all available floors

### Proximiio.getFloor(id: string): Promise<ProximiioFloor>
returns floor by id

### Proximiio.places(): Promise<ProximiioPlace[]>
returns all available places

### Proximiio.getPlace(id: string): Promise<ProximiioPlace>
returns place by id

### Proximiio.geofences(): Promise<ProximiioGeofence[]>
returns all available geofences

### Proximiio.getGeofence(id: string): Promise<ProximiioGeofence>
returns geofence by id

### Proximiio.getGeofence(id: string): Promise<ProximiioGeofence>
returns geofence by id

### Proximiio.setBufferSize(bufferSize: BufferSize): void (IOS Only)
sets different buffer size
```ts
export enum BufferSize {
  MINI = 0,
  SMALL = 1,
  MEDIUM = 2,
  LARGE = 3,
  XLARGE = 4,
}
```


### Proximiio.setNativeAccuracy(NativeAccuracy) -> void
sets native accuracy threshold, the higher the accuracy, the more sensors are used resulting into
more precise positioning but with larger battery usage.

Note that Cellular and WIFI settings produce more sparse position updates with lower then GPS accuracy

```
export enum NativeAccuracy {
  Cellular = 1,
  WIFI = 2,
  GPS = 3,
  Navigation = 4,
}
```


### Proximiio.setNotificationMode(NotificationMode) -> void (Android Only)
Sets the notification policy of the SDK.

When a notification is displayed, the Proximi.io Service is operating in a foreground service mode. This disables several battery and resource optimizations in Android that target background services, allowing Proximi.io to properly function in background. If you disable the notification, Proximi.io will not be able to function properly in background.

It's recommended to always display a notification, to keep your application transparent to the user, as well as to guarantee a consistent experience across all platforms.

```
Proximiio.setNotificationMode(Proximiio.NotificationModes.Enabled)
// Notification is Enabled

Proximiio.setNotificationMode(Proximiio.NotificationModes.Disabled)
// Notification is Disabled

Proximiio.setNotificationMode(Proximiio.NotificationModes.Required)
// Notification is enabled when running on Android 8 and above. (Please note that previous platforms also apply some limits to background services.)
```

*Note that calling Proximiio.updateOptions() after notification customization is required for the changes to take effect

### Proximiio.setNotificationTitle(String) -> void (Android Only)
Allows you to set custom content to the notification displayed.

Please note that a title, text, and an icon must be supplied for custom notification content to show. When customized notification content is shown, tapping the notification will open the application instead of the settings screen for the application. See Android documentation for more info.

```
Proximiio.setNotificationTitle("Proximi.io Background Service")
```

*Note that calling Proximiio.updateOptions() after notification customization is required for the changes to take effect

### Proximiio.setNotificationText(String) -> void (Android Only)
Allows you to set custom content to the notification displayed.

```
Proximiio.setNotificationText("Allows location interactivity while the application is in background")
```

### Proximiio.setNotificationIcon(String) -> void (Android Only)
Allows you to set custom content to the notification displayed.
The String parameter should contain the name of drawable icon file, this file has to be added in Android Studio as standard drawable image file.

```
Proximiio.setNotificationIcon('ic_notification')
```

*Note that calling Proximiio.updateOptions() after notification customization is required for the changes to take effect

### Proximiio.updateOptions() -> void (Android Only)
Performs notification options update. Call this method once after customizing notifciation title, text or icon.

## Events

### ProximiioEvents.Initialized
called after the Proximi.io finishes the authorization & data initialization, provides
state object containing visitorId

```ts
Proximiio.authorize(TOKEN).then((state: ProximiioInitState) => {
  if (state.ready) {
    console.log(`authorized, visitorId: ${state.visitorId}`)
  }
});
```

### ProximiioEvents.PositionUpdated
called everytime the position is updated, provides ProximiioLocation object

```ts
Proximiio.subscribe(
  ProximiioEvents.PositionUpdated,
  (location: ProximiioLocation) => console.log(`lat: ${location.lat} / lng: ${location.lng}`)
);
```

### ProximiioEvents.FloorChanged
called when floor change was detected by the sdk, provides ProximiioFloor object
```ts
Proximiio.subscribe(
  ProximiioEvents.FloorChanged,
  (floor: ProximiioFloor) => console.log(`floor: ${floor.name} / level: ${floor.level}`)
);
```

### ProximiioEvents.EnteredGeofence
called everytime user enters a geofence, user may be inside multiple geofences at once
```ts
Proximiio.subscribe(
  ProximiioEvents.EnteredGeofence,
  (geofence: ProximiioGeofence) => console.log(`geofence enter: ${geofence.name}`)
);
```

### ProximiioEvents.ExitedGeofence
called everytime user leaves a geofence
```ts
Proximiio.subscribe(
  ProximiioEvents.ExitedGeofence,
  (geofence: ProximiioGeofence) => console.log(`geofence exit: ${geofence.name}`)
);
```

### ProximiioEvents.EnteredPrivacyZone
called everytime user enters a privacy zone, user may be inside multiple privacy zones at once
```ts
Proximiio.subscribe(
  ProximiioEvents.EnteredPrivacyZone,
  (privacyZone: ProximiioPrivacyZone) => console.log(`privacy zone enter: ${privacyZone.name}`)
);
```

### ProximiioEvents.ExitedPrivacyZone
called everytime user leaves a privacy zone
```ts
Proximiio.subscribe(
  ProximiioEvents.ExitedPrivacyZone,
  (privacyZone: ProximiioPrivacyZone) => console.log(`privacy zone exit: ${privacyZone.name}`)
);
```

### ProximiioEvents.FoundIBeacon
called when an ibeacon is detected
```ts
Proximiio.subscribe(
  ProximiioEvents.FoundIBeacon,
  (input: ProximiioInput) => console.log(`ibeacon found: ${input.name}`)
);
```

### ProximiioEvents.UpdatedIBeacon
called when an ibeacon is updated
```ts
Proximiio.subscribe(
  ProximiioEvents.UpdatedIBeacon,
  (input: ProximiioInput) => console.log(`ibeacon updated: ${input.name}`)
);
```

### ProximiioEvents.LostIBeacon
called when an ibeacon is lost from range
```ts
Proximiio.subscribe(
  ProximiioEvents.LostIBeacon,
  (input: ProximiioInput) => console.log(`ibeacon lost: ${input.name}`)
);
```

### ProximiioEvents.FoundEddystoneBeacon
called when an eddystone beacon is detected
```ts
Proximiio.subscribe(
  ProximiioEvents.FoundEddystoneBeacon,
  (input: ProximiioInput) => console.log(`eddystone found: ${input.name}`)
);
```

### ProximiioEvents.UpdatedEddystoneBeacon
called when an eddystone beacon is updated
```ts
Proximiio.subscribe(
  ProximiioEvents.UpdatedEddystoneBeacon,
  (input: ProximiioInput) => console.log(`eddystone updated: ${input.name}`)
);
```

### ProximiioEvents.LostEddystoneBeacon

called when an eddystone beacon is lost from range
```ts
Proximiio.subscribe(
  ProximiioEvents.LostEddystoneBeacon
,
  (input: ProximiioInput) => console.log(`eddystone lost: ${input.name}`)
);
```

