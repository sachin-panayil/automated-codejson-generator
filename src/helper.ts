import * as core from '@actions/core'
import * as github from '@actions/github'
import { exec } from 'child_process'
import { promisify } from 'util';

import * as fs from 'fs'

import { CodeJSON, Date as CodeDate } from './model.js'

const token = core.getInput("github-token", { required: true })
const execAsync = promisify(exec);

export async function calculateMetaData() {
  try {
    const laborHours = await getLaborHours()
    const dateFeilds = await getDateFields()
    
    return {
      laborHours: laborHours,
      date: dateFeilds
    }

  } catch (error) {
    console.log(`Error with calculating meta data: ${error}`)
    return null
  }
}

export async function getDateFields(): Promise<CodeDate> {
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  try {
    const repoData = await octokit.rest.repos.get({owner, repo});

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

    const { stdout } = await execAsync(`scc .. -f json2 2>/dev/null`)
    const json = JSON.parse(stdout);

    const laborHours = Math.ceil(json["estimatedScheduleMonths"] * 730.001)
    return laborHours
  } catch (error) {
    throw new Error(`Failed to run SCC: ${error}`);
  }
}

export function readJSON(filepath: string): CodeJSON | null {
  try {
    const fileContent = fs.readFileSync(filepath, 'utf8')
    return JSON.parse(fileContent) as CodeJSON
  } catch (error) {
    console.log(`Error with reading JSON file: ${error}`)
    return null
  }
}