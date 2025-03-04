export interface CodeJSON {
  name: string; // calculated
  description: string; // calculated
  longDescription: string;
  status: string;
  permissions: Permissions;
  organization: string;
  repositoryURL: string; // calculated
  vcs: string;
  laborHours: number; // calculated
  platforms: string[];
  categories: string[];
  softwareType: string;
  languages: string[]; // calculated
  maintenance: string;
  date: Date; // calculated
  tags: string[];
  contact: Contact;
  localisation: boolean;
  repositoryType: string;
  userInput: boolean;
  fismaLevel: string;
  group: string;
  subsetInHealthcare: string[];
  userType: string[];
  repositoryHost: string;
  maturityModelTier: number;
}

export interface Permissions {
  license: License[];
  usageType: string;
  exemptionText: string;
}

export interface License {
  name: string;
  URL: string;
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
  date: Date;
}
