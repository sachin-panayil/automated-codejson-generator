import * as core from '@actions/core';
import * as path from 'path';
import * as fs from 'fs';

import { CodeJSON } from './model.js'
import * as helpers from './helper.js'

const baselineCodeJSON: CodeJSON = {
  name: '',
  description: '',
  longDescription: '',
  status: '',
  permissions: {
    license: [{
      name: '',
      URL: ''
    }],
    usageType: '',
    exemptionText: ''
  },
  organization: '',
  repositoryURL: '',
  vcs: 'git',
  laborHours: 0,
  platforms: [],
  categories: [],
  softwareType: '',
  languages: [],
  maintenance: '',
  date: {
    created: '',         
    lastModified: '',      
    metaDataLastUpdated: '' 
  },
  tags: [],
  contact: {
    email: '',
    name: ''
  },
  localisation: false,
  repositoryType: '',
  userInput: false,
  fismaLevel: '',
  group: '',
  subsetInHealthcare: [],
  userType: [],
  repositoryHost: 'github',
  maturityModelTier: 0
};

async function getCalclatedMetaData(): Promise<Partial<CodeJSON>> {
  const partialCodeJSON = await helpers.calculateMetaData()

  return {
    laborHours: partialCodeJSON?.laborHours,
    date: {
      created: partialCodeJSON?.date.created ?? "", // need better default values here
      lastModified: partialCodeJSON?.date.lastModified ?? "",
      metaDataLastUpdated: partialCodeJSON?.date.metaDataLastUpdated ?? ""
    }
  }
}

export async function run(): Promise<void> {
  try {
    const workspaceDir = process.env.GITHUB_WORKSPACE;
    if (!workspaceDir) {
      throw new Error('GITHUB_WORKSPACE not set');
    }

    const repoCodePath = path.join(workspaceDir, 'code.json');
    const existing = helpers.readJSON(repoCodePath);
    const autoFields = await getCalclatedMetaData();
    
    let finalJson: CodeJSON;
    
    if (!existing) {
      finalJson = {
        ...baselineCodeJSON,
        ...autoFields
      };
      core.info('No existing code.json found. Creating new file with baseline schema.');
    } else {
      finalJson = {
        ...baselineCodeJSON,
        ...existing,
        ...autoFields
      };
      core.info('Updated existing code.json with auto-calculated fields.');
    }
    
    fs.writeFileSync(repoCodePath, JSON.stringify(finalJson, null, 2));
    core.info(`Successfully updated code.json at ${repoCodePath}`);
    
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}


