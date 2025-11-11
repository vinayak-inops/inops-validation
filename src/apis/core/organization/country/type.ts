// types/ReasonCode.ts

export class countryJson {
  id?: string; // optional ID
  countryCode: string;
  reasonName: string;
  isDeleted?: boolean;
  createdOn?: string;
  createdBy?: string;

  constructor(countryCode: string, countryName: string, id?: string) {
    if (!countryCode?.trim() || !countryName?.trim()) {
      throw new Error("reasonCode and reasonName are required and cannot be empty");
    }

    this.countryCode = countryCode;
    this.reasonName = countryName;

    if (id) {
      this.id = id;
    }
  }
}
