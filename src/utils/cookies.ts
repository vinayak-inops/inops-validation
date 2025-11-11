// src/utils/CookieManager.ts

export class CookieManager {
  /**
   * Get a cookie value by name (client-side only)
   * @param name Cookie name
   * @returns Cookie value or null
   */
  static get(name: string): string | null {
    if (typeof window === "undefined") return null; // SSR safe

    const cookies = document.cookie.split(";").map(cookie => cookie.trim());

    for (const cookie of cookies) {
      const [key, ...rest] = cookie.split("="); // support = in value
      if (key === name) {
        const value = rest.join("="); // recombine in case value has =
        try {
          return decodeURIComponent(value);
        } catch {
          return value;
        }
      }
    }

    return null;
  }

  /**
   * Set a cookie (client-side only)
   * @param name Cookie name
   * @param value Cookie value
   * @param days Expiration in days
   */
  static set(name: string, value: string, days: number = 1) {
    if (typeof window === "undefined") return;

    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/`;
  }

  /**
   * Delete a cookie by name (client-side only)
   * @param name Cookie name
   */
  static delete(name: string) {
    if (typeof window === "undefined") return;

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
}
