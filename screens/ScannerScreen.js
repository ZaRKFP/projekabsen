import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { CameraView, Camera } from 'expo-camera';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sound, setSound] = useState();
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();

    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/success.mp3')
      );
      setSound(sound);
    })();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setLoading(true);

      try {
        setQrData(data);
        alert(`QR ketangkep! Data: ${data}`);

        const q = query(collection(db, 'siswa'), where('id', '==', data));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const siswaData = querySnapshot.docs[0].data();

          await addDoc(collection(db, 'absensi'), {
            student_id: siswaData.id,
            nama: siswaData.nama,
            kelas: siswaData.kelas,
            timestamp: serverTimestamp()
          });

          if (sound) {
            await sound.replayAsync();
          Alert.alert('✅ Absensi berhasil!', `Selamat datang, ${siswaData.nama}`); }
        } else {
          Alert.alert('❌ Siswa tidak ditemukan!', `ID: ${data}`);
        }
      } catch (error) {
        console.log(error);
        Alert.alert('❌ Gagal absen', error.message);
      } finally {
        setLoading(false);
        setTimeout(() => setScanned(false), 2000);
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />}
      {!loading && (
        <CameraView
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <Text style={styles.info}>📷 Arahkan QR ke kamera untuk absen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  info: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    fontWeight: 'bold'
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25
  }
});