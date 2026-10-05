import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

import crypto from "crypto";
import { Readable } from "stream";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

const containerName =
  process.env.AZURE_STORAGE_DOCUMENT_LIBRARY_CONTAINER || "document-library";

if (!accountName || !accountKey) {
  throw new Error(
    "AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY environment variables are required",
  );
}

const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey,
);

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential,
);

const containerClient = blobServiceClient.getContainerClient(containerName);

// Create the container on first use so no manual setup is needed
let containerReady: Promise<unknown> | null = null;
function ensureContainer() {
  if (!containerReady) {
    containerReady = containerClient.createIfNotExists();
  }
  return containerReady;
}

export async function uploadLibraryFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folderId: number,
) {
  await ensureContainer();

  const extension = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
    : "";

  const blobName = `folder-${folderId}/${crypto.randomUUID()}${extension}`;

  await containerClient.getBlockBlobClient(blobName).uploadData(buffer, {
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
 * Short-lived read URL. With `downloadAs`, the browser is forced to
 * download the file (with its original name) instead of previewing it.
 */
export function getLibraryFileSasUrl(
  blobName: string,
  downloadAs?: string,
): string {
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(Date.now() - 60 * 1000),
      expiresOn: new Date(Date.now() + 10 * 60 * 1000),
      ...(downloadAs
        ? {
            contentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(downloadAs)}`,
          }
        : {}),
    },
    sharedKeyCredential,
  ).toString();

  return `${containerClient.getBlobClient(blobName).url}?${sasToken}`;
}

/** Stream a blob (used when building the ZIP). */
export async function downloadLibraryFileStream(
  blobName: string,
): Promise<Readable> {
  const response = await containerClient.getBlobClient(blobName).download();
  if (!response.readableStreamBody) {
    throw new Error(`Blob ${blobName} has no readable stream`);
  }
  // In Node, Azure returns a real Readable; the SDK just types it loosely.
  return response.readableStreamBody as Readable;
}

export async function deleteLibraryFile(blobName: string): Promise<void> {
  await containerClient.getBlobClient(blobName).deleteIfExists();
}