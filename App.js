import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AMAZON_AFFILIATE_TAG = 'YOUR-TAG-20';
// Sovrn Commerce key: tracks AutoZone and Advance Auto Parts links.
const SOVRN_KEY = 'ad1d7954ef97f039e50b0cec744b6d7e';
const SITE_URL = 'https://mechanicmate.site';
const SUPPORT_EMAIL = 'support@mechanicmate.site';
// Wrap a retailer URL in a Sovrn tracked link.
const sovrnLink = (url) =>
  SOVRN_KEY ? `https://redirect.viglink.com/?key=${SOVRN_KEY}&u=${encodeURIComponent(url)}` : url;
const GARAGE_KEY = 'mechanicmate.garage.v1';
const LOG_KEY = 'mechanicmate.log.v1';
const MAKES = [
  'Acura', 'BMW', 'Chevrolet', 'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai',
  'Jeep', 'Kia', 'Mazda', 'Nissan', 'Ram', 'Subaru', 'Toyota', 'Volkswagen',
];
const YEARS = Array.from({ length: 27 }, (_, i) => String(new Date().getFullYear() - i));
const PARTS = [
  ['Brake Pads', '🛑', 'brake pads'],
  ['Brake Rotors', '⚙️', 'brake rotors'],
  ['Oil Filter', '🛢️', 'oil filter'],
  ['Engine Air Filter', '🌬️', 'engine air filter'],
  ['Cabin Air Filter', '❄️', 'cabin air filter'],
  ['Battery', '🔋', 'car battery'],
  ['Spark Plugs', '⚡', 'spark plugs'],
  ['Wiper Blades', '💧', 'windshield wiper blades'],
  ['Serpentine Belt', '➰', 'serpentine belt'],
  ['Headlight Bulb', '💡', 'headlight bulb'],
];
const SERVICES = [
  'Oil change',
  'Tire rotation',
  'Brake service',
  'Air filter',
  'Battery',
  'Wiper blades',
  'Inspection',
];

const cleanVin = (v) => v.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
const label = (v) => (v ? [v.year, v.make, v.model].filter(Boolean).join(' ') : '');
const findVin = (value) => value.toUpperCase().match(/[A-HJ-NPR-Z0-9]{17}/)?.[0] || '';

