<template>
  <div class="geojson-map-container">
    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="error" class="error">Error: {{ error }}</div>

    <component
      v-else-if="mapComponent"
      :is="mapComponent"
      :geojson="geojson"
      :height="height"
      :zoom="zoom"
      :center="center"
    />

    <div v-else class="no-provider">
      Unknown map provider. Use route param or query param `provider=leaflet` or `provider=google`.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import LeafletMap from './LeafletMap.vue'
import GoogleMap from './GoogleMap.vue'
import type { GeoJSONFeatureCollection } from '../../../common/types'

const route = useRoute()

// Get provider from either route param or query param (allow both styles)
const providerParam = computed(() => {
  return ((route?.params?.provider as string) || (route?.query?.provider as string) || 'leaflet')
})

const provider = ref(providerParam.value.toLowerCase())

// Update provider when route param or query changes
watch(providerParam, (newVal) => {
  provider.value = (newVal || 'leaflet').toLowerCase()
})

const loading = ref(true)
const error = ref<string | null>(null)
const geojson = ref<GeoJSONFeatureCollection | null>(null)

// Optional props/config
const zoom = 13
const center: [number, number] = [60.1699, 24.9384]
const height = '500px'

const mapComponent = computed(() => {
  if (provider.value === 'leaflet') return LeafletMap
  if (provider.value === 'google') return GoogleMap
  return LeafletMap
})

async function fetchAreas() {
  loading.value = true
  error.value = null

  try {
    const res = await fetch('http://localhost:3000/geo/api/v1/areas')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const payload = await res.json()
    // The endpoint returns an envelope { data: <featureCollection> } (based on server sendJSON)
    const data = payload?.data ?? payload

    // Validate shape lightly
    if (data && data.type === 'FeatureCollection') {
      geojson.value = data as GeoJSONFeatureCollection
    } else {
      throw new Error('Invalid GeoJSON returned from API')
    }
  } catch (err: any) {
    error.value = err?.message ?? String(err)
    geojson.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAreas()
})
</script>

<style scoped>
.geojson-map-container {
  display: block;
}
.loading {
  padding: 1rem;
  color: #666;
}
.error {
  padding: 1rem;
  color: #a00;
}
.no-provider {
  padding: 1rem;
  color: #666;
}
</style>
