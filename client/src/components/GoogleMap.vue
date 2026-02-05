/// <reference types="google.maps" />
<template>
  <div ref="mapContainer" class="google-map-container"></div>
</template>

<script setup lang="ts">
/// <reference types="google.maps" />
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { Loader } from "@googlemaps/js-api-loader";
import type { GeoJSONFeatureCollection } from "../../../common/types";

const route = useRoute()

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
const apiKeyToUse = ref<string>("");
let mapInstance: google.maps.Map | null = null;
let geoJsonLayer: google.maps.Data | null = null;

async function fetchGoogleApiKey() {
  try {
    const res = await fetch('http://localhost:3000/geo/api/v1/config/google-maps-key')
    if (!res.ok) throw new Error(`Failed to fetch Google Maps API key: HTTP ${res.status}`)
    const payload = await res.json()
    const apiKey = payload?.data?.apiKey
    if (apiKey) {
      apiKeyToUse.value = apiKey
    }
  } catch (err: any) {
    console.warn('Could not fetch Google Maps API key:', err?.message)
    // Non-fatal error - app will work with Leaflet
  }
}

function loadGoogleApiKey() {
  // First, try to get API key from URL search parameters
  const apiKeyFromUrl = props.apiKey || (route?.query?.googleApiKey as string) || (route?.query?.apiKey as string)

  if (apiKeyFromUrl) {
    apiKeyToUse.value = apiKeyFromUrl
    console.info('Google Maps API key loaded from ' + route?.query?.googleApiKey ? 'URL parameters' : 'props' )
    return
  }

  // If not in URL, fetch from backend
  fetchGoogleApiKey()
}

const initializeMap = async () => {
  if (!mapContainer.value || mapInstance || !apiKeyToUse.value) return;

  if (mapContainer.value) {
    mapContainer.value.style.height = props.height;
  }

  // Load Google Maps API
  const loader = new Loader({
    apiKey: apiKeyToUse.value,
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
    const rawProps = feature.getProperty("properties");
    const propsObj = rawProps && typeof rawProps === "object" ? (rawProps as Record<string, any>) : {};

    // helper that checks props object first, then top-level feature property
    const getProp = (candidates: string[]) => {
      for (const key of candidates) {
        if (propsObj[key] !== undefined) return propsObj[key];
        const val = feature.getProperty(key as any);
        if (val !== undefined) return val;
      }
      return undefined;
    };

    // create a props bag for marker icon and other usages
    const props: Record<string, any> = { ...propsObj };
    // ensure common marker keys are present
    const markerSize = getProp(["marker-size", "markerSize"]);
    const markerColor = getProp(["marker-color", "markerColor"]);
    if (markerSize !== undefined) props["marker-size"] = markerSize;
    if (markerColor !== undefined) props["marker-color"] = markerColor;

    // Determine feature type
    const geometry = feature.getGeometry();
    const geometryType = geometry?.getType();

    if (geometryType === "Point") {
      return {
        icon: createMarkerIcon(props),
        title: (getProp(["title"]) as string) || "",
      };
    } else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
      return {
        fillColor: (getProp(["fill", "fillColor"]) as string) || "#555555",
        strokeColor: (getProp(["stroke", "strokeColor"]) as string) || "#555555",
        fillOpacity: (getProp(["fill-opacity", "fillOpacity"]) as number) ?? 0.6,
        strokeOpacity: (getProp(["stroke-opacity", "strokeOpacity"]) as number) ?? 1,
        strokeWeight: (getProp(["stroke-width", "strokeWidth"]) as number) || 2,
      };
    } else if (geometryType === "LineString" || geometryType === "MultiLineString") {
      return {
        strokeColor: (getProp(["stroke", "strokeColor"]) as string) || "#555555",
        strokeOpacity: (getProp(["stroke-opacity", "strokeOpacity"]) as number) ?? 1,
        strokeWeight: (getProp(["stroke-width", "strokeWidth"]) as number) || 2,
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
watch(() => props.apiKey, (newApiKey) => {
  if (newApiKey) {
    loadGoogleApiKey();
  }
});
watch(() => route?.query?.googleApiKey, (newKey) => {
  if (typeof newKey === 'string') {
    loadGoogleApiKey();
  }
});
watch(() => apiKeyToUse.value, (newApiKey) => {
  if (newApiKey) {
    initializeMap();
  }
});

onMounted(() => {
  if (mapContainer.value) {
    mapContainer.value.style.height = props.height;
  }
  loadGoogleApiKey();
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
