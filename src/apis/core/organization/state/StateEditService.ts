// services/StateEditService.ts

import { CookieManager } from "../../../../utils/cookies";
import { OrganizationService } from "../services/OrganizationService";
import { StateJson } from "./type";

export class StateEditService {
  private tenantCode: string;
  private orgService: OrganizationService;

  constructor() {
    this.tenantCode = this.initTenantCode();
    this.orgService = new OrganizationService();
  }

  private initTenantCode(): string {
    const raw = CookieManager.get("keyclockroleinfo");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return parsed?.org || "";
      } catch {}
    }
    return "";
  }

  private validateState(state: StateJson) {
    if (!state.id) {
      throw new Error("ID is required for editing a state");
    }
    if (
      !state.countryCode?.trim() &&
      !state.countryName?.trim() &&
      !state.stateCode?.trim() &&
      !state.stateName?.trim()
    ) {
      throw new Error("At least one field (countryName or stateName) must be provided for update");
    }
  }

  /**
   * Validate that the country exists and matches in the country list (if countryName is being updated)
   */
  private validateCountryExists(orgData: any, state: StateJson, existingItem: StateJson): { valid: boolean; error?: string } {
    const countries = orgData?.reasonCodes || [];

    // If countryName is being changed, validate it exists
    if (state.countryName && state.countryName !== existingItem.countryName) {
      const country = countries.find(
        (c: any) =>
          c.countryCode?.toLowerCase() === existingItem.countryCode?.toLowerCase() &&
          !c.isDeleted
      );

      if (!country) {
        return {
          valid: false,
          error: `Country with code "${existingItem.countryCode}" not found in the system`,
        };
      }

      if (country.reasonName?.toLowerCase() !== state.countryName?.toLowerCase()) {
        return {
          valid: false,
          error: `Country name "${state.countryName}" does not match the registered name "${country.reasonName}" for code "${existingItem.countryCode}"`,
        };
      }
    }

    return { valid: true };
  }

  public async editState(state: StateJson): Promise<any> {
    this.validateState(state);

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existingStates = orgData?.states || [];

    // Find the existing item by id
    const existingItem = existingStates.find((s: StateJson) => s.id === state.id);
    if (!existingItem) {
      return { status: false, error: "State with provided ID not found" };
    }

    // Validate country if countryName is being updated
    const countryValidation = this.validateCountryExists(orgData, state, existingItem);
    if (!countryValidation.valid) {
      return { status: false, error: countryValidation.error };
    }

    // Prevent countryCode changes
    if (state.countryCode && state.countryCode !== existingItem.countryCode) {
      return {
        status: false,
        error: "Changing countryCode is not allowed. You can only update the countryName and stateName.",
      };
    }

    // Prevent stateCode changes
    if (state.stateCode && state.stateCode !== existingItem.stateCode) {
      return {
        status: false,
        error: "Changing stateCode is not allowed. You can only update the countryName and stateName.",
      };
    }

    // Check if countryName or stateName is actually changing
    const isCountryNameChanged = state.countryName && state.countryName !== existingItem.countryName;
    const isStateNameChanged = state.stateName && state.stateName !== existingItem.stateName;

    if (!isCountryNameChanged && !isStateNameChanged) {
      return { status: false, error: "No changes detected in state data" };
    }

    // Update the item
    const updatedStates = existingStates.map((s: StateJson) =>
      s.id === state.id ? { ...s, ...state } : s
    );

    orgData.states = updatedStates;

    const updatedData = await this.orgService.updateOrganization(orgData);

    return {
      status: true,
      data: updatedData,
      tenantCode: this.tenantCode,
    };
  }
}
