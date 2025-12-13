/**
 * HTTP Request Node
 * Make API calls
 */

import axios from 'axios';
import type { HttpRequestConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';
import { interpolateVariables } from '../utils';

export const executeHttpRequest: NodeExecutor<HttpRequestConfig> = async (
  config: HttpRequestConfig,
  context: ExecutionContext
) => {
  if (!config.url) {
    throw new Error('HTTP Request node requires a URL');
  }

  const { method, url, headers, body, auth } = config;

  // Build request config
  const requestConfig: any = {
    method,
    url: interpolateVariables(url, context),
    headers: { ...headers },
    timeout: 30000, // 30 second default timeout
  };

  // Add body for POST/PUT/PATCH
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      requestConfig.data = JSON.parse(interpolateVariables(body, context));
    } catch {
      requestConfig.data = interpolateVariables(body, context);
    }
  }

  // Add authentication
  if (auth) {
    if (auth.type === 'basic' && auth.username && auth.password) {
      requestConfig.auth = {
        username: auth.username,
        password: auth.password
      };
    } else if (auth.type === 'bearer' && auth.token) {
      requestConfig.headers['Authorization'] = `Bearer ${auth.token}`;
    }
  }

  try {
    const response = await axios(requestConfig);
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    };
  } catch (error: any) {
    if (error.response) {
      return {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
        error: true
      };
    }
    throw error;
  }
};

