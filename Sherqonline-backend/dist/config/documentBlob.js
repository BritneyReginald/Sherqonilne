"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLibraryFile = uploadLibraryFile;
exports.getLibraryFileSasUrl = getLibraryFileSasUrl;
exports.downloadLibraryFileStream = downloadLibraryFileStream;
exports.deleteLibraryFile = deleteLibraryFile;
const storage_blob_1 = require("@azure/storage-blob");
const crypto_1 = __importDefault(require("crypto"));
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_DOCUMENT_LIBRARY_CONTAINER || "document-library";
if (!accountName || !accountKey) {
    throw new Error("AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY environment variables are required");
}
const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);
const containerClient = blobServiceClient.getContainerClient(containerName);
// Create the container on first use so no manual setup is needed
let containerReady = null;
function ensureContainer() {
    if (!containerReady) {
        containerReady = containerClient.createIfNotExists();
    }
    return containerReady;
}
async function uploadLibraryFile(buffer, originalName, mimeType, folderId) {
    await ensureContainer();
    const extension = originalName.includes(".")
        ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
        : "";
    const blobName = `folder-${folderId}/${crypto_1.default.randomUUID()}${extension}`;
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
function getLibraryFileSasUrl(blobName, downloadAs) {
    const sasToken = (0, storage_blob_1.generateBlobSASQueryParameters)({
        containerName,
        blobName,
        permissions: storage_blob_1.BlobSASPermissions.parse("r"),
        startsOn: new Date(Date.now() - 60 * 1000),
        expiresOn: new Date(Date.now() + 10 * 60 * 1000),
        ...(downloadAs
            ? {
                contentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(downloadAs)}`,
            }
            : {}),
    }, sharedKeyCredential).toString();
    return `${containerClient.getBlobClient(blobName).url}?${sasToken}`;
}
/** Stream a blob (used when building the ZIP). */
async function downloadLibraryFileStream(blobName) {
    const response = await containerClient.getBlobClient(blobName).download();
    if (!response.readableStreamBody) {
        throw new Error(`Blob ${blobName} has no readable stream`);
    }
    // In Node, Azure returns a real Readable; the SDK just types it loosely.
    return response.readableStreamBody;
}
async function deleteLibraryFile(blobName) {
    await containerClient.getBlobClient(blobName).deleteIfExists();
}
