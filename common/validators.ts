import { GeoJSONFeature, GeoJSONFeatureCollection, GeoJSONProperties, SimpleStylesProperties, ValidationResult, ValidBetween } from "./types";

export function validateValidBetween(object: ValidBetween, locator: string, validationResult: ValidationResult, nowDateValue = new Date(), nowDateKey ="nowDate") {
  const startDate = object.startDate ?  new Date(object.startDate) : new Date(0);
  const endDate = object.endDate ? new Date(object.endDate) : new Date(nowDateValue.getTime());
  
  if (startDate > nowDateValue) {
      validationResult.errors.push(`${locator}.startDate ${startDate.toISOString()} is in the future from ${locator}.${nowDateKey} ${nowDateValue.toISOString()}`)
  }

  if (endDate < nowDateValue) {
    validationResult.errors.push(`${locator}.endDate ${endDate.toISOString()} is in the past from ${locator}.${nowDateKey} ${nowDateValue.toISOString()}`)
  }

  return {
    valid: true,
    errors: []
  };
}

export function validateMandatoryObject(object: unknown, locator: string): ValidationResult {
    // Validate mandatory properties
  if (object === null || object === undefined || typeof object !== "object" || Array.isArray(object)) {
      return {
        valid: false,
        errors: [(`${locator} must be a valid object. Got: ${object}`)]
    }
  }
  return {
    valid: true,
    errors: []
  };
}

/**
 * Validates SimpleStylesProperties against the SimpleStyle specification rules.
 * 
 * @param properties - The properties object to validate
 * @returns An object with `valid: boolean` and optional `errors: string[]`
 */
export function validateSimpleStylesProperties(
  properties: Partial<SimpleStylesProperties>,
  locator: string = "properties",
  validationResult: ValidationResult = validateMandatoryObject(properties, locator),
): ValidationResult {
  const errors: string[] = validationResult.errors;

  // Validate marker-size
  if (properties["marker-size"] !== null && properties["marker-size"] !== undefined) {
    if (!["small", "medium", "large"].includes(properties["marker-size"])) {
      errors.push(`${locator}["marker-size"] must be one of: "small", "medium", "large". Got: ${properties["marker-size"]}`);
    }
  }

  // Validate marker-symbol
  if (properties["marker-symbol"] !== null && properties["marker-symbol"] !== undefined) {
    const symbol = String(properties["marker-symbol"]);
    const isValidInteger = /^[0-9]$/.test(symbol);
    const isValidLetter = /^[a-z]$/.test(symbol);
    const isValidIconId = /^[a-zA-Z0-9_-]+$/.test(symbol) && symbol.length > 1;
    
    if (!isValidInteger && !isValidLetter && !isValidIconId) {
      errors.push(`${locator}["marker-symbol"] must be 0-9, a-z, or an icon ID. Got: ${properties["marker-symbol"]}`);
    }
  }

  // Validate stroke-opacity
  if (properties["stroke-opacity"] !== null && properties["stroke-opacity"] !== undefined) {
    if (typeof properties["stroke-opacity"] !== "number" || properties["stroke-opacity"] < 0 || properties["stroke-opacity"] > 1) {
      errors.push(`${locator}["stroke-opacity"] must be a number between 0 and 1. Got: ${properties["stroke-opacity"]}`);
    }
  }

  // Validate stroke-width
  if (properties["stroke-width"] !== null && properties["stroke-width"] !== undefined) {
    if (typeof properties["stroke-width"] !== "number" || properties["stroke-width"] < 0) {
      errors.push(`${locator}["stroke-width"] must be a number >= 0. Got: ${properties["stroke-width"]}`);
    }
  }

  // Validate fill-opacity
  if (properties["fill-opacity"] !== null && properties["fill-opacity"] !== undefined) {
    if (typeof properties["fill-opacity"] !== "number" || properties["fill-opacity"] < 0 || properties["fill-opacity"] > 1) {
      errors.push(`${locator}["fill-opacity"] must be a number between 0 and 1. Got: ${properties["fill-opacity"]}`);
    }
  }

  validationResult.valid = validationResult.errors.length === 0;
  return validationResult;
}


/**
 * Validates GeoJSONProperties against the specification rules.
 * Includes validation of SimpleStylesProperties and GeoJSON-specific properties.
 * 
 * @param properties - The properties object to validate
 * @returns An object with `valid: boolean` and `errors: string[]`
 */
export function validateGeoJSONProperties(
  properties: Partial<GeoJSONProperties> | any,
  locator: string = "properties",
  validationResult = validateMandatoryObject(properties, locator)
): ValidationResult {
  if (validationResult.valid !== true) {
    return validationResult;
  }

  const errors: string[] = validationResult.errors;

  // Validate SimpleStylesProperties
  const styleValidation = validateSimpleStylesProperties(properties, locator);
  errors.push(...styleValidation.errors);

  // Validate required areaCode
  if (!properties.areaCode || typeof properties.areaCode !== "string") {
    errors.push(locator + ".areaCode is required and must be a string");
  }

  // Validate required areaName
  if (!properties.areaName || typeof properties.areaName !== "object") {
    errors.push(locator + ".areaName is required and must be an object");
  } else if (Object.keys(properties.areaName).length === 0) {
    errors.push(locator+".areaName must contain at least one language entry");
  }

  // Validate optional areaSize
  if (properties.areaSize !== null && properties.areaSize !== undefined) {
    if (typeof properties.areaSize !== "number" || properties.areaSize < 0) {
      errors.push(`${locator}.areaSize must be a number >= 0. Got: ${properties.areaSize}`);
    }
  }

  // Validate optional parentAreaCode
  if (properties.parentAreaCode !== null && properties.parentAreaCode !== undefined) {
    if (typeof properties.parentAreaCode !== "string") {
      errors.push(`${locator}.parentAreaCode must be a string. Got: ${typeof properties.parentAreaCode}`);
    }
  }

  // Validate optional populationSize
  if (properties.populationSize !== null && properties.populationSize !== undefined) {
    if (typeof properties.populationSize !== "number" || properties.populationSize < 0) {
      errors.push(`${locator}.populationSize must be a number >= 0. Got: ${properties.populationSize}`);
    }
  }

  // Validate optional valueMap
  if (properties.valueMap !== null && properties.valueMap !== undefined) {
    if (typeof properties.valueMap !== "object" || Array.isArray(properties.valueMap)) {
      errors.push(`${locator}.valueMap must be an object. Got: ${typeof properties.valueMap}`);
    }
  }

  validationResult.valid = validationResult.errors.length === 0;
  return validationResult;
}

export function validateGeoJSONFeature(feature: Partial<GeoJSONFeature>, locator: string = "feature") {
  return validateGeoJSONProperties(feature.properties, locator + ".properties");
}

export function validateGeoJSONFeatureCollection(featureCollection: Partial<GeoJSONFeatureCollection>, locator: string = "featureCollection",
  validationResult = validateMandatoryObject(featureCollection, locator)
) {
  if (!validationResult.valid) {
    return validationResult;
  }
  
  return validateGeoJSONProperties(featureCollection.properties, locator + ".properties", validationResult);
}
