"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadIncidentEvidence = uploadIncidentEvidence;
exports.getIncidentEvidenceSasUrl = getIncidentEvidenceSasUrl;
exports.deleteIncidentEvidence = deleteIncidentEvidence;
const storage_blob_1 = require("@azure/storage-blob");
const identity_1 = require("@azure/identity");
const crypto_1 = __importDefault(require("crypto"));
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_INCIDENTS_CONTAINER || "incident-evidence";
if (!accountName) {
    throw new Error("AZURE_STORAGE_ACCOUNT_NAME environment variable is required");
}
const credential = new identity_1.DefaultAzureCredential();
const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential);
const containerClient = blobServiceClient.getContainerClient(containerName);
/**
 * Upload an evidence file for an incident/NCR/injury record to
 * Azure Blob Storage. One record can have many evidence files, so
 * blobs are namespaced by record, not by employee like medicals.
 */
async function uploadIncidentEvidence(buffer, originalName, mimeType, recordId) {
    const extension = originalName.includes(".")
        ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
        : "";
    const randomName = crypto_1.default.randomUUID();
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
function getIncidentEvidenceSasUrl(blobName) {
    const storageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    if (!storageAccountKey) {
        throw new Error("AZURE_STORAGE_ACCOUNT_KEY is required to generate SAS URLs");
    }
    const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(accountName, storageAccountKey);
    const expiresOn = new Date(Date.now() + 10 * 60 * 1000);
    const sasToken = (0, storage_blob_1.generateBlobSASQueryParameters)({
        containerName,
        blobName,
        permissions: storage_blob_1.BlobSASPermissions.parse("r"),
        startsOn: new Date(Date.now() - 60 * 1000),
        expiresOn,
    }, sharedKeyCredential).toString();
    return `${containerClient.getBlobClient(blobName).url}?${sasToken}`;
}
/**
 * Delete an evidence file from Azure Blob Storage.
 */
async function deleteIncidentEvidence(blobName) {
    const blobClient = containerClient.getBlobClient(blobName);
    await blobClient.deleteIfExists();
}
