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

async function getMetaData(): Promise<Partial<CodeJSON>> {
  const partialCodeJSON = await helpers.calculateMetaData()

  return {
    // laborHours: partialCodeJSON?.laborHours,
    date: {
      created: partialCodeJSON?.date.created ?? "", // need better default values here
      lastModified: partialCodeJSON?.date.lastModified ?? "",
      metaDataLastUpdated: partialCodeJSON?.date.metaDataLastUpdated ?? ""
    }
  }
}

export async function run(): Promise<void> {
  const metaData = await getMetaData()
  const currentCodeJSON = await helpers.readJSON("./code.json")
  let finalCodeJSON = {} as CodeJSON

  if (currentCodeJSON) {
    finalCodeJSON = {
      ...baselineCodeJSON,
      ...currentCodeJSON,
      ...metaData
    }
  } else {
    finalCodeJSON = {
      ...baselineCodeJSON,
      ...metaData
    }
  }

  helpers.writeJSON("./code.json", finalCodeJSON)
  console.log(finalCodeJSON)
  
}


