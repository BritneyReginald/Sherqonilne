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
  process.env.AZURE_STORAGE_INCIDENTS_CONTAINER || "incident-evidence";

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
 * Upload an evidence file for an incident/NCR/injury record to
 * Azure Blob Storage. One record can have many evidence files, so
 * blobs are namespaced by record, not by employee like medicals.
 */
export async function uploadIncidentEvidence(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  recordId: number,
) {
  const extension = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
    : "";

  const randomName = crypto.randomUUID();

  const blobName = `record-${recordId}/${randomName}${extension}`;

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
 * Generate a short-lived URL for viewing/downloading a private
 * evidence file.
 */
export function getIncidentEvidenceSasUrl(blobName: string): string {
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
 * Delete an evidence file from Azure Blob Storage.
 */
export async function deleteIncidentEvidence(blobName: string): Promise<void> {
  const blobClient = containerClient.getBlobClient(blobName);
  await blobClient.deleteIfExists();
}