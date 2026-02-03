/// <reference types="google.maps" />
<template>
  <div ref="mapContainer" class="google-map-container"></div>
</template>

<script setup lang="ts">
/// <reference types="google.maps" />
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
import type { GeoJSONFeatureCollection, GeoJSONProperties } from "../../../common/types";

interface Props {
  geojson?: GeoJSONFeatureCollection | null;
  zoom?: number;
  center?: [number, number];
  height?: string;
  apiKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 13,
  center: () => [60.1699, 24.9384], // Helsinki coordinates as default (note: Google Maps uses lat, lng)
  height: "400px",
  geojson: null,
  apiKey: "",
});

const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: google.maps.Map | null = null;
let geoJsonLayer: google.maps.Data | null = null;

const initializeMap = async () => {
  if (!mapContainer.value || mapInstance) return;

  // Load Google Maps API
  const loader = new Loader({
    apiKey: props.apiKey || "YOUR_GOOGLE_MAPS_API_KEY",
    version: "weekly",
    libraries: ["maps"],
  });

  try {
    await loader.load();

    // Initialize map with lat, lng order for Google Maps
    mapInstance = new google.maps.Map(mapContainer.value, {
      zoom: props.zoom,
      center: {
        lat: props.center[0],
        lng: props.center[1],
      },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    // Add GeoJSON if provided
    if (props.geojson) {
      addGeoJsonToMap(props.geojson);
    }
  } catch (error) {
    console.error("Error loading Google Maps API:", error);
  }
};

const addGeoJsonToMap = (geojson: GeoJSONFeatureCollection) => {
  if (!mapInstance) return;

  // Remove existing GeoJSON layer
  if (geoJsonLayer) {
    geoJsonLayer.forEach((feature) => {
      geoJsonLayer?.remove(feature);
    });
  } else {
    geoJsonLayer = new google.maps.Data({ map: mapInstance });
  }

  // Add GeoJSON data
  geoJsonLayer.addGeoJson(geojson as any);

  // Apply styling to features
  geoJsonLayer.setStyle((feature) => {
    const props = (feature.getProperty("properties") || {}) as GeoJSONProperties;

    // Determine feature type
    const geometry = feature.getGeometry();
    const geometryType = geometry?.getType();

    if (geometryType === "Point") {
      return {
        icon: createMarkerIcon(props),
        title: props.title || "",
      };
    } else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
      return {
        fillColor: props.fill || "#555555",
        strokeColor: props.stroke || "#555555",
        fillOpacity: props["fill-opacity"] ?? 0.6,
        strokeOpacity: props["stroke-opacity"] ?? 1,
        strokeWeight: props["stroke-width"] || 2,
      };
    } else if (geometryType === "LineString" || geometryType === "MultiLineString") {
      return {
        strokeColor: props.stroke || "#555555",
        strokeOpacity: props["stroke-opacity"] ?? 1,
        strokeWeight: props["stroke-width"] || 2,
      };
    }

    return {};
  });

  // Add click listeners for popups
  geoJsonLayer.addListener("click", (event: any) => {
    const feature = event.feature;
    const props = feature.getProperty("properties") || {};

    let infoWindowContent = "<div style='max-width: 300px;'>";

    // Add title
    if (props.title) {
      infoWindowContent += `<strong style='font-size: 16px;'>${props.title}</strong><br>`;
    }

    // Add description
    if (props.description) {
      infoWindowContent += `${props.description}<br>`;
    }

    // Add area information
    if (props.areaCode) {
      infoWindowContent += `<br><strong>Area Code:</strong> ${props.areaCode}`;
    }

    if (props.areaName) {
      const areaNames = Object.values(props.areaName).join(", ");
      infoWindowContent += `<br><strong>Area Name:</strong> ${areaNames}`;
    }

    if (props.areaSize !== undefined && props.areaSize !== null) {
      infoWindowContent += `<br><strong>Area Size:</strong> ${props.areaSize}`;
    }

    if (props.populationSize !== undefined && props.populationSize !== null) {
      infoWindowContent += `<br><strong>Population:</strong> ${props.populationSize}`;
    }

    infoWindowContent += "</div>";

    // Get geometry center for info window
    const geometry = feature.getGeometry();
    let position: google.maps.LatLng | undefined;

    if (geometry?.getType() === "Point") {
      position = geometry.get();
    } else if (geometry?.getType() === "Polygon") {
      // Get bounds and center
      const bounds = new google.maps.LatLngBounds();
      geometry.forEachLatLng((latLng: any) => bounds.extend(latLng));
      position = bounds.getCenter();
    }

    if (position) {
      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
        position: position,
      });
      infoWindow.open(mapInstance);
    }
  });

  // Fit bounds to GeoJSON
  const bounds = new google.maps.LatLngBounds();
  geoJsonLayer.forEach((feature) => {
    const geometry = feature.getGeometry() as any;
    if (geometry?.getType() === "Point") {
      bounds.extend(geometry.get());
    } else {
      geometry?.forEachLatLng((latLng: any) => bounds.extend(latLng));
    }
  });

  if (!bounds.isEmpty()) {
    mapInstance?.fitBounds(bounds, 50);
  }
};

const createMarkerIcon = (props: Record<string, any>) => {
  const size = props["marker-size"] || "medium";
  const scale =
    size === "small" ? 24 : size === "large" ? 40 : 32;

  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: scale / 8,
    fillColor: props["marker-color"] || "#7e7e7e",
    fillOpacity: 1,
    strokeColor: props.stroke || "#ffffff",
    strokeWeight: 2,
  };
};

const updateGeojson = (newGeojson: GeoJSONFeatureCollection | null) => {
  if (!mapInstance) return;

  if (newGeojson) {
    addGeoJsonToMap(newGeojson);
  } else if (geoJsonLayer) {
    geoJsonLayer.forEach((feature) => {
      geoJsonLayer?.remove(feature);
    });
  }
};

const updateCenter = (newCenter: [number, number]) => {
  if (mapInstance) {
    mapInstance.setCenter({
      lat: newCenter[0],
      lng: newCenter[1],
    });
  }
};

const updateZoom = (newZoom: number) => {
  if (mapInstance) {
    mapInstance.setZoom(newZoom);
  }
};

watch(() => props.geojson, updateGeojson, { deep: true });
watch(() => props.center, updateCenter);
watch(() => props.zoom, updateZoom);

onMounted(() => {
  if (mapContainer.value) {
    mapContainer.value.style.height = props.height;
  }
  initializeMap();
});

onUnmounted(() => {
  if (mapInstance) {
    // Google Maps doesn't have a remove method, just nullify
    mapInstance = null;
  }
  if (geoJsonLayer) {
    geoJsonLayer = null;
  }
});
</script>

<style scoped>
.google-map-container {
  width: 100%;
  height: 400px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
