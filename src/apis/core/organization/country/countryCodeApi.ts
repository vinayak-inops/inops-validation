import { CookieManager } from "../../../../utils/cookies";
import { DeterministicMongoId } from "../../../../utils/idGenerator";
import { OrganizationService } from "../services/OrganizationService";
import TimeUtils from "../../../../utils/time";
import { CountryDuplicateChecker } from "./services/CountryDuplicateChecker";
import { countryJson } from "./type";

/**
 * Country service - create / edit / soft-delete country entries stored under organization.reasonCodes
 * (This mirrors the ReasonCodes Service implementation but for `country` type.)
 */
export class CountryService {
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

  private validateCountry(payload: countryJson) {
    if (!payload.countryCode?.trim() || !payload.reasonName?.trim()) {
      throw new Error("countryCode and countryName are required and cannot be empty");
    }
  }

  public async postCountry(payload: countryJson): Promise<any> {
    this.validateCountry(payload);

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existing = orgData?.reasonCodes || [];

    // Check for duplicate countryCode using DuplicateChecker
    if (CountryDuplicateChecker.isDuplicateCode(existing, payload.countryCode)) {
      return { status: false, error: "Duplicate countryCode found" };
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

    orgData.reasonCodes = [...existing, newItem];
    const updated = await this.orgService.updateOrganization(orgData);

    return { status: true, data: updated, tenantCode: this.tenantCode };
  }

  public async editCountry(payload: countryJson): Promise<any> {
    if (!payload.id) throw new Error("ID is required for editing a country entry");

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existing = orgData?.reasonCodes || [];

    const item = existing.find((c: any) => c.id === payload.id);
    if (!item) return { status: false, error: "Country entry with provided ID not found" };

    // Prevent changing countryCode
    if (payload.countryCode && payload.countryCode !== item.countryCode) {
      return { status: false, error: "Changing countryCode is not allowed" };
    }

    // Only update name (reasonName) or other non-identifying fields
    if (payload.reasonName === item.reasonName) {
      return { status: false, error: "No changes detected in country name" };
    }

    const updatedList = existing.map((c: any) => (c.id === payload.id ? { ...c, ...payload } : c));
    orgData.reasonCodes = updatedList;
    const updated = await this.orgService.updateOrganization(orgData);

    return { status: true, data: updated, tenantCode: this.tenantCode };
  }

  public async deleteCountry(payload: { id?: string }): Promise<any> {
    if (!payload.id) throw new Error("ID is required for deleting a country entry");

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existing = orgData?.reasonCodes || [];

    const item = existing.find((c: any) => c.id === payload.id);
    if (!item) return { status: false, error: "Country entry with provided ID not found" };
    if (item.isDeleted) return { status: false, error: "Country entry already deleted" };

    const updatedList = existing.map((c: any) => (c.id === payload.id ? { ...c, isDeleted: true } : c));
    orgData.reasonCodes = updatedList;
    const updated = await this.orgService.updateOrganization(orgData);

    return { status: true, message: "Country entry deleted successfully", data: updated, tenantCode: this.tenantCode };
  }
}

export default CountryService;
