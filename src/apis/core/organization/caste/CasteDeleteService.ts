// services/CasteDeleteService.ts

import { CookieManager } from "../../../../utils/cookies";
import { OrganizationService } from "../services/OrganizationService";
import { CasteJson } from "./type";

export class CasteDeleteService {
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

  private validateDeleteRequest(caste: CasteJson) {
    if (!caste.id) {
      throw new Error("ID is required for deleting a caste");
    }

    // Ensure no other fields are being modified during deletion
    if (caste.casteName || caste.casteDescription) {
      throw new Error("Only deletion is allowed. Cannot modify caste data during deletion.");
    }
  }

  /**
   * Soft delete a caste by setting its `isDeleted` flag to true
   */
  public async deleteCaste(caste: CasteJson): Promise<any> {
    try {
      // Validate input
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }
      this.validateDeleteRequest(caste);

      // Get organization data
      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        throw new Error("Organization data not found");
      }

      const existingCastes = orgData.castes || [];
      console.log("Existing castes:", existingCastes.length, "orgData._id:", orgData?._id);

      // Find the target item
      const existingItem = existingCastes.find((c: CasteJson) => c.id === caste.id);
      if (!existingItem) {
        return { status: false, error: "Caste with provided ID not found" };
      }
      console.log("Found item to delete:", existingItem);

      // Check if already deleted
      if (existingItem.isDeleted) {
        return { status: false, error: "Caste is already deleted" };
      }

      // Only allow setting isDeleted to true, preserve all other fields
      const updatedCastes = existingCastes.map((c: CasteJson) =>
        c.id === caste.id
          ? {
              ...c,           // Keep existing values
              isDeleted: true  // Set deleted flag
            }
          : c
      );

      // Verify the update
      const updatedItem = updatedCastes.find((c: CasteJson) => c.id === caste.id);
      if (!updatedItem?.isDeleted) {
        throw new Error("Failed to mark item as deleted");
      }

      // Update organization data
      orgData.castes = updatedCastes;
      console.log("Prepared orgData for update (snippet):", { _id: orgData?._id, tenant: orgData?.tenant, castesCount: orgData.castes.length });
      const updatedData = await this.orgService.updateOrganization(orgData);

      if (!updatedData) {
        throw new Error("Failed to update organization data");
      }

      console.log("Successfully deleted caste:", caste.id);

      return {
        status: true,
        message: "Caste deleted successfully",
        data: updatedData,
        tenantCode: this.tenantCode,
      };

    } catch (error: any) {
      console.error("Error in deleteCaste:", error);
      return {
        status: false,
        error: error.message || "Failed to delete caste",
        tenantCode: this.tenantCode,
      };
    }
  }
}
