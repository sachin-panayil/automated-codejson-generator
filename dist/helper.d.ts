import { CodeJSON, Date as CodeDate } from './model.js';
export declare function calculateMetaData(): Promise<{
    laborHours: number;
    date: CodeDate;
} | null>;
export declare function getDateFields(): Promise<CodeDate>;
export declare function readJSON(filepath: string): CodeJSON | null;
