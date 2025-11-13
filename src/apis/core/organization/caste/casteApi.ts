import { CookieManager } from "../../../../utils/cookies";
import { DeterministicMongoId } from "../../../../utils/idGenerator";
import { OrganizationService } from "../services/OrganizationService";
import TimeUtils from "../../../../utils/time";
import { CasteDuplicateChecker } from "./services/CasteDuplicateChecker";
import { CasteJson } from "./type";

/**
 * Caste service - create / edit / soft-delete caste entries stored under organization.castes
 */
export class CasteService {
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

  private validateCaste(payload: CasteJson) {
    if (!payload.casteName?.trim() || !payload.casteDescription?.trim()) {
      throw new Error("casteName and casteDescription are required and cannot be empty");
    }
  }

  public async postCaste(payload: CasteJson): Promise<any> {
    this.validateCaste(payload);

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existing = orgData?.castes || [];

    // Check for duplicate casteName using DuplicateChecker
    if (CasteDuplicateChecker.isDuplicateName(existing, payload.casteName)) {
      return { status: false, error: "Duplicate casteName found" };
    }

    const newId = DeterministicMongoId.encode(existing.length + 1);

    // createdBy from cookie if available
    let createdBy = "";
    try {
      const raw = CookieManager.get("keyclockroleinfo");
      if (raw) {
        const parsed = JSON.parse(raw);
        createdBy = parsed?.employeeId || parsed?.employeeID || parsed?.user || parsed?.username || "";
      }
    } catch {}

    const newItem = {
      ...payload,
      id: newId,
      isDeleted: false,
      createdOn: TimeUtils.nowIST(),
      createdBy,
    };

    orgData.castes = [...existing, newItem];
    const updated = await this.orgService.updateOrganization(orgData);

    return { status: true, data: updated, tenantCode: this.tenantCode };
  }

  public async editCaste(payload: CasteJson): Promise<any> {
    if (!payload.id) throw new Error("ID is required for editing a caste entry");

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existing = orgData?.castes || [];

    const item = existing.find((c: any) => c.id === payload.id);
    if (!item) return { status: false, error: "Caste entry with provided ID not found" };

    // Allow updating either casteName or casteDescription
    const isNameChanged = payload.casteName && payload.casteName !== item.casteName;
    const isDescChanged = payload.casteDescription && payload.casteDescription !== item.casteDescription;

    if (!isNameChanged && !isDescChanged) {
      return { status: false, error: "No changes detected in caste data" };
    }

    // Check for duplicate casteName if it's being changed
    if (isNameChanged && CasteDuplicateChecker.isDuplicateName(existing.filter((c: any) => c.id !== payload.id), payload.casteName)) {
      return { status: false, error: "casteName already exists" };
    }

    const updatedList = existing.map((c: any) => (c.id === payload.id ? { ...c, ...payload } : c));
    orgData.castes = updatedList;
    const updated = await this.orgService.updateOrganization(orgData);

    return { status: true, data: updated, tenantCode: this.tenantCode };
  }

  public async deleteCaste(payload: { id?: string }): Promise<any> {
    if (!payload.id) throw new Error("ID is required for deleting a caste entry");

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existing = orgData?.castes || [];

    const item = existing.find((c: any) => c.id === payload.id);
    if (!item) return { status: false, error: "Caste entry with provided ID not found" };
    if (item.isDeleted) return { status: false, error: "Caste entry already deleted" };

    const updatedList = existing.map((c: any) => (c.id === payload.id ? { ...c, isDeleted: true } : c));
    orgData.castes = updatedList;
    const updated = await this.orgService.updateOrganization(orgData);

    return { status: true, message: "Caste entry deleted successfully", data: updated, tenantCode: this.tenantCode };
  }
}

export default CasteService;
