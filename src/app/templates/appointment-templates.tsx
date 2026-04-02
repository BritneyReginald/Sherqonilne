export const appointmentTemplates = {
  investigator: {
    title: "Appointment as Incident Investigator",
    body: (appt) => ({
  intro: `You are hereby appointed as an Incident Investigator in terms of ${appt.legalSection}.`,

  responsibilities: [
    "Investigating all workplace incidents",
    "Compiling detailed incident reports",
    "Recommending corrective actions",
  ],

  reporting: `You will report to ${appt.reportsTo || "management"}.`,

  effectiveDate: `This appointment is effective from ${appt.startDate}.`,
}),
  },

  hseRep: {
  title: "Appointment as Health and Safety Representative",
  body: (appt) => `
In terms of ${appt.legalSection}, you are appointed as a Health and Safety Representative.

Your duties include:
- Attending Health and Safety Committee meetings
- Undergoing required Health & Safety training
- Ensuring risk assessments are available on site
- Reporting unsafe conditions and incidents

You will operate within the ${appt.delegatedAuthorityScope} department.

Any issues must be reported to ${appt.reportsTo || "your supervisor"}.

This appointment is effective from ${appt.startDate}.
  `,
},
};