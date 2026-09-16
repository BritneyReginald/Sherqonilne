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
  process.env.AZURE_STORAGE_RISK_ASSESSMENTS_CONTAINER || "risk-assessment";

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

function buildBlobName(
  prefix: "logo" | "pdf",
  originalName: string,
  riskAssessmentId: number,
) {
  const extension = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
    : "";

  const randomName = crypto.randomUUID();

  return `risk-assessment-${riskAssessmentId}/${prefix}/${randomName}${extension}`;
}

async function upload(
  prefix: "logo" | "pdf",
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  riskAssessmentId: number,
) {
  const blobName = buildBlobName(prefix, originalName, riskAssessmentId);
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

export const uploadRiskAssessmentLogo = (
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  riskAssessmentId: number,
) => upload("logo", buffer, originalName, mimeType, riskAssessmentId);

export const uploadRiskAssessmentPdf = (
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  riskAssessmentId: number,
) => upload("pdf", buffer, originalName, mimeType, riskAssessmentId);

export function getRiskAssessmentFileSasUrl(blobName: string): string {
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

export async function deleteRiskAssessmentFile(blobName: string): Promise<void> {
  const blobClient = containerClient.getBlobClient(blobName);
  await blobClient.deleteIfExists();
}