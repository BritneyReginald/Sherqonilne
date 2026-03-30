export const appointmentTemplates = {
  "Incident Investigator": {
    title: "Appointment as Incident Investigator",
    body: (appt) => `
You are hereby appointed as an Incident Investigator in terms of ${appt.legalSection}.

Your responsibilities include:
- Investigating all workplace incidents
- Compiling detailed incident reports
- Recommending corrective actions

You will report to ${appt.reportsTo || "management"}.

This appointment is effective from ${appt.startDate}.
    `,
  },

  "HSE Representative": {
    title: "Appointment as HSE Representative",
    body: (appt) => `
In terms of ${appt.legalSection}, you are appointed as a Health and Safety Representative.

Your duties include:
- Conducting workplace inspections
- Identifying hazards
- Reporting unsafe conditions

You will operate within the ${appt.delegatedAuthorityScope} department.
    `,
  },
};