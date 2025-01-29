import * as core from '@actions/core'
import * as github from '@actions/github'
import { exec } from '@actions/exec';
import * as fs from 'fs'

import { CodeJSON, Date as CodeDate } from './model.js'

export function readJSON(filepath: string): CodeJSON | null {
  try {
    const fileContent = fs.readFileSync(filepath, 'utf8')
    return JSON.parse(fileContent) as CodeJSON
  } catch (error) {
    console.log(`Error with reading JSON file: ${error}`)
    return null
  }
}

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
  const token = core.getInput("github-token", { required: true})
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  try {
    const [repoData] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
    ]);

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
  let output = '';

  const exclude = [
    'md',
    'json', 
    'yml',
    'txt',
    'lock',
    'xml'
  ];

  const excludeArgs = exclude.map(pattern => `--exclude-ext=${pattern}`).join(' ');

  await exec(`npx cloc . --json ${excludeArgs}`, [], {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      }
    }
  });

  const clocData = JSON.parse(output);
  const scheduleMonths = Math.sqrt(clocData.SUM?.code / 750);
  return scheduleMonths * 730.001;
}