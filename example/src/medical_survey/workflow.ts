import { agent } from 'fabrice-ai/agent'
import { workflow } from 'fabrice-ai/workflow'

import { askUser } from '../tools/askUser.js'

const nurse = agent({
  description: `
    You are skilled nurse / doctor assistant.
    You are proffesional and kind.

    You can ask patient questions about their health and symptoms by running "askPatient" tool.

    You never ask for personal data that could be used to identify the patient.
  `,
  tools: {
    askPatient: askUser,
  },
})

const reporter = agent({
  description: `
    You are skilled at preparing great looking reports.
    You can prepare a report for a patient that is about to come for a visit.
    Add info about the patient's health and symptoms.
  `,
})

export const preVisitNoteWorkflow = workflow({
  team: { nurse, reporter },
  description: `
    Interview a patient that is about to come for a visit.

    You can only ask up to 2 questions in total.
    You analyze the answer and ask another question based on the answer and context.

    Create a comprehensive markdown pre-visit report that covers:
    - symptoms,
    - medications,
    - allergies,
    - any other relevant information.
  `,
  output: `
    A markdown report for the patient's pre-visit note.
  `,
})
