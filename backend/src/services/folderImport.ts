/**
 * Folder Import Service
 * Handles reading and parsing files from a folder for dataset import
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

export interface FolderImportResult {
  files: Array<{
    filename: string;
    path: string;
    size: number;
    content: any; // Parsed content (JSON, CSV rows, etc.)
    type: 'json' | 'csv' | 'text' | 'unknown';
  }>;
  totalFiles: number;
  totalSize: number;
}

/**
 * Check if a file matches a pattern
 */
function matchesPattern(filename: string, pattern: string): boolean {
  if (!pattern) return true;
  
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(filename);
}

/**
 * Parse file content based on extension
 */
async function parseFileContent(filePath: string, content: Buffer): Promise<{ data: any; type: 'json' | 'csv' | 'text' | 'unknown' }> {
  const ext = path.extname(filePath).toLowerCase();
  const textContent = content.toString('utf-8');
  
  if (ext === '.json') {
    try {
      return { data: JSON.parse(textContent), type: 'json' };
    } catch (e) {
      return { data: textContent, type: 'text' };
    }
  }
  
  if (ext === '.csv') {
    const lines = textContent.split('\n').filter(line => line.trim());
    const headers = lines[0]?.split(',').map(h => h.trim()) || [];
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      return obj;
    });
    return { data: rows, type: 'csv' };
  }
  
  // For other file types, return as text
  return { data: textContent, type: 'text' };
}

/**
 * Recursively read files from a directory
 */
async function readDirectory(dirPath: string, filePattern?: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        // Recursively read subdirectories
        const subFiles = await readDirectory(fullPath, filePattern);
        files.push(...subFiles);
      } else if (stats.isFile()) {
        if (matchesPattern(entry, filePattern || '*')) {
          files.push(fullPath);
        }
      }
    }
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Failed to read directory ${dirPath}: ${error.message}`);
    }
  }
  
  return files;
}

/**
 * Import files from a folder
 */
export async function importFromFolder(
  folderPath: string,
  filePattern?: string
): Promise<FolderImportResult> {
  // Validate folder path
  if (!folderPath || !folderPath.trim()) {
    throw new Error('Folder path is required');
  }
  
  // Resolve path (handle both absolute and relative paths)
  const resolvedPath = path.isAbsolute(folderPath) 
    ? folderPath 
    : path.resolve(process.cwd(), folderPath);
  
  // Check if folder exists
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Folder not found: ${resolvedPath}`);
  }
  
  const stats = await stat(resolvedPath);
  if (!stats.isDirectory()) {
    throw new Error(`Path is not a directory: ${resolvedPath}`);
  }
  
  // Read all matching files
  const filePaths = await readDirectory(resolvedPath, filePattern);
  
  if (filePaths.length === 0) {
    throw new Error(`No files found matching pattern "${filePattern || '*'}" in ${resolvedPath}`);
  }
  
  // Read and parse each file
  const files = await Promise.all(
    filePaths.map(async (filePath) => {
      const content = await readFile(filePath);
      const parsed = await parseFileContent(filePath, content);
      const fileStats = await stat(filePath);
      
      return {
        filename: path.basename(filePath),
        path: filePath,
        size: fileStats.size,
        content: parsed.data,
        type: parsed.type,
      };
    })
  );
  
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  
  return {
    files,
    totalFiles: files.length,
    totalSize,
  };
}

/**
 * Get folder import preview (without reading full content)
 */
export async function previewFolderImport(
  folderPath: string,
  filePattern?: string,
  maxFiles: number = 10
): Promise<{
  files: Array<{ filename: string; path: string; size: number }>;
  totalFiles: number;
  totalSize: number;
}> {
  const resolvedPath = path.isAbsolute(folderPath) 
    ? folderPath 
    : path.resolve(process.cwd(), folderPath);
  
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Folder not found: ${resolvedPath}`);
  }
  
  const filePaths = await readDirectory(resolvedPath, filePattern);
  
  const previewFiles = await Promise.all(
    filePaths.slice(0, maxFiles).map(async (filePath) => {
      const stats = await stat(filePath);
      return {
        filename: path.basename(filePath),
        path: filePath,
        size: stats.size,
      };
    })
  );
  
  const totalSize = previewFiles.reduce((sum, file) => sum + file.size, 0);
  
  return {
    files: previewFiles,
    totalFiles: filePaths.length,
    totalSize,
  };
}

