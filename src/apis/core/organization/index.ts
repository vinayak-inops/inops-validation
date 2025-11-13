import { ReasonCodesService } from "./reasonCodes/reasonCodesApi";
import { ReasonCodesDeleteService } from "./reasonCodes/ReasonCodesDeleteService";
import { ReasonCodesEditService } from "./reasonCodes/ReasonCodesEditService";
import { ReasonCodesGetService } from "./reasonCodes/ReasonCodesGetService";
import { CountryService } from "./country/countryCodeApi";
import { CountryEditService } from "./country/CountryEditService";
import { CountryDeleteService } from "./country/CountryDeleteService";
import { CountryGetService } from "./country/CountryGetService";
import { CasteService } from "./caste/casteApi";
import { CasteEditService } from "./caste/CasteEditService";
import { CasteDeleteService } from "./caste/CasteDeleteService";
import { CasteGetService } from "./caste/CasteGetService";
import { StateService } from "./state/stateApi";
import { StateEditService } from "./state/StateEditService";
import { StateDeleteService } from "./state/StateDeleteService";
import { StateGetService } from "./state/StateGetService";
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
  public caste: CasteService;
  public casteEdit: CasteEditService;
  public casteDelete: CasteDeleteService;
  public casteGet: CasteGetService;
  public state: StateService;
  public stateEdit: StateEditService;
  public stateDelete: StateDeleteService;
  public stateGet: StateGetService;

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
    this.caste = new CasteService();
    this.casteEdit = new CasteEditService();
    this.casteDelete = new CasteDeleteService();
    this.casteGet = new CasteGetService();
    this.state = new StateService();
    this.stateEdit = new StateEditService();
    this.stateDelete = new StateDeleteService();
    this.stateGet = new StateGetService();
  }
}

// Export a single instance for convenience
const organizationApi = new OrganizationApi();
export default organizationApi;
