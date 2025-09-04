import express from 'express';
const githubDataRoutes = express.Router();
import { getRepoDetails, getRepoContributors, getRepoLanguages, validateSubmission } from '../utils/githubService.js';
import  Hackathon  from '../models/hackathon.models.js';

const parseRepoUrl = (url) => {
  try {
    const urlParts = url.split('/').filter(Boolean);
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1].replace('.git', '');
    return { owner, repo };
  } catch (error) {
    throw new Error('Invalid GitHub URL format.');
  }
};

githubDataRoutes.post('/validate-repo', async (req, res) => {
  const { repo_url, hackathonId } = req.body;

  if (!repo_url || !hackathonId) {
    return res.status(400).json({ error: 'Missing repo_url or hackathonId in request body.' });
  }

  try {
    // You'll need to define your Hackathon model and connect to your DB for this to work
    // For now, let's assume we fetch the hackathon details from a mock object
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
        return res.status(404).json({ error: 'Hackathon not found.' });
    }

    const { owner, repo } = parseRepoUrl(repo_url);

    const [repoDetails, contributors, languages] = await Promise.all([
      getRepoDetails(owner, repo),
      getRepoContributors(owner, repo),
      getRepoLanguages(owner, repo)
    ]);

    const { isForkValid, isSubmissionLate } = validateSubmission({
        repoDetails,
        originalRepoUrl: hackathon.originalRepoURL,
        deadline: hackathon.endDate
    });

    const finalData = {
      repo_name: repoDetails.name,
      repo_owner: repoDetails.owner.login,
      is_fork: repoDetails.fork,
      is_fork_valid: isForkValid,
      parent_repo: repoDetails.fork ? {
        name: repoDetails.parent.name,
        owner: repoDetails.parent.owner.login,
        url: repoDetails.parent.html_url
      } : null,
      stars: repoDetails.stargazers_count,
      forks: repoDetails.forks_count,
      watchers: repoDetails.watchers_count,
      languages: languages,
      contributors: contributors,
      last_updated: repoDetails.pushed_at, 
      license: repoDetails.license ? repoDetails.license.name : null,
      submitted_before_deadline: !isSubmissionLate
    };

    return res.status(200).json(finalData);

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: error.message });
  }
});

export { githubDataRoutes };
