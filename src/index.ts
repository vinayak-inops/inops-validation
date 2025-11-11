import { OrganizationApi } from "./apis/core/organization";
import axiosService from "./config/axiosConfig";

/**
 * API Helper class to wrap organization API and token management
 */
export class ApiHelper {
  public organization = new OrganizationApi();

  constructor() {
    // Attach to window if running in browser
    if (typeof window !== "undefined") {
      (window as any).apiHelper = this;
    }
  }

  /**
   * Set authentication token
   * @param token Auth token string
   */
  public setAuthToken(token: string) {
    axiosService.storeAuthToken(token);
  }
}

// Export a single instance for convenience
const apiHelper = new ApiHelper();
export default apiHelper;

// Re-export types
export * from "./types/apiTypes";
