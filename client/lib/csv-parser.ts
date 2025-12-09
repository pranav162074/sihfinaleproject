/**
 * CSV Parser utility for parsing CSV files
 */

export interface ParsedCSVData {
  headers: string[];
  rows: Record<string, string | number>[];
  rowCount: number;
}

/**
 * Parse CSV file content
 */
export function parseCSV(csvContent: string): ParsedCSVData {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return { headers: [], rows: [], rowCount: 0 };
  }

  // Parse headers
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const rows: Record<string, string | number>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    
    const row: Record<string, string | number> = {};
    headers.forEach((header, index) => {
      let value: string | number = values[index] || '';
      
      // Try to convert to number if it looks like a number
      if (value && !isNaN(Number(value)) && value.trim() !== '') {
        value = Number(value);
      }
      
      row[header] = value;
    });
    
    rows.push(row);
  }

  return { headers, rows, rowCount: rows.length };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Push the last field
  result.push(current.trim());

  return result;
}

/**
 * Validate CSV data against expected schema
 */
export interface ValidationResult {
  isValid: boolean;
  missingColumns: string[];
  errorRows: Array<{ rowIndex: number; errors: string[] }>;
  summary: string;
}

export function validateCSVData(
  parsedData: ParsedCSVData,
  requiredColumns: string[]
): ValidationResult {
  const missingColumns = requiredColumns.filter(
    col => !parsedData.headers.includes(col)
  );

  const errorRows: Array<{ rowIndex: number; errors: string[] }> = [];

  // Check each row for required columns
  parsedData.rows.forEach((row, index) => {
    const rowErrors: string[] = [];
    
    requiredColumns.forEach(col => {
      const value = row[col];
      if (value === null || value === undefined || value === '') {
        rowErrors.push(`Missing value for column: ${col}`);
      }
    });

    if (rowErrors.length > 0) {
      errorRows.push({ rowIndex: index + 2, errors: rowErrors }); // +2 because row 1 is header, and 0-indexed
    }
  });

  const isValid = missingColumns.length === 0 && errorRows.length === 0;

  let summary = '';
  if (isValid) {
    summary = `Valid file: ${parsedData.rowCount} rows`;
  } else {
    const issues: string[] = [];
    if (missingColumns.length > 0) {
      issues.push(`Missing columns: ${missingColumns.join(', ')}`);
    }
    if (errorRows.length > 0) {
      issues.push(`${errorRows.length} rows with missing data`);
    }
    summary = issues.join('; ');
  }

  return {
    isValid,
    missingColumns,
    errorRows,
    summary,
  };
}

/**
 * Convert parsed CSV data to the expected data format
 */
export function convertParsedDataToFormat(
  parsedData: ParsedCSVData,
  fileType: string
): unknown[] {
  // For now, just return the rows as-is
  // The backend validation will check for required fields
  return parsedData.rows;
}
