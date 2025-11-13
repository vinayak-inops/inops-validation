// services/CasteGetService.ts

import { CookieManager } from "../../../../utils/cookies";
import { OrganizationService } from "../services/OrganizationService";
import { CasteJson } from "./type";

/**
 * Service to fetch and filter castes from organization
 */
export class CasteGetService {
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
   * Get all castes (including deleted ones)
   */
  public async getAllCastes(): Promise<any> {
    try {
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const castes = orgData.castes || [];
      console.log("Retrieved castes count:", castes.length);

      return {
        status: true,
        data: castes,
        tenantCode: this.tenantCode,
        total: castes.length,
      };
    } catch (error: any) {
      console.error("Error in getAllCastes:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch castes",
        data: [],
      };
    }
  }

  /**
   * Get only active castes (not deleted)
   */
  public async getActiveCastes(): Promise<any> {
    try {
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const allCastes = orgData.castes || [];
      const activeCastes = allCastes.filter((caste: CasteJson) => !caste.isDeleted);

      console.log("Retrieved active castes count:", activeCastes.length);

      return {
        status: true,
        data: activeCastes,
        tenantCode: this.tenantCode,
        total: activeCastes.length,
      };
    } catch (error: any) {
      console.error("Error in getActiveCastes:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch active castes",
        data: [],
      };
    }
  }

  /**
   * Get only deleted castes
   */
  public async getDeletedCastes(): Promise<any> {
    try {
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const allCastes = orgData.castes || [];
      const deletedCastes = allCastes.filter((caste: CasteJson) => caste.isDeleted);

      console.log("Retrieved deleted castes count:", deletedCastes.length);

      return {
        status: true,
        data: deletedCastes,
        tenantCode: this.tenantCode,
        total: deletedCastes.length,
      };
    } catch (error: any) {
      console.error("Error in getDeletedCastes:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch deleted castes",
        data: [],
      };
    }
  }

  /**
   * Get caste by ID
   */
  public async getCasteById(id: string): Promise<any> {
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

      const allCastes = orgData.castes || [];
      const caste = allCastes.find((c: CasteJson) => c.id === id);

      if (!caste) {
        return { status: false, error: "Caste with provided ID not found", data: null };
      }

      return {
        status: true,
        data: caste,
        tenantCode: this.tenantCode,
      };
    } catch (error: any) {
      console.error("Error in getCasteById:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch caste",
        data: null,
      };
    }
  }
}

export default CasteGetService;
