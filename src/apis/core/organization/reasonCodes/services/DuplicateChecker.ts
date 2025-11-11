export class DuplicateChecker {
  static isDuplicate(existing: any[], newItem: any, fields: string[]): boolean {
    return existing.some(item => fields.some(f => item[f] === newItem[f]));
  }
}
