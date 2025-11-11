// services/ReasonCodesGetService.ts

import { CookieManager } from "../../../../utils/cookies";
import { OrganizationService } from "../services/OrganizationService";
import { ReasonCode } from "./type";

/**
 * Service to fetch and filter reason codes from organization
 */
export class ReasonCodesGetService {
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
   * Get all reason codes (including deleted ones)
   */
  public async getAllReasonCodes(): Promise<any> {
    try {
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const reasonCodes = orgData.reasonCodes || [];

      return {
        status: true,
        data: reasonCodes,
        tenantCode: this.tenantCode,
        total: reasonCodes.length,
      };
    } catch (error: any) {
      console.error("Error in getAllReasonCodes:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch reason codes",
        data: [],
      };
    }
  }

  /**
   * Get only active reason codes (not deleted)
   */
  public async getActiveReasonCodes(): Promise<any> {
    try {
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const allReasonCodes = orgData.reasonCodes || [];
      const activeReasonCodes = allReasonCodes.filter((rc: ReasonCode) => !rc.isDeleted);

      console.log("Retrieved active reason codes count:", activeReasonCodes.length);

      return {
        status: true,
        data: activeReasonCodes,
        tenantCode: this.tenantCode,
        total: activeReasonCodes.length,
      };
    } catch (error: any) {
      console.error("Error in getActiveReasonCodes:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch active reason codes",
        data: [],
      };
    }
  }

  /**
   * Get only deleted reason codes
   */
  public async getDeletedReasonCodes(): Promise<any> {
    try {
      if (!this.tenantCode) {
        throw new Error("Tenant code not found");
      }

      const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
      if (!orgData) {
        return { status: false, error: "Organization data not found", data: [] };
      }

      const allReasonCodes = orgData.reasonCodes || [];
      const deletedReasonCodes = allReasonCodes.filter((rc: ReasonCode) => rc.isDeleted);

      console.log("Retrieved deleted reason codes count:", deletedReasonCodes.length);

      return {
        status: true,
        data: deletedReasonCodes,
        tenantCode: this.tenantCode,
        total: deletedReasonCodes.length,
      };
    } catch (error: any) {
      console.error("Error in getDeletedReasonCodes:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch deleted reason codes",
        data: [],
      };
    }
  }

  /**
   * Get reason code by ID
   */
  public async getReasonCodeById(id: string): Promise<any> {
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

      const allReasonCodes = orgData.reasonCodes || [];
      const reasonCode = allReasonCodes.find((rc: ReasonCode) => rc.id === id);

      if (!reasonCode) {
        return { status: false, error: "Reason code with provided ID not found", data: null };
      }

      return {
        status: true,
        data: reasonCode,
        tenantCode: this.tenantCode,
      };
    } catch (error: any) {
      console.error("Error in getReasonCodeById:", error);
      return {
        status: false,
        error: error.message || "Failed to fetch reason code",
        data: null,
      };
    }
  }
}

export default ReasonCodesGetService;
