import axios from 'axios'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const GITHUB_API_BASE_URL = 'https://api.github.com';


const headers = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json'
};


const getRepoDetails = async (owner, repo) => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching repo details for ${owner}/${repo}:`, error.message);
    throw new Error(`Failed to fetch repo details: ${error.message}`);
  }
};


const getRepoContributors = async (owner, repo) => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contributors`, { headers });

    return response.data.map(contributor => ({
      username: contributor.login,
      contributions: contributor.contributions
    }));
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error.message);
    throw new Error(`Failed to fetch contributors: ${error.message}`);
  }
};


const getRepoLanguages = async (owner, repo) => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/languages`, { headers });

    return Object.keys(response.data);
  } catch (error) {
    console.error(`Error fetching languages for ${owner}/${repo}:`, error.message);
    throw new Error(`Failed to fetch languages: ${error.message}`);
  }
};

const validateSubmission = ({ repoDetails, originalRepoUrl, deadline }) => {
    let isForkValid = false;
    let isSubmissionLate = false;
    
    if (repoDetails.fork && repoDetails.parent) {
        const parentRepoUrl = `https://github.com/${repoDetails.parent.owner.login}/${repoDetails.parent.name}`;
        if (parentRepoUrl === originalRepoUrl) {
            isForkValid = true;
        }
    }

    if (repoDetails.pushed_at) {
        const lastPushDate = new Date(repoDetails.pushed_at);
        const deadlineDate = new Date(deadline);
        if (lastPushDate > deadlineDate) {
            isSubmissionLate = true;
        }
    }
    
    return {
        isForkValid,
        isSubmissionLate
    };
};

export {
  getRepoDetails,
  getRepoContributors,
  getRepoLanguages,
  validateSubmission
};
