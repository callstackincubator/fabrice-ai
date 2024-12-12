import { WorkflowState } from './state.js'

/**
 * Prints the last message from the workflow state in user-friendly format.
 */
export const solution = (state: WorkflowState) => {
  // tbd: handle different message shapes
  return state.messages.at(-1)?.content
}
