// services/ReasonCodesDeleteService.ts

import { CookieManager } from "../../../../utils/cookies";
import { OrganizationService } from "../services/OrganizationService";
import { ReasonCode } from "./type";

export class ReasonCodesDeleteService {
  private tenantCode: string;
  private orgService: OrganizationService;

  constructor() {
    this.tenantCode = this.initTenantCode();
    this.orgService = new OrganizationService();
  }

  // Initialize tenantCode from cookie
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

  private validateDeleteRequest(reasonCode: ReasonCode) {
    if (!reasonCode.id) {
      throw new Error("ID is required for deleting a reason code");
    }
  }

  /**
   * Soft delete a reason code
   * Ensures reasonCode and reasonName are not modified during delete
   */
  public async deleteReasonCode(reasonCode: ReasonCode): Promise<any> {
    this.validateDeleteRequest(reasonCode);

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existingReasonCodes = orgData?.reasonCodes || [];

    // Find existing item by ID
    const existingItem = existingReasonCodes.find((rc: ReasonCode) => rc.id === reasonCode.id);
    if (!existingItem) {
      return { status: false, error: "Reason code with provided ID not found" };
    }

    // ❌ Prevent modification of reasonCode or reasonName
    const hasChangedCode = reasonCode.reasonCode && reasonCode.reasonCode !== existingItem.reasonCode;
    const hasChangedName = reasonCode.reasonName && reasonCode.reasonName !== existingItem.reasonName;

    if (hasChangedCode || hasChangedName) {
      return {
        status: false,
        error:
          "You cannot modify reasonCode or reasonName while deleting.",
      };
    }

    // ✅ Proceed to soft delete
    const updatedReasonCodes = existingReasonCodes.map((rc: ReasonCode) =>
      rc.id === reasonCode.id ? { ...rc, isDeleted: true } : rc
    );

    orgData.reasonCodes = updatedReasonCodes;

    const updatedData = await this.orgService.updateOrganization(orgData);

    return {
      status: true,
      message: "Reason code marked as deleted successfully",
      data: updatedData,
      tenantCode: this.tenantCode,
    };
  }
}
