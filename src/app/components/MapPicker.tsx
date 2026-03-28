import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix default marker icon in Leaflet with Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

function generateGoogleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapViewUpdater({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);
  return null;
}

interface MapPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  value,
  onChange,
  placeholder = 'Klik peta untuk memilih lokasi atau paste link',
}) => {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(() => {
    if (value && value.includes('maps') && value.includes('q=')) {
      const match = value.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      }
    }
    return null;
  });

  const defaultCenter: [number, number] = [-6.2088, 106.8456]; // Jakarta

  const handleLocationSelect = useCallback(
    (lat: number, lng: number) => {
      setSelectedPosition([lat, lng]);
      onChange(generateGoogleMapsLink(lat, lng));
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue && newValue.includes('maps') && newValue.includes('q=')) {
      const match = newValue.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          setSelectedPosition([lat, lng]);
        }
      }
    } else {
      setSelectedPosition(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="url"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-200 h-64 bg-gray-100">
        <MapContainer
          center={selectedPosition || defaultCenter}
          zoom={selectedPosition ? 16 : 12}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewUpdater position={selectedPosition} />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {selectedPosition && (
            <Marker position={selectedPosition} icon={defaultIcon}>
              <Popup>
                Lokasi dipilih
                <br />
                {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500">
        Klik pada peta untuk menandai titik lokasi, atau paste link Google Maps secara manual
      </p>
    </div>
  );
};
