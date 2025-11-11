import AxiosService from "../../../../config/axiosConfig";
import { ApiResponse, AttendanceData } from "../../../../types/apiTypes";
import { CookieManager } from "../../../../utils/cookies";

export class SubsidiariesService {
  private axiosService: any;

  constructor() {
    this.axiosService = AxiosService; // Use the singleton instance
  }

  /**
   * Fetch subsidiaries for a given user
   */
  public async getSubsidiaries(userId: string): Promise<ApiResponse> {
    const axios = this.axiosService.getAxiosInstance();
    const response = await axios.get(`/query/attendance/${userId}`);

    // Get employee info from cookie
    const raw = CookieManager.get("keyclockroleinfo");
    let employeeId = "";
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        employeeId = parsed?.employeeId || parsed?.employeeID || "";
      } catch {}
    }

    return {
      status: response.status,
      data: response.data[0]?.subsidiaries || [],
      method: "getSubsidiaries",
      employeeId,
    };
  }

  /**
   * Mark attendance
   */
  public async markAttendance(data: AttendanceData): Promise<ApiResponse> {
    const axios = this.axiosService.getAxiosInstance();
    const response = await axios.post("/query/attendance/organization", data);

    return {
      status: response.status,
      data: response.data,
      method: "markAttendance",
    };
  }
}
