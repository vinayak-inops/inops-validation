// types/State.ts

export class StateJson {
  id?: string; // optional ID
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  isDeleted?: boolean;
  createdOn?: string;
  createdBy?: string;

  constructor(
    countryCode: string,
    countryName: string,
    stateCode: string,
    stateName: string,
    id?: string
  ) {
    if (!countryCode?.trim() || !countryName?.trim() || !stateCode?.trim() || !stateName?.trim()) {
      throw new Error("countryCode, countryName, stateCode, and stateName are required and cannot be empty");
    }

    this.countryCode = countryCode;
    this.countryName = countryName;
    this.stateCode = stateCode;
    this.stateName = stateName;

    if (id) {
      this.id = id;
    }
  }
}
