import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { parseCookies } from "nookies";

export class AxiosService {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL =
      baseURL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.API_BASE_URL ||
      "";
  }

  /**
   * Override base URL dynamically
   */
  public setBaseUrl(url: string) {
    this.baseURL = url;
  }

  /**
   * Store auth token in cookie (1-day expiry)
   */
  public storeAuthToken(token: string) {
    if (typeof window !== "undefined") {
      Cookies.set("authToken", token, { expires: 1 });
    }
  }

  /**
   * Get auth token from cookie (client or SSR)
   */
  private getAuthToken(ctx?: any): string | null {
    if (typeof window !== "undefined") {
      return Cookies.get("authToken") || null;
    } else if (ctx) {
      const cookies = parseCookies(ctx);
      return cookies.authToken || null;
    }
    return null;
  }

  /**
   * Return configured Axios instance
   */
  public getAxiosInstance(ctx?: any): AxiosInstance {
    const token = this.getAuthToken(ctx);

    const instance = axios.create({
      baseURL: this.baseURL,
      headers: { "Content-Type": "application/json" },
    });

    if (token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    return instance;
  }

  /**
   * Expose config for debugging or external use
   */
  public getConfig(ctx?: any) {
    return {
      baseURL: this.baseURL,
      authToken: this.getAuthToken(ctx) ? "[SET]" : null,
    };
  }
}

// Export a single instance for convenience
const axiosService = new AxiosService();
export default axiosService;
