<template>
  <div ref="mapContainer" class="leaflet-map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import L from "leaflet";
import type { GeoJSONFeatureCollection } from "../../../common/types";
import "leaflet/dist/leaflet.css";

interface Props {
  geojson?: GeoJSONFeatureCollection | null;
  zoom?: number;
  center?: [number, number];
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 13,
  center: () => [60.1699, 24.9384], // Helsinki coordinates as default
  height: "400px",
  geojson: null,
});

const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: L.Map | null = null;
let geoJsonLayer: L.GeoJSON | null = null;

const initializeMap = () => {
  if (!mapContainer.value || mapInstance) return;

  // Initialize map
  mapInstance = L.map(mapContainer.value).setView(props.center, props.zoom);

  // Add tile layer (OpenStreetMap)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(mapInstance);

  // Add GeoJSON if provided
  if (props.geojson) {
    addGeoJsonToMap(props.geojson);
  }
};

const addGeoJsonToMap = (geojson: GeoJSONFeatureCollection) => {
  if (!mapInstance) return;

  // Remove existing GeoJSON layer
  if (geoJsonLayer) {
    mapInstance.removeLayer(geoJsonLayer);
  }

  // Create GeoJSON layer with feature styling
  geoJsonLayer = L.geoJSON(geojson as any, {
    style: (feature) => {
      const props = feature?.properties;
      if (!props) {
        return {
          color: "#555555",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.6,
        };
      }

      return {
        color: props["stroke"] || "#555555",
        weight: props["stroke-width"] || 2,
        opacity: props["stroke-opacity"] ?? 1,
        fillColor: props["fill"] || "#555555",
        fillOpacity: props["fill-opacity"] ?? 0.6,
      };
    },
    pointToLayer: (feature, latlng) => {
      const props = feature?.properties;
      if (!props) {
        return L.circleMarker(latlng);
      }

      const markerSize = props["marker-size"] || "medium";
      const radius =
        markerSize === "small" ? 4 : markerSize === "large" ? 10 : 7;

      return L.circleMarker(latlng, {
        radius,
        fillColor: props["marker-color"] || "#7e7e7e",
        color: props["stroke"] || "#555555",
        weight: 2,
        opacity: props["stroke-opacity"] ?? 1,
        fillOpacity: props["fill-opacity"] ?? 0.8,
      });
    },
    onEachFeature: (feature, layer) => {
      const props = feature?.properties;
      if (!props) return;

      let popupContent = "";

      // Add title
      if (props.title) {
        popupContent += `<strong>${props.title}</strong><br>`;
      }

      // Add description
      if (props.description) {
        popupContent += `${props.description}<br>`;
      }

      // Add area information
      if (props.areaCode) {
        popupContent += `<br><strong>Area Code:</strong> ${props.areaCode}`;
      }

      if (props.areaName) {
        const areaNames = Object.values(props.areaName).join(", ");
        popupContent += `<br><strong>Area Name:</strong> ${areaNames}`;
      }

      if (props.areaSize !== undefined && props.areaSize !== null) {
        popupContent += `<br><strong>Area Size:</strong> ${props.areaSize}`;
      }

      if (props.populationSize !== undefined && props.populationSize !== null) {
        popupContent += `<br><strong>Population:</strong> ${props.populationSize}`;
      }

      if (popupContent) {
        layer.bindPopup(popupContent);
      }
    },
  }).addTo(mapInstance);

  // Fit bounds to GeoJSON
  const bounds = geoJsonLayer.getBounds();
  if (bounds.isValid()) {
    mapInstance.fitBounds(bounds, { padding: [50, 50] });
  }
};

const updateGeojson = (newGeojson: GeoJSONFeatureCollection | null) => {
  if (!mapInstance) return;

  if (newGeojson) {
    addGeoJsonToMap(newGeojson);
  } else if (geoJsonLayer) {
    mapInstance.removeLayer(geoJsonLayer);
    geoJsonLayer = null;
  }
};

const updateCenter = (newCenter: [number, number]) => {
  if (mapInstance) {
    mapInstance.setView(newCenter, props.zoom);
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
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<style scoped>
.leaflet-map-container {
  width: 100%;
  height: 400px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
