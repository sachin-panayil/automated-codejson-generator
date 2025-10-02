import { CodeJSON } from "./model.js";
export declare function calculateMetaData(): Promise<Partial<CodeJSON>>;
export declare function getBaseBranch(): Promise<string>;
export declare function readJSON(filepath: string): Promise<CodeJSON | null>;
export declare function sendPR(updatedCodeJSON: CodeJSON, baseBranchName: string): Promise<void>;
export declare function pushDirectlyWithFallback(updatedCodeJSON: CodeJSON, baseBranchName: string): Promise<void>;
