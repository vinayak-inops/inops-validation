// services/CountryDuplicateChecker.ts

import { countryJson } from "../type";

/**
 * Utility class to check for duplicate countries based on specified fields
 */
export class CountryDuplicateChecker {
  /**
   * Check if a country is a duplicate in the existing list
   * @param existingCountries Array of existing countries
   * @param newCountry New country to check
   * @param fieldsToCheck Array of field names to check for duplicates (e.g., ["countryCode"])
   * @returns true if duplicate found, false otherwise
   */
  public static isDuplicate(
    existingCountries: countryJson[],
    newCountry: countryJson,
    fieldsToCheck: string[]
  ): boolean {
    return existingCountries.some((country: countryJson) =>
      fieldsToCheck.some((field: string) => {
        const existingValue = (country as any)[field];
        const newValue = (newCountry as any)[field];
        return existingValue === newValue && existingValue !== undefined && newValue !== undefined;
      })
    );
  }

  /**
   * Check if a countryCode already exists (case-insensitive)
   * @param existingCountries Array of existing countries
   * @param countryCode Country code to check
   * @returns true if countryCode exists, false otherwise
   */
  public static isDuplicateCode(
    existingCountries: countryJson[],
    countryCode: string
  ): boolean {
    return existingCountries.some((country: countryJson) =>
      country.countryCode?.toLowerCase() === countryCode?.toLowerCase()
    );
  }

  /**
   * Check if a countryName (reasonName) already exists (case-insensitive)
   * @param existingCountries Array of existing countries
   * @param countryName Country name to check
   * @returns true if countryName exists, false otherwise
   */
  public static isDuplicateName(
    existingCountries: countryJson[],
    countryName: string
  ): boolean {
    return existingCountries.some((country: countryJson) =>
      country.reasonName?.toLowerCase() === countryName?.toLowerCase()
    );
  }
}

export default CountryDuplicateChecker;
