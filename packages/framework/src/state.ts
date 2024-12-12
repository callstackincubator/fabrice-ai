import s from 'dedent'

import { Message } from './types.js'
import { Workflow } from './workflow.js'

type WorkflowStateOptions = {
  agent: string

  status?: 'idle' | 'running' | 'paused' | 'finished' | 'failed'
  messages?: Message[]
  children?: WorkflowState[]
}

export const childState = (options: WorkflowStateOptions): WorkflowState => {
  const { status = 'idle', messages = [], agent, children = [] } = options
  return {
    status,
    messages,
    agent,
    children,
  }
}

export const rootState = (workflow: Workflow): WorkflowState =>
  childState({
    agent: 'supervisor',
    messages: [
      {
        role: 'user',
        content: s`
          Here is description of my workflow and expected output:
          <workflow>${workflow.description}</workflow>
          <output>${workflow.output}</output>
        `,
      },
    ],
  })

export type WorkflowState = Required<WorkflowStateOptions>
