// services/CasteDuplicateChecker.ts

import { CasteJson } from "../type";

/**
 * Utility class to check for duplicate castes based on specified fields
 */
export class CasteDuplicateChecker {
  /**
   * Check if a caste is a duplicate in the existing list
   * @param existingCastes Array of existing castes
   * @param newCaste New caste to check
   * @param fieldsToCheck Array of field names to check for duplicates (e.g., ["casteName"])
   * @returns true if duplicate found, false otherwise
   */
  public static isDuplicate(
    existingCastes: CasteJson[],
    newCaste: CasteJson,
    fieldsToCheck: string[]
  ): boolean {
    return existingCastes.some((caste: CasteJson) =>
      fieldsToCheck.some((field: string) => {
        const existingValue = (caste as any)[field];
        const newValue = (newCaste as any)[field];
        return existingValue === newValue && existingValue !== undefined && newValue !== undefined;
      })
    );
  }

  /**
   * Check if a casteName already exists (case-insensitive)
   * @param existingCastes Array of existing castes
   * @param casteName Caste name to check
   * @returns true if casteName exists, false otherwise
   */
  public static isDuplicateName(
    existingCastes: CasteJson[],
    casteName: string
  ): boolean {
    return existingCastes.some((caste: CasteJson) =>
      caste.casteName?.toLowerCase() === casteName?.toLowerCase()
    );
  }
}

export default CasteDuplicateChecker;
