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
    name: partialCodeJSON.name,
    description: partialCodeJSON.description,
    repositoryURL: partialCodeJSON.repositoryURL,
    laborHours: partialCodeJSON?.laborHours,
    date: {
      created: partialCodeJSON.date?.created ?? "",
      lastModified: partialCodeJSON.date?.lastModified ?? "",
      metaDataLastUpdated: partialCodeJSON.date?.metaDataLastUpdated ?? new Date().toISOString()
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

  helpers.sendPR(finalCodeJSON)
  
}


