export interface AppointmentTemplateData {
  employeeName: string;
  jobTitle?: string;
  companyName?: string;
  siteName?: string;
  appointerName?: string;
  startDate?: string;
  logoUrl?: string | null;
  /** Employee number from Workforce; shown in the acknowledgement once signed */
  employeeNumber?: string;
  /** True once the employee has signed (on-screen or uploaded signed letter) */
  signed?: boolean;
}

export interface LetterParagraphSegment {
  text: string;
  bold?: boolean;
}

/** A block of legal text attached to the end of the letter (Act section, regulation, etc.) */
export interface LegalReference {
  /** e.g. "LEGAL REFERENCE – Section 23" */
  title: string;
  /** e.g. "23. Provision of personal protective equipment and clothing" */
  heading?: string;
  /** One entry per paragraph */
  body: string[];
}

/** One row of the "Attached legal references" table (GMR 2(1) letter) */
export interface AppendixRow {
  reference: string;
  requirement: string;
}

/** One row of the summary table at the top of the letter */
export interface SummaryRow {
  label: string;
  /** May contain "\n" for multi-line values (e.g. several legal sections) */
  value: string;
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

  /* ---------- Optional fields (summary table, appointing/validity wording, legal references, etc.) ---------- */

  /** Controlled document number printed in the letter header, e.g. "CM-SHEQ-APP-004" */
  docNo?: string;
  /** Lines for the "Legal Assignment" row of the summary table. Falls back to legalSection. */
  legalAssignment?: string[];
  /** "Appointment Description" row of the summary table. Falls back to roleLabel. */
  appointmentDescription?: string;
  /**
   * Overrides the appointing paragraph. Tokens: {appointer} {company} {employee}
   * {site} {role}. {role} is rendered bold. When omitted, the original
   * "I, X, the 16(2) appointee of Y, hereby appoint you, Z, as ROLE for SITE." is used.
   */
  appointingTemplate?: string;
  /**
   * Overrides the validity line. Tokens: {startDate} {company} {site} {role}.
   * When omitted, the original "valid from … till end of contract, or while
   * competency is still valid." line is used.
   */
  validityTemplate?: string;
  /** Overrides the sentence that introduces the duties list */
  dutiesIntro?: string;
  /** Extra paragraphs shown between the validity line and the duties intro */
  introParagraphs?: string[];
  /** Legal text attached after the signature blocks */
  legalReferences?: LegalReference[];
  /** Intro sentence + table of appendices (GMR 2(1) letter) */
  appendicesIntro?: string;
  appendices?: AppendixRow[];
  /** Overrides the employee acknowledgement paragraph. Token: {employee} (blank until signed, then name + employee number) */
  acknowledgementTemplate?: string;
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

  /* ---------- New (optional so existing renderers keep compiling) ---------- */
  docNo?: string;
  /** Legal Assignment / Appointment Description / Full Name / Designation / Date */
  summaryRows?: SummaryRow[];
  introParagraphs?: string[];
  legalReferences?: LegalReference[];
  appendicesIntro?: string;
  appendices?: AppendixRow[];
  acknowledgement?: string;
}

/* ------------------------------------------------------------------ */
/* Shared legal text                                                   */
/* ------------------------------------------------------------------ */

/**
 * Regulation 18 text as it appears in the Forklift and Excavator
 * Operator appointment documents. Shared so it's maintained once.
 */
