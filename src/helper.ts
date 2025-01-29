import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit as ActionKit} from '@octokit/action'
import {createPullRequest} from "octokit-plugin-create-pull-request"
import { exec } from '@actions/exec';
import * as fs from 'fs'

import { CodeJSON, Date as CodeDate } from './model.js'

const token = core.getInput("github-token", { required: true})

const MyOctokit = ActionKit.plugin(createPullRequest)

const octokit = new MyOctokit({
  auth: token,
  log: {
    debug: core.debug,
    info: core.info,
    warn: core.warning,
    error: core.error
  }
})


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

export async function sendPR(content: string) {
  const { owner, repo } = github.context.repo
  const runNumber = getRunNumber()

  const pr = await octokit.createPullRequest({
    owner,
    repo,
    title: `Repolinter Results`,
    body: "this is a test",
    base: "main",
    head: `repolinter-results-#${runNumber}`,
    changes: [{
      files: {
        "code.json": content
      },
      commit: `changes based on repolinter output`
    }]
  })

  if (pr) {
    core.info(`Created PR: ${pr.data.html_url}`)
  }  
}

function getRunNumber(): number {
  const runNum = parseInt(process.env['GITHUB_RUN_NUMBER'] as string)
  if (!runNum || isNaN(runNum))
    throw new Error(
      `Found invalid GITHUB_RUN_NUMBER "${process.env['GITHUB_RUN_NUMBER']}"`
    )
  return runNum
}