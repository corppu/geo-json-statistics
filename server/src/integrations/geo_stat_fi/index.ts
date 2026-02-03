import { BBox } from "geojson";
import { GeoJSONFeature, GeoJSONFeatureCollection, GeoJSONProperties } from "../../../../common/types";
import { mapGeoJSONFeatureCollection } from "../../../../common/tools/mapCoordinates";


export type WFSProperties = {
  id: number;
  kunta: string;
  vuosi: number;
  nimi: string;
  namn: string;
  name: string;
} & GeoJSON.GeoJsonProperties;

export interface WFSFeature extends GeoJSON.Feature {
  properties: WFSProperties,
  bbox: BBox,
}

export interface WFSGeoJSONFeatureCollection extends GeoJSON.FeatureCollection {
  features: WFSFeature[],
}

// WFS-rajapinnan perus-URL
const WFS_URL = "https://geo.stat.fi/geoserver/tilastointialueet/wfs";

// Parametrit: haetaan kiinteistötunnukset pienen alueen sisältä
const params = new URLSearchParams({
  service: "WFS",
  version: "2.0.0",
  request: "GetFeature",
  typeNames: "tilastointialueet:kunta1000k",
  outputFormat: "application/json",
});

/**
 * Get the first day of a given year in UTC, adjusted for a specific timezone offset.
 * @param {number} year - The year (e.g., 2026)
 * @param {number} timezoneOffsetMinutes - Timezone offset in minutes (e.g., +2 hours = 120, -5 hours = -300)
 * @returns {Date} - Date object representing the first day of the year in UTC
 */
function getFirstDayOfYearUTC(year: number, timezoneOffsetMinutes = 120) {
    if (!Number.isInteger(year)) {
        throw new Error("Year must be an integer.");
    }

    if (!Number.isInteger(timezoneOffsetMinutes)) {
        throw new Error("Timezone offset must be an integer (minutes).");
    }

    // Create date in local time for Jan 1st at midnight
    const localDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));

    // Adjust for timezone offset
    const utcTime = localDate.getTime() + (timezoneOffsetMinutes * 60 * 1000);

    return new Date(utcTime);
}

function mapToGeoJSONFeature(feature: WFSFeature) : GeoJSONFeature {
  return {
    ...feature,
    properties: {
      areaCode: feature.properties.kunta,
      areaName: {
        en: feature.properties.name,
        fi: feature.properties.nimi,
        sv: feature.properties.namn,
      },
      startDate: getFirstDayOfYearUTC(feature.properties.vuosi),
    }
  }
}

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

  const data = (await response.json()) as WFSGeoJSONFeatureCollection;

  // Perusvalidointi
  if (data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    throw new Error("Invalid GeoJSON format");
  }

  return mapGeoJSONFeatureCollection({
     ...data,
     features: data.features.map(mapToGeoJSONFeature)
   });
}
