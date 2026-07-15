import { type FC, useEffect, useState } from "react";
import { Input, Button } from "antd";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Brand-red pin — same shape used on the public Theaters map, kept
// consistent with the site's crimson accent instead of Leaflet's default.
const redPin = L.divIcon({
    className: "cinema-picker-pin",
    html: `<svg width="28" height="38" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" fill="#E8001C" stroke="#7a0010" stroke-width="0.6"/>
        <circle cx="12" cy="10" r="3.5" fill="#fff"/>
    </svg>`,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
});

const VIETNAM_CENTER: [number, number] = [16.0, 106.0];
const DEFAULT_ZOOM = 6;
const PICKED_ZOOM = 15;

interface NominatimResult {
    lat: string;
    lon: string;
}

/** Registers the map click handler — must be a child of MapContainer to
 *  access the map instance via react-leaflet's hook. */
const ClickHandler: FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
    useMapEvents({
        click: (e) => onPick(e.latlng.lat, e.latlng.lng),
    });
    return null;
};

/** Pans/zooms the map whenever the marker position changes (drag, click,
 *  address search, or typing directly into the Lat/Lng fields). */
const FlyTo: FC<{ position: [number, number] | null }> = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, Math.max(map.getZoom(), PICKED_ZOOM), { duration: 0.6 });
    }, [position, map]);
    return null;
};

interface Props {
    latitude: number | null;
    longitude: number | null;
    onChange: (lat: number, lng: number) => void;
}

/** Lets a manager set a cinema's exact coordinates visually — click the map
 *  or drag the pin, or search an address (free OpenStreetMap Nominatim
 *  geocoding, no API key needed) — instead of typing raw decimals blind. */
const CinemaLocationPicker: FC<Props> = ({ latitude, longitude, onChange }) => {
    const [search, setSearch] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Treat (0, 0) — the form's default for a brand-new cinema — as "no
    // location set yet" rather than a real pin in the middle of the ocean.
    const hasPosition =
        typeof latitude === "number" && typeof longitude === "number" &&
        !Number.isNaN(latitude) && !Number.isNaN(longitude) &&
        !(latitude === 0 && longitude === 0);
    const position: [number, number] | null = hasPosition ? [latitude as number, longitude as number] : null;

    const handleSearch = async () => {
        const q = search.trim();
        if (!q) return;
        setSearching(true);
        setSearchError(null);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
            );
            const results: NominatimResult[] = await res.json();
            if (!results.length) {
                setSearchError("No results found for that address.");
                return;
            }
            onChange(Number(results[0].lat), Number(results[0].lon));
        } catch {
            setSearchError("Couldn't search for that address. Please try again.");
        } finally {
            setSearching(false);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Input
                    placeholder="Search an address, e.g. Vincom Dong Khoi, Ho Chi Minh City"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={handleSearch}
                    disabled={searching}
                />
                <Button onClick={handleSearch} loading={searching}>
                    Search
                </Button>
            </div>

            {searchError && (
                <p style={{ margin: "0 0 8px", fontSize: 12, color: "#E8001C" }}>{searchError}</p>
            )}

            <div style={{ height: 260, borderRadius: 8, overflow: "hidden", border: "1px solid var(--dash-border)" }}>
                <MapContainer
                    center={position ?? VIETNAM_CENTER}
                    zoom={position ? PICKED_ZOOM : DEFAULT_ZOOM}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {position && (
                        <Marker
                            position={position}
                            icon={redPin}
                            draggable
                            eventHandlers={{
                                dragend: (e) => {
                                    const { lat, lng } = (e.target as L.Marker).getLatLng();
                                    onChange(lat, lng);
                                },
                            }}
                        />
                    )}
                    <ClickHandler onPick={onChange} />
                    <FlyTo position={position} />
                </MapContainer>
            </div>

            <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--dash-text-3)" }}>
                Click the map or drag the pin to set the exact location.
            </p>
        </div>
    );
};

export default CinemaLocationPicker;
