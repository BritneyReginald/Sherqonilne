export interface AppointmentTemplateData {
  employeeName: string;
  companyName?: string;
  siteName?: string;
  appointerName?: string;
  startDate?: string;
  logoUrl?: string | null;
}

export interface LetterParagraphSegment {
  text: string;
  bold?: boolean;
}

export interface AppointmentTemplate {
  /** Bolded, all-caps Act/Regulation + role heading, e.g. matches the PDF's top paragraph */
  headerTitle: string;
  /** Short single-line label used in the register/filters/DB, not the letter itself */
  legalSection: string;
  /** Exact role text used in the appointing paragraph, bolded there */
  roleLabel: string;
  duties: string[];
  reportingNote: string;
}

export interface GeneratedLetter {
  headerTitle: string;
  companyName: string;
  logoUrl?: string | null;
  appointingParagraph: LetterParagraphSegment[];
  validityLine: string;
  dutiesIntro: string;
  duties: string[];
  reportingLine: string;
}

/**
 * The 3 legal appointment bodies currently in use, all under
 * Health & Safety. Duty text and letter structure are transcribed
 * from the signed Baletsema Mining Services appointment letters
 * (BM-SHEQ-APP-004, 005, 006) so the generated letter matches what's
 * actually issued on site: logo + company name, bolded Act heading,
 * "I, [appointer], the 16(2) appointee of [company] hereby appoint
 * you, [employee], as [role] for [site]." paragraph, validity line,
 * then the duties.
 */
export const appointmentTemplates: Record<string, AppointmentTemplate> = {
  firstAid: {
    headerTitle:
      "OCCUPATIONAL HEALTH AND SAFETY ACT, ACT 85 OF 1993 GENERAL SAFETY REGULATION 3(4) – FIRST AIDER APPOINTMENT",
    legalSection: "OHS Act, General Safety Regulation 3(4)",
    roleLabel: "First Aider",
    duties: [
      "Ensure that the First Aid box or boxes under your control remain adequately stocked at all times to address all reasonably foreseeable injuries or medical incidents within your designated area of responsibility.",
      "Ensure that First Aid boxes are properly safeguarded, that their locations are clearly demarcated, and that the names of appointed First Aiders are conspicuously displayed on or near each First Aid box.",
      "Ensure that your First Aid certificate remains valid and current for the duration of this appointment.",
      "Where activities within your area of responsibility involve the use, handling or storage of hazardous chemical substances, familiarise yourself with the relevant Material Safety Data Sheets (MSDS), specifically the prescribed first aid measures to be implemented in the event of exposure or emergency.",
      "Be readily available during working hours or shifts to render First Aid treatment when required.",
      "Ensure that the following documents are maintained within the First Aid box: First Aid Box Inspection Checklist; First Aid Treatment Record Register; WCL2 Form (in terms of Compensation for Occupational Injuries and Diseases requirements).",
      "Ensure that First Aid box inspections are conducted at regular intervals and properly recorded.",
      "Undergo appropriate accredited training in order to obtain and maintain a valid certificate of competency in First Aid.",
    ],
    reportingNote:
      "Any problems which you may experience in the execution of this appointment must be reported immediately to the Construction Supervisor.",
  },

  hseRep: {
    headerTitle:
      "OCCUPATIONAL HEALTH AND SAFETY ACT, ACT 85 OF 1993 SECTION 17, 18, 19, 20 & GENERAL ADMINISTRATIVE REGULATION 7 – HEALTH, SAFETY AND ENVIRONMENTAL REPRESENTATIVE APPOINTMENT",
    legalSection:
      "OHS Act Sections 17, 18, 19, 20 & General Administrative Regulation 7",
    roleLabel: "Health and Safety and Environmental Representative",
    duties: [
      "Represent your employee electorate's interests in terms of Occupational Health and Safety as well as Environmental Management requirements applicable to the workplace.",
      "Carry out Health and Safety inspections of your workplace prior to Health and Safety Committee meetings, including Environmental compliance inspections (waste management, spill control, pollution prevention, legal permits where applicable).",
      "Serve on the appropriate Health and Safety Committee, and participate in Environmental management discussions, reviews and meetings where required.",
      "Bring to the attention of your supervisor any deviations in respect of Health and Safety that come to your attention, including any Environmental non-compliance, pollution risks, waste mismanagement or environmental hazards.",
      "Investigate, or assist with the investigation of, incidents in your area of responsibility, including Environmental incidents (spills, contamination, improper disposal).",
      "Ensure that Environmental aspects and impacts are identified, monitored and controlled in accordance with company procedures and applicable legislation.",
      "Attend Health and Safety Committee meetings as determined by the committee.",
      "Undergo Health and Safety Representative training in order to complete your tasks successfully, as well as any required Environmental Management training relevant to your responsibilities.",
      "Ensure that copies of the latest, updated risk assessments are available on site for inspection and that the Safety Officer is in possession of such risk assessments, including Environmental aspect and impact registers and waste registers where applicable.",
    ],
    reportingNote:
      "Any problems which you may experience in the execution of this appointment must be reported to the Construction Supervisor or the designated Site Manager or Site Safety Officer, where applicable.",
  },

  investigator: {
    headerTitle:
      "OCCUPATIONAL HEALTH AND SAFETY ACT, ACT 85 OF 1993 GENERAL ADMINISTRATIVE REGULATION 9(2) – INCIDENT INVESTIGATOR APPOINTMENT",
    legalSection: "OHS Act, General Administrative Regulation 9(2)",
    roleLabel: "Incident Investigator",
    duties: [
      "Investigate and report all incidents, injuries and non-conformances in accordance with applicable legal requirements and relevant International Organization for Standardization (ISO) standards. This includes all recordable incidents reportable under Section 24 of the Occupational Health and Safety Act, as well as any incident resulting in injury or ill health where the affected person(s) received medical treatment beyond first aid, including referral to a medical practitioner, clinic or hospital for examination and/or treatment.",
      "Once advised of, or aware of, such incident, injury, Environmental incident or Quality non-conformance, immediately arrange and/or commence the investigation.",
      "Where reasonably practicable, visit the site of the incident or non-conformance with a view to establishing the conditions prevailing at the time of the occurrence.",
      "Ensure all incidents, injuries, Environmental incidents and Quality non-conformances are investigated within seven (7) days, or as soon as reasonably practicable, and finalised as soon as possible thereafter.",
      "Record the results of the investigation in the form of Annexure 1 / the Company Document prescribed for this purpose, and ensure this document is tabled and discussed at the first meeting of the Health and Safety Committee following the incident, and, where applicable, reviewed during Environmental or Quality meetings.",
      "Ensure all documentation pertaining to incident and non-conformance investigations is properly completed and filed (with the appropriate name and/or reference of file).",
      "Undergo training to obtain the necessary competencies to carry out this task effectively.",
      "Ensure that copies of the latest updated risk assessments are available on site for inspection and that the Safety Officer is in possession of such risk assessments.",
    ],
    reportingNote:
      "Any problems which you may experience in the execution of this appointment must be reported to the Construction Manager.",
  },
};

