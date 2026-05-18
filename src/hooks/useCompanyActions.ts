import { CreateTenantRequest, ExtendSubscriptionRequest, ApiResponse } from "@/types/admin";
import { adminHeaders } from "./useAdminAuth";

export async function createCompany(data: CreateTenantRequest): Promise<ApiResponse> {
  const response = await fetch("/api/admin/tenants", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteCompany(tenantId: string): Promise<ApiResponse> {
  const response = await fetch(`/api/admin/tenants?tenantId=${tenantId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  return response.json();
}

export async function extendSubscription(data: ExtendSubscriptionRequest): Promise<ApiResponse> {
  const response = await fetch("/api/admin/tenants", {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}
