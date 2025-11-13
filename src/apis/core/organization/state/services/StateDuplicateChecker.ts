// services/StateDuplicateChecker.ts

import { StateJson } from "../type";

/**
 * Utility class to check for duplicate states based on specified fields
 */
export class StateDuplicateChecker {
  /**
   * Check if a state is a duplicate in the existing list
   * @param existingStates Array of existing states
   * @param newState New state to check
   * @param fieldsToCheck Array of field names to check for duplicates
   * @returns true if duplicate found, false otherwise
   */
  public static isDuplicate(
    existingStates: StateJson[],
    newState: StateJson,
    fieldsToCheck: string[]
  ): boolean {
    return existingStates.some((state: StateJson) =>
      fieldsToCheck.some((field: string) => {
        const existingValue = (state as any)[field];
        const newValue = (newState as any)[field];
        return existingValue === newValue && existingValue !== undefined && newValue !== undefined;
      })
    );
  }

  /**
   * Check if a stateCode already exists for a given country (case-insensitive)
   * @param existingStates Array of existing states
   * @param countryCode Country code to filter by
   * @param stateCode State code to check
   * @returns true if stateCode exists for this country, false otherwise
   */
  public static isDuplicateStateCode(
    existingStates: StateJson[],
    countryCode: string,
    stateCode: string
  ): boolean {
    return existingStates.some((state: StateJson) =>
      state.countryCode?.toLowerCase() === countryCode?.toLowerCase() &&
      state.stateCode?.toLowerCase() === stateCode?.toLowerCase()
    );
  }

  /**
   * Check if a stateName already exists for a given country (case-insensitive)
   * @param existingStates Array of existing states
   * @param countryCode Country code to filter by
   * @param stateName State name to check
   * @returns true if stateName exists for this country, false otherwise
   */
  public static isDuplicateStateName(
    existingStates: StateJson[],
    countryCode: string,
    stateName: string
  ): boolean {
    return existingStates.some((state: StateJson) =>
      state.countryCode?.toLowerCase() === countryCode?.toLowerCase() &&
      state.stateName?.toLowerCase() === stateName?.toLowerCase()
    );
  }
}

export default StateDuplicateChecker;
