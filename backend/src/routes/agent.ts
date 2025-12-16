/**
 * AI Agent Chat Routes
 * Handles chat interactions with the AI agent
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { executeAIAgent } from '../services/nodes/ai/ai-agent';
import type { AIAgentConfig } from '../types';
import type { ExecutionContext } from '../services/executor';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token
 */
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).userId = decoded.userId;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
};

/**
 * Chat with AI Agent
 * POST /api/agent/chat
 */
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Get AI configuration from environment variables or use defaults
    // Default to Claude (Anthropic) with the low-cost Haiku model
    const provider = (process.env.AI_PROVIDER || 'anthropic') as 'openai' | 'anthropic' | 'ollama';
    const model = process.env.AI_MODEL || (provider === 'openai' ? 'gpt-4o-mini' : provider === 'anthropic' ? 'claude-3-5-haiku-20241022' : 'llama3');
    const apiKey = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY || '';
    const temperature = parseFloat(process.env.AI_TEMPERATURE || '0.7');
    const maxTokens = parseInt(process.env.AI_MAX_TOKENS || '2000');

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'AI API key not configured. Please set AI_API_KEY or ANTHROPIC_API_KEY environment variable.',
      });
    }

    // Build system prompt
    const systemPrompt = `You are an AI agent assistant for SPECTR SYSTEM, an automation and intelligence platform. 
You help users with:
- Creating and managing workflows
- Executing automation tasks
- Intelligence gathering (OSINT, GEOINT)
- Data processing and analysis
- General questions about the platform

Be helpful, concise, and professional. When users ask you to do something, explain what you can help with and guide them on how to accomplish their goals.

Respond naturally in a conversational manner.`;

    // Build conversation context from history (last 8 messages to keep context manageable)
    const recentHistory = conversationHistory.slice(-8);
    let conversationContext = '';
    
    if (recentHistory.length > 0) {
      conversationContext = '\n\nHere is our conversation history for context:\n';
      for (const msg of recentHistory) {
        if (msg.from === 'user') {
          conversationContext += `User: ${msg.text}\n`;
        } else if (msg.from === 'agent') {
          conversationContext += `You: ${msg.text}\n`;
        }
      }
      conversationContext += '\nNow respond to the user\'s current message above.';
    }

    // Build the full user prompt with conversation context
    const fullUserPrompt = conversationContext 
      ? `${message.trim()}${conversationContext}`
      : message.trim();

    // Create AI agent config
    const aiConfig: AIAgentConfig = {
      provider,
      model,
      apiKey,
      systemPrompt,
      userPrompt: fullUserPrompt,
      temperature,
      maxTokens,
      jsonMode: false,
    };

    // Create execution context (minimal for chat)
    const context: ExecutionContext = {
      executionId: 'chat-' + Date.now(),
      variables: {},
      previousNodeOutput: {},
      allNodeOutputs: {},
      executedNodes: new Set(),
    };

    // Execute AI agent
    const result = await executeAIAgent(aiConfig, context);

    // Extract response text
    let responseText = '';
    if (typeof result.response === 'string') {
      responseText = result.response;
    } else if (result.response && typeof result.response === 'object') {
      // If response is an object, try to extract meaningful text
      if ('response' in result.response && typeof result.response.response === 'string') {
        responseText = result.response.response;
      } else {
        responseText = JSON.stringify(result.response, null, 2);
      }
    } else {
      responseText = 'I received your message, but I\'m having trouble processing the response.';
    }

    res.json({
      success: true,
      data: {
        message: responseText,
        model: result.model,
        provider: result.provider,
      },
    });
  } catch (error: any) {
    console.error('Agent chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process chat message',
    });
  }
});

export default router;

