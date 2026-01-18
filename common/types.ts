export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidBetween {
    startDate?: Date | number | string | null | undefined;
    endDate?: Date | number | string | null | undefined;
}

export type CountryCode = string;
export type AreaCode = string;
export type LanguageCode = string;
export type ColorString = string | null | undefined;

/**
 * Represents the styling properties for a simple GeoJSON feature.
 * 
 * These properties control the visual appearance of markers, lines, and polygons
 * in a GeoJSON feature collection, following the SimpleStyle specification.
 * 
 * @property {string} [title] - A title to display when the item is clicked or hovered over. Defaults to "".
 * @property {string} [description] - A description to display when the item is clicked or hovered over. Defaults to "".
 * @property {"small" | "medium" | "large"} [marker-size] - The size of the marker. Defaults to "medium".
 * @property {string | number} [marker-symbol] - A symbol to position in the center of the marker icon. Can be an icon ID, integer 0-9, or lowercase letter "a"-"z". If not provided or empty, only the marker is shown.
 * @property {ColorString} [marker-color] - The marker's color following COLOR RULES. Defaults to "7e7e7e".
 * @property {ColorString} [stroke] - The color of a line as part of a polygon, polyline, or multigeometry, following COLOR RULES. Defaults to "555555".
 * @property {number} [stroke-opacity] - The opacity of the line component (0-1). Defaults to 1.0.
 * @property {number} [stroke-width] - The width of the line component in pixels (≥0). Defaults to 2.
 * @property {ColorString} [fill] - The color of the interior of a polygon, following COLOR RULES. Defaults to "555555".
 * @property {number} [fill-opacity] - The opacity of the polygon interior (0-1). Defaults to 0.6.
 */
export interface SimpleStylesProperties {
  // OPTIONAL: default ""
  // A title to show when this item is clicked or
  // hovered over
  title?: string | null | undefined,

  // OPTIONAL: default ""
  // A description to show when this item is clicked or
  // hovered over
  description?: string | null | undefined,

  // OPTIONAL: default "medium"
  // specify the size of the marker. sizes
  // can be different pixel sizes in different
  // implementations
  // Value must be one of
  // "small"
  // "medium"
  // "large"
  "marker-size"?: "small" | "medium" | "large" | null | undefined,

  // OPTIONAL: default ""
  // a symbol to position in the center of this icon
  // if not provided or "", no symbol is overlaid
  // and only the marker is shown
  // Allowed values include
  // - Icon ID
  // - An integer 0 through 9
  // - A lowercase character "a" through "z"
  "marker-symbol"?: string | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  // OPTIONAL: default "7e7e7e"
  // the marker's color
  //
  // value must follow COLOR RULES
  "marker-color"?: ColorString;

  // OPTIONAL: default "555555"
  // the color of a line as part of a polygon, polyline, or
  // multigeometry
  //
  // value must follow COLOR RULES
  stroke?: ColorString,

  // OPTIONAL: default 1.0
  // the opacity of the line component of a polygon, polyline, or
  // multigeometry
  //
  // value must be a floating point number greater than or equal to
  // zero and less or equal to than one
  "stroke-opacity"?: number | null | undefined,

  // OPTIONAL: default 2
  // the width of the line component of a polygon, polyline, or
  // multigeometry
  //
  // value must be a floating point number greater than or equal to 0
  "stroke-width"?: number | null | undefined,

  // OPTIONAL: default "555555"
  // the color of the interior of a polygon
  //
  // value must follow COLOR RULES
  fill?: ColorString,

  // OPTIONAL: default 0.6
  // the opacity of the interior of a polygon. Implementations
  // may choose to set this to 0 for line features.
  //
  // value must be a floating point number greater than or equal to
  // zero and less or equal to than one
  "fill-opacity"?: number | null | undefined,
};

/**
 * Represents the properties of a GeoJSON feature with geographic and demographic information.
 * Extends SimpleStylesProperties to include styling capabilities.
 *
 * @interface GeoJSONProperties
 * @extends {SimpleStylesProperties}
 *
 * @property {AreaCode} areaCode - The unique code identifier for the geographic area.
 * @property {Record<LanguageCode, string>} areaName - Localized names of the area, keyed by language code.
 * @property {number | null | undefined} [areaSize] - The size of the area in square units, if available.
 * @property {AreaCode | null | undefined} [parentAreaCode] - The area code of the parent geographic region, if applicable.
 * @property {number | null | undefined} [populationSize] - The population count for the area, if available.
 * @property {Record<string, string | string[] | number | number[]> | null | undefined} [valueMap] - Additional custom data values mapped by string keys, supporting various data types.
 */
export interface GeoJSONProperties extends SimpleStylesProperties {
  areaCode: AreaCode;
  areaName: Record<LanguageCode, string>;
  areaSize?: number | null | undefined;
  parentAreaCode?: AreaCode | null | undefined;
  populationSize?: number | null | undefined;
  valueMap?: Record<string, string | string[] | number | number[]> | null | undefined;
}

export interface GeoJSONFeature extends GeoJSON.Feature {
  properties: GeoJSONProperties;
}

export interface GeoJSONFeatureCollection extends GeoJSON.FeatureCollection {
  features: GeoJSONFeature[];
  properties: GeoJSONProperties;
}
