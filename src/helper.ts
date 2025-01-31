import * as core from '@actions/core'
import * as github from '@actions/github'
import { spawn } from 'child_process'

import * as fs from 'fs'

import { CodeJSON, Date as CodeDate } from './model.js'

const token = core.getInput("github-token", { required: true })

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

export async function getLaborHours() {
  let cmd = 'scc .. --format json2 --exclude-file '

  const files_to_exclude = "checks.yml, auto-changelog.yml, contributors.yml, repoStructure.yml, code.json, checklist.md, checklist.pdf, README.md, CONTIRBUTING.md, LICENSE, MAINTAINERS.md, repolinter.json, SECURITY.md, CODE_OF_CONDUCT.md, CODEOWNERS.md, COMMUNITY_GUIDELINES.md, GOVERANCE.md"

  let output = ""

  const child = spawn(cmd)

  child.stdout.on('data', (data) => {
    output += data.toString();
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  const exitCode = await new Promise<number>((resolve) => {
    child.on('close', resolve);
  });

  if (exitCode !== 0) {
    throw new Error(`Process exited with code ${exitCode}`);
  }

  return output;
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