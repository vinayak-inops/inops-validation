// utils/DeterministicMongoId.ts

export class DeterministicMongoId {
  /**
   * Encode a number into a 24-character MongoDB-like ID
   * @param num Number to encode
   * @returns 24-character hex string
   */
  public static encode(num: number): string {
    // Convert number to hex, pad to 8 chars
    const numHex = num.toString(16).padStart(8, "0");

    // Use timestamp for first 8 chars
    const timestampHex = Math.floor(Date.now() / 1000)
      .toString(16)
      .padStart(8, "0");

    // Random 8 chars for remaining
    const randomHex = Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, "0");

    return timestampHex + randomHex + numHex; // 24 chars
  }

  /**
   * Decode a 24-character ID back to the original number
   * @param objectId 24-character ID
   * @returns Original number
   */
  public static decode(objectId: string): number {
    if (objectId.length !== 24) throw new Error("Invalid ID length");
    const numHex = objectId.slice(16, 24);
    return parseInt(numHex, 16);
  }
}
