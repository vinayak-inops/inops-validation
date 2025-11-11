// services/CountryGetService.ts

import { CookieManager } from "../../../../utils/cookies";
import { OrganizationService } from "../services/OrganizationService";
import { countryJson } from "./type";

/**
 * Service to fetch and filter countries from organization
 */
export class CountryGetService {
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
   * Get all countries (including deleted ones)
   */
  public async getAllCountries(): Promise<any> {
    try {
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const countries = orgData.reasonCodes || [];
      console.log("Retrieved countries count:", countries.length);

      return {
        status: true,
        data: countries,
        tenantCode: this.tenantCode,
        total: countries.length,
      };
    } catch (error: any) {
      console.error("Error in getAllCountries:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch countries",
        data: [],
      };
    }
  }

  /**
   * Get only active countries (not deleted)
   */
  public async getActiveCountries(): Promise<any> {
    try {
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const allCountries = orgData.reasonCodes || [];
      const activeCountries = allCountries.filter((country: countryJson) => !country.isDeleted);

      console.log("Retrieved active countries count:", activeCountries.length);

      return {
        status: true,
        data: activeCountries,
        tenantCode: this.tenantCode,
        total: activeCountries.length,
      };
    } catch (error: any) {
      console.error("Error in getActiveCountries:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch active countries",
        data: [],
      };
    }
  }

  /**
   * Get only deleted countries
   */
  public async getDeletedCountries(): Promise<any> {
    try {
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const allCountries = orgData.reasonCodes || [];
      const deletedCountries = allCountries.filter((country: countryJson) => country.isDeleted);

      console.log("Retrieved deleted countries count:", deletedCountries.length);

      return {
        status: true,
        data: deletedCountries,
        tenantCode: this.tenantCode,
        total: deletedCountries.length,
      };
    } catch (error: any) {
      console.error("Error in getDeletedCountries:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch deleted countries",
        data: [],
      };
    }
  }

  /**
   * Get country by ID
   */
  public async getCountryById(id: string): Promise<any> {
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

      const allCountries = orgData.reasonCodes || [];
      const country = allCountries.find((c: countryJson) => c.id === id);

      if (!country) {
        return { status: false, error: "Country with provided ID not found", data: null };
      }

      return {
        status: true,
        data: country,
        tenantCode: this.tenantCode,
      };
    } catch (error: any) {
      console.error("Error in getCountryById:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch country",
        data: null,
      };
    }
  }
}

export default CountryGetService;
