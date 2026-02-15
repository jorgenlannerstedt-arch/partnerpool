import { useEffect, useRef } from "react";
import type { AgencyProfile } from "@shared/schema";

interface PartnerMapProps {
  agencies: AgencyProfile[];
}

export function PartnerMap({ agencies }: PartnerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const loadLeaflet = async () => {
      const L = await import("leaflet");

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      await new Promise((r) => setTimeout(r, 100));

      const map = L.map(mapRef.current!, {
        center: [59.3293, 18.0686],
        zoom: 5,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      const customIcon = L.divIcon({
        html: `<div style="background: hsl(221, 83%, 53%); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        className: "",
      });

      agencies.forEach((agency) => {
        if (agency.latitude && agency.longitude) {
          const marker = L.marker([agency.latitude, agency.longitude], { icon: customIcon }).addTo(map);
          marker.bindPopup(`
            <div style="min-width: 180px; font-family: system-ui, sans-serif;">
              <strong style="font-size: 14px;">${agency.name}</strong>
              ${agency.city ? `<br/><span style="color: #666; font-size: 12px;">${agency.city}</span>` : ""}
              ${agency.specialties ? `<br/><span style="color: #888; font-size: 11px;">${agency.specialties.slice(0, 2).join(", ")}</span>` : ""}
              <br/><a href="/partners/${agency.id}" style="color: hsl(221, 83%, 53%); font-size: 12px; text-decoration: none;">View Profile &rarr;</a>
            </div>
          `);
        }
      });

      const markers = agencies
        .filter((a) => a.latitude && a.longitude)
        .map((a) => [a.latitude!, a.longitude!] as [number, number]);

      if (markers.length > 0) {
        map.fitBounds(markers, { padding: [50, 50] });
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [agencies]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer: any) => {
      if (layer instanceof (window as any).L?.Marker) {
        map.removeLayer(layer);
      }
    });

    import("leaflet").then((L) => {
      const customIcon = L.divIcon({
        html: `<div style="background: hsl(221, 83%, 53%); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        className: "",
      });

      agencies.forEach((agency) => {
        if (agency.latitude && agency.longitude) {
          const marker = L.marker([agency.latitude, agency.longitude], { icon: customIcon }).addTo(map);
          marker.bindPopup(`
            <div style="min-width: 180px; font-family: system-ui, sans-serif;">
              <strong style="font-size: 14px;">${agency.name}</strong>
              ${agency.city ? `<br/><span style="color: #666; font-size: 12px;">${agency.city}</span>` : ""}
              ${agency.specialties ? `<br/><span style="color: #888; font-size: 11px;">${agency.specialties.slice(0, 2).join(", ")}</span>` : ""}
              <br/><a href="/partners/${agency.id}" style="color: hsl(221, 83%, 53%); font-size: 12px; text-decoration: none;">View Profile &rarr;</a>
            </div>
          `);
        }
      });
    });
  }, [agencies]);

  return <div ref={mapRef} className="w-full h-full" data-testid="map-partners" />;
}
