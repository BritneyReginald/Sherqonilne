export type InjuryType = "firstAid" | "hospital" | null;

export type SignatureStatus =
  | "draft"
  | "AWAITING_EMPLOYEE"
  | "AWAITING_FIRST_AIDER"
  | "AWAITING_SAFETY"
  | "closed";

export type SignatureRecord = {
  signedBy: string;
  signedAt: string;
  signature: string;
  profileId: string;
  role: string;
};

export type UnableToSign = {
  reason: string;
  recordedBy: string;
  witnessName: string;
  witnessSignature: string;
  dateTime: string;
  comment: string;
};

export type FirstAidEntry = {
  id: string;

  date: string;
  time: string;

  employeeName: string;
  employeeNumber: string;

  injury: string;
  treatment: string;
  comments: string;

  firstAider: string;

  furtherMedicalAttention: boolean;

  status: SignatureStatus;

  employeeSignature?: SignatureRecord;
  firstAiderSignature?: SignatureRecord;
  safetyOfficerSignature?: SignatureRecord;

  employeeUnableToSign?: UnableToSign;
};