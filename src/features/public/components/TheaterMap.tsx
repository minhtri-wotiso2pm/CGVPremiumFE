import { type FC, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Cinema } from "@/features/manager/types/cinema.types";
import "leaflet/dist/leaflet.css";

// Brand-red pin (matches the site's crimson accent) instead of Leaflet's
// default blue marker — a self-contained inline SVG, same teardrop shape
// used elsewhere on this page (e.g. the "Get Directions" pin icon), so no
// external image asset is needed.
const redPin = L.divIcon({
    className: "thtr-map-pin",
    html: `<svg width="30" height="42" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" fill="#E8001C" stroke="#7a0010" stroke-width="0.6"/>
        <circle cx="12" cy="10" r="3.5" fill="#fff"/>
    </svg>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
});

const VIETNAM_CENTER: [number, number] = [16.0, 106.0];
const DEFAULT_ZOOM = 6;
const FOCUS_ZOOM = 14;

type GeoCinema = Cinema & { latitude: number; longitude: number };

const hasCoords = (c: Cinema): c is GeoCinema =>
    typeof c.latitude === "number" && typeof c.longitude === "number" && !Number.isNaN(c.latitude) && !Number.isNaN(c.longitude);

/** Pans/zooms the map whenever the selected cinema changes. */
const FlyTo: FC<{ position: [number, number] | null }> = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, FOCUS_ZOOM, { duration: 0.8 });
    }, [position, map]);
    return null;
};

/** Fits the map to every cinema pin once, the first time coordinates are
 *  available — gives a sensible initial view instead of a fixed zoomed-out
 *  Vietnam center. Only runs once so it never fights a later FlyTo. */
const FitToAll: FC<{ positions: [number, number][] }> = ({ positions }) => {
    const map = useMap();
    const didFit = useRef(false);
    useEffect(() => {
        if (didFit.current || positions.length === 0) return;
        didFit.current = true;
        map.fitBounds(L.latLngBounds(positions), { padding: [48, 48], maxZoom: 13 });
    }, [positions, map]);
    return null;
};

interface Props {
    cinemas: Cinema[];
    selectedCinemaId: number | null;
    onSelect: (cinemaId: number) => void;
}

/** Real Leaflet/OpenStreetMap map (free, no API key) with a dark tile style
 *  to match the site theme. Cinemas without latitude/longitude just get no
 *  pin — see the "Theaters map" backend requirements note. */
const TheaterMap: FC<Props> = ({ cinemas, selectedCinemaId, onSelect }) => {
    const withCoords = cinemas.filter(hasCoords);
    const selected = withCoords.find((c) => c.cinemaId === selectedCinemaId);
    const focusPosition: [number, number] | null = selected ? [selected.latitude, selected.longitude] : null;

    return (
        <div className="thtr-map">
            <MapContainer
                center={VIETNAM_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {withCoords.map((c) => (
                    <Marker
                        key={c.cinemaId}
                        position={[c.latitude, c.longitude]}
                        icon={redPin}
                        eventHandlers={{ click: () => onSelect(c.cinemaId) }}
                    >
                        <Popup>
                            <strong>{c.cinemaName}</strong>
                            <br />
                            {c.status === "ACTIVE" ? "Active" : "Inactive"}
                        </Popup>
                    </Marker>
                ))}
                <FlyTo position={focusPosition} />
                <FitToAll positions={withCoords.map((c): [number, number] => [c.latitude, c.longitude])} />
            </MapContainer>

            {withCoords.length === 0 && (
                <div className="thtr-map__notice">
                    Cinema coordinates aren't available yet — pins will appear once the backend adds them.
                </div>
            )}
        </div>
    );
};

export default TheaterMap;
