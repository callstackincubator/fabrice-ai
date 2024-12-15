import { ParsedFunctionToolCall } from 'openai/resources/beta/chat/completions'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

import { Tool } from './tool.js'
import { Message } from './types.js'

type LLMResponseFormat = Record<string, z.ZodObject<any>>

type LLMCall<T extends LLMResponseFormat> = {
  messages: Message[]
  response_format: T
  temperature?: number
}

type LLMCallWithTools<T extends LLMResponseFormat> = LLMCall<T> & {
  tools: Record<string, Tool>
}

type LLMResponse<T extends LLMResponseFormat> = {
  [K in keyof T]: {
    kind: K
    value: z.infer<T[K]>
  }
}[keyof T]

type FunctionToolCall = {
  kind: 'tool_call'
  value: ParsedFunctionToolCall[]
}

export interface Provider {
  chat<T extends LLMResponseFormat>(
    args: LLMCallWithTools<T>
  ): Promise<FunctionToolCall | LLMResponse<T>>
  chat<T extends LLMResponseFormat>(args: LLMCall<T>): Promise<LLMResponse<T>>
  embeddings(input: string): Promise<number[]>
}

export const toLLMTools = (tools: Record<string, Tool>, strict: boolean = true) => {
  return Object.entries(tools).map(([name, tool]) => ({
    type: 'function' as const,
    function: {
      name,
      parameters: zodToJsonSchema(tool.parameters),
      description: tool.description,
      strict,
    },
  }))
}
