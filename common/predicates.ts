import {
  ColorString,
  ValidBetween,
} from "./types";

/**
 * Checks if a value is a valid object (not null, not array, not primitive)
 */
export function isValidObject(value: unknown): value is Record<string, any> {
  return value !== null && value !== undefined && typeof value === "object" && !Array.isArray(value);
}

/**
 * Checks if a value is a valid string
 */
export function isValidString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * Checks if a value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && isFinite(value);
}

/**
 * Checks if a value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isValidNumber(value) && value >= 0;
}

/**
 * Checks if a value is a number between 0 and 1 (inclusive)
 */
export function isOpacityValue(value: unknown): value is number {
  return isValidNumber(value) && value >= 0 && value <= 1;
}

/**
 * Checks if a value is a valid marker size
 */
export function isValidMarkerSize(value: unknown): value is "small" | "medium" | "large" {
  return ["small", "medium", "large"].includes(value as string);
}

/**
 * Checks if a value is a valid marker symbol
 */
export function isValidMarkerSymbol(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  const symbol = String(value);
  const isValidInteger = /^[0-9]$/.test(symbol);
  const isValidLetter = /^[a-z]$/.test(symbol);
  const isValidIconId = /^[a-zA-Z0-9_-]+$/.test(symbol) && symbol.length > 1;
  return isValidInteger || isValidLetter || isValidIconId;
}

/**
 * Checks if a value is a valid color string (hex format or null/undefined)
 */
export function isValidColorString(value: unknown): value is ColorString {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value !== "string") {
    return false;
  }
  // Check if it's a valid hex color (3 or 6 characters)
  return /^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value);
}

/**
 * Checks if an object is a valid ValidBetween object
 */
export function isValidBetween(value: unknown): value is ValidBetween {
  if (!isValidObject(value)) {
    return false;
  }


  // Check startDate
  if (value.startDate !== undefined && value.startDate !== null) {
    if (!(value.startDate instanceof Date || typeof value.startDate === "number" || typeof value.startDate === "string")) {
      return false;
    }
  }

  // Check endDate
  if (value.endDate !== undefined && value.endDate !== null) {
    if (!(value.endDate instanceof Date || typeof value.endDate === "number" && isNonNegativeNumber(value.endDate) || typeof value.endDate === "string")) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if a value is a valid language code (string)
 */
export function isValidLanguageCode(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * Checks if a value is a valid country code (string)
 */
export function isValidCountryCode(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * Checks if a value is a valid area code (string)
 */
export function isValidAreaCode(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
