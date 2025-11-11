// types/ReasonCode.ts

export class ReasonCode {
  id?: string; // optional ID
  reasonCode: string;
  reasonName: string;
  isDeleted?: boolean;
  createdOn?: string;
  createdBy?: string;

  constructor(reasonCode: string, reasonName: string, id?: string) {
    if (!reasonCode?.trim() || !reasonName?.trim()) {
      throw new Error("reasonCode and reasonName are required and cannot be empty");
    }

    this.reasonCode = reasonCode;
    this.reasonName = reasonName;

    if (id) {
      this.id = id;
    }
  }
}
