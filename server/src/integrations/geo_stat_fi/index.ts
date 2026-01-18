

export type WFSProperties = {
  id: number;
  kunta: string;
  vuosi: number;
  nimi: string;
  namn: string;
  name: string;
} & GeoJSON.GeoJsonProperties;

export interface WFSFeature extends GeoJSON.Feature {
  properties: WFSProperties
}

export interface GeoJSONFeatureCollection extends GeoJSON.FeatureCollection {
  features: WFSFeature[]
}


export interface OutputGeoJSONFeatureCollection extends GeoJSON.FeatureCollection {
  features: OutputWFSFeature;
}

// WFS-rajapinnan perus-URL
const WFS_URL = "https://geo.stat.fi/geoserver/tilastointialueet/wfs";

// Parametrit: haetaan kiinteistötunnukset pienen alueen sisältä
const params = new URLSearchParams({
  service: "WFS",
  version: "2.0.0",
  request: "GetFeature",
  typeNames: "tilastointialueet:kunta4500k",
  outputFormat: "application/json",
});

export async function fetchGeoStatFIGeoJSON(): Promise<GeoJSONFeatureCollection> {
  const url = `${WFS_URL}?${params.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = (await response.json()) as GeoJSONFeatureCollection;

  // Perusvalidointi
  if (data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    throw new Error("Invalid GeoJSON format");
  }


  return {...data, features: data.features.map(mapFeature) };
}
