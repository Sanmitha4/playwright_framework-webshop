import * as fs from 'fs/promises';

export class DataProviderError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'DataProviderError';
    }
}

export class CSVParser {
    /**
     * Parses a CSV file into an array of data rows.
     * Supports multiple header blocks in the same file.
     * @param filePath Path to CSV file
     * @param separator Separator (default: '|')
     */
    static async parseData(
        filePath: string,
        separator: string = '|'
    ): Promise<Record<string, string>[]> {
        if (!filePath || filePath.trim().length === 0) {
            throw new DataProviderError('filePath must be a non-empty string.');
        }

        let fileContent: string;
        try {
            fileContent = await fs.readFile(filePath, 'utf8');
            fileContent = fileContent.replace(/^\uFEFF/, ''); // remove BOM
        } catch (err) {
            throw new DataProviderError(`Error reading CSV file ${filePath}`, err);
        }

        const data: Record<string, string>[] = [];
        const lines = fileContent
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l.length > 0);

        let headers: string[] = [];

        for (const line of lines) {
            // Skip comments
            if (line.startsWith('#') || line.startsWith('!')) continue;

            const cols = line.split(separator).map(c => c.trim());

            // Detect a new header row (starts with Key and Env)
            if (cols.some(c => c.toLowerCase() === 'key') && cols.some(c => c.toLowerCase() === 'env')) {
                headers = cols;
                continue;
            }

            if (!headers.length) continue;

            // Map row values
            const row: Record<string, string> = {};
            headers.forEach((h, i) => row[h] = cols[i] ?? '');
            data.push(row);
        }

        return data;
    }
}
