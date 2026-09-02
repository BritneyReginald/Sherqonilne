"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedicalFile = uploadMedicalFile;
exports.getMedicalFileSasUrl = getMedicalFileSasUrl;
exports.deleteMedicalFile = deleteMedicalFile;
const storage_blob_1 = require("@azure/storage-blob");
const identity_1 = require("@azure/identity");
const crypto_1 = __importDefault(require("crypto"));
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_MEDICALS_CONTAINER || "medical-records";
if (!accountName) {
    throw new Error("AZURE_STORAGE_ACCOUNT_NAME environment variable is required");
}
const credential = new identity_1.DefaultAzureCredential();
const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential);
const containerClient = blobServiceClient.getContainerClient(containerName);
/**
 * Upload medical document to Azure Blob Storage.
 */
async function uploadMedicalFile(buffer, originalName, mimeType, employeeId) {
    const extension = originalName.includes(".")
        ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
        : "";
    const randomName = crypto_1.default.randomUUID();
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
function getMedicalFileSasUrl(blobName) {
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
 * Delete medical document from Azure Blob Storage.
 */
async function deleteMedicalFile(blobName) {
    const blobClient = containerClient.getBlobClient(blobName);
    await blobClient.deleteIfExists();
}
