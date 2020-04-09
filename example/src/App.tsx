import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Proximiio, {
  ProximiioEvents,
  ProximiioFloor,
  ProximiioLocation,
  NativeAccuracy,
  ProximiioGeofence,
  ProximiioInitState,
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

  const onProximiioInit = (state: ProximiioInitState) => {
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
