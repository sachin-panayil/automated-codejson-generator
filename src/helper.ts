import * as core from '@actions/core'
import * as fs from 'fs/promises';

import { Octokit as ActionKit } from '@octokit/action'
import { createPullRequest } from "octokit-plugin-create-pull-request"
import { exec } from 'child_process'
import { promisify } from 'util';

import { CodeJSON, BasicRepoInfo} from './model.js'

const execAsync = promisify(exec);

const TOKEN = core.getInput("GITHUB_TOKEN", { required: true })
const MyOctoKit = ActionKit.plugin(createPullRequest)
const octokit = new MyOctoKit({
  auth: TOKEN,
  log: {
    debug: core.debug,
    info: core.info,
    warn: core.warning,
    error: core.error
  }
});

const owner = process.env.GITHUB_REPOSITORY_OWNER ?? ""
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ""

const HOURS_PER_MONTH = 730.001

//===============================================
// Meta Data
//===============================================
export async function calculateMetaData(): Promise<Partial<CodeJSON>> {
  try {
    const [laborHours, basicInfo, languages] = await Promise.all([
      getLaborHours(),
      getBasicInfo(),
      getProgrammingLanguages()
    ])
    
    return {
      name: basicInfo.title,
      description: basicInfo.description,
      repositoryURL: basicInfo.url,
      laborHours: laborHours,
      languages: languages,
      date: {
        created: basicInfo.date.created,
        lastModified: basicInfo.date.lastModified,
        metaDataLastUpdated: basicInfo.date.metaDataLastUpdated
      }
    }

  } catch (error) {
    core.error(`Failed to calculate meta data: ${error}`) 
    throw error 
  }
}

async function getBasicInfo(): Promise<BasicRepoInfo> {
  try {
    const repoData = await octokit.rest.repos.get({owner,repo})

    return {
      title: repoData.data.name,
      description: repoData.data.description ?? "",
      url: repoData.data.html_url,
      date: {
        created: repoData.data.created_at,         
        lastModified: repoData.data.updated_at,      
        metaDataLastUpdated: new Date().toISOString()
      }
    }

  } catch (error) {
    core.error(`Failed to get basic info: ${error}`)
    throw error 
  }

}

async function getLaborHours(): Promise<number> {
  try {
    const { stdout } = await execAsync(`scc . --format json2`)
    const sccData = JSON.parse(stdout)

    const laborHours = Math.ceil(sccData["estimatedScheduleMonths"] * HOURS_PER_MONTH)
    return laborHours
  } catch (error) {
    core.error(`Failed to get labor hours: ${error}`) 
    throw error 
  }
}

async function getProgrammingLanguages(): Promise<string[]> {
  try {
    const repoData = await octokit.rest.repos.listLanguages({owner, repo})
    const languages = Object.keys(repoData.data)

    return languages
  } catch (error) {
    core.error(`Failed to get languages: ${error}`)
    throw error
  }
}

//===============================================
// Data Handling
//===============================================
export async function readJSON(filepath: string): Promise<CodeJSON | null> {
  try {
    const fileContent = await fs.readFile(filepath, 'utf8')
    return JSON.parse(fileContent) as CodeJSON
  } catch (error) {
    console.log(`Error with reading JSON file: ${error}`)
    return null
  }
}

export async function sendPR(updatedCodeJSON: CodeJSON) {
   try {
    const formattedContent = JSON.stringify(updatedCodeJSON, null, 2)
    const branchName = `code-json-${new Date().getTime()}`

    const PR = await octokit.createPullRequest({
      owner,
      repo,
      title: 'Update code.json',
      body: bodyOfPR(),
      base: 'main',
      head: branchName,
      changes: [{
        files: {
          'code.json': formattedContent
        },
        commit: 'Update code.json metadata'
      }]
    });  

    if (PR) {
      core.info(`Successfully created PR: ${PR.data.html_url}`)
    } else {
      core.error(`Failed to create PR because of PR object`)
    }

  } catch (error) {
    core.error(`Failed to create PR: ${error}`)
  }
}

function bodyOfPR(): string {
  return `
  ## Next Steps
  ### Add Missing Information to code.json
  - We have automatically calculated some fields but the majority require manual input
  - Please enter the missing fields by directly editing code.json in Files Changed
  - We also have a [formsite](https://dsacms.github.io/codejson-generator/) where you can create your code.json via a website.
    - You can copy and paste your code.json from the website into here.
  `
}