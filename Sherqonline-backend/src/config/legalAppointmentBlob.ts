import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

import crypto from "crypto";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

const documentsContainerName =
  process.env.AZURE_STORAGE_LEGAL_APPOINTMENT_DOCUMENTS_CONTAINER ||
  "legal-appointment-documents";

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

const documentsContainerClient = blobServiceClient.getContainerClient(
  documentsContainerName,
);

/*
 * Auto-create the container on first use so there's no manual
 * Azure Portal step. Runs once per process.
 */
let containerEnsured = false;

async function ensureContainer() {
  if (containerEnsured) return;
  await documentsContainerClient.createIfNotExists();
  containerEnsured = true;
}

function buildSasUrl(blobName: string): string {
  const storageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

  if (!storageAccountKey) {
    throw new Error(
      "AZURE_STORAGE_ACCOUNT_KEY is required to generate SAS URLs",
    );
  }

  const keyCredential = new StorageSharedKeyCredential(
    accountName!,
    storageAccountKey,
  );

  const expiresOn = new Date(Date.now() + 10 * 60 * 1000);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: documentsContainerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(Date.now() - 60 * 1000),
      expiresOn,
    },
    keyCredential,
  ).toString();

  return `${documentsContainerClient.getBlobClient(blobName).url}?${sasToken}`;
}

/* ------------------------------------------------------------------ */
/* SIGNED / UPLOADED DOCUMENTS                                         */
/* ------------------------------------------------------------------ */

export async function uploadLegalAppointmentDocument(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  appointmentId: number,
) {
  await ensureContainer();

  const extension = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
    : "";

  const blobName = `appointment-${appointmentId}/${crypto.randomUUID()}${extension}`;

  const blockBlobClient = documentsContainerClient.getBlockBlobClient(blobName);

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

export function getLegalAppointmentDocumentSasUrl(blobName: string): string {
  return buildSasUrl(blobName);
}

export async function deleteLegalAppointmentDocument(blobName: string) {
  await documentsContainerClient.getBlobClient(blobName).deleteIfExists();
}
