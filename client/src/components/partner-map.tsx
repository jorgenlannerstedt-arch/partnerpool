/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AgencyProfile } from "@shared/schema";

interface PartnerMapProps {
  agencies: AgencyProfile[];
}

export function PartnerMap({ agencies }: PartnerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  const { data: config } = useQuery<{ apiKey: string }>({
    queryKey: ["/api/config/maps"],
  });

  useEffect(() => {
    if (!config?.apiKey || loaded) return;
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, [config, loaded]);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 62.0, lng: 15.0 },
        zoom: 5,
        mapId: "vertigogo-partner-map",
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });
    }

    const map = mapInstanceRef.current;

    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasMarkers = false;

    agencies.forEach((agency) => {
      if (agency.latitude && agency.longitude) {
        const position = { lat: agency.latitude, lng: agency.longitude };

        const pin = document.createElement("div");
        pin.style.cssText =
          "width: 32px; height: 32px; background: #0082f3; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer;";

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position,
          content: pin,
          title: agency.name,
        });

        const infoContent = `
          <div style="min-width: 180px; font-family: 'Open Sans', system-ui, sans-serif; padding: 4px;">
            <strong style="font-size: 14px;">${agency.name}</strong>
            ${agency.city ? `<br/><span style="color: #666; font-size: 12px;">${agency.city}</span>` : ""}
            ${agency.specialties ? `<br/><span style="color: #888; font-size: 11px;">${agency.specialties.slice(0, 2).join(", ")}</span>` : ""}
            <br/><a href="/partners/${agency.id}" style="color: #0082f3; font-size: 12px; text-decoration: none;">Visa profil &rarr;</a>
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({ content: infoContent });

        marker.addListener("click", () => {
          infoWindow.open({ anchor: marker, map });
        });

        markersRef.current.push(marker);
        bounds.extend(position);
        hasMarkers = true;
      }
    });

    if (hasMarkers) {
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [loaded, agencies]);

  if (!config?.apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-md" data-testid="map-partners">
        <p className="text-muted-foreground text-sm">Laddar karta...</p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full rounded-md" data-testid="map-partners" />;
}
