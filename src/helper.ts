import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs/promises';

import { Octokit as ActionKit } from '@octokit/action'
import { createPullRequest } from "octokit-plugin-create-pull-request"
import { exec } from 'child_process'
import { promisify } from 'util';

import { CodeJSON, Date as CodeDate } from './model.js'

const execAsync = promisify(exec);

//===============================================
// Meta Data
//===============================================
export async function calculateMetaData() {
  try {
    // const laborHours = await getLaborHours()
    const dateFeilds = await getDateFields()
    
    return {
      // laborHours: laborHours,
      date: dateFeilds
    }

  } catch (error) {
    console.log(`Error with calculating meta data: ${error}`)
    return null
  }
}

export async function getDateFields(): Promise<CodeDate> {
  try {
    const TOKEN = core.getInput("github-token", { required: true })
    const MyOctoKit = ActionKit.plugin(createPullRequest)
    const octokit = new MyOctoKit({
      auth: TOKEN,
    });

    const owner = process.env.GITHUB_REPOSITORY_OWNER
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]

    if (!owner || !repo) {
      throw new Error('Unable to determine repository owner or name from environment');
    }

    const repoData = await octokit.rest.repos.get({owner,repo})

    const dates: CodeDate = {
      created: repoData.data.created_at,         
      lastModified: repoData.data.updated_at,      
      metaDataLastUpdated: new Date().toISOString()
    }

    return dates
  } catch (error) {
    console.log(`Error getting date: ${error}`)
    return {
      created: "",
      lastModified: "",
      metaDataLastUpdated: "" 
    }
  }
}

export async function getLaborHours(): Promise<number> {
  try {
    // const filesToExclude = "checks.yml,auto-changelog.yml,contributors.yml,repoStructure.yml,code.json,checklist.md,checklist.pdf,README.md,CONTIRBUTING.md,LICENSE,MAINTAINERS.md,repolinter.json,SECURITY.md,CODE_OF_CONDUCT.md,CODEOWNERS.md,COMMUNITY_GUIDELINES.md,GOVERANCE.md"
    // add this in later

    const { stdout } = await execAsync(`scc .. --format json2`)
    const json = JSON.parse(stdout);

    const laborHours = Math.ceil(json["estimatedScheduleMonths"] * 730.001)
    return laborHours
  } catch (error) {
    throw new Error(`Failed to run SCC: ${error}`);
  }
}

//===============================================
// JSON
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

export async function writeJSON(filename: string, data: CodeJSON): Promise<void> {
  const jsonString = JSON.stringify(data, null, 2);
  await fs.writeFile(filename, jsonString);
} 

//===============================================
// PR
//===============================================
export function sendPR() {

}