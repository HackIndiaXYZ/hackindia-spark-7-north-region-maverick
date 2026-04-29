'use client';

import { useState, useCallback } from 'react';

export type GpsState = 'idle' | 'loading' | 'ok' | 'error';

export interface GpsCoords {
  lat: number;
  lng: number;
  label: string; // human-readable address or fallback coords string
}

export function useGps() {
  const [state,  setState]  = useState<GpsState>('idle');
  const [coords, setCoords] = useState<GpsCoords | null>(null);
  const [error,  setError]  = useState('');

  const fetch = useCallback(async (): Promise<GpsCoords | null> => {
    if (!navigator?.geolocation) {
      setError('Geolocation not supported by this browser.');
      setState('error');
      return null;
    }

    setState('loading');
    setError('');

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        }),
      );

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Reverse geocode using free Nominatim API (no key required)
      let label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      try {
        const res = await window.fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { 'Accept-Language': 'en' } },
        );
        if (res.ok) {
          const data = await res.json() as { display_name?: string; address?: { suburb?: string; city?: string; state?: string } };
          // Prefer a short form: suburb + city
          const a = data.address ?? {};
          label = [a.suburb, a.city ?? a.state].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 2).join(', ') || label;
        }
      } catch {
        // Nominatim failed — use raw coords string, that's fine
      }

      const result: GpsCoords = { lat, lng, label };
      setCoords(result);
      setState('ok');
      return result;
    } catch (err) {
      const msg = (err as GeolocationPositionError)?.code === 1
        ? 'Location permission denied. Please allow access in your browser settings.'
        : 'Could not get your location. Try again.';
      setError(msg);
      setState('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setCoords(null);
    setError('');
  }, []);

  return { state, coords, error, fetch, reset };
}
