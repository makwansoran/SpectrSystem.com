/**
 * AI Agent Node
 * Process with AI/LLM
 */

import axios from 'axios';
import type { AIAgentConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';
import { interpolateVariables } from '../utils';

async function callOpenAI(config: AIAgentConfig, userPrompt: string): Promise<string> {
  if (!config.apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const requestBody: Record<string, unknown> = {
    model: config.model,
    messages: [
      { role: 'system', content: config.systemPrompt || 'You are a helpful assistant.' },
      { role: 'user', content: userPrompt }
    ],
    temperature: config.temperature ?? 0.7,
    max_tokens: config.maxTokens || 1000,
  };

  if (config.jsonMode) {
    requestBody.response_format = { type: 'json_object' };
  }

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    requestBody,
    {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000
    }
  );

  return response.data.choices[0].message.content;
}

async function callAnthropic(config: AIAgentConfig, userPrompt: string): Promise<string> {
  if (!config.apiKey) {
    throw new Error('Anthropic API key is required');
  }

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: config.model,
      max_tokens: config.maxTokens || 1000,
      temperature: config.temperature ?? 0.7,
      system: config.systemPrompt || 'You are a helpful assistant.',
      messages: [
        { role: 'user', content: userPrompt }
      ],
    },
    {
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2024-06-20',
        'Content-Type': 'application/json',
      },
      timeout: 60000
    }
  );

  return response.data.content[0].text;
}

async function callOllama(config: AIAgentConfig, userPrompt: string): Promise<string> {
  const baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

  const response = await axios.post(
    `${baseUrl}/api/chat`,
    {
      model: config.model,
      messages: [
        { role: 'system', content: config.systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: userPrompt }
      ],
      stream: false,
      options: {
        temperature: config.temperature ?? 0.7,
        num_predict: config.maxTokens || 1000,
      },
    },
    {
      timeout: 120000
    }
  );

  return response.data.message.content;
}

export const executeAIAgent: NodeExecutor<AIAgentConfig> = async (
  config: AIAgentConfig,
  context: ExecutionContext
) => {
  console.log(`    🤖 AI Agent: ${config.provider}/${config.model}`);

  // Fallback to environment variables if API key is not provided in config
  const apiKey = config.apiKey || 
    (config.provider === 'openai' ? process.env.OPENAI_API_KEY : 
     config.provider === 'anthropic' ? (process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY) :
     process.env.OLLAMA_API_KEY) || '';

  // Create config with API key fallback
  const configWithApiKey: AIAgentConfig = {
    ...config,
    apiKey: apiKey || config.apiKey,
  };

  let userPrompt = config.userPrompt || '';
  userPrompt = interpolateVariables(userPrompt, context);

  if (userPrompt.includes('{{$input.data}}')) {
    const inputData = context.previousNodeOutput;
    userPrompt = userPrompt.replace('{{$input.data}}', JSON.stringify(inputData, null, 2));
  }

  try {
    let response: string;

    switch (config.provider) {
      case 'openai':
        response = await callOpenAI(configWithApiKey, userPrompt);
        break;
      case 'anthropic':
        response = await callAnthropic(configWithApiKey, userPrompt);
        break;
      case 'ollama':
        response = await callOllama(configWithApiKey, userPrompt);
        break;
      default:
        throw new Error(`Unknown AI provider: ${config.provider}`);
    }

    let parsedResponse: unknown = response;
    try {
      parsedResponse = JSON.parse(response);
    } catch {
      // Keep as string if not valid JSON
    }

    return {
      input: context.previousNodeOutput,
      prompt: userPrompt,
      response: parsedResponse,
      model: config.model,
      provider: config.provider
    };
  } catch (error: any) {
    throw new Error(`AI Agent failed: ${error.message}`);
  }
};

