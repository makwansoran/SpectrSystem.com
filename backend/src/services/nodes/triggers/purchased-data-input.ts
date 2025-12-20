/**
 * Purchased Data Input Node Executor
 * Handles execution of Spectr Live Data node
 */

import axios from 'axios';
import { importFromFolder } from '../../folderImport';

export interface PurchasedDataInputConfig {
  datasetId?: string;
  category?: string;
}

export async function executePurchasedDataInput(
  config: PurchasedDataInputConfig,
  context: any
): Promise<unknown> {
  if (!config.datasetId) {
    throw new Error('Dataset ID is required');
  }

  // Get dataset from database
  const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
  
  let dataset: any;
  
  if (dbType === 'postgresql') {
    const { pool } = await import('../../../database/postgresql');
    const result = await pool.query('SELECT * FROM datasets WHERE id = $1', [config.datasetId]);
    dataset = result.rows[0];
  } else {
    const { db } = await import('../../../database/sqlite');
    dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(config.datasetId) as any;
  }

  if (!dataset) {
    throw new Error(`Dataset not found: ${config.datasetId}`);
  }

  if (dataset.is_active !== 1 && dataset.is_active !== true) {
    throw new Error(`Dataset is not active: ${config.datasetId}`);
  }

  // Parse config
  const datasetConfig = typeof dataset.config === 'string' 
    ? JSON.parse(dataset.config) 
    : (dataset.config || {});

  const dataSourceType = datasetConfig.dataSourceType || 'api';

  // Handle different data source types
  if (dataSourceType === 'folder') {
    // Folder import
    const folderPath = datasetConfig.folderPath;
    const filePattern = datasetConfig.filePattern;

    if (!folderPath) {
      throw new Error('Folder path is required for folder import');
    }

    try {
      const importResult = await importFromFolder(folderPath, filePattern);
      
      // Return structured data
      return {
        dataset: {
          id: dataset.id,
          name: dataset.name,
          type: dataset.type,
        },
        source: 'folder',
        files: importResult.files.map(file => ({
          filename: file.filename,
          type: file.type,
          content: file.content,
        })),
        totalFiles: importResult.totalFiles,
        totalSize: importResult.totalSize,
        data: importResult.files.map(file => file.content), // Flattened array of all file contents
      };
    } catch (error: any) {
      throw new Error(`Failed to import from folder: ${error.message}`);
    }
  } else if (datasetConfig.systemType === 'company-intelligence') {
    // Company Intelligence API
    const apiEndpoint = datasetConfig.apiEndpoint || '/api/companies';
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    
    try {
      const response = await axios.get(`${baseUrl}${apiEndpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        dataset: {
          id: dataset.id,
          name: dataset.name,
          type: dataset.type,
        },
        source: 'company-intelligence',
        data: response.data.success ? response.data.data : response.data,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch company intelligence data: ${error.message}`);
    }
  } else {
    // API data source
    const apiEndpoint = datasetConfig.apiEndpoint;
    const apiMethod = datasetConfig.apiMethod || 'GET';
    const apiHeaders = datasetConfig.apiHeaders 
      ? (typeof datasetConfig.apiHeaders === 'string' 
          ? JSON.parse(datasetConfig.apiHeaders) 
          : datasetConfig.apiHeaders)
      : {};

    if (!apiEndpoint) {
      throw new Error('API endpoint is required for API data source');
    }

    try {
      const response = await axios({
        method: apiMethod,
        url: apiEndpoint,
        headers: {
          'Content-Type': 'application/json',
          ...apiHeaders,
        },
      });

      return {
        dataset: {
          id: dataset.id,
          name: dataset.name,
          type: dataset.type,
        },
        source: 'api',
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch data from API: ${error.message}`);
    }
  }
}

