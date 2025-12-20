/**
 * File Storage Service
 * Handles storage of raw source documents
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Use project root relative path (works from both backend/ and project root)
const projectRoot = process.cwd().includes('backend') 
  ? path.join(process.cwd(), '..')
  : process.cwd();
const DATA_DIR = path.join(projectRoot, 'backend/src/services/company-intelligence/data');
const RAW_DIR = path.join(DATA_DIR, 'raw');

// Ensure directories exist
if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

/**
 * Save raw file to disk
 */
export async function saveRawFile(
  sourceName: string,
  originalPath: string,
  fileContent?: string | Buffer
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedSourceName = sourceName.replace(/[^a-zA-Z0-9-_]/g, '_');
  const sourceDir = path.join(RAW_DIR, sanitizedSourceName);
  
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
  }

  const fileName = path.basename(originalPath) || `${timestamp}_document`;
  const filePath = path.join(sourceDir, `${timestamp}_${fileName}`);

  if (fileContent) {
    // Save provided content
    if (Buffer.isBuffer(fileContent)) {
      fs.writeFileSync(filePath, fileContent);
    } else {
      fs.writeFileSync(filePath, fileContent, 'utf8');
    }
  } else if (fs.existsSync(originalPath)) {
    // Copy existing file
    fs.copyFileSync(originalPath, filePath);
  } else {
    throw new Error(`File not found: ${originalPath}`);
  }

  return filePath;
}

/**
 * Get raw file path
 */
export function getRawFilePath(relativePath: string): string {
  return path.join(RAW_DIR, relativePath);
}

/**
 * Read raw file
 */
export function readRawFile(filePath: string): Buffer {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(RAW_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath);
}

