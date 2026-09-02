import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

import { DefaultAzureCredential } from "@azure/identity";

import crypto from "crypto";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName =
  process.env.AZURE_STORAGE_MEDICALS_CONTAINER || "medical-records";

if (!accountName) {
  throw new Error(
    "AZURE_STORAGE_ACCOUNT_NAME environment variable is required",
  );
}

const credential = new DefaultAzureCredential();

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  credential,
);

const containerClient = blobServiceClient.getContainerClient(containerName);

/**
 * Upload medical document to Azure Blob Storage.
 */
export async function uploadMedicalFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  employeeId: number,
) {
  const extension = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
    : "";

  const randomName = crypto.randomUUID();

  const blobName = `employee-${employeeId}/${randomName}${extension}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
      blobContentDisposition: "inline",
    },
  });

  return {
    blobName,
    fileName: originalName,
    mimeType,
    fileSize: buffer.length,
  };
}

/**
 * Generate a short-lived URL for viewing/downloading
 * a private medical document.
 */
export function getMedicalFileSasUrl(blobName: string): string {
  const storageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

  if (!storageAccountKey) {
    throw new Error(
      "AZURE_STORAGE_ACCOUNT_KEY is required to generate SAS URLs",
    );
  }

  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName!,
    storageAccountKey,
  );

  const expiresOn = new Date(Date.now() + 10 * 60 * 1000);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(Date.now() - 60 * 1000),
      expiresOn,
    },
    sharedKeyCredential,
  ).toString();

  return `${containerClient.getBlobClient(blobName).url}?${sasToken}`;
}

/**
 * Delete medical document from Azure Blob Storage.
 */
export async function deleteMedicalFile(blobName: string): Promise<void> {
  const blobClient = containerClient.getBlobClient(blobName);

  await blobClient.deleteIfExists();
}