const REGULATION_18_REFERENCE: LegalReference = {
  title: "LEGAL REFERENCE – Regulation 18",
  heading: "Regulation 18: Lifting machines and lifting tackle",
  body: [
    "18.(1) No user shall use or permit the use of a lifting machine unless -",
    "(a) it has been designed and constructed in accordance with a generally accepted technical standard;",
    "(b) it is conspicuously and clearly marked with the maximum mass load which it is designed to carry with safety: Provided that when this mass load varies with the conditions of use a table showing the maximum mass load with respect to every variable condition shall be posted up by the user in a conspicuous place easily visible to the operator; and",
    "(c) it has at all times at least three full turns of rope on the drum of each winch which forms part of such a machine when such winch has been run to its lowest limit.",
    "(2) The user shall, where practicable, provide every power-driven lifting machine with -",
    "(a) a brake or other device capable of holding the maximum mass load should the power supply fail, or which is such that it will automatically prevent the uncontrolled downward movement of the load when the raising effort is interrupted; and",
    "(b) a limiting device which will automatically arrest the driving effort when -",
    "(i) the hook or load attachment point of the power-driven lifting machine reaches its highest safe position; and",
    "(ii) in the case of a winch-operated lifting machine with a lifting capacity of 5000 kg or more, the load is greater than the rated mass load of such machine.",
    "(3) The user shall cause every chain or rope which forms an integral part of a lifting machine to have a factor of safety as prescribed by the standard to which such machine was manufactured: Provided that in the absence of such prescribed factor of safety, chains, steel-wire ropes and fibre ropes shall have a factor of safety of at least four, five and ten, respectively, with respect to the rated carrying capacity of the lifting machine.",
    "(4) The user shall cause every hook or any other load-attaching device which forms an integral part of a lifting machine to be so designed or proportioned that accidental disconnection of the load under working conditions cannot take place.",
    "(5) The user shall cause the whole installation and all working parts of every lifting machine to be thoroughly examined and subjected to a performance test, as prescribed by the standard to which the lifting machine was manufactured, by a person who has knowledge and experience of the erection and maintenance of the type of lifting machine involved or similar machinery and who shall determine the serviceability of the structures, ropes, machinery and safety devices, before they are put into use following every time they are dismantled and re-erected, and thereafter at intervals not exceeding 12 months: Provided that in the absence of such prescribed performance test the whole installation of the lifting machine shall be tested with 110 % of the rated mass load, applied over the complete lifting range of such machine and in such a manner that every part of the installation is stressed accordingly.",
    "(6) Notwithstanding the provisions of subregulation (5), the user shall cause all ropes, chains, hooks or other attaching devices, sheaves, brakes and safety devices forming an integral part of a lifting machine to be thoroughly examined by a person contemplated in subregulation (5) at intervals not exceeding six months.",
    "(7) Every user of a lifting machine shall at all times keep on his premises a register in which he shall record or cause to be recorded full particulars of any performance test and examination prescribed by subregulation (5) and (6) and any modification or repair to the lifting machine, and shall ensure that the register is available on request for inspection by an inspector.",
    "(8) No user of machinery shall require or permit any persons to be moved or supported by means of a lifting machine, unless such machine is fitted with a cradle approved for that purpose by an inspector.",
    "(9) No user shall use or permit any person to use a jib-crane with a lifting capacity of 5 000 kg or more at minimum jib radius, unless it is provided with -",
    "(a) a load indicator that will indicate to the operator of the jib-crane the mass of the load being lifted: Provided that such a device shall not require manual adjustment, from application of a load to the jib crane until the release of that load, using any motion or combination of motions permitted by the crane manufacturer to ensure safe lifting; or",
    "(b) a limiting device which will automatically arrest the driving effort whenever the load being lifted is greater than the rated mass load of the jib-crane, at that particular radius, using any motion or combination of motions permitted by the crane manufacturer to ensure safe lifting: Provided that such a device shall not arrest the driving effort when the jib-crane is being operated into a safer condition.",
    "(10) No user shall use or allow the use of any lifting tackle unless the following conditions are complied with, namely that -",
    "(a) every item of lifting tackle is well constructed of sound material, is strong enough and is free from patent defects and is in general constructed in accordance with a generally accepted technical standard;",
    "(b) every lifting assembly consisting of different items of lifting tackle is conspicuously and clearly marked with identification particulars and the maximum mass load which it is designed to lift with safety;",
    "(c) ropes or chains have a factor of safety with respect to the maximum mass load they are designed to lift with safety of -",
    "(i) ten for natural-fibre ropes;",
    "(ii) six for man-made fibre ropes or woven webbing;",
    "(iii) six for steel-wire ropes except for double part spliced endless sling legs and double part endless grommet sling legs made from steel-wire rope, in which case the factor of safety shall be at least eight;",
    "(iv) five for steel chains; and",
    "(v) four for high-tensile or alloy steel chains:",
    "Provided that when the load is equally shared by two or more ropes or chains the factor of safety may be calculated in accordance with the sum of the breaking strengths taking into consideration the angle of loading;",
    "(d) steel-wire ropes are discarded and not used again for lifting purposes if the rope shows signs of excessive wear, too many broken wires, corrosion or other defects that have made its use in any way dangerous;",
    "(e) such lifting tackle is examined at intervals not exceeding three months by a person contemplated in sub-regulation (5) who shall enter and sign the result of each such inspection in a book kept for this purpose; and",
    "(f) such lifting tackle is stored or protected so as to prevent damage or deterioration when not in use.",
    "(11) The user shall ensure that every lifting machine is operated by an operator specifically trained for a particular type of lifting machine: Provided that in the case of a lift truck with a lifting capacity of 750 kg or more and jib-cranes with a lifting capacity of 5000 kg or more at minimum jib radius, the user shall not require or permit any person to operate such a lifting machine unless the operator is in possession of a certificate of training, issued by a person or organization approved for the purpose by the Chief Inspector.",
    "[Date effective 10 October 1993 - G.N.R.2483 of 4 September 1992]",
  ],
};