/** Appointment Type dropdown value -> template + department config */
export const appointmentTypeMap: Record<
  string,
  {
    legalSection: string;
    department: string;
    templateKey: keyof typeof appointmentTemplates;
    hierarchyLevel: number;
  }
> = {
  "First Aid Officer": {
    legalSection: appointmentTemplates.firstAid.legalSection,
    department: "Health & Safety",
    templateKey: "firstAid",
    hierarchyLevel: 4,
  },
  "HSE/SHE Representative": {
    legalSection: appointmentTemplates.hseRep.legalSection,
    department: "Health & Safety",
    templateKey: "hseRep",
    hierarchyLevel: 3,
  },
  "Incident Investigator": {
    legalSection: appointmentTemplates.investigator.legalSection,
    department: "Health & Safety",
    templateKey: "investigator",
    hierarchyLevel: 3,
  },
};

export function generateAppointmentLetter(
  templateKey: string,
  data: AppointmentTemplateData,
): GeneratedLetter {
  const template = appointmentTemplates[templateKey];

  if (!template) {
    return {
      headerTitle: "",
      companyName: data.companyName || "",
      logoUrl: data.logoUrl,
      appointingParagraph: [{ text: "No template found for this appointment type." }],
      validityLine: "",
      dutiesIntro: "",
      duties: [],
      reportingLine: "",
    };
  }

  const appointingParagraph: LetterParagraphSegment[] = [
    {
      text: `I, ${data.appointerName || "____________"}, the 16(2) appointee of ${
        data.companyName || "the Company"
      }, hereby appoint you, ${data.employeeName}, as `,
    },
    { text: template.roleLabel, bold: true },
    {
      text: data.siteName ? ` for ${data.siteName}.` : ".",
    },
  ];

  return {
    headerTitle: template.headerTitle,
    companyName: data.companyName || "",
    logoUrl: data.logoUrl,
    appointingParagraph,
    validityLine: `This Legal Appointment is valid from ${
      data.startDate || "____________"
    } till end of contract, or while competency is still valid.`,
    dutiesIntro:
      "In terms of this appointment, you are required to perform the following functions and responsibilities:",
    duties: template.duties,
    reportingLine: template.reportingNote,
  };
}