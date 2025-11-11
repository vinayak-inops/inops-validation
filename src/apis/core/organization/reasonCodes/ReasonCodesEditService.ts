// services/ReasonCodesEditService.ts

import { CookieManager } from "../../../../utils/cookies";
import { OrganizationService } from "../services/OrganizationService";
import { DuplicateChecker } from "./services/DuplicateChecker";
import { ReasonCode } from "./type";

export class ReasonCodesEditService {
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

  private validateReasonCode(reasonCodes: ReasonCode) {
    if (!reasonCodes.id) {
      throw new Error("ID is required for editing a reason code");
    }
    if (!reasonCodes.reasonCode?.trim() && !reasonCodes.reasonName?.trim()) {
      throw new Error("At least reasonCode or reasonName must be provided for update");
    }
  }

  public async editReasonCode(reasonCodes: ReasonCode): Promise<any> {
    this.validateReasonCode(reasonCodes);

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existingReasonCodes = orgData?.reasonCodes || [];

    // Find the existing item by id
    const existingItem = existingReasonCodes.find((rc: ReasonCode) => rc.id === reasonCodes.id);
    if (!existingItem) {
      return { status: false, error: "Reason code with provided ID not found" };
    }

    // Prevent reasonCode changes
    if (reasonCodes.reasonCode !== existingItem.reasonCode) {
      return { status: false, error: "Changing reasonCode is not allowed. You can only update the reasonName." };
    }

    // Check if reasonName is actually changing
    const isNameChanged = reasonCodes.reasonName !== existingItem.reasonName;
    if (!isNameChanged) {
      return { status: false, error: "No changes detected in reasonName" };
    }

    // Update the item
    const updatedReasonCodes = existingReasonCodes.map((rc: ReasonCode) =>
      rc.id === reasonCodes.id ? { ...rc, ...reasonCodes } : rc
    );

    orgData.reasonCodes = updatedReasonCodes;

    const updatedData = await this.orgService.updateOrganization(orgData);

    return {
      status: true,
      data: updatedData,
      tenantCode: this.tenantCode,
    };
  }
}
