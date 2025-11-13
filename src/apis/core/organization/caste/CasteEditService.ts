// services/CasteEditService.ts

import { CookieManager } from "../../../../utils/cookies";
import { OrganizationService } from "../services/OrganizationService";
import { CasteJson } from "./type";

export class CasteEditService {
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

  private validateCaste(caste: CasteJson) {
    if (!caste.id) {
      throw new Error("ID is required for editing a caste");
    }
    if (!caste.casteName?.trim() && !caste.casteDescription?.trim()) {
      throw new Error("At least casteName or casteDescription must be provided for update");
    }
  }

  public async editCaste(caste: CasteJson): Promise<any> {
    this.validateCaste(caste);

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existingCastes = orgData?.castes || [];

    // Find the existing item by id
    const existingItem = existingCastes.find((c: CasteJson) => c.id === caste.id);
    if (!existingItem) {
      return { status: false, error: "Caste with provided ID not found" };
    }

    // Check if casteName or casteDescription is actually changing
    const isNameChanged = caste.casteName && caste.casteName !== existingItem.casteName;
    const isDescChanged = caste.casteDescription && caste.casteDescription !== existingItem.casteDescription;

    if (!isNameChanged && !isDescChanged) {
      return { status: false, error: "No changes detected in caste data" };
    }

    // Update the item
    const updatedCastes = existingCastes.map((c: CasteJson) =>
      c.id === caste.id ? { ...c, ...caste } : c
    );

    orgData.castes = updatedCastes;

    const updatedData = await this.orgService.updateOrganization(orgData);

    return {
      status: true,
      data: updatedData,
      tenantCode: this.tenantCode,
    };
  }
}