export default function App() {
  const [tab, setTab] = useState('Home');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mode, setMode] = useState('VIN');
  const [vin, setVin] = useState('');
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [current, setCurrent] = useState(null);
  const [garage, setGarage] = useState([]);
  const [logs, setLogs] = useState([]);
  const [busy, setBusy] = useState(true);
  const [part, setPart] = useState(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [nickname, setNickname] = useState('');
  const [miles, setMiles] = useState('');
  const [service, setService] = useState(SERVICES[0]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [recognizingVin, setRecognizingVin] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [g, l] = await Promise.all([
          AsyncStorage.getItem(GARAGE_KEY),
          AsyncStorage.getItem(LOG_KEY),
        ]);
        if (g) setGarage(JSON.parse(g));
        if (l) setLogs(JSON.parse(l));
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  const persistGarage = async (next) => {
    setGarage(next);
    await AsyncStorage.setItem(GARAGE_KEY, JSON.stringify(next));
  };

  const persistLogs = async (next) => {
    setLogs(next);
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(next));
  };

  const decode = async () => {
    const id = cleanVin(vin);
    if (id.length !== 17) {
      return Alert.alert('Enter all 17 characters', 'A VIN always has 17 letters and numbers.');
    }
    setBusy(true);
    try {
      const r = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${id}?format=json`
      );
      const row = (await r.json()).Results?.[0];
      if (!row?.Make || !row?.Model) throw new Error();
      const vehicle = {
        id: `vin-${id}`,
        vin: id,
        year: row.ModelYear,
        make: row.Make,
        model: row.Model,
        engine: [
          row.DisplacementL && `${row.DisplacementL}L`,
          row.EngineCylinders && `${row.EngineCylinders} cyl`,
          row.EngineModel,
        ]
          .filter(Boolean)
          .join(' '),
        drive: row.DriveType || '',
        nickname: '',
        miles: '',
        verified: true,
      };
      await persistGarage([vehicle, ...garage.filter((v) => v.vin !== id)]);
      setCurrent(vehicle);
      setNickname('');
      setMiles('');
      Alert.alert(
        'Saved to My Garage',
        `${label(vehicle)} is saved. You can add mileage any time from My Garage.`
      );
    } catch {
      Alert.alert(
        'VIN lookup unavailable',
        'Check your connection or enter your vehicle manually.'
      );
    } finally {
      setBusy(false);
    }
  };

  const manual = () => {
    if (!year || !make || !model.trim()) {
      return Alert.alert('Finish your vehicle', 'Choose a year and make, then type the model.');
    }
    setCurrent({
      id: `manual-${Date.now()}`,
      year,
      make,
      model: model.trim(),
      engine: '',
      drive: '',
      verified: false,
    });
    setNickname('');
    setMiles('');
    setSaveOpen(true);
  };

  const saveVehicle = async () => {
    const v = {
      ...current,
      id: `${current.id}-${Date.now()}`,
      nickname: nickname.trim(),
      miles: miles.replace(/\D/g, ''),
    };
    await persistGarage([v, ...garage.filter((x) => !v.vin || x.vin !== v.vin)]);
    setCurrent(v);
    setSaveOpen(false);
  };

  const search = (where) => {
    const q = encodeURIComponent(`${label(current)} ${current?.engine || ''} ${part?.[2]}`);
    const urls = {
      AutoZone: sovrnLink(`https://www.autozone.com/searchresult?searchText=${q}`),
      Advance: sovrnLink(`https://shop.advanceautoparts.com/web/SearchResults?searchTerm=${q}`),
      "O'Reilly": `https://www.oreillyauto.com/search?q=${q}`,
      Amazon: `https://www.amazon.com/s?k=${q}${
        AMAZON_AFFILIATE_TAG === 'YOUR-TAG-20' ? '' : `&tag=${AMAZON_AFFILIATE_TAG}`
      }`,
      YouTube: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${label(current)} ${part?.[2]} replacement how to`
      )}`,
    };
    Linking.openURL(urls[where]);
  };

  const addLog = async () => {
    if (!miles) {
      return Alert.alert('Mileage is needed', 'Enter the odometer reading for this service.');
    }
    const row = {
      id: String(Date.now()),
      vehicleId: current.id,
      service,
      miles: miles.replace(/\D/g, ''),
      date: new Date().toISOString().slice(0, 10),
    };
    await persistLogs([row, ...logs]);
    setMiles('');
    setLogOpen(false);
  };

  const selectVehicle = (v) => {
    setCurrent(v);
    setTab('Home');
  };

  const openMileageEditor = (v) => {
    setEditingVehicle(v);
    setMiles(v.miles || '');
  };

  const updateMileage = async () => {
    const updated = { ...editingVehicle, miles: miles.replace(/\D/g, '') };
    const next = garage.map((v) => (v.id === updated.id ? updated : v));
    await persistGarage(next);
    if (current?.id === updated.id) setCurrent(updated);
    setEditingVehicle(null);
    setMiles('');
  };

  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        return Alert.alert(
          'Camera access is needed',
          'Allow camera access to scan the VIN label, or use Type VIN instead.'
        );
      }
    }
    setScannerOpen(true);
  };

  const onBarcodeScanned = ({ data }) => {
    const scanned = findVin(data);
    if (!scanned) return;
    setScannerOpen(false);
    setMode('VIN');
    setVin(scanned);
    Alert.alert('VIN found', `${scanned}\n\nTap “Look up my vehicle” to confirm it.`);
  };

  const recognizePrintedVin = async () => {
    if (recognizingVin || !cameraRef.current) return;

    const hasNativeOCR = Boolean(requireOptionalNativeModule('RNMLKitTextRecognition'));
    if (!hasNativeOCR) {
      return Alert.alert(
        'Preview Build Required',
        'Printed text OCR requires native MLKit code and runs in your TestFlight / Development build. In Expo Go, scan the barcode on the driver-door jamb label.'
      );
    }

    setRecognizingVin(true);
    try {
      const mlkit = require('@infinitered/react-native-mlkit-text-recognition');
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9, skipProcessing: false });
      const result = await mlkit.recognizeText(photo.uri);
      const scanned = findVin(result.text);

      if (!scanned) {
        return Alert.alert(
          'No VIN found',
          'Hold steady about 6–10 inches away so the text is sharp, center the VIN in the guide, and try again. You can also scan the barcode on the driver-door label.'
        );
      }

      setScannerOpen(false);
      setMode('VIN');
      setVin(scanned);
      Alert.alert('VIN found', `${scanned}\n\nTap “Look up my vehicle” to confirm it.`);
    } catch {
      Alert.alert(
        'Scan failed',
        'Unable to read text from image. Try scanning the barcode on the door jamb instead.'
      );
    } finally {
      setRecognizingVin(false);
    }
  };

  const activeLogs = current ? logs.filter((x) => x.vehicleId === current.id) : [];

  if (busy) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ActivityIndicator color="#F97316" size="large" />
          <Text style={s.muted}>Loading MechanicMate…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const Banner = () =>
    current && (
      <View style={s.banner}>
        <View style={{ flex: 1 }}>
          <Text style={s.bannerTitle}>{current.nickname || label(current)}</Text>
          <Text style={s.bannerSub}>
            {[current.engine, current.drive].filter(Boolean).join(' • ') ||
              (current.verified ? 'VIN verified' : 'Vehicle entered manually')}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setTab('Garage')}>
          <Text style={s.change}>Change</Text>
        </TouchableOpacity>
      </View>
    );

  // --- VIN SCANNER SCREEN ---
  if (scannerOpen) {
    return (
      <View style={s.scannerContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        <CameraView
          ref={cameraRef}
          style={s.camera}
          facing="back"
          onBarcodeScanned={onBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['code39', 'code128', 'pdf417', 'datamatrix'],
          }}
        />

        <View pointerEvents="none" style={s.scannerTopHeader}>
          <Text style={s.scannerTitle}>Scan or capture VIN</Text>
          <Text style={s.scannerText}>
            Point at the dashboard VIN plate or driver-door label.
          </Text>
        </View>

        <View pointerEvents="none" style={s.scannerCenterTarget}>
          <View style={s.scanFrame} />
          <Text style={s.scannerHint}>
            Barcodes scan automatically. For printed text, hold the phone 6–10 inches away, center the VIN in the guide, and tap Capture.
          </Text>
        </View>

        <View style={s.scannerBottomBar}>
          <TouchableOpacity
            style={s.captureButton}
            onPress={recognizePrintedVin}
            disabled={recognizingVin}
          >
            <Text style={s.captureButtonText}>
              {recognizingVin ? 'Reading VIN…' : 'Capture printed VIN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.scannerClose} onPress={() => setScannerOpen(false)}>
            <Text style={s.scannerCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- MAIN APPLICATION SCREEN ---
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.logo}>
            Mechanic<Text style={s.orange}>Mate</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setAboutOpen(true)}
            style={s.aboutBtn}
            accessibilityRole="button"
            accessibilityLabel="About MechanicMate"
          >
            <Text style={s.aboutBtnText}>ⓘ</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.tagline}>Your car-care sidekick</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {tab === 'Home' && (
          <>
            <Text style={s.title}>Find a part with confidence.</Text>
            <Text style={s.sub}>
              Start with your vehicle, then shop or learn how to do the job.
            </Text>
            {current ? (
              <Banner />
            ) : (
              <View style={s.card}>
                <View style={s.segment}>
                  <Segment
                    text="VIN lookup"
                    active={mode === 'VIN'}
                    onPress={() => setMode('VIN')}
                  />
                  <Segment
                    text="Enter vehicle"
                    active={mode === 'Vehicle'}
                    onPress={() => setMode('Vehicle')}
                  />
                </View>
                {mode === 'VIN' ? (
                  <>
                    <Label text="17-CHARACTER VIN" />
                    <TextInput
                      style={s.input}
                      value={vin}
                      onChangeText={(v) => setVin(cleanVin(v))}
                      maxLength={17}
                      autoCapitalize="characters"
                      placeholder="Enter VIN"
                      placeholderTextColor="#64748B"
                    />
                    <TouchableOpacity style={s.scanButton} onPress={openScanner}>
                      <Text style={s.scanButtonText}>⌁  Scan VIN barcode</Text>
                    </TouchableOpacity>
                    <Text style={s.hint}>
                      Scan the barcode on the driver-door label, or type the VIN from the dashboard. We use the free U.S. DOT NHTSA database to identify your vehicle.
                    </Text>
                    <Button text="Look up my vehicle" onPress={decode} />
                  </>
                ) : (
                  <>
                    <Label text="YEAR" />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {YEARS.map((v) => (
                        <Chip key={v} text={v} active={year === v} onPress={() => setYear(v)} />
                      ))}
                    </ScrollView>
                    <Label text="MAKE" />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {MAKES.map((v) => (
                        <Chip key={v} text={v} active={make === v} onPress={() => setMake(v)} />
                      ))}
                    </ScrollView>
                    <Label text="MODEL" />
                    <TextInput
                      style={s.input}
                      value={model}
                      onChangeText={setModel}
                      placeholder="Example: F-150, Camry, CR-V"
                      placeholderTextColor="#64748B"
                    />
                    <Button text="Use this vehicle" onPress={manual} />
                  </>
                )}
              </View>
            )}

            <Text style={s.section}>Popular maintenance parts</Text>
            <View style={s.grid}>
              {PARTS.map((p) => (
                <TouchableOpacity
                  key={p[0]}
                  style={[s.part, !current && s.dim]}
                  disabled={!current}
                  onPress={() => setPart(p)}
                >
                  <Text style={s.partIcon}>{p[1]}</Text>
                  <Text style={s.partText}>{p[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {current && (
              <Text style={s.disclaimer}>
                Search results are a starting point. Always confirm the exact fitment before ordering or installing.
              </Text>
            )}
          </>
        )}

        {tab === 'Garage' && (
          <>
            <Text style={s.title}>My Garage</Text>
            <Text style={s.sub}>Your vehicles stay on this device. No account needed.</Text>
            <Button
              text="Add another vehicle"
              onPress={() => {
                setCurrent(null);
                setTab('Home');
              }}
            />
            {garage.length === 0 ? (
              <Empty
                title="Your garage is empty"
                text="Add a vehicle from the Home tab to save it here."
              />
            ) : (
              garage.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[s.vehicle, current?.id === v.id && s.currentVehicle]}
                  onPress={() => selectVehicle(v)}
                >
                  <Text style={s.vehicleTitle}>{v.nickname || label(v)}</Text>
                  {v.nickname && <Text style={s.vehicleMeta}>{label(v)}</Text>}
                  <Text style={s.vehicleMeta}>
                    {[v.engine, v.drive].filter(Boolean).join(' • ') ||
                      (v.verified ? 'VIN verified' : 'Vehicle entered manually')}
                  </Text>
                  {v.miles && (
                    <Text style={s.vehicleMeta}>{Number(v.miles).toLocaleString()} miles</Text>
                  )}
                  <View style={s.vehicleActions}>
                    <TouchableOpacity onPress={() => openMileageEditor(v)}>
                      <Text style={s.edit}>Edit mileage</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => persistGarage(garage.filter((x) => x.id !== v.id))}
                    >
                      <Text style={s.remove}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {tab === 'Maintenance' && (
          <>
            <Text style={s.title}>Maintenance</Text>
            <Text style={s.sub}>
              {current ? label(current) : 'Choose a vehicle from My Garage to track its service.'}
            </Text>
            {current && (
              <>
                <Banner />
                <Button text="Add service record" onPress={() => setLogOpen(true)} />
                {activeLogs.length ? (
                  activeLogs.map((x) => (
                    <View key={x.id} style={s.log}>
                      <Text style={s.vehicleTitle}>{x.service}</Text>
                      <Text style={s.vehicleMeta}>
                        {x.date} • {Number(x.miles).toLocaleString()} miles
                      </Text>
                    </View>
                  ))
                ) : (
                  <Empty
                    title="No service records yet"
                    text="Add an oil change, brake service, or another job."
                  />
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={s.nav}>
        {['Home', 'Garage', 'Maintenance'].map((x) => (
          <TouchableOpacity key={x} onPress={() => setTab(x)} style={s.navItem}>
            <Text style={[s.navText, tab === x && s.orange]}>{x}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Part Modal */}
      <Modal visible={!!part} transparent animationType="slide" onRequestClose={() => setPart(null)}>
        <KeyboardAvoidingView
          style={s.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.sheet}>
            <Text style={s.modalTitle}>
              {part?.[1]} {part?.[0]}
            </Text>
            <Text style={s.modalSub}>{label(current)}</Text>
            <Text style={s.fit}>
              We’ll open a browser search. Verify exact fitment before buying.
            </Text>
            <Button text="Shop AutoZone" onPress={() => search('AutoZone')} />
            <Button text="Shop Advance Auto Parts" onPress={() => search('Advance')} />
            <Button text="Shop O'Reilly" onPress={() => search("O'Reilly")} />
            <Button text="Shop Amazon" onPress={() => search('Amazon')} />
            <TouchableOpacity style={s.video} onPress={() => search('YouTube')}>
              <Text style={s.videoText}>▶ Watch install videos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.close} onPress={() => setPart(null)}>
              <Text style={s.muted}>Close</Text>
            </TouchableOpacity>
            <Text style={s.disclosureSmall}>
              Some store links may earn us a commission at no extra cost to you.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* About Modal */}
      <Modal visible={aboutOpen} transparent animationType="slide" onRequestClose={() => setAboutOpen(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.modalTitle}>About MechanicMate</Text>
            <Text style={s.aboutText}>
              Find parts for your vehicle, compare where to buy them, and watch how to install them.
            </Text>
            <Text style={s.aboutHeading}>Affiliate disclosure</Text>
            <Text style={s.aboutText}>
              Some store links in this app are affiliate links. If you buy through them, we may earn a
              small commission at no extra cost to you. As an Amazon Associate I earn from qualifying
              purchases.
            </Text>
            <Text style={s.aboutHeading}>Fitment</Text>
            <Text style={s.aboutText}>
              Fitment can vary by trim, engine and options. Always confirm fitment with the retailer
              before you buy.
            </Text>
            <View style={{ height: 8 }} />
            <Button text="Privacy Policy" onPress={() => Linking.openURL(`${SITE_URL}/privacy.html`)} />
            <Button text="Help & Support" onPress={() => Linking.openURL(`${SITE_URL}/support.html`)} />
            <TouchableOpacity style={s.close} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
              <Text style={s.aboutLink}>{SUPPORT_EMAIL}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.close} onPress={() => setAboutOpen(false)}>
              <Text style={s.muted}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Save Vehicle Modal */}
      <Modal visible={saveOpen} transparent animationType="slide" onRequestClose={() => setSaveOpen(false)}>
        <KeyboardAvoidingView
          style={s.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={s.sheet} keyboardShouldPersistTaps="handled">
            <Text style={s.modalTitle}>Save to My Garage</Text>
            <Text style={s.modalSub}>{label(current)}</Text>
            <Label text="NICKNAME (OPTIONAL)" />
            <TextInput
              style={s.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="Example: David's F-150"
              placeholderTextColor="#64748B"
            />
            <Label text="CURRENT MILEAGE (OPTIONAL)" />
            <TextInput
              style={s.input}
              value={miles}
              onChangeText={setMiles}
              keyboardType="number-pad"
              placeholder="Example: 82,500"
              placeholderTextColor="#64748B"
            />
            <Button text="Save vehicle" onPress={saveVehicle} />
            <TouchableOpacity style={s.close} onPress={() => setSaveOpen(false)}>
              <Text style={s.muted}>Not now</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Mileage Editor Modal */}
      <Modal
        visible={!!editingVehicle}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingVehicle(null)}
      >
        <KeyboardAvoidingView
          style={s.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.sheet}>
            <Text style={s.modalTitle}>Update mileage</Text>
            <Text style={s.modalSub}>{label(editingVehicle)}</Text>
            <Label text="CURRENT MILEAGE" />
            <TextInput
              style={s.input}
              value={miles}
              onChangeText={setMiles}
              keyboardType="number-pad"
              placeholder="Example: 82,500"
              placeholderTextColor="#64748B"
            />
            <Button text="Save mileage" onPress={updateMileage} />
            <TouchableOpacity style={s.close} onPress={() => setEditingVehicle(null)}>
              <Text style={s.muted}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Log Service Modal */}
      <Modal visible={logOpen} transparent animationType="slide" onRequestClose={() => setLogOpen(false)}>
        <KeyboardAvoidingView
          style={s.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={s.sheet} keyboardShouldPersistTaps="handled">
            <Text style={s.modalTitle}>Add service record</Text>
            <Label text="SERVICE" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SERVICES.map((x) => (
                <Chip key={x} text={x} active={service === x} onPress={() => setService(x)} />
              ))}
            </ScrollView>
            <Label text="MILEAGE" />
            <TextInput
              style={s.input}
              value={miles}
              onChangeText={setMiles}
              keyboardType="number-pad"
              placeholder="Odometer reading"
              placeholderTextColor="#64748B"
            />
            <Button text="Save record" onPress={addLog} />
            <TouchableOpacity style={s.close} onPress={() => setLogOpen(false)}>
              <Text style={s.muted}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function Button({ text, onPress }) {
  return (
    <TouchableOpacity style={s.button} onPress={onPress}>
      <Text style={s.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

function Label({ text }) {
  return <Text style={s.label}>{text}</Text>;
}

function Segment({ text, active, onPress }) {
  return (
    <TouchableOpacity style={[s.segmentItem, active && s.segmentOn]} onPress={onPress}>
      <Text style={[s.segmentText, active && s.segmentTextOn]}>{text}</Text>
    </TouchableOpacity>
  );
}

function Chip({ text, active, onPress }) {
  return (
    <TouchableOpacity style={[s.chip, active && s.chipOn]} onPress={onPress}>
      <Text style={[s.chipText, active && s.chipTextOn]}>{text}</Text>
    </TouchableOpacity>
  );
}

function Empty({ title, text }) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptyText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  muted: { color: '#94A3B8' },

  // Scanner Screen
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  scannerTopHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  scannerTitle: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 24,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowRadius: 6,
  },
  scannerText: {
    color: '#E2E8F0',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    textShadowColor: '#000',
    textShadowRadius: 6,
  },
  scannerCenterTarget: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.28,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  scanFrame: {
    width: '100%',
    height: 130,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#F97316',
    backgroundColor: 'transparent',
  },
  scannerHint: {
    color: '#FFF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 14,
    paddingHorizontal: 10,
    textShadowColor: '#000',
    textShadowRadius: 6,
  },
  scannerBottomBar: {
    position: 'absolute',
    bottom: 45,
    left: 20,
    right: 20,
    gap: 10,
    zIndex: 10,
  },
  captureButton: {
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#F97316',
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 16,
  },
  scannerClose: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.92)',
    alignItems: 'center',
  },
  scannerCloseText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 15,
  },

  // Main Screen
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aboutBtn: { padding: 6 },
  aboutBtnText: { color: '#94A3B8', fontSize: 24 },
  aboutHeading: { color: '#F8FAFC', fontSize: 15, fontWeight: '900', marginTop: 14, marginBottom: 4 },
  aboutText: { color: '#CBD5E1', fontSize: 14, lineHeight: 20, marginTop: 6 },
  aboutLink: { color: '#FDBA74', fontWeight: '700' },
  disclosureSmall: { color: '#64748B', fontSize: 11, lineHeight: 15, textAlign: 'center' },
  orange: {
    color: '#F97316',
  },
  tagline: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 3,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 27,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  sub: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 17,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    padding: 4,
    borderRadius: 12,
    marginBottom: 9,
  },
  segmentItem: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentOn: {
    backgroundColor: '#F97316',
  },
  segmentText: {
    color: '#94A3B8',
    fontWeight: '800',
  },
  segmentTextOn: {
    color: '#0F172A',
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 11,
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 11,
    color: '#F8FAFC',
    fontSize: 16,
    padding: 13,
  },
  scanButton: {
    borderWidth: 1,
    borderColor: '#F97316',
    borderRadius: 11,
    padding: 13,
    alignItems: 'center',
    marginTop: 10,
  },
  scanButtonText: {
    color: '#FDBA74',
    fontWeight: '900',
  },
  hint: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#0F172A',
    fontWeight: '900',
  },
  chip: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginRight: 8,
  },
  chipOn: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  chipText: {
    color: '#CBD5E1',
    fontWeight: '700',
  },
  chipTextOn: {
    color: '#0F172A',
  },
  section: {
    fontSize: 19,
    fontWeight: '900',
    color: '#F8FAFC',
    marginTop: 25,
    marginBottom: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  part: {
    width: '48%',
    minHeight: 105,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 15,
    padding: 15,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dim: {
    opacity: 0.42,
  },
  partIcon: {
    fontSize: 27,
  },
  partText: {
    color: '#E2E8F0',
    fontWeight: '800',
    fontSize: 14,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: '#172554',
    borderWidth: 1,
    borderColor: '#1D4ED8',
    borderRadius: 15,
    padding: 15,
  },
  bannerTitle: {
    color: '#F8FAFC',
    fontWeight: '900',
    fontSize: 16,
  },
  bannerSub: {
    color: '#93C5FD',
    fontSize: 12,
    marginTop: 3,
  },
  change: {
    color: '#FDBA74',
    fontWeight: '900',
  },
  disclaimer: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 7,
  },
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: '#111C31',
    borderTopWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 17,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navText: {
    color: '#94A3B8',
    fontWeight: '800',
    fontSize: 12,
  },
  vehicle: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 15,
    marginTop: 12,
  },
  currentVehicle: {
    borderColor: '#F97316',
  },
  vehicleTitle: {
    color: '#F8FAFC',
    fontWeight: '900',
    fontSize: 16,
  },
  vehicleMeta: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  vehicleActions: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 10,
  },
  edit: {
    color: '#FDBA74',
    fontSize: 12,
    fontWeight: '800',
  },
  remove: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '800',
  },
  log: {
    backgroundColor: '#1E293B',
    borderLeftWidth: 3,
    borderColor: '#F97316',
    borderRadius: 12,
    padding: 15,
    marginTop: 11,
  },
  empty: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginTop: 15,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontWeight: '900',
    fontSize: 17,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.68)',
  },
  sheet: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 21,
    paddingBottom: 34,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalSub: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  fit: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 14,
  },
  video: {
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  videoText: {
    color: '#FCA5A5',
    fontWeight: '900',
  },
  close: {
    padding: 14,
    alignItems: 'center',
  },
});