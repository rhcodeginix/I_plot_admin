import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
// import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX;

interface Map3DProps {
  coordinates?: any;
}

const Map3D: React.FC<Map3DProps> = ({ coordinates }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const exagRef = useRef<HTMLInputElement | null>(null);
  const opacityRef = useRef<HTMLInputElement | null>(null);

  const START: any = {
    center:
      coordinates && coordinates.length > 0
        ? [coordinates[0].longitude, coordinates[1].latitude]
        : [10.501013344017752, 59.75169381162908],
    zoom: 17.6,
    pitch: 45,
    bearing: -20,
  };

  const KART_TILES = [
    "https://opencache2.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=Nibcache_web_mercator_v2&STYLE=default&FORMAT=image/jpgpng&tileMatrixSet=default028mm&tileMatrix={z}&tileRow={y}&tileCol={x}",
    "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=Nibcache_web_mercator_v2&STYLE=default&FORMAT=image/jpgpng&tileMatrixSet=default028mm&tileMatrix={z}&tileRow={y}&tileCol={x}",
  ];

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: START.center,
      zoom: START.zoom,
      pitch: START.pitch,
      bearing: START.bearing,
      antialias: true,
    });

    mapRef.current = map;

    map.on("load", () => {
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
        });
      }

      const initialExag = exagRef.current
        ? parseFloat(exagRef.current.value)
        : 1.5;
      map.setTerrain({ source: "mapbox-dem", exaggeration: initialExag });

      if (!map.getLayer("sky-layer")) {
        map.addLayer({
          id: "sky-layer",
          type: "sky",
          paint: {
            "sky-type": "atmosphere",
            "sky-atmosphere-sun": [0.0, 0.0],
            "sky-atmosphere-sun-intensity": 15,
          },
        });
      }

      if (!map.getSource("kart-ortho")) {
        map.addSource("kart-ortho", {
          type: "raster",
          tiles: KART_TILES,
          tileSize: 256,
          maxzoom: 19,
        });
      }

      const layers: any = map.getStyle().layers || [];
      const firstSymbolId = layers.find((l: any) => l.type === "symbol")?.id;

      if (!map.getLayer("kart-ortho-layer")) {
        map.addLayer(
          {
            id: "kart-ortho-layer",
            type: "raster",
            source: "kart-ortho",
            paint: {
              "raster-opacity": opacityRef.current
                ? parseFloat(opacityRef.current.value)
                : 0.95,
            },
          },
          firstSymbolId
        );
      }

      if (!map.getLayer("3d-buildings")) {
        map.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", ["get", "extrude"], "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": [
                "coalesce",
                ["get", "height"],
                ["get", "render_height"],
              ],
              "fill-extrusion-base": ["coalesce", ["get", "min_height"], 0],
              "fill-extrusion-opacity": 0.85,
            },
          },
          firstSymbolId
        );
      }

      const boundaryCoordinates = coordinates?.map((coord: any) => [
        coord.longitude,
        coord.latitude,
      ]);
      if (
        boundaryCoordinates?.[0] !==
        boundaryCoordinates?.[boundaryCoordinates.length - 1]
      ) {
        boundaryCoordinates.push(boundaryCoordinates[0]);
      }

      const BOUNDARY: any = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [boundaryCoordinates || []],
        },
      };

      if (!map.getSource("boundary") && coordinates?.length) {
        map.addSource("boundary", {
          type: "geojson",
          data: BOUNDARY,
        });

        const topLayerId = layers[layers.length - 1].id;

        map.addLayer(
          {
            id: "boundary-line",
            type: "line",
            source: "boundary",
            layout: {},
            paint: {
              "line-color": "red",
              "line-width": 3,
            },
          },
          topLayerId
        );
      }
    });

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      const googleEarthUrl = `https://earth.google.com/web/@${lat},${lng},500a,35d,0y,0h,0t`;
      window.open(googleEarthUrl, "_blank");
    });

    return () => {
      map.remove();
    };
  }, [coordinates]);

  const handleView = (pitch: number, bearing: number, zoom: number) => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({ pitch, bearing, zoom, duration: 700 });
  };

  const handleExagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mapRef.current) return;
    const ex = parseFloat(e.target.value);
    mapRef.current.setTerrain({ source: "mapbox-dem", exaggeration: ex });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mapRef.current) return;
    const v = parseFloat(e.target.value);
    if (mapRef.current.getLayer("kart-ortho-layer")) {
      mapRef.current.setPaintProperty("kart-ortho-layer", "raster-opacity", v);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      <div
        className="ui"
        style={{
          position: "absolute",
          left: 6,
          top: 6,
          zIndex: 4,
          background: "rgba(255,255,255,0.95)",
          padding: 6,
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>3D View Controls</div>
        <div className="row">
          <button onClick={() => handleView(0, 0, 17.5)}>Top</button>
          <button onClick={() => handleView(60, -45, 18.6)}>Oblique NE</button>
          <button onClick={() => handleView(60, 135, 18.6)}>Oblique SW</button>
        </div>
        <div className="row">
          <label>
            Terrain exaggeration: <span>{exagRef.current?.value || "1.5"}</span>
            x
          </label>
          <input
            ref={exagRef}
            type="range"
            min="0.1"
            max="4"
            step="0.1"
            defaultValue={1.5}
            onChange={handleExagChange}
          />
        </div>
        <div className="row">
          <label>Imagery opacity</label>
          <input
            ref={opacityRef}
            type="range"
            min="0"
            max="1"
            step="0.01"
            defaultValue={0.95}
            onChange={handleOpacityChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Map3D;
