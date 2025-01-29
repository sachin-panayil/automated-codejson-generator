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
  const laborHours = await helpers.getLaborHours()
  console.log(laborHours)

}