const SECTION_8_SUPERVISOR_REFERENCE: LegalReference = {
  title: "LEGAL REFERENCE – Section 8",
  heading: "8. General duties of employers to their employees",
  body: [
    "(1) Every employer shall provide and maintain, as far as is reasonably practicable, a working environment that is safe and without risk to the health of his employees.",
    "(2) Without limiting the generality of an employer's duties under subsection (1), the matters to which those duties refer include —",
    "(i) ensuring, as far as is reasonably practicable, that all persons who may be affected by his activities are informed of and adequately supervised in the performance of their work so as to render such work safe and without risk to health.",
  ],
};

const SECTION_8_PPE_REFERENCE: LegalReference = {
  title: "LEGAL REFERENCE – Section 8",
  heading: "8. General duties of employers to their employees",
  body: [
    "(1) Every employer shall provide and maintain, as far as is reasonably practicable, a working environment that is safe and without risk to the health of his employees.",
    "(2) The matters to which those duties refer include, without limiting their generality, the provision and maintenance of systems of work, plant and machinery that, as far as is reasonably practicable, are safe and without risks to health.",
  ],
};

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

/**
 * The legal appointment bodies in use, all under Health & Safety.
 *
 * - firstAid / hseRep / investigator: transcribed from the signed
 *   Baletsema Mining Services letters (BM-SHEQ-APP-004, 005, 006).
 * - fireFighter / forkliftOperator / excavatorOperator / supervisor /
 *   ppeInspector / gmr21: transcribed from the Claremount Metals
 *   appointment documents (CM-SHEQ-APP-xxx).
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

  fireFighter: {
    headerTitle:
      "OCCUPATIONAL HEALTH AND SAFETY ACT, ACT 85 OF 1993 ENVIRONMENTAL REGULATIONS FOR WORKPLACES 9(2) – FIRE FIGHTER APPOINTMENT",
    legalSection: "OHS Act, Environmental Regulations for Workplaces 9(2)",
    roleLabel: "Fire Fighter",
    docNo: "CM-SHEQ-APP-004",
    // NOTE: the source document's summary table says "General Safety
    // Regulation 3" / "First Aider" (a copy-paste from the First Aider
    // letter). The legal reference attached to the letter is
    // Environmental Regulations for Workplaces 9(2), which is used here.
    legalAssignment: ["Environmental Regulations for Workplaces 9(2)"],
    appointmentDescription: "Fire Fighter",
    appointingTemplate:
      "I, {appointer}, the 16(2) appointee of {company}, hereby appoint you, {employee}, as the {role}.",
    validityTemplate:
      "You are hereby designated with effect from {startDate} until end of contract as the {role} for {company}.",
    dutiesIntro:
      "In terms of this appointment the following functions should be performed:",
    duties: [
      "Ensure that all firefighting equipment within this area is in good working condition and that the fire access to this equipment is clear and unobstructed.",
      "Ensure that all employees working in the area that you are designated for are aware of your appointment as the fire team member.",
      "Do not endanger yourself and/or your fellow employees' safety in the event of a fire. Your principal aim as a fire team member is to prevent fires and to notify the authorities when a fire occurs.",
      "When a fire occurs in your area, sound the emergency alarm; then act against the fire, using the fire equipment provided.",
      "Ensure that you report to your fire marshal when the emergency alarm is sounded and follow instructions given by your fire marshal.",
    ],
    reportingNote:
      "Fire fighters and members of the fire fighting team report directly to the appointed coordinator.",
    legalReferences: [
      {
        title:
          "FIRE FIGHTER / MEMBER OF THE FIRE FIGHTING TEAM LEGAL REFERENCE – Environmental Regulations for Workplaces 9(2)",
        heading: "9. Fire precautions and means of egress",
        body: [
          "(2) Having regard to the size, construction and location of the workplace, and the amount and type of flammable articles used, handled, or stored on the premises, an employer shall provide on the premises an adequate supply of suitable fire-fighting equipment at strategic locations or as may be recommended by the fire chief of the local authority concerned, and such equipment shall be maintained in a good working order.",
          "Explanation:",
          "This is not considered a well-written regulation. One of the reasons for saying this is that although it is a legal requirement for employers to provide fire fighting equipment, nothing is said in the regulation regarding the training of persons to use such equipment in case of a fire.",
          "Common sense should, therefore, prevail and dictate to employers the number of persons to be trained in fire fighting and also whether it is necessary to formally establish a fire fighting team or maybe even teams for the workplace. The necessity for this will obviously be determined by the risk of fires on such premises.",
          "It is also suggested, based on the risk once again, that where a fire fighting team is established that regular exercises be held to ensure good co-operation between team members to operate as efficiently as possible during a real emergency.",
          "Any fire fighters and members of fire fighting teams will report directly to the appointed coordinator.",
        ],
      },
    ],
  },

  forkliftOperator: {
    headerTitle:
      "OCCUPATIONAL HEALTH AND SAFETY ACT, ACT 85 OF 1993 DRIVEN MACHINERY REGULATION 18 – FORKLIFT OPERATOR APPOINTMENT",
    legalSection: "OHS Act, Driven Machinery Regulation 18",
    roleLabel: "Forklift Operator",
    docNo: "CM-SHEQ-APP-010",
    legalAssignment: ["Driven Machinery Regulation 18"],
    appointmentDescription: "Forklift Operator",
    appointingTemplate:
      "I, {appointer}, the 16(2) appointee of {company}, hereby appoint you, {employee}, as the {role}.",
    validityTemplate:
      "You are hereby designated with effect from {startDate} until end of contract as the {role} for {company}.",
    dutiesIntro:
      "In terms of this appointment the following functions should be performed:",
    duties: [
      "Familiarize yourself with the full scope of Driven Machinery Regulation 18.",
      "You may not permit any person to be transported or lifted by the forklift.",
      "No other person except a trained forklift operator may operate your forklift.",
      "When the forklift unit is stationary, do not leave the forklift unit keys in the ignition, nor leave it idling unattended.",
      "Perform daily and weekly pre-use and post-use inspections in the prescribed manner.",
      "Report any mechanical, hydraulic, or electrical defects and ensure that they are immediately attended to before using the forklift.",
      "At all times, operate the unit with due care in compliance with the training you have been given.",
      "Only allow persons to be lifted provided that a 'purpose-made' safety cage is supplied and securely attached to the forklift unit, and persons to be lifted are wearing full safety harnesses.",
      "Return the forklift unit to the assigned parking space when not in use.",
      "Obey all signs and do not exceed regulated speed limits.",
      "At all times, follow the correct procedure to gain permission for operating a forklift.",
    ],
    reportingNote: "",
    legalReferences: [REGULATION_18_REFERENCE],
  },

  excavatorOperator: {
    headerTitle:
      "OCCUPATIONAL HEALTH AND SAFETY ACT, ACT 85 OF 1993 DRIVEN MACHINERY REGULATION 18 – EXCAVATOR OPERATOR APPOINTMENT",
    legalSection: "OHS Act, Driven Machinery Regulation 18",
    roleLabel: "Excavator Operator",
    // NOTE: the source document carries the same doc number as the
    // Forklift Operator appointment (CM-SHEQ-APP-010). Update once a
    // unique number is allocated.
    docNo: "CM-SHEQ-APP-010",
    legalAssignment: ["Driven Machinery Regulation 18"],
    appointmentDescription: "Excavator Operator",
    appointingTemplate:
      "I, {appointer}, the 16(2) appointee of {company}, hereby appoint you, {employee}, as the {role}.",
    validityTemplate:
      "You are hereby designated with effect from {startDate} until end of contract as the {role} for {company}.",
    dutiesIntro:
      "In terms of this appointment the following functions should be performed:",
    duties: [
      "Familiarize yourself with the full scope of Driven Machinery Regulation 18.",
      "You may not permit any person to be transported or lifted by the excavator.",
      "No other person except a trained excavator operator may operate your excavator.",
      "When the excavator unit is stationary, do not leave the excavator unit keys in the ignition, nor leave it idling unattended.",
      "Perform daily and weekly pre-use and post-use inspections in the prescribed manner.",
      "Report any mechanical, hydraulic, or electrical defects and ensure that they are immediately attended to before using the excavator.",
      "At all times, operate the unit with due care in compliance with the training you have been given.",
      "Only allow persons to be lifted provided that a 'purpose-made' safety cage is supplied and securely attached to the excavator unit, and persons to be lifted are wearing full safety harnesses.",
      "Return the excavator unit to the assigned parking space when not in use.",
      "Obey all signs and do not exceed regulated speed limits.",
      "At all times, follow the correct procedure to gain permission for operating an excavator.",
    ],
    reportingNote: "",
    legalReferences: [REGULATION_18_REFERENCE],
  },

  supervisor: {
    headerTitle:
      "OCCUPATIONAL HEALTH AND SAFETY ACT, ACT 85 OF 1993 SECTION 8, SECTION 8(2)(i), SECTION 13 & GENERAL SAFETY REGULATIONS – SUPERVISOR APPOINTMENT",
    legalSection:
      "OHS Act Sections 8, 8(2)(i), 13 & General Safety Regulations",
    roleLabel: "Supervisor",
    docNo: "CM-SHEQ-APP-012",
    legalAssignment: [
      "Occupational Health and Safety Act 85 of 1993",
      "Section 8 – General duties of employers to their employees",
      "Section 8(2)(i) – Supervision of health and safety at work",
      "Section 13 – Duty to inform",
      "General Safety Regulations",
    ],
    appointmentDescription: "Supervisor Appointment",
    appointingTemplate:
      "I, {appointer}, the 16(2) appointee of {company}, hereby appoint you, {employee}, as the {role}.",
    validityTemplate:
      "You are hereby designated with effect from {startDate} until end of contract as the {role} responsible for {company}.",
    dutiesIntro:
      "As Supervisor, you are responsible for ensuring that all work in your area of responsibility is performed safely and in accordance with the Occupational Health and Safety Act 85 of 1993. In terms of this appointment the following functions should be performed:",
    duties: [
      "Ensure that all employees under your supervision comply with the provisions of the Occupational Health and Safety Act 85 of 1993 and its regulations.",
      "Identify and report hazards and unsafe conditions in the workplace immediately, and take steps to eliminate or control them where reasonably practicable.",
      "Ensure that all employees receive the necessary training, instruction and information to perform their work safely.",
      "Conduct regular safety inspections of your area of responsibility and keep records of such inspections.",
      "Report all incidents, accidents, near misses and injuries immediately to management, and ensure the scene is not disturbed where required.",
      "Ensure that all machinery and equipment in your area is maintained in a safe and serviceable condition and is only operated by authorised, competent persons.",
      "Ensure that personal protective equipment is available, correctly used and maintained by all employees under your supervision.",
      "Participate in the investigation of all incidents and accidents in your area and assist with the implementation of corrective actions.",
      "Enforce all safe work procedures, safe work instructions and site safety rules within your area of responsibility.",
    ],
    reportingNote:
      "Any problems or unsafe conditions which you are unable to resolve must be reported to your Plant Manager immediately.",
    legalReferences: [
      SECTION_8_SUPERVISOR_REFERENCE,
      {
        title: "LEGAL REFERENCE – Section 13",
        heading: "13. Duty to inform",
        body: [
          "Every employer shall, in respect of every hazard to the health or safety of his employees, as far as is reasonably practicable, cause every employee to be made conversant with the hazards to his health and safety attached to any work which he has to perform, and the precautionary measures which should be taken and observed with respect to those hazards.",
        ],
      },
    ],
  },

  ppeInspector: {
    headerTitle:
      "OCCUPATIONAL HEALTH AND SAFETY ACT, ACT 85 OF 1993 SECTION 8, SECTION 23 & GENERAL SAFETY REGULATION 2 – PPE INSPECTOR APPOINTMENT",
    legalSection: "OHS Act Sections 8, 23 & General Safety Regulation 2",
    roleLabel: "PPE Inspector",
    legalAssignment: [
      "Occupational Health and Safety Act 85 of 1993",
      "Section 8 – General duties of employers to their employees",
      "Section 23 – Provision of Personal Protective Equipment",
      "General Safety Regulation 2 – Personal safety equipment and facilities",
    ],
    appointmentDescription: "PPE Inspector Appointment",
    appointingTemplate:
      "I, {appointer}, the 16(2) appointee of {company}, hereby appoint you, {employee}, as the {role}.",
    validityTemplate:
      "You are hereby designated with effect from {startDate} until end of contract as the {role} responsible for {company}.",
    dutiesIntro:
      "In terms of this appointment it is your responsibility to ensure that the issuing of personal protective equipment complies with the requirements of the OHS Act 85 of 1993, and the following functions should be performed:",
    duties: [
      "Ensure that the PPE issuing list / register is completed and signed by all staff who are issued with or use any personal protective equipment.",
      "In the process of issuing and re-issuing PPE, visually inspect whether the equipment is in good condition and remains suitable for the purpose for which it is intended.",
      "Ensure that defective, damaged or worn PPE is removed from use and replaced before further issue.",
      "Ensure that the correct type and grade of PPE is issued for the hazard and task concerned.",
      "Maintain accurate records of PPE inspections, issues and replacements.",
    ],
    reportingNote:
      "Any problems which you experience during the issuing or re-issuing process must be reported to your Plant Manager immediately.",
    legalReferences: [
      {
        title: "LEGAL REFERENCE – Section 23",
        heading: "23. Provision of personal protective equipment and clothing",
        body: [
          "An employer shall, in respect of every hazard which is prescribed, provide free of charge to any employee who is exposed to that hazard, and maintain in a good and clean condition, such personal protective equipment or clothing as may be prescribed, and take such steps as may be necessary to ensure that such equipment or clothing is properly used by the employee concerned.",
        ],
      },
      {
        title: "LEGAL REFERENCE – General Safety Regulation 2",
        heading: "2. Personal safety equipment and facilities",
        body: [
          "(1) Subject to the provisions of sub-regulation (2), an employer shall provide and an employee shall use such personal protective equipment as may be necessary to protect the employee against hazards to his health or safety at the workplace.",
          "(2) Where it is necessary for an employee to use personal protective equipment, the employer shall, before the use thereof, inform the employee concerned of the hazards against which the equipment is intended to protect him, and instruct him in the proper use, care, limitations and maintenance thereof.",
          "(3) No employer shall require or permit any employee to use personal protective equipment or a safety facility unless it is in a serviceable and hygienic condition and complies with the relevant safety standard.",
        ],
      },
      SECTION_8_PPE_REFERENCE,
    ],
  },

  gmr21: {
    headerTitle:
      "OCCUPATIONAL HEALTH AND SAFETY ACT 85 OF 1993 GENERAL MACHINERY REGULATION 2(1) – SUPERVISION OF MACHINERY APPOINTMENT",
    legalSection: "General Machinery Regulation 2(1)",
    roleLabel: "General Machinery Regulation 2(1) Appointee",
    docNo: "CM-SHEQ-APP-011",
    legalAssignment: ["General Machinery Regulation 2(1)"],
    appointmentDescription: "Supervision of Machinery (Competent Person)",
    appointingTemplate:
      "I, {appointer}, being the Section 16.2 appointee of {company}, and in order to ensure that the provisions of the Occupational Health and Safety Act 85 of 1993 and the General Machinery Regulations, 1988 (as amended) in relation to machinery are complied with, hereby designate and appoint you, {employee}, in a full-time capacity as the {role} in respect of the premises of {company}.",
    introParagraphs: [
      "This appointment is made in terms of General Machinery Regulation 2(1) read with Section 8(2)(i) of the Act. You are appointed as a competent person as contemplated in General Machinery Regulation 2(3), being suitably qualified and experienced for the class and size of machinery used on the premises.",
    ],
    dutiesIntro:
      "In terms of this appointment you are charged with the following duties and responsibilities:",
    duties: [
      "To ensure that all machinery on the premises is operated, used and maintained in a safe manner and in compliance with the Occupational Health and Safety Act 85 of 1993 and the General Machinery Regulations, 1988 (as amended).",
      "To implement and maintain a planned preventative maintenance programme for all machinery on the premises.",
      "To ensure that all statutory machinery records, registers, inspection records and certificates are kept, maintained and are available for inspection.",
      "To ensure that machinery is operated only by authorised, trained and competent persons, and that the necessary safeguards, guards and safety equipment are in place and in good working order.",
      "To ensure that no person is required or permitted to work in a manner or in circumstances that expose them to danger from machinery.",
      "To identify hazards and assess risks associated with the use of machinery, and to take the necessary steps to eliminate or mitigate such risks.",
      "To ensure that any defective machinery is taken out of service and is not returned to use until it has been rendered safe.",
      "To report all deviations, incidents and areas of non-compliance which you are unable to rectify to the Section 16.2 / 16.1 appointee without delay.",
      "You may, with the approval of the employer, designate one or more competent persons to assist you in the performance of your duties in terms of GMR 2(7).",
      "That you will comply with the provisions of the Occupational Health and Safety Act 85 of 1993, the General Machinery Regulations and all other applicable regulations.",
    ],
    reportingNote: "",
    appendicesIntro:
      "Attached are the relevant legal references for this appointment. Ensure that you familiarize yourself with the legal requirements of the Occupational Health and Safety Act 85 of 1993 (OHSA) and the General Machinery Regulations, 1988:",
    appendices: [
      {
        reference: "Appendix 1",
        requirement: "Occupational Health and Safety Act, No. 85 of 1993",
      },
      {
        reference: "Appendix 2",
        requirement:
          "Section 8 — General duties of employers to their employees",
      },
      {
        reference: "Appendix 3",
        requirement:
          "Section 16(1) and 16(2) — Chief Executive Officer / Assignment of duties",
      },
      {
        reference: "Appendix 4",
        requirement: "General Machinery Regulations, 1988 (as amended)",
      },
      {
        reference: "Appendix 5",
        requirement: "GMR 2 — Supervision of Machinery",
      },
      {
        reference: "Appendix 6",
        requirement: "GMR 2(1) — Designation of competent person",
      },
      {
        reference: "Appendix 7",
        requirement: "GMR 2(3) — Competency requirements of the appointee",
      },
      {
        reference: "Appendix 8",
        requirement: "Driven Machinery Regulations, 2015",
      },
      {
        reference: "Appendix 9",
        requirement: "General Safety Regulations, 1986",
      },
    ],
    acknowledgementTemplate:
      "I, {employee}, confirm that I understand the duties, responsibilities and legal implications of this appointment as the General Machinery Regulation 2(1) appointee, and I confirm my acceptance thereof. I further confirm that I am a competent person as contemplated in the General Machinery Regulations, 1988 (as amended), for the class of machinery I am required to supervise.",
  },
};

/* ------------------------------------------------------------------ */
/* Appointment type dropdown                                           */
/* ------------------------------------------------------------------ */

