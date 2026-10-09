import { useState } from 'react';
import { useToast } from '../components/common/ToastProvider.jsx';
import { api } from '../services/api.js';

export function useCurrentLocation(onLocationFound) {
  const toast = useToast();
  const [locating, setLocating] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast('GPS is unavailable here. Location requires localhost or HTTPS.', 'error');
      return;
    }

    setLocating(true);
    setLocationAccuracy(null);
    let best = null;
    let watchId = null;
    let timeoutId = null;
    let finished = false;

    const stop = () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const finish = async () => {
      if (finished) return;
      finished = true;
      stop();
      if (!best) {
        setLocating(false);
        toast('Could not get a GPS fix. Check location permission and try again.', 'error');
        return;
      }

      const coordinates = {
        latitude: best.coords.latitude,
        longitude: best.coords.longitude,
      };
      try {
        const { data } = await api.get('/location/reverse', { params: coordinates });
        const details = data.addressDetails || {};
        const street = [details.house_number, details.road].filter(Boolean).join(' ');
        const area =
          details.neighbourhood || details.suburb || details.quarter || details.residential;
        const town = details.city || details.town || details.village || details.municipality;
        const parts = [street, area, town, details.state, details.postcode].filter(Boolean);
        const uniqueParts = parts.filter(
          (part, index) =>
            parts.findIndex((other) => other.toLowerCase() === part.toLowerCase()) === index,
        );

        onLocationFound({
          address: uniqueParts.join(', ') || data.address,
          coordinates,
          details,
        });
        setLocationAccuracy(Math.round(best.coords.accuracy));
        toast(
          best.coords.accuracy > 250
            ? 'Location found; GPS is approximate. Check the pin.'
            : 'Current delivery location found',
        );
      } catch (error) {
        toast(
          error.response?.data?.message ||
            'Could not look up this location. Please enter your address manually.',
          'error',
        );
      } finally {
        setLocating(false);
      }
    };

    const fail = (error) => {
      if (finished) return;
      if (best) {
        finish();
        return;
      }
      finished = true;
      stop();
      setLocating(false);
      const message =
        error.code === 1
          ? 'Allow location access in your browser to use GPS.'
          : error.code === 2
            ? 'Your device could not determine its location. Try again or enter it manually.'
            : 'Location took too long. Check GPS and try again.';
      toast(message, 'error');
    };

    try {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (!best || position.coords.accuracy < best.coords.accuracy) {
            best = position;
            setLocationAccuracy(Math.round(position.coords.accuracy));
          }
          if (best.coords.accuracy <= 50) finish();
        },
        fail,
        { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 },
      );
      timeoutId = setTimeout(() => (best ? finish() : fail({ code: 3 })), 20000);
    } catch {
      setLocating(false);
      toast('Could not start GPS. Please check browser location permissions.', 'error');
    }
  };

  return {
    locateMe,
    locating,
    locationAccuracy,
    resetAccuracy: () => setLocationAccuracy(null),
  };
}
