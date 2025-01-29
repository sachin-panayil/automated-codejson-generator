import * as core from '@actions/core'
import * as github from '@actions/github'
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

    return {
      laborHours: 0,
      date: dates
    }

  } catch (error) {
    console.log(`Error with calculating meta data: ${error}`)
    return null
  }
}

export async function getLaborHours(): Promise<number> {
  try {
    const token = core.getInput('token', { required: true });
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    const [repoData, languages] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listLanguages({ owner, repo })
    ]);

    const totalLines = Object.values(languages.data).reduce((sum, lines) => sum + lines, 0);

    const c = 2.5;    
    const d = 0.38;   
    const a = 2.4;    
    const b = 1.05;   

    const effort = a * Math.pow(totalLines / 1000, b);
    const scheduleMonths = c * Math.pow(effort, d);
    
    return Number((scheduleMonths * 730.001).toFixed(2));

  } catch (error) {
    core.error('Error calculating labor hours: ' + error);
    return 0;
  }
}