/** Order in which groups appear in the Appointment Type dropdowns */
export const appointmentGroups = [
  "Health & Safety Management",
  "Emergency Response",
  "Machinery & Plant",
] as const;

export type AppointmentGroup = (typeof appointmentGroups)[number];

/** Appointment Type dropdown value -> template + department config */
export const appointmentTypeMap: Record<
  string,
  {
    legalSection: string;
    department: string;
    group: AppointmentGroup;
    templateKey: keyof typeof appointmentTemplates;
    hierarchyLevel: number;
  }
> = {
  "HSE/SHE Representative": {
    legalSection: appointmentTemplates.hseRep.legalSection,
    department: "Health & Safety",
    group: "Health & Safety Management",
    templateKey: "hseRep",
    hierarchyLevel: 3,
  },
  "Incident Investigator": {
    legalSection: appointmentTemplates.investigator.legalSection,
    department: "Health & Safety",
    group: "Health & Safety Management",
    templateKey: "investigator",
    hierarchyLevel: 3,
  },
  Supervisor: {
    legalSection: appointmentTemplates.supervisor.legalSection,
    department: "Health & Safety",
    group: "Health & Safety Management",
    templateKey: "supervisor",
    hierarchyLevel: 3,
  },
  "PPE Inspector": {
    legalSection: appointmentTemplates.ppeInspector.legalSection,
    department: "Health & Safety",
    group: "Health & Safety Management",
    templateKey: "ppeInspector",
    hierarchyLevel: 4,
  },
  "First Aid Officer": {
    legalSection: appointmentTemplates.firstAid.legalSection,
    department: "Health & Safety",
    group: "Emergency Response",
    templateKey: "firstAid",
    hierarchyLevel: 4,
  },
  "Fire Fighter": {
    legalSection: appointmentTemplates.fireFighter.legalSection,
    department: "Health & Safety",
    group: "Emergency Response",
    templateKey: "fireFighter",
    hierarchyLevel: 4,
  },
  "GMR 2(1) Appointee": {
    legalSection: appointmentTemplates.gmr21.legalSection,
    department: "Health & Safety",
    group: "Machinery & Plant",
    templateKey: "gmr21",
    hierarchyLevel: 3,
  },
  "Forklift Operator": {
    legalSection: appointmentTemplates.forkliftOperator.legalSection,
    department: "Health & Safety",
    group: "Machinery & Plant",
    templateKey: "forkliftOperator",
    hierarchyLevel: 4,
  },
  "Excavator Operator": {
    legalSection: appointmentTemplates.excavatorOperator.legalSection,
    department: "Health & Safety",
    group: "Machinery & Plant",
    templateKey: "excavatorOperator",
    hierarchyLevel: 4,
  },
};

