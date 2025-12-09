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
  const lines = csvContent.split("\n").filter((line) => line.trim());

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
      let value: string | number = values[index] || "";

      // Try to convert to number if it looks like a number
      if (value && !isNaN(Number(value)) && value.trim() !== "") {
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
  let current = "";
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
    } else if (char === "," && !insideQuotes) {
      // Field separator
      result.push(current.trim());
      current = "";
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
  validRows: number;
  invalidRows: number;
  errorRows: Array<{ rowIndex: number; errors: string[] }>;
  summary: string;
}

export function validateCSVData(
  parsedData: ParsedCSVData,
  requiredColumns: string[],
): ValidationResult {
  const missingColumns = requiredColumns.filter(
    (col) => !parsedData.headers.includes(col),
  );

  const errorRows: Array<{ rowIndex: number; errors: string[] }> = [];
  let validRowCount = 0;

  // Check each row for required columns
  parsedData.rows.forEach((row, index) => {
    const rowErrors: string[] = [];

    requiredColumns.forEach((col) => {
      const value = row[col];
      if (value === null || value === undefined || value === "") {
        rowErrors.push(`Missing value for column: ${col}`);
      }
    });

    if (rowErrors.length > 0) {
      errorRows.push({ rowIndex: index + 2, errors: rowErrors }); // +2 because row 1 is header, and 0-indexed
    } else {
      validRowCount++;
    }
  });

  const isValid = missingColumns.length === 0 && errorRows.length === 0;

  let summary = "";
  if (isValid) {
    summary = `Valid file: ${parsedData.rowCount} rows`;
  } else {
    const issues: string[] = [];
    if (missingColumns.length > 0) {
      issues.push(`Missing columns: ${missingColumns.join(", ")}`);
    }
    if (errorRows.length > 0) {
      issues.push(`${errorRows.length} rows with missing data`);
    }
    summary = issues.join("; ");
  }

  return {
    isValid,
    missingColumns,
    validRows: validRowCount,
    invalidRows: errorRows.length,
    errorRows,
    summary,
  };
}

/**
 * Convert parsed CSV data to the expected data format
 * Converts string values to appropriate types based on the schema
 */
export function convertParsedDataToFormat(
  parsedData: ParsedCSVData,
  fileType: string,
): unknown[] {
  const numericFields: Record<string, string[]> = {
    stockyards: ["available_tonnage", "safety_stock"],
    orders: ["quantity_tonnes", "priority", "penalty_rate_per_day"],
    rakes: ["num_wagons", "per_wagon_capacity_tonnes", "total_capacity_tonnes"],
    product_wagon_matrix: ["max_load_per_wagon_tonnes"],
    loading_points: [
      "max_rakes_per_day",
      "loading_rate_tonnes_per_hour",
      "operating_hours_start",
      "operating_hours_end",
      "siding_capacity_rakes",
    ],
    routes_costs: [
      "distance_km",
      "transit_time_hours",
      "cost_per_tonne",
      "idle_freight_cost_per_hour",
    ],
  };

  const booleanFields: Record<string, string[]> = {
    product_wagon_matrix: ["allowed"],
    orders: ["partial_allowed"],
  };

  const fieldsToConvert = numericFields[fileType] || [];
  const boolToConvert = booleanFields[fileType] || [];

  return parsedData.rows.map((row) => {
    const converted: Record<string, any> = { ...row };

    // Convert numeric fields
    fieldsToConvert.forEach((field) => {
      if (
        field in converted &&
        converted[field] !== "" &&
        converted[field] !== null
      ) {
        const num = Number(converted[field]);
        converted[field] = !isNaN(num) ? num : converted[field];
      }
    });

    // Convert boolean fields
    boolToConvert.forEach((field) => {
      if (field in converted) {
        const val = String(converted[field]).toLowerCase();
        converted[field] = val === "true" || val === "yes" || val === "1";
      }
    });

    return converted;
  });
}
