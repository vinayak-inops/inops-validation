import { CookieManager } from "../../../../utils/cookies";
import { DeterministicMongoId } from "../../../../utils/idGenerator";
import { OrganizationService } from "../services/OrganizationService";
import TimeUtils from "../../../../utils/time";
import { StateDuplicateChecker } from "./services/StateDuplicateChecker";
import { StateJson } from "./type";

/**
 * State service - create / edit / soft-delete state entries stored under organization.states
 * Each state is associated with a country via countryCode
 */
export class StateService {
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

  private validateState(payload: StateJson) {
    if (
      !payload.countryCode?.trim() ||
      !payload.countryName?.trim() ||
      !payload.stateCode?.trim() ||
      !payload.stateName?.trim()
    ) {
      throw new Error(
        "countryCode, countryName, stateCode, and stateName are required and cannot be empty"
      );
    }
  }

  /**
   * Validate that the country exists and matches in the country list
   */
  private validateCountryExists(orgData: any, payload: StateJson): { valid: boolean; error?: string } {
    const countries = orgData?.reasonCodes || []; // Countries stored in reasonCodes

    // Find country with matching code
    const country = countries.find(
      (c: any) =>
        c.countryCode?.toLowerCase() === payload.countryCode?.toLowerCase() &&
        !c.isDeleted
    );

    if (!country) {
      return {
        valid: false,
        error: `Country with code "${payload.countryCode}" not found in the system`,
      };
    }

    // Verify country name matches
    if (country.reasonName?.toLowerCase() !== payload.countryName?.toLowerCase()) {
      return {
        valid: false,
        error: `Country name "${payload.countryName}" does not match the registered name "${country.reasonName}" for code "${payload.countryCode}"`,
      };
    }

    return { valid: true };
  }

  public async postState(payload: StateJson): Promise<any> {
    this.validateState(payload);

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);

    // Validate that the country exists
    const countryValidation = this.validateCountryExists(orgData, payload);
    if (!countryValidation.valid) {
      return { status: false, error: countryValidation.error };
    }

    const existing = orgData?.states || [];

    // Check for duplicate stateCode within the same country
    if (
      StateDuplicateChecker.isDuplicateStateCode(existing, payload.countryCode, payload.stateCode)
    ) {
      return {
        status: false,
        error: `Duplicate stateCode "${payload.stateCode}" found for country "${payload.countryCode}"`,
      };
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

    orgData.states = [...existing, newItem];
    const updated = await this.orgService.updateOrganization(orgData);

    return { status: true, data: updated, tenantCode: this.tenantCode };
  }

  public async editState(payload: StateJson): Promise<any> {
    if (!payload.id) throw new Error("ID is required for editing a state entry");

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existing = orgData?.states || [];

    const item = existing.find((s: any) => s.id === payload.id);
    if (!item) return { status: false, error: "State entry with provided ID not found" };

    // Prevent changing countryCode (immutable)
    if (payload.countryCode && payload.countryCode !== item.countryCode) {
      return { status: false, error: "Changing countryCode is not allowed" };
    }

    // Prevent changing stateCode (immutable)
    if (payload.stateCode && payload.stateCode !== item.stateCode) {
      return { status: false, error: "Changing stateCode is not allowed" };
    }

    // Check if stateName or countryName is actually changing
    const isCountryNameChanged = payload.countryName && payload.countryName !== item.countryName;
    const isStateNameChanged = payload.stateName && payload.stateName !== item.stateName;

    if (!isCountryNameChanged && !isStateNameChanged) {
      return { status: false, error: "No changes detected in state data" };
    }

    const updatedList = existing.map((s: any) => (s.id === payload.id ? { ...s, ...payload } : s));
    orgData.states = updatedList;
    const updated = await this.orgService.updateOrganization(orgData);

    return { status: true, data: updated, tenantCode: this.tenantCode };
  }

  public async deleteState(payload: { id?: string }): Promise<any> {
    if (!payload.id) throw new Error("ID is required for deleting a state entry");

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existing = orgData?.states || [];

    const item = existing.find((s: any) => s.id === payload.id);
    if (!item) return { status: false, error: "State entry with provided ID not found" };
    if (item.isDeleted) return { status: false, error: "State entry already deleted" };

    const updatedList = existing.map((s: any) => (s.id === payload.id ? { ...s, isDeleted: true } : s));
    orgData.states = updatedList;
    const updated = await this.orgService.updateOrganization(orgData);

    return { status: true, message: "State entry deleted successfully", data: updated, tenantCode: this.tenantCode };
  }
}

export default StateService;
