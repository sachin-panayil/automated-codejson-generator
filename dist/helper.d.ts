import { CodeJSON, Date as CodeDate } from './model.js';
export declare function calculateMetaData(): Promise<{
    laborHours: number;
    date: CodeDate;
} | null>;
export declare function readJSON(filepath: string): Promise<CodeJSON | null>;
export declare function sendPR(updatedCodeJSON: CodeJSON): Promise<void>;
