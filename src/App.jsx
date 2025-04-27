// src/App.jsx
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';

function App() {
  const [absensi, setAbsensi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, 'absensi'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAbsensi(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(absensi.map(item => ({
      Nama: item.nama,
      Kelas: item.kelas,
      Jam_Absen: item.timestamp?.toDate().toLocaleString('id-ID') || '-'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi");
    XLSX.writeFile(workbook, "absensi.xlsx");
  };

  const getTodayAttendance = () => {
    const today = new Date();
    return absensi.filter(item => {
      const date = item.timestamp?.toDate();
      return date &&
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    }).length;
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#222', padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>
        <h1 style={{ color: '#fff', margin: 0 }}>📋 Absen Bet Dashboard</h1>
      </header>

      {loading ? (
        <p>Loading data absensi...</p>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Jumlah Kehadiran Hari Ini:</strong> {getTodayAttendance()} siswa
          </div>
          <button onClick={exportToExcel} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            ⬇️ Export to Excel
          </button>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
            <thead style={{ backgroundColor: '#333', color: '#fff' }}>
              <tr>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nama</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Kelas</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Jam Absen</th>
              </tr>
            </thead>
            <tbody>
              {absensi.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.nama}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.kelas}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.timestamp?.toDate().toLocaleString('id-ID') || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default App;