/* ------------------------------------------------------------------ */
/* Letter generation                                                   */
/* ------------------------------------------------------------------ */

function fillTokens(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

/** Builds paragraph segments from a template string, rendering {role} in bold. */
function buildSegments(
  template: string,
  vars: Record<string, string>,
): LetterParagraphSegment[] {
  const parts = template.split("{role}");
  const segments: LetterParagraphSegment[] = [];

  parts.forEach((part, i) => {
    const text = fillTokens(part, vars);
    if (text) segments.push({ text });
    if (i < parts.length - 1) segments.push({ text: vars.role, bold: true });
  });

  return segments;
}

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
      appointingParagraph: [
        { text: "No template found for this appointment type." },
      ],
      validityLine: "",
      dutiesIntro: "",
      duties: [],
      reportingLine: "",
    };
  }

  const vars: Record<string, string> = {
    appointer: data.appointerName || "____________",
    company: data.companyName || "the Company",
    employee: data.employeeName,
    site: data.siteName || "",
    role: template.roleLabel,
    startDate: data.startDate || "____________",
  };

  const appointingParagraph: LetterParagraphSegment[] =
    template.appointingTemplate
      ? buildSegments(template.appointingTemplate, vars)
      : [
          {
            text: `I, ${vars.appointer}, the 16(2) appointee of ${vars.company}, hereby appoint you, ${vars.employee}, as `,
          },
          { text: template.roleLabel, bold: true },
          { text: data.siteName ? ` for ${data.siteName}.` : "." },
        ];

  const validityLine = template.validityTemplate
    ? fillTokens(template.validityTemplate, vars)
    : `This Legal Appointment is valid from ${vars.startDate} till end of contract, or while competency is still valid.`;

  const acknowledgementName = data.signed
    ? data.employeeNumber
      ? `${data.employeeName} (Employee No. ${data.employeeNumber})`
      : data.employeeName
    : "________________________";

  const allSummaryRows: SummaryRow[] = [
    {
      label: "Legal Assignment",
      value: (template.legalAssignment ?? [template.legalSection]).join("\n"),
    },
    {
      label: "Appointment Description",
      value: template.appointmentDescription ?? template.roleLabel,
    },
    { label: "Full Name", value: data.employeeName },
    { label: "Designation", value: data.jobTitle || "" },
    { label: "Date", value: data.startDate || "" },
  ];

  return {
    headerTitle: template.headerTitle,
    companyName: data.companyName || "",
    logoUrl: data.logoUrl,
    appointingParagraph,
    validityLine,
    dutiesIntro:
      template.dutiesIntro ??
      "In terms of this appointment, you are required to perform the following functions and responsibilities:",
    duties: template.duties,
    reportingLine: template.reportingNote,

    docNo: template.docNo,
    // Every template gets the summary table (falls back to legalSection /
    // roleLabel when a template doesn't declare legalAssignment).
    summaryRows: allSummaryRows,
    introParagraphs: template.introParagraphs,
    legalReferences: template.legalReferences,
    appendicesIntro: template.appendicesIntro,
    appendices: template.appendices,
    // Every template gets the acknowledgement. The employee's name (and
    // employee number) only appear once the letter has been signed;
    // until then the name is left as a blank line to be completed by hand.
    acknowledgement: fillTokens(
      template.acknowledgementTemplate ??
        "I, {employee}, do hereby accept this appointment and acknowledge that I understand the requirements of this appointment.",
      { ...vars, employee: acknowledgementName },
    ),
  };
}
