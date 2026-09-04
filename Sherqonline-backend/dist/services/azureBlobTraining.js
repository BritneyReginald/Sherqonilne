"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTrainingCertificate = uploadTrainingCertificate;
exports.getTrainingCertificateSasUrl = getTrainingCertificateSasUrl;
exports.deleteTrainingCertificate = deleteTrainingCertificate;
const storage_blob_1 = require("@azure/storage-blob");
const crypto_1 = require("crypto");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Reuses the SAME storage account + container as Medicals
// (services/azureBlob.ts) — no new Azure resource needed. Files
// are kept apart purely by blob path prefix ("training/..." vs
// "employee-.../..."), which is enough since access always goes
// through a per-file SAS URL anyway, never a directory listing.
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "medical-records";
const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);
const containerClient = blobServiceClient.getContainerClient(containerName);
async function uploadTrainingCertificate(buffer, originalFileName, mimeType, employeeId) {
    const safeExtension = originalFileName.includes(".")
        ? originalFileName.split(".").pop()
        : "";
    const blobName = `training/employee-${employeeId}/${(0, crypto_1.randomUUID)()}${safeExtension ? `.${safeExtension}` : ""}`;
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
function getTrainingCertificateSasUrl(blobName, expiryMinutes = 10) {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const sasOptions = {
        containerName,
        blobName,
        permissions: storage_blob_1.BlobSASPermissions.parse("r"),
        protocol: storage_blob_1.SASProtocol.Https,
        startsOn: new Date(Date.now() - 60 * 1000),
        expiresOn: new Date(Date.now() + expiryMinutes * 60 * 1000),
    };
    const sasToken = (0, storage_blob_1.generateBlobSASQueryParameters)(sasOptions, sharedKeyCredential).toString();
    return `${blockBlobClient.url}?${sasToken}`;
}
async function deleteTrainingCertificate(blobName) {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
}
