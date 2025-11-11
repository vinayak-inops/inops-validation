// services/CountryDeleteService.ts

import { CookieManager } from "../../../../utils/cookies";
import { OrganizationService } from "../services/OrganizationService";
import { countryJson } from "./type";

export class CountryDeleteService {
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

  private validateDeleteRequest(country: countryJson) {
    if (!country.id) {
      throw new Error("ID is required for deleting a country");
    }

    // Ensure no other fields are being modified during deletion
    if (country.countryCode || country.reasonName) {
      throw new Error("Only deletion is allowed. Cannot modify country code or name during deletion.");
    }
  }

  /**
   * Soft delete a country by setting its `isDeleted` flag to true
   */
  public async deleteCountry(country: countryJson): Promise<any> {
    try {
      // Validate input
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }
      this.validateDeleteRequest(country);

      // Get organization data
      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        throw new Error("Organization data not found");
      }

      const existingCountries = orgData.reasonCodes || [];
      console.log("Existing countries:", existingCountries.length, "orgData._id:", orgData?._id);

      // Find the target item
      const existingItem = existingCountries.find((c: countryJson) => c.id === country.id);
      if (!existingItem) {
        return { status: false, error: "Country with provided ID not found" };
      }
      console.log("Found item to delete:", existingItem);

      // Check if already deleted
      if (existingItem.isDeleted) {
        return { status: false, error: "Country is already deleted" };
      }

      // Only allow setting isDeleted to true, preserve all other fields
      const updatedCountries = existingCountries.map((c: countryJson) =>
        c.id === country.id
          ? {
              ...c,           // Keep existing values
              isDeleted: true  // Set deleted flag
            }
          : c
      );

      // Verify the update
      const updatedItem = updatedCountries.find((c: countryJson) => c.id === country.id);
      if (!updatedItem?.isDeleted) {
        throw new Error("Failed to mark item as deleted");
      }

      // Update organization data
      orgData.reasonCodes = updatedCountries;
      console.log("Prepared orgData for update (snippet):", { _id: orgData?._id, tenant: orgData?.tenant, countriesCount: orgData.reasonCodes.length });
      const updatedData = await this.orgService.updateOrganization(orgData);

      if (!updatedData) {
        throw new Error("Failed to update organization data");
      }

      console.log("Successfully deleted country:", country.id);

      return {
        status: true,
        message: "Country deleted successfully",
        data: updatedData,
        tenantCode: this.tenantCode,
      };

    } catch (error: any) {
      console.error("Error in deleteCountry:", error);
      return {
        status: false,
        error: error.message || "Failed to delete country",
        tenantCode: this.tenantCode,
      };
    }
  }
}
