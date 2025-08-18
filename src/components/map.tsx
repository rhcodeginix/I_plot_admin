import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DEFAULT_ZOOM = 18;
const MAX_ZOOM = 18;

const NorkartMap: React.FC<{ coordinates: any }> = ({ coordinates }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any | null>(null);
  const mapApiKey = "E8C374EF-6B2A-4304-B935-A05DDBB79947";
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const BOUNDARY_POINTS: [number, number][] =
      coordinates?.map((item: any) => [item.longitude, item.latitude]) ?? [];

    if (!mapContainer.current || BOUNDARY_POINTS.length === 0) return;

    const DEFAULT_CENTER = BOUNDARY_POINTS[0];

    setIsLoading(true);

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            "raster-tiles": {
              type: "raster",
              tiles: [
                `https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?APITOKEN=${mapApiKey}`,
              ],
              tileSize: 256,
              attribution:
                "© 2020 Norkart AS/Geovekst og kommunene/OpenStreetMap/NASA/EEA CLC2006/Meti/Plan- og bygningsetaten, Oslo Kommune",
            },
          },
          layers: [
            {
              id: "simple-tiles",
              type: "raster",
              source: "raster-tiles",
              minzoom: 0,
              maxzoom: 24,
            },
          ],
        },
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        maxZoom: MAX_ZOOM,
        collectResourceTiming: false,
      });

      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
      map.current.addControl(new maplibregl.ScaleControl(), "bottom-left");
    }

    map.current.on("load", () => {
      if (map.current?.getSource("boundary")) {
        (map.current.getSource("boundary") as maplibregl.GeoJSONSource).setData(
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [[...BOUNDARY_POINTS]],
            },
            properties: {},
          }
        );
      } else {
        map.current?.addSource("boundary", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [[...BOUNDARY_POINTS]],
            },
            properties: {},
          },
        });

        map.current?.addLayer({
          id: "boundary-layer",
          type: "line",
          source: "boundary",
          paint: {
            "line-color": "#006555",
            "line-width": 3,
            "line-opacity": 0.85,
          },
        });

        map.current?.addLayer({
          id: "boundary-fill-layer",
          type: "fill",
          source: "boundary",
          paint: {
            "fill-color": "#006555",
            "fill-opacity": 0.15,
          },
        });
      }

      const bounds = new maplibregl.LngLatBounds();
      BOUNDARY_POINTS.forEach((coord) => bounds.extend(coord));

      map.current?.fitBounds(bounds, {
        padding: 60,
        maxZoom: MAX_ZOOM,
        duration: 1500,
      });

      map.current.once("moveend", () => {
        const currentZoom = map.current!.getZoom();
        map.current?.zoomTo(Math.min(currentZoom + 1, MAX_ZOOM), {
          duration: 500,
        });

        map.current?.once("moveend", () => {
          setIsLoading(false);
        });
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordinates]);

  return (
    <div className="flex flex-col w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="relative w-full h-full">
        <div
          ref={mapContainer}
          className="w-full h-full rounded-lg shadow-lg relative"
        />
      </div>
    </div>
  );
};

export default NorkartMap;
