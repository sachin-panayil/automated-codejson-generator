import { CodeJSON } from "./model.js";
import * as helpers from "./helper.js";

const baselineCodeJSON: CodeJSON = {
  name: "",
  description: "",
  longDescription: "",
  status: "",
  permissions: {
    license: [
      {
        name: "",
        URL: "",
      },
    ],
    usageType: "",
    exemptionText: "",
  },
  organization: "",
  repositoryURL: "",
  projectURL: "",
  repositoryHost: "github",
  repositoryVisibility: "",
  vcs: "git",
  laborHours: 0,
  reuseFrequency: {
    forks: 0,
    clones: 0,
  },
  platforms: [],
  categories: [],
  softwareType: "",
  languages: [],
  maintenance: "",
  contractNumber: [],
  date: {
    created: "",
    lastModified: "",
    metaDataLastUpdated: "",
  },
  tags: [],
  contact: {
    email: "",
    name: "",
  },
  feedbackMechanism: "",
  AIUseCaseID: "0",
  localisation: false,
  repositoryType: "",
  userInput: false,
  fismaLevel: "",
  group: "",
  projects: [],
  systems: [],
  upstream: "",
  subsetInHealthcare: [],
  userType: [],
  maturityModelTier: 0,
};

async function getMetaData(
  existingCodeJSON?: CodeJSON | null,
): Promise<Partial<CodeJSON>> {
  const partialCodeJSON = await helpers.calculateMetaData();

  // preserve existing feedback mechanisms if they exist, otherwise default to GitHub Issues
  const feedbackMechanism = existingCodeJSON?.feedbackMechanism || `${partialCodeJSON.repositoryURL}/issues`;

  // only use the calculated description if its not empty, otherwise keep existing
  const shouldUpdateDescription =
    partialCodeJSON.description && partialCodeJSON.description.trim() !== "";
  const description = shouldUpdateDescription
    ? partialCodeJSON.description
    : existingCodeJSON?.description || "";

  // only update tags if we have new ones from GitHub Topics, otherwise keep existing
  const shouldUpdateTags =
    partialCodeJSON.tags && partialCodeJSON.tags.length > 0;
  const tags = shouldUpdateTags
    ? partialCodeJSON.tags
    : existingCodeJSON?.tags || [];

  return {
    name: partialCodeJSON.name,
    description: description,
    repositoryURL: partialCodeJSON.repositoryURL,
    repositoryVisibility: partialCodeJSON.repositoryVisibility,
    laborHours: partialCodeJSON.laborHours,
    languages: partialCodeJSON.languages,
    reuseFrequency: {
      forks: partialCodeJSON.reuseFrequency?.forks ?? 0,
      clones: existingCodeJSON?.reuseFrequency?.clones ?? 0,
    },
    tags: tags,
    date: {
      created: partialCodeJSON.date?.created ?? "",
      lastModified: partialCodeJSON.date?.lastModified ?? "",
      metaDataLastUpdated:
        partialCodeJSON.date?.metaDataLastUpdated ?? new Date().toISOString(),
    },
    feedbackMechanism,
  };
}

export async function run(): Promise<void> {
  const currentCodeJSON = await helpers.readJSON("/github/workspace/code.json");
  const metaData = await getMetaData(currentCodeJSON);
  let finalCodeJSON = {} as CodeJSON;

  if (currentCodeJSON) {
    finalCodeJSON = {
      ...baselineCodeJSON,
      ...currentCodeJSON,
      ...metaData,
    };
  } else {
    finalCodeJSON = {
      ...baselineCodeJSON,
      ...metaData,
    };
  }

  const baseBranchName = await helpers.getBaseBranch();
  await helpers.sendPR(finalCodeJSON, baseBranchName);
}
