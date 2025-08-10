import Papa from 'papaparse';

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

export const parseFile = async (file: File): Promise<ParsedData> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv':
      return parseCSV(file);
    case 'json':
      return parseJSON(file);
    case 'xlsx':
    case 'xls':
      // For now, we'll show an error for Excel files
      // In a real implementation, you'd use a library like xlsx
      return {
        data: [],
        headers: [],
        errors: ['Excel files are not yet supported. Please convert to CSV format.'],
      };
    default:
      return {
        data: [],
        headers: [],
        errors: ['Unsupported file format'],
      };
  }
};