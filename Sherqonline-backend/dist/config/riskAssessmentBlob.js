"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRiskAssessmentPdf = exports.uploadRiskAssessmentLogo = void 0;
exports.getRiskAssessmentFileSasUrl = getRiskAssessmentFileSasUrl;
exports.deleteRiskAssessmentFile = deleteRiskAssessmentFile;
const storage_blob_1 = require("@azure/storage-blob");
const identity_1 = require("@azure/identity");
const crypto_1 = __importDefault(require("crypto"));
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_RISK_ASSESSMENTS_CONTAINER || "risk-assessment";
if (!accountName) {
    throw new Error("AZURE_STORAGE_ACCOUNT_NAME environment variable is required");
}
const credential = new identity_1.DefaultAzureCredential();
const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential);
const containerClient = blobServiceClient.getContainerClient(containerName);
function buildBlobName(prefix, originalName, riskAssessmentId) {
    const extension = originalName.includes(".")
        ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
        : "";
    const randomName = crypto_1.default.randomUUID();
    return `risk-assessment-${riskAssessmentId}/${prefix}/${randomName}${extension}`;
}
async function upload(prefix, buffer, originalName, mimeType, riskAssessmentId) {
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
const uploadRiskAssessmentLogo = (buffer, originalName, mimeType, riskAssessmentId) => upload("logo", buffer, originalName, mimeType, riskAssessmentId);
exports.uploadRiskAssessmentLogo = uploadRiskAssessmentLogo;
const uploadRiskAssessmentPdf = (buffer, originalName, mimeType, riskAssessmentId) => upload("pdf", buffer, originalName, mimeType, riskAssessmentId);
exports.uploadRiskAssessmentPdf = uploadRiskAssessmentPdf;
function getRiskAssessmentFileSasUrl(blobName) {
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
async function deleteRiskAssessmentFile(blobName) {
    const blobClient = containerClient.getBlobClient(blobName);
    await blobClient.deleteIfExists();
}
