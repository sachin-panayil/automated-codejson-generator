import { CodeJSON, Date as CodeDate } from './model.js';
export declare function calculateMetaData(): Promise<{
    date: CodeDate;
} | null>;
export declare function getDateFields(): Promise<CodeDate>;
export declare function getLaborHours(): Promise<number>;
export declare function readJSON(filepath: string): Promise<CodeJSON | null>;
export declare function writeJSON(filename: string, data: CodeJSON): Promise<void>;
export declare function sendPR(): void;
