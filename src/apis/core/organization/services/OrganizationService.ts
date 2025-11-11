import axiosService from "../../../../config/axiosConfig";


export class OrganizationService {
  private axios = axiosService.getAxiosInstance();

  async getOrganizationByTenant(tenantCode: string): Promise<any> {
    const response = await this.axios.post(`/query/attendance/organization/search`, [
      { field: "tenantCode", value: tenantCode, operator: "eq" },
    ]);
    return response.data[0] || null;
  }

  async updateOrganization(orgData: any): Promise<any> {
    const postData = {
      tenant: orgData.tenant,
      action: "insert",
      id: orgData._id,
      collectionName: "organization",
      data: orgData,
    };
    const response = await this.axios.post(`/command/attendance/organization`, postData);
    return response.data;
  }
}
