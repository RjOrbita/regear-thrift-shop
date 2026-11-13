"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Navigation,
  LocateFixed,
  Search,
  ExternalLink,
  Route,
  Clock,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

export const SHOP_LAT = 6.960294388413744;
export const SHOP_LNG = 125.08871203716633;

interface SearchSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface RouteStep {
  instruction: string;
  distanceMeters: number;
}

export default function ShopMapSection() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeLayerRef = useRef<any>(null);

  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);

  const [routeSummary, setRouteSummary] = useState<{
    distanceKm: string;
    durationMin: number;
    steps: RouteStep[];
  } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      leafletRef.current = L;

      const map = L.map(mapContainerRef.current, {
        center: [SHOP_LAT, SHOP_LNG],
        zoom: 16,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Custom High-Contrast Streetwear Marker for ReGear Thrift Shop
      const shopIcon = L.divIcon({
        className: "regear-shop-pin",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
            <div style="background:#0D0D0D;color:#F7F6F2;border:2px solid #F7F6F2;padding:4px 8px;font-family:monospace;font-size:11px;font-weight:900;letter-spacing:0.12em;white-space:nowrap;box-shadow:3px 3px 0px #0D0D0D;">
              REGEAR THRIFT SHOP
            </div>
            <div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid #0D0D0D;"></div>
            <div style="width:10px;height:10px;border-radius:9999px;background:#16A34A;border:2px solid #0D0D0D;margin-top:-2px;"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      L.marker([SHOP_LAT, SHOP_LNG], { icon: shopIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:monospace;font-size:12px;"><strong>REGEAR THRIFT SHOP</strong><br/>${SHOP_LAT.toFixed(
            5
          )}, ${SHOP_LNG.toFixed(5)}</div>`
        );

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Draw route using OSRM whenever userCoords changes
  const buildRouteFromCoords = async (
    startLat: number,
    startLng: number,
    label: string
  ) => {
    setErrorMsg("");
    setCalculatingRoute(true);
    setUserCoords({ lat: startLat, lng: startLng, label });

    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    if (L && map) {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }
      const startIcon = L.divIcon({
        className: "regear-user-pin",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
            <div style="background:#F7F6F2;color:#0D0D0D;border:2px solid #0D0D0D;padding:3px 7px;font-family:monospace;font-size:10px;font-weight:800;white-space:nowrap;box-shadow:2px 2px 0px #0D0D0D;">
              YOU ARE HERE
            </div>
            <div style="width:12px;height:12px;border-radius:9999px;background:#2563EB;border:2px solid #FFFFFF;margin-top:2px;box-shadow:0 0 0 2px #0D0D0D;"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      userMarkerRef.current = L.marker([startLat, startLng], {
        icon: startIcon,
      }).addTo(map);
    }

    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${SHOP_LNG},${SHOP_LAT}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(osrmUrl);
      const data = await res.json();

      if (!data.routes || data.routes.length === 0) {
        setErrorMsg(
          "Could not calculate a driving road route from that point. You can still open directions in Google Maps below."
        );
        if (L && map) {
          map.fitBounds(
            [
              [startLat, startLng],
              [SHOP_LAT, SHOP_LNG],
            ],
            { padding: [50, 50] }
          );
        }
        return;
      }

      const route = data.routes[0];
      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationMin = Math.max(1, Math.round(route.duration / 60));

      // Extract readable turn-by-turn steps
      const rawSteps = route.legs?.[0]?.steps || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsedSteps: RouteStep[] = rawSteps.map((step: any) => {
        const type = step.maneuver?.type || "continue";
        const modifier = step.maneuver?.modifier
          ? ` (${step.maneuver.modifier})`
          : "";
        const roadName = step.name ? ` onto ${step.name}` : "";
        let action = "Continue";

        if (type === "depart") action = "Head out";
        else if (type === "arrive") action = "Arrive at ReGear Thrift Shop";
        else if (type === "turn") action = `Turn${modifier}`;
        else if (type === "roundabout") action = "Take the roundabout";
        else if (type === "merge") action = `Merge${modifier}`;
        else if (type === "fork") action = `Keep${modifier} at the fork`;

        return {
          instruction:
            type === "arrive"
              ? "Arrive at ReGear Thrift Shop"
              : `${action}${roadName}`,
          distanceMeters: Math.round(step.distance || 0),
        };
      });

      setRouteSummary({
        distanceKm,
        durationMin,
        steps: parsedSteps,
      });

      if (L && map) {
        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
        }
        routeLayerRef.current = L.geoJSON(route.geometry, {
          style: {
            color: "#0D0D0D",
            weight: 5,
            opacity: 0.9,
          },
        }).addTo(map);

        map.fitBounds(routeLayerRef.current.getBounds(), {
          padding: [50, 50],
        });
      }
    } catch {
      setErrorMsg(
        "Unable to fetch live route right now. Use the Google Maps button below for instant directions."
      );
    } finally {
      setCalculatingRoute(false);
    }
  };

  // Search address or parse coordinates
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = locationInput.trim();
    if (!query) return;

    setErrorMsg("");
    setSuggestions([]);

    // 1. Check if user typed raw "lat, lng" coordinates directly
    const coordMatch = query.match(
      /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/
    );
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      await buildRouteFromCoords(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      return;
    }

    // 2. Otherwise geocode via OpenStreetMap Nominatim (prioritizing Philippines)
    setSearchingLocation(true);
    try {
      const phUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=ph&limit=5`;
      let res = await fetch(phUrl);
      let results: SearchSuggestion[] = await res.json();

      if (!results || results.length === 0) {
        const globalUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`;
        res = await fetch(globalUrl);
        results = await res.json();
      }

      if (!results || results.length === 0) {
        setErrorMsg(
          "Location not found. Try typing a nearby city, barangay, landmark, or coordinates."
        );
        return;
      }

      // Immediately route from the top match and show alternatives if multiple exist
      const top = results[0];
      setLocationInput(top.display_name);
      if (results.length > 1) {
        setSuggestions(results.slice(1, 4));
      }
      await buildRouteFromCoords(
        parseFloat(top.lat),
        parseFloat(top.lon),
        top.display_name
      );
    } catch {
      setErrorMsg("Could not search location. Please check your connection.");
    } finally {
      setSearchingLocation(false);
    }
  };

  // Use browser GPS
  const handleUseMyGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported on this browser.");
      return;
    }

    setErrorMsg("");
    setCalculatingRoute(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocationInput(`My GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setSuggestions([]);
        await buildRouteFromCoords(lat, lng, "My Current GPS Location");
      },
      () => {
        setCalculatingRoute(false);
        setErrorMsg(
          "Location permission denied or unavailable. Type your city/street in the box instead."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleResetMap = () => {
    setLocationInput("");
    setSuggestions([]);
    setUserCoords(null);
    setRouteSummary(null);
    setErrorMsg("");

    const map = mapInstanceRef.current;
    if (map) {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      map.setView([SHOP_LAT, SHOP_LNG], 16);
    }
  };

  const googleMapsDirectionsUrl = userCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${SHOP_LAT},${SHOP_LNG}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${SHOP_LAT},${SHOP_LNG}&travelmode=driving`;

  return (
    <section
      id="shop-map"
      className="max-w-[1440px] mx-auto border-x border-b border-ink bg-surface"
    >
      {/* Top Section Strip */}
      <div className="px-5 sm:px-8 py-5 bg-canvas border-b border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-ash font-bold">
            // PHYSICAL RACK LOCATION &amp; DIRECTIONS
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-ink mt-0.5">
            VISIT REGEAR THRIFT SHOP IN PERSON
          </h2>
        </div>

        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-ink text-canvas px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors self-start"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>OPEN IN GOOGLE MAPS</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main 2-Column Layout: Left Controls & Directions + Right Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Location Input & Live Directions (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-8 border-b lg:border-b-0 lg:border-r border-ink flex flex-col justify-between space-y-5 bg-surface">
          <div className="space-y-4">
            <div className="bg-canvas border border-ink p-3.5 font-mono text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-ash font-bold">
                  DESTINATION PIN
                </span>
                <span className="text-[10px] bg-ink text-canvas px-2 py-0.5 font-bold">
                  PHYSICAL SHOP
                </span>
              </div>
              <p className="font-bold text-ink">
                COORDINATES: {SHOP_LAT.toFixed(6)}, {SHOP_LNG.toFixed(6)}
              </p>
            </div>

            {/* Starting Location Input Form */}
            <form onSubmit={handleSearchLocation} className="space-y-2.5">
              <label className="block font-mono text-[11px] uppercase tracking-wider font-bold text-ink">
                ENTER YOUR STARTING LOCATION FOR DIRECTIONS:
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Type street, barangay, city, or coordinates..."
                    className="w-full pl-9 pr-3 py-3 bg-canvas border border-ink font-mono text-xs text-ink placeholder:text-ash focus:outline-none focus:ring-2 focus:ring-ink"
                  />
                </div>

                <button
                  type="submit"
                  disabled={searchingLocation || calculatingRoute}
                  className="px-4 py-3 bg-ink text-canvas font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shrink-0 inline-flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>
                    {searchingLocation || calculatingRoute ? "ROUTING..." : "GO"}
                  </span>
                </button>
              </div>

              {/* Quick GPS + Reset Row */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleUseMyGPS}
                  disabled={calculatingRoute}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-ink bg-canvas text-ink font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-ink hover:text-canvas transition-colors"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>USE MY CURRENT GPS</span>
                </button>

                {userCoords && (
                  <button
                    type="button"
                    onClick={handleResetMap}
                    className="inline-flex items-center gap-1 font-mono text-[11px] uppercase font-bold text-ash hover:text-ink underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>CLEAR ROUTE</span>
                  </button>
                )}
              </div>
            </form>

            {/* Alternative Search Suggestions if Multiple Found */}
            {suggestions.length > 0 && (
              <div className="border border-ink bg-canvas p-2.5 space-y-1.5">
                <span className="block font-mono text-[10px] uppercase text-ash font-bold">
                  DID YOU MEAN:
                </span>
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setLocationInput(sug.display_name);
                      setSuggestions([]);
                      buildRouteFromCoords(
                        parseFloat(sug.lat),
                        parseFloat(sug.lon),
                        sug.display_name
                      );
                    }}
                    className="w-full text-left font-mono text-[11px] text-ink hover:bg-ink hover:text-canvas px-2 py-1.5 transition-colors truncate flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 shrink-0" />
                    <span className="truncate">{sug.display_name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3 bg-amber-50 border border-amber-700 font-mono text-xs text-amber-950">
                {errorMsg}
              </div>
            )}

            {/* Route Summary & Step-by-Step Turn Instructions */}
            {routeSummary && (
              <div className="border-2 border-ink bg-canvas p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-ink/20 font-mono">
                  <div className="bg-surface border border-ink p-2.5">
                    <span className="text-[10px] uppercase text-ash flex items-center gap-1">
                      <Route className="w-3 h-3 text-ink" />
                      DISTANCE
                    </span>
                    <span className="text-lg sm:text-xl font-black text-ink block mt-0.5">
                      {routeSummary.distanceKm} KM
                    </span>
                  </div>

                  <div className="bg-surface border border-ink p-2.5">
                    <span className="text-[10px] uppercase text-ash flex items-center gap-1">
                      <Clock className="w-3 h-3 text-ink" />
                      EST. DRIVE / RIDE
                    </span>
                    <span className="text-lg sm:text-xl font-black text-emerald-700 block mt-0.5">
                      ~{routeSummary.durationMin} MINS
                    </span>
                  </div>
                </div>

                {routeSummary.steps.length > 0 && (
                  <div>
                    <span className="block font-mono text-[10px] uppercase tracking-wider font-bold text-ink mb-2">
                      TURN-BY-TURN DIRECTIONS ({routeSummary.steps.length} STEPS):
                    </span>
                    <ol className="max-h-44 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                      {routeSummary.steps.map((st, idx) => (
                        <li
                          key={idx}
                          className="flex items-start justify-between gap-2 py-1 border-b border-ink/10 last:border-none"
                        >
                          <span className="text-ink">
                            <strong>{idx + 1}.</strong> {st.instruction}
                          </span>
                          {st.distanceMeters > 0 && (
                            <span className="text-[10px] text-ash shrink-0">
                              {st.distanceMeters >= 1000
                                ? `${(st.distanceMeters / 1000).toFixed(1)}km`
                                : `${st.distanceMeters}m`}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Direct Navigation CTA */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 bg-ink text-canvas font-mono text-xs font-bold uppercase tracking-[0.16em] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#5A5A55]"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {userCoords
                ? "START TURN-BY-TURN IN GOOGLE MAPS →"
                : "GET DIRECTIONS IN GOOGLE MAPS →"}
            </span>
          </a>
        </div>

        {/* Right Column: Interactive Map Canvas (7 cols) */}
        <div className="lg:col-span-7 relative min-h-[360px] sm:min-h-[460px] bg-neutral-200 z-10">
          <div
            ref={mapContainerRef}
            className="w-full h-full min-h-[360px] sm:min-h-[460px]"
          />
        </div>
      </div>
    </section>
  );
}
