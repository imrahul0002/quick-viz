import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedData {
  data: any[];
  headers: string[];
  errors: string[];
}

export const parseCSV = (file: File): Promise<ParsedData> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        resolve({
          data: results.data,
          headers: results.meta.fields || [],
          errors: results.errors.map(error => error.message),
        });
      },
      error: (error) => {
        resolve({
          data: [],
          headers: [],
          errors: [error.message],
        });
      },
    });
  });
};

export const parseJSON = (file: File): Promise<ParsedData> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const jsonData = JSON.parse(text);
        
        // Handle different JSON structures
        let data: any[];
        if (Array.isArray(jsonData)) {
          data = jsonData;
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
          data = jsonData.data;
        } else if (typeof jsonData === 'object') {
          // Convert single object to array
          data = [jsonData];
        } else {
          throw new Error('Invalid JSON structure');
        }
        
        const headers = data.length > 0 ? Object.keys(data[0]) : [];
        
        resolve({
          data,
          headers,
          errors: [],
        });
      } catch (error) {
        resolve({
          data: [],
          headers: [],
          errors: [error instanceof Error ? error.message : 'Failed to parse JSON'],
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        data: [],
        headers: [],
        errors: ['Failed to read file'],
      });
    };
    
    reader.readAsText(file);
  });
};

export const parseExcel = (file: File): Promise<ParsedData> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          resolve({
            data: [],
            headers: [],
            errors: ['Empty Excel file'],
          });
          return;
        }
        
        // Extract headers from first row
        const headers = (jsonData[0] as any[]).map(header => 
          header ? String(header).trim() : ''
        );
        
        // Convert data rows to objects
        const parsedData = jsonData.slice(1)
          .filter(row => Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== ''))
          .map((row: any[]) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] !== undefined ? row[index] : '';
            });
            return obj;
          });
        
        resolve({
          data: parsedData,
          headers: headers.filter(h => h !== ''),
          errors: [],
        });
      } catch (error) {
        resolve({
          data: [],
          headers: [],
          errors: [error instanceof Error ? error.message : 'Failed to parse Excel file'],
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        data: [],
        headers: [],
        errors: ['Failed to read Excel file'],
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const parseFile = async (file: File): Promise<ParsedData> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv':
      return parseCSV(file);
    case 'json':
      return parseJSON(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    default:
      return {
        data: [],
        headers: [],
        errors: ['Unsupported file format. Please use CSV, JSON, or Excel files.'],
      };
  }
};