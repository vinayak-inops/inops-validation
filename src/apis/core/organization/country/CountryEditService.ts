// services/CountryEditService.ts

import { CookieManager } from "../../../../utils/cookies";
import { OrganizationService } from "../services/OrganizationService";
import { DuplicateChecker } from "../reasonCodes/services/DuplicateChecker";
import { countryJson } from "./type";

export class CountryEditService {
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

  private validateCountry(country: countryJson) {
    if (!country.id) {
      throw new Error("ID is required for editing a country");
    }
    if (!country.countryCode?.trim() && !country.reasonName?.trim()) {
      throw new Error("At least countryCode or countryName must be provided for update");
    }
  }

  public async editCountry(country: countryJson): Promise<any> {
    this.validateCountry(country);

    const orgData = await this.orgService.getOrganizationByTenant(this.tenantCode);
    const existingCountries = orgData?.reasonCodes || [];

    // Find the existing item by id
    const existingItem = existingCountries.find((c: countryJson) => c.id === country.id);
    if (!existingItem) {
      return { status: false, error: "Country with provided ID not found" };
    }

    // Prevent countryCode changes
    if (country.countryCode !== existingItem.countryCode) {
      return { status: false, error: "Changing countryCode is not allowed. You can only update the countryName." };
    }

    // Check if countryName is actually changing
    const isNameChanged = country.reasonName !== existingItem.reasonName;
    if (!isNameChanged) {
      return { status: false, error: "No changes detected in countryName" };
    }

    // Update the item
    const updatedCountries = existingCountries.map((c: countryJson) =>
      c.id === country.id ? { ...c, ...country } : c
    );

    orgData.reasonCodes = updatedCountries;

    const updatedData = await this.orgService.updateOrganization(orgData);

    return {
      status: true,
      data: updatedData,
      tenantCode: this.tenantCode,
    };
  }
}
