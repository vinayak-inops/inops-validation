// services/StateDeleteService.ts

import { CookieManager } from "../../../../utils/cookies";
import { OrganizationService } from "../services/OrganizationService";
import { StateJson } from "./type";

export class StateDeleteService {
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

  private validateDeleteRequest(state: StateJson) {
    if (!state.id) {
      throw new Error("ID is required for deleting a state");
    }

    // Ensure no other fields are being modified during deletion
    if (
      state.countryCode ||
      state.countryName ||
      state.stateCode ||
      state.stateName
    ) {
      throw new Error("Only deletion is allowed. Cannot modify state data during deletion.");
    }
  }

  /**
   * Soft delete a state by setting its `isDeleted` flag to true
   */
  public async deleteState(state: StateJson): Promise<any> {
    try {
      // Validate input
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }
      this.validateDeleteRequest(state);

      // Get organization data
      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        throw new Error("Organization data not found");
      }

      const existingStates = orgData.states || [];
      console.log("Existing states:", existingStates.length, "orgData._id:", orgData?._id);

      // Find the target item
      const existingItem = existingStates.find((s: StateJson) => s.id === state.id);
      if (!existingItem) {
        return { status: false, error: "State with provided ID not found" };
      }
      console.log("Found item to delete:", existingItem);

      // Check if already deleted
      if (existingItem.isDeleted) {
        return { status: false, error: "State is already deleted" };
      }

      // Only allow setting isDeleted to true, preserve all other fields
      const updatedStates = existingStates.map((s: StateJson) =>
        s.id === state.id
          ? {
              ...s,           // Keep existing values
              isDeleted: true  // Set deleted flag
            }
          : s
      );

      // Verify the update
      const updatedItem = updatedStates.find((s: StateJson) => s.id === state.id);
      if (!updatedItem?.isDeleted) {
        throw new Error("Failed to mark item as deleted");
      }

      // Update organization data
      orgData.states = updatedStates;
      console.log("Prepared orgData for update (snippet):", {
        _id: orgData?._id,
        tenant: orgData?.tenant,
        statesCount: orgData.states.length,
      });
      const updatedData = await this.orgService.updateOrganization(orgData);

      if (!updatedData) {
        throw new Error("Failed to update organization data");
      }

      console.log("Successfully deleted state:", state.id);

      return {
        status: true,
        message: "State deleted successfully",
        data: updatedData,
        tenantCode: this.tenantCode,
      };
    } catch (error: any) {
      console.error("Error in deleteState:", error);
      return {
        status: false,
        error: error.message || "Failed to delete state",
        tenantCode: this.tenantCode,
      };
    }
  }
}
