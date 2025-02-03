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

async function getLaborHours() {
  try {
    // Run SCC with explicit JSON formatting and error handling
    const { stdout, stderr } = await execAsync(`scc .. --format json2`);
    
    // Check if we got any error output
    if (stderr) {
      console.error('SCC stderr:', stderr);
    }

    // Try to extract valid JSON from the output
    let json;
    try {
      json = JSON.parse(stdout.trim());
    } catch (parseError) {
      console.error('Raw stdout:', stdout);
      throw new Error(`Failed to parse SCC output as JSON: ${parseError}`);
    }

    // Validate that we have the expected data
    if (!json.hasOwnProperty('estimatedScheduleMonths')) {
      throw new Error('SCC output missing estimatedScheduleMonths property');
    }

    // Calculate labor hours (one month ≈ 730.001 hours)
    const laborHours = Math.ceil(json.estimatedScheduleMonths * 730.001);
    return laborHours;
  } catch (error) {
    // Provide more context in the error message
    throw new Error(`Failed to calculate labor hours: ${error}`);
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