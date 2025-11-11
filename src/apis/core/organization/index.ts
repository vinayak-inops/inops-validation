import { ReasonCodesService } from "./reasonCodes/reasonCodesApi";
import { ReasonCodesDeleteService } from "./reasonCodes/ReasonCodesDeleteService";
import { ReasonCodesEditService } from "./reasonCodes/ReasonCodesEditService";
import { ReasonCodesGetService } from "./reasonCodes/ReasonCodesGetService";
import { CountryService } from "./country/countryCodeApi";
import { CountryEditService } from "./country/CountryEditService";
import { CountryDeleteService } from "./country/CountryDeleteService";
import { CountryGetService } from "./country/CountryGetService";
import { SubsidiariesService } from "./subsidiaries/subsidiariesApi";

export class OrganizationApi {
  public subsidiaries: SubsidiariesService;
  public reasonCodes: ReasonCodesService;
  public reasonCodesEdit: ReasonCodesEditService;
  public reasonCodesDeleted: ReasonCodesDeleteService;
  public reasonCodesGet: ReasonCodesGetService;
  public country: CountryService;
  public countryEdit: CountryEditService;
  public countryDelete: CountryDeleteService;
  public countryGet: CountryGetService;

  constructor() {
    this.subsidiaries = new SubsidiariesService();
    this.reasonCodes = new ReasonCodesService();
    this.reasonCodesEdit = new ReasonCodesEditService();
    this.reasonCodesDeleted = new ReasonCodesDeleteService();
    this.reasonCodesGet = new ReasonCodesGetService();
    this.country = new CountryService();
    this.countryEdit = new CountryEditService();
    this.countryDelete = new CountryDeleteService();
    this.countryGet = new CountryGetService();
  }
}

// Export a single instance for convenience
const organizationApi = new OrganizationApi();
export default organizationApi;
