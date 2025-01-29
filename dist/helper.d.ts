import { CodeJSON, Date as CodeDate } from './model.js';
export declare function readJSON(filepath: string): CodeJSON | null;
export declare function calculateMetaData(): Promise<{
    laborHours: number;
    date: CodeDate;
} | null>;
export declare function getLaborHours(): Promise<number>;
