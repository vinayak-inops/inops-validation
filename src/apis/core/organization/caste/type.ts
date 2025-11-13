// types/Caste.ts

export class CasteJson {
  id?: string; // optional ID
  casteName: string;
  casteDescription: string;
  isDeleted?: boolean;
  createdOn?: string;
  createdBy?: string;

  constructor(casteName: string, casteDescription: string, id?: string) {
    if (!casteName?.trim() || !casteDescription?.trim()) {
      throw new Error("casteName and casteDescription are required and cannot be empty");
    }

    this.casteName = casteName;
    this.casteDescription = casteDescription;

    if (id) {
      this.id = id;
    }
  }
}
