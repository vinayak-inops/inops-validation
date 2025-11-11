import { CookieManager } from "../../../../utils/cookies";
import { DeterministicMongoId } from "../../../../utils/idGenerator";
import { OrganizationService } from "../services/OrganizationService";
import { DuplicateChecker } from "./services/DuplicateChecker";
import { ReasonCode } from "./type";
import TimeUtils from "../../../../utils/time";

export class ReasonCodesService {
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
    if (!reasonCodes.reasonCode?.trim() || !reasonCodes.reasonName?.trim()) {
      throw new Error("reasonCode and reasonName are required and cannot be empty");
    }
  }

  public async postReasonCode(reasonCodes: ReasonCode): Promise<any> {
    this.validateReasonCode(reasonCodes);

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existingReasonCodes = orgData?.reasonCodes || [];

    if (DuplicateChecker.isDuplicate(existingReasonCodes, reasonCodes, ["reasonCode",])) {
      return { status: false, error: "Duplicate reasonCode found" };
    }

    const newId = DeterministicMongoId.encode(existingReasonCodes.length + 1);
    // Populate createdOn using IST timestamp and try to set createdBy from cookie (if present)
    let createdBy = "";
    try {
      const raw = CookieManager.get("keyclockroleinfo");
      if (raw) {
        const parsed = JSON.parse(raw);
        createdBy = parsed?.employeeID || "";
      }
    } catch {}

    const newReasonCode = {
      ...reasonCodes,
      id: newId,
      isDeleted: false,
      createdOn: TimeUtils.nowIST(),
      createdBy,
    };
    orgData.reasonCodes = [...existingReasonCodes, newReasonCode];

    const updatedData = await this.orgService.updateOrganization(orgData);

    return {
      status: true,
      data: updatedData,
      tenantCode: this.tenantCode,
    };
  }
}
