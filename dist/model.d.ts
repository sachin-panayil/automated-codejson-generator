export interface CodeJSON {
    name: string;
    version?: string;
    description: string;
    longDescription: string;
    status: string;
    permissions: Permissions;
    organization: string;
    repositoryURL: string;
    repositoryHost: string;
    repositoryVisibility: string;
    homepageURL?: string;
    downloadURL?: string;
    disclaimerURL?: string;
    disclaimerText?: string;
    vcs: string;
    laborHours: number;
    reuseFrequency: ReuseFrequency;
    platforms: string[];
    categories: string[];
    softwareType: string;
    languages: string[];
    maintenance: string;
    contractNumber: string[];
    SBOM: string;
    relatedCode?: RelatedCode[];
    reusedCode?: ReusedCode[];
    partners?: Partner[];
    date: Date;
    tags: string[];
    contact: Contact;
    feedbackMechanism: string;
    AIUseCaseID: string;
    localisation: boolean;
    repositoryType: string;
    userInput: boolean;
    fismaLevel: string;
    group: string;
    projects: string[];
    systems: string[];
    subsetInHealthcare: string[];
    userType: string[];
    maturityModelTier: number;
}
export interface ReuseFrequency {
    forks: number;
    clones: number | undefined;
}
export interface Permissions {
    license: License[];
    usageType: string[];
    exemptionText: string;
}
export interface License {
    name: string;
    URL: string;
}
export interface RelatedCode {
    name: string;
    URL: string;
    isGovernmentRepo: boolean;
}
export interface ReusedCode {
    name: string;
    URL: string;
}
export interface Partner {
    name: string;
    email: string;
}
export interface Date {
    created: string;
    lastModified: string;
    metaDataLastUpdated: string;
}
export interface Contact {
    email: string;
    name: string;
}
export interface BasicRepoInfo {
    title: string;
    description: string;
    url: string;
    repositoryVisibility: string;
    languages: string[];
    forks: number;
    tags: string[];
    date: Date;
}
