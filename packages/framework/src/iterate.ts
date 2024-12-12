import { childState, WorkflowState } from './state.js'
import { runTools } from './tool_calls.js'
import { Message } from './types.js'
import { Workflow } from './workflow.js'

// tbd: finalize workflow
export async function run(
  state: WorkflowState,
  context: Message[] = [],
  workflow: Workflow
): Promise<WorkflowState> {
  if (state.messages.length > workflow.maxIterations) {
    return childState({
      ...state,
      agent: 'finalBoss',
    })
  }

  if (state.children.length > 0) {
    const children = await Promise.all(
      state.children.map((child) => run(child, context.concat(state.messages), workflow))
    )
    if (children.every((child) => child.status === 'finished')) {
      return {
        ...state,
        messages: state.messages.concat(children.flatMap((child) => child.messages)),
        children: [],
      }
    }
    return {
      ...state,
      children,
    }
  }

  const agent = workflow.team[state.agent]

  if (state.status === 'paused') {
    const toolsResponse = await runTools(state, context, workflow)
    return {
      ...state,
      status: 'running',
      messages: state.messages.concat(toolsResponse),
    }
  }

  if (state.status === 'running' || state.status === 'idle') {
    return agent.run(state, context, workflow)
  }

  if (state.status === 'failed') {
    return {
      ...state,
      status: 'finished',
    }
  }

  return state
}

/**
 * Iterates over the workflow and takes a snapshot of the state after each iteration.
 */
export async function iterate(workflow: Workflow, state: WorkflowState) {
  const nextState = await run(state, [], workflow)
  workflow.snapshot({ prevState: state, nextState })
  return nextState
}
