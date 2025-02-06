import { CodeJSON } from './model.js';
export declare function calculateMetaData(): Promise<Partial<CodeJSON>>;
export declare function readJSON(filepath: string): Promise<CodeJSON | null>;
export declare function sendPR(updatedCodeJSON: CodeJSON): Promise<void>;
