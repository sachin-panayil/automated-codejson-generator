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
    // Run scc with json2 format which gives us detailed metrics
    const { stdout } = await execAsync('scc . --format json');
    
    // Parse the JSON output
    const json = JSON.parse(stdout);
    
    // Calculate total lines of code and complexity
    let totalLines = 0;
    let totalComplexity = 0;

    // json2 format returns an array of language statistics
    for (const lang of json) {
      totalLines += lang.Lines || 0;
      totalComplexity += lang.Complexity || 0;
    }

    // Estimate schedule months using similar formula to scc internal calculation
    // This is a simplified version of COCOMO model
    const estimatedScheduleMonths = Math.pow(totalLines / 1000, 0.33);
    
    // Convert to labor hours (1 month = 730.001 hours as used in the original code)
    const laborHours = Math.ceil(estimatedScheduleMonths * 730.001);
    
    return Math.max(1, laborHours); // Ensure we return at least 1 hour
  } catch (error) {
    console.error('Full error:', error);
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