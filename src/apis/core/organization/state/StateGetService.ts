// services/StateGetService.ts

import { CookieManager } from "../../../../utils/cookies";
import { OrganizationService } from "../services/OrganizationService";
import { StateJson } from "./type";

/**
 * Service to fetch and filter states from organization
 */
export class StateGetService {
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

  /**
   * Get all states (including deleted ones)
   */
  public async getAllStates(): Promise<any> {
    try {
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const states = orgData.states || [];
      console.log("Retrieved states count:", states.length);

      return {
        status: true,
        data: states,
        tenantCode: this.tenantCode,
        total: states.length,
      };
    } catch (error: any) {
      console.error("Error in getAllStates:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch states",
        data: [],
      };
    }
  }

  /**
   * Get only active states (not deleted)
   */
  public async getActiveStates(): Promise<any> {
    try {
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const allStates = orgData.states || [];
      const activeStates = allStates.filter((state: StateJson) => !state.isDeleted);

      console.log("Retrieved active states count:", activeStates.length);

      return {
        status: true,
        data: activeStates,
        tenantCode: this.tenantCode,
        total: activeStates.length,
      };
    } catch (error: any) {
      console.error("Error in getActiveStates:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch active states",
        data: [],
      };
    }
  }

  /**
   * Get only deleted states
   */
  public async getDeletedStates(): Promise<any> {
    try {
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const allStates = orgData.states || [];
      const deletedStates = allStates.filter((state: StateJson) => state.isDeleted);

      console.log("Retrieved deleted states count:", deletedStates.length);

      return {
        status: true,
        data: deletedStates,
        tenantCode: this.tenantCode,
        total: deletedStates.length,
      };
    } catch (error: any) {
      console.error("Error in getDeletedStates:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch deleted states",
        data: [],
      };
    }
  }

  /**
   * Get state by ID
   */
  public async getStateById(id: string): Promise<any> {
    try {
      if (!id) {
        throw new Error("ID is required");
      }

      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: null };
      }

      const allStates = orgData.states || [];
      const state = allStates.find((s: StateJson) => s.id === id);

      if (!state) {
        return { status: false, error: "State with provided ID not found", data: null };
      }

      return {
        status: true,
        data: state,
        tenantCode: this.tenantCode,
      };
    } catch (error: any) {
      console.error("Error in getStateById:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch state",
        data: null,
      };
    }
  }

  /**
   * Get states by country code
   */
  public async getStatesByCountry(countryCode: string): Promise<any> {
    try {
      if (!countryCode) {
        throw new Error("Country code is required");
      }

      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const allStates = orgData.states || [];
      const statesForCountry = allStates.filter(
        (s: StateJson) =>
          s.countryCode?.toLowerCase() === countryCode?.toLowerCase() && !s.isDeleted
      );

      console.log(`Retrieved states for country ${countryCode}:`, statesForCountry.length);

      return {
        status: true,
        data: statesForCountry,
        tenantCode: this.tenantCode,
        total: statesForCountry.length,
        countryCode,
      };
    } catch (error: any) {
      console.error("Error in getStatesByCountry:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch states for country",
        data: [],
      };
    }
  }
}

export default StateGetService;
