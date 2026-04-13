import { storage } from "./config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadPolicyPDF(
  file: File,
  tenantId: string
): Promise<{ downloadUrl: string; storagePath: string }> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `tenants/${tenantId}/policies/${timestamp}_${safeName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return { downloadUrl, storagePath };
}
