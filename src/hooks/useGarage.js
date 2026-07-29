import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GARAGE_KEY = '@mechanicmate_garage';
const MAINT_KEY  = '@mechanicmate_maintenance';

// ── Garage (saved vehicles) ──────────────────────────────
export function useGarage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(GARAGE_KEY);
        if (raw) setVehicles(JSON.parse(raw));
      } catch (e) {
        console.warn('useGarage load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = useCallback(async (updated) => {
    setVehicles(updated);
    await AsyncStorage.setItem(GARAGE_KEY, JSON.stringify(updated));
  }, []);

  const addVehicle = useCallback(
    (vehicle) => {
      const id = Date.now().toString();
      const entry = { ...vehicle, id, addedAt: new Date().toISOString() };
      save([...vehicles, entry]);
      return entry;
    },
    [vehicles, save]
  );

  const removeVehicle = useCallback(
    (id) => save(vehicles.filter((v) => v.id !== id)),
    [vehicles, save]
  );

  return { vehicles, loading, addVehicle, removeVehicle };
}

// ── Maintenance records ──────────────────────────────────
export function useMaintenance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(MAINT_KEY);
        if (raw) setRecords(JSON.parse(raw));
      } catch (e) {
        console.warn('useMaintenance load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = useCallback(async (updated) => {
    setRecords(updated);
    await AsyncStorage.setItem(MAINT_KEY, JSON.stringify(updated));
  }, []);

  const logService = useCallback(
    (vehicleId, itemId, mileage) => {
      const entry = {
        id: Date.now().toString(),
        vehicleId,
        itemId,
        mileage: Number(mileage) || 0,
        date: new Date().toISOString(),
      };
      save([...records, entry]);
      return entry;
    },
    [records, save]
  );

  const getRecordsForVehicle = useCallback(
    (vehicleId) =>
      records
        .filter((r) => r.vehicleId === vehicleId)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [records]
  );

  const removeRecord = useCallback(
    (id) => save(records.filter((r) => r.id !== id)),
    [records, save]
  );

  return { records, loading, logService, getRecordsForVehicle, removeRecord };
}