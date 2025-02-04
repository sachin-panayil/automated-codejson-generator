import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs/promises';

import { Octokit as ActionKit, Octokit } from '@octokit/action'
import { createPullRequest } from "octokit-plugin-create-pull-request"
import { exec } from 'child_process'
import { promisify } from 'util';

import { CodeJSON, Date as CodeDate } from './model.js'

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

//===============================================
// Meta Data
//===============================================
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

async function getDateFields(): Promise<CodeDate> {
  try {
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

async function getLaborHours(): Promise<number> {
  try {
    const { stdout } = await execAsync(`scc .`);
    core.info(stdout)
    
    const scheduleMatch = stdout.match(/Estimated Schedule Effort \(organic\) ([\d.]+) months/);
    
    if (!scheduleMatch) {
        throw new Error('Could not find schedule effort in output');
    }
    
    const estimatedMonths = parseFloat(scheduleMatch[1]);
    core.info(estimatedMonths.toString())

    const laborHours = Math.ceil(estimatedMonths * 730.001);
    core.info(laborHours.toString())

    return laborHours;
} catch (error) {
    console.error('Raw command output:', error);
    throw new Error(`Failed to run SCC: ${error}`);
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
      body: 'This PR updates the code.json file',
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