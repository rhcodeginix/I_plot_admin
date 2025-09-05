// import React, { useState, useEffect } from "react";
// import { GoogleMap, useJsApiLoader, Polygon } from "@react-google-maps/api";

// const GoogleMapComponent: React.FC<{ coordinates: any }> = ({
//   coordinates,
// }) => {
//   const [map, setMap] = useState<any | null>(null);

//   const containerStyle = {
//     width: "100%",
//     height: "100%",
//   };

//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
//   });

//   const bounds = coordinates?.length
//     ? coordinates.reduce(
//         (acc: any, coord: any) => {
//           acc.north = Math.max(acc.north, coord.latitude);
//           acc.south = Math.min(acc.south, coord.latitude);
//           acc.east = Math.max(acc.east, coord.longitude);
//           acc.west = Math.min(acc.west, coord.longitude);
//           return acc;
//         },
//         {
//           north: coordinates[0].latitude,
//           south: coordinates[0].latitude,
//           east: coordinates[0].longitude,
//           west: coordinates[0].longitude,
//         }
//       )
//     : null;

//   const center = bounds
//     ? {
//         lat: (bounds.north + bounds.south) / 2,
//         lng: (bounds.east + bounds.west) / 2,
//       }
//     : { lat: 0, lng: 0 };

//   const onLoad = (map: any) => {
//     setMap(map);
//   };

//   const onUnmount = () => {
//     setMap(null);
//   };

//   const mapOptions = {
//     mapTypeId: "satellite",
//     mapTypeControl: false,
//     streetViewControl: false,
//     fullscreenControl: false,
//     zoomControl: false,
//     disableDefaultUI: true,
//     draggable: false,
//     scrollwheel: false,
//     disableDoubleClickZoom: true,
//     styles: [
//       {
//         featureType: "all",
//         elementType: "labels",
//         stylers: [{ visibility: "off" }],
//       },
//     ],
//   };

//   const polygonOptions = {
//     fillColor: "transparent",
//     fillOpacity: 0.3,
//     strokeColor: "#FF0000",
//     strokeOpacity: 1,
//     strokeWeight: 2,
//     draggable: false,
//     editable: false,
//     visible: true,
//     zIndex: 1,
//   };

//   const getClosedPath = () => {
//     if (!coordinates || coordinates.length === 0) return [];

//     const path = coordinates.map((coord: any) => ({
//       lat: coord.latitude,
//       lng: coord.longitude,
//     }));

//     const firstPoint = path[0];
//     const lastPoint = path[path.length - 1];

//     if (firstPoint.lat !== lastPoint.lat || firstPoint.lng !== lastPoint.lng) {
//       path.push(firstPoint);
//     }

//     return path;
//   };

//   const handleMapClick = (e: any) => {
//     const clickedLatLng = e.latLng;
//     if (!clickedLatLng) return;

//     const lat = clickedLatLng.lat();
//     const lng = clickedLatLng.lng();

//     const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
//     window.open(googleMapsUrl, "_blank");

//     if (map) {
//       map.panTo(clickedLatLng);
//       map.setZoom(12);
//     }
//   };

//   useEffect(() => {
//     if (map && bounds) {
//       const googleBounds = new google.maps.LatLngBounds(
//         { lat: bounds.south, lng: bounds.west },
//         { lat: bounds.north, lng: bounds.east }
//       );

//       window.setTimeout(() => {
//         map.fitBounds(googleBounds);
//       }, 500);
//     }
//   }, [map, bounds]);
//   if (!isLoaded) return <div>Loading Map...</div>;

//   return (
//     <GoogleMap
//       mapContainerStyle={containerStyle}
//       center={center}
//       onLoad={onLoad}
//       onUnmount={onUnmount}
//       options={mapOptions}
//     >
//       {coordinates && coordinates.length > 0 && (
//         <Polygon
//           paths={getClosedPath()}
//           options={polygonOptions}
//           onClick={handleMapClick}
//         />
//       )}
//     </GoogleMap>
//   );
// };

// export default GoogleMapComponent;

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
// import "mapbox-gl/dist/mapbox-gl.css";
import Ic_close from "../../../assets/images/Ic_close.svg";
import Ic_logo from "../../../assets/images/Ic_logo.svg";
import Modal from "../../common/modal";
import Map3D from "./map3d";

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX;

interface MapComponentProps {
  coordinates: any;
}

const MapComponent: React.FC<MapComponentProps> = ({ coordinates }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {},
        layers: [],
      },
      center: [coordinates[0].longitude, coordinates[0].latitude],
      zoom: 19,
      maxZoom: 19,
      scrollZoom: false,
      dragPan: false,
    });

    mapRef.current.on("load", () => {
      mapRef.current.scrollZoom.disable();
      mapRef.current.boxZoom.disable();
      mapRef.current.doubleClickZoom.disable();
      mapRef.current.touchZoomRotate.disable();

      mapRef.current!.addSource("norge-ortofoto", {
        type: "raster",
        tiles: [
          "https://opencache2.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?" +
            "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0" +
            "&LAYER=terreng_norgeskart" +
            "&STYLE=default" +
            "&FORMAT=image/jpgpng" +
            "&tileMatrixSet=default028mm" +
            "&tileMatrix={z}&tileRow={y}&tileCol={x}",
        ],
        tileSize: 256,
        maxzoom: 20,
      });

      mapRef.current!.addLayer({
        id: "norge-ortofoto-layer",
        type: "raster",
        source: "norge-ortofoto",
        paint: { "raster-opacity": 1 },
      });

      const polygonCoordinates: any = coordinates.map((coord: any) => [
        coord.longitude,
        coord.latitude,
      ]);

      mapRef.current!.addSource("bbox", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [polygonCoordinates],
          },
        },
      });

      mapRef.current!.addLayer({
        id: "bbox-layer",
        type: "line",
        source: "bbox",
        paint: { "line-color": "#FF0000", "line-width": 3 },
      });

      const bounds = polygonCoordinates.reduce(
        (b: any, coord: any) => b.extend(coord),
        new mapboxgl.LngLatBounds(polygonCoordinates[0], polygonCoordinates[0])
      );

      mapRef.current!.fitBounds(bounds, { padding: 40 });
    });

    mapRef.current.on("click", () => {
      setModalOpen(true);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [coordinates]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {modalOpen && (
        <Modal isOpen={true} onClose={() => setModalOpen(false)}>
          <div className="bg-white p-3 md:p-6 rounded-lg w-[340px] sm:w-[500px] md:w-[700px] lg:w-[900px] relative">
            <div className="flex items-center justify-between gap-2 mb-4 md:mb-6">
              <img src={Ic_logo} alt="logo" className="w-[90px] lg:w-auto" />
              <button
                className="absolute top-2 md:top-3 right-2 md:right-3"
                onClick={() => setModalOpen(false)}
              >
                <img src={Ic_close} alt="close" />
              </button>
            </div>
            <div className="h-[70vh] w-full">
              <Map3D coordinates={coordinates} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MapComponent;
