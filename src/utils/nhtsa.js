const BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

/**
 * Fetch models for a given year + make.
 * Returns ["Camry", "Corolla", ...] — FREE, no API key.
 */
export async function fetchModels(year, make) {
  try {
    const url = `${BASE}/GetModelsForMakeYear/make/${encodeURIComponent(
      make
    )}/modelyear/${year}?format=json`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.Results && json.Results.length > 0) {
      const unique = [...new Set(json.Results.map((r) => r.Model_Name))];
      return unique.sort();
    }
    return [];
  } catch (err) {
    console.warn('NHTSA fetchModels error:', err);
    return [];
  }
}

/**
 * Decode a 17-character VIN into vehicle details.
 * Returns { year, make, model, trim, engine, ... } or null.
 */
export async function decodeVIN(vin) {
  try {
    const url = `${BASE}/DecodeVinValues/${encodeURIComponent(vin)}?format=json`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.Results && json.Results.length > 0) {
      const r = json.Results[0];
      return {
        year:         r.ModelYear || '',
        make:         r.Make || '',
        model:        r.Model || '',
        trim:         r.Trim || '',
        engine:       r.EngineConfiguration || '',
        cylinders:    r.EngineCylinders || '',
        displacement: r.DisplacementL || '',
        fuelType:     r.FuelTypePrimary || '',
        bodyClass:    r.BodyClass || '',
        driveType:    r.DriveType || '',
        errorCode:    r.ErrorCode || '0',
        errorText:    r.ErrorText || '',
      };
    }
    return null;
  } catch (err) {
    console.warn('NHTSA decodeVIN error:', err);
    return null;
  }
}