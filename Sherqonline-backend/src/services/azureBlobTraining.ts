import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from "@azure/storage-blob";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Reuses the SAME storage account + container as Medicals
// (services/azureBlob.ts) — no new Azure resource needed. Files
// are kept apart purely by blob path prefix ("training/..." vs
// "employee-.../..."), which is enough since access always goes
// through a per-file SAS URL anyway, never a directory listing.
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY as string;
const containerName =
  process.env.AZURE_STORAGE_CONTAINER_NAME || "medical-records";

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential,
);

const containerClient = blobServiceClient.getContainerClient(containerName);

interface UploadResult {
  blobName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export async function uploadTrainingCertificate(
  buffer: Buffer,
  originalFileName: string,
  mimeType: string,
  employeeId: number,
): Promise<UploadResult> {
  const safeExtension = originalFileName.includes(".")
    ? originalFileName.split(".").pop()
    : "";
  const blobName = `training/employee-${employeeId}/${randomUUID()}${
    safeExtension ? `.${safeExtension}` : ""
  }`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });

  return {
    blobName,
    fileName: originalFileName,
    fileSize: buffer.length,
    mimeType,
  };
}

export function getTrainingCertificateSasUrl(
  blobName: string,
  expiryMinutes = 10,
): string {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const sasOptions = {
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse("r"),
    protocol: SASProtocol.Https,
    startsOn: new Date(Date.now() - 60 * 1000),
    expiresOn: new Date(Date.now() + expiryMinutes * 60 * 1000),
  };

  const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

  return `${blockBlobClient.url}?${sasToken}`;
}

export async function deleteTrainingCertificate(blobName: string): Promise<void> {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
}