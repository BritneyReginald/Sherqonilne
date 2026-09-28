"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLegalAppointmentDocument = uploadLegalAppointmentDocument;
exports.getLegalAppointmentDocumentSasUrl = getLegalAppointmentDocumentSasUrl;
exports.deleteLegalAppointmentDocument = deleteLegalAppointmentDocument;
const storage_blob_1 = require("@azure/storage-blob");
const crypto_1 = __importDefault(require("crypto"));
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const documentsContainerName = process.env.AZURE_STORAGE_LEGAL_APPOINTMENT_DOCUMENTS_CONTAINER ||
    "legal-appointment-documents";
if (!accountName || !accountKey) {
    throw new Error("AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY environment variables are required");
}
const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);
const documentsContainerClient = blobServiceClient.getContainerClient(documentsContainerName);
/*
 * Auto-create the container on first use so there's no manual
 * Azure Portal step. Runs once per process.
 */
let containerEnsured = false;
async function ensureContainer() {
    if (containerEnsured)
        return;
    await documentsContainerClient.createIfNotExists();
    containerEnsured = true;
}
function buildSasUrl(blobName) {
    const storageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    if (!storageAccountKey) {
        throw new Error("AZURE_STORAGE_ACCOUNT_KEY is required to generate SAS URLs");
    }
    const keyCredential = new storage_blob_1.StorageSharedKeyCredential(accountName, storageAccountKey);
    const expiresOn = new Date(Date.now() + 10 * 60 * 1000);
    const sasToken = (0, storage_blob_1.generateBlobSASQueryParameters)({
        containerName: documentsContainerName,
        blobName,
        permissions: storage_blob_1.BlobSASPermissions.parse("r"),
        startsOn: new Date(Date.now() - 60 * 1000),
        expiresOn,
    }, keyCredential).toString();
    return `${documentsContainerClient.getBlobClient(blobName).url}?${sasToken}`;
}
/* ------------------------------------------------------------------ */
/* SIGNED / UPLOADED DOCUMENTS                                         */
/* ------------------------------------------------------------------ */
async function uploadLegalAppointmentDocument(buffer, originalName, mimeType, appointmentId) {
    await ensureContainer();
    const extension = originalName.includes(".")
        ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
        : "";
    const blobName = `appointment-${appointmentId}/${crypto_1.default.randomUUID()}${extension}`;
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
function getLegalAppointmentDocumentSasUrl(blobName) {
    return buildSasUrl(blobName);
}
async function deleteLegalAppointmentDocument(blobName) {
    await documentsContainerClient.getBlobClient(blobName).deleteIfExists();
}
