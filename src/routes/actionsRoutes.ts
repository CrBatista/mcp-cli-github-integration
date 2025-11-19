import { Router } from 'express';
import { GitHubActions } from '../services/githubActions';
import { MissingConnectionError } from '../services/tokenManager';

const router = Router();

router.post('/github/list-repos', async (req, res) => {
  const { userId } = req.body ?? {};
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const repos = await GitHubActions.listRepositories(userId);
    return res.json({ repos });
  } catch (error: any) {
    if (error instanceof MissingConnectionError) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to list repositories', details: error?.message });
  }
});

router.post('/github/create-issue', async (req, res) => {
  const { userId, owner, repo, title, body } = req.body ?? {};
  if (!userId || !owner || !repo || !title) {
    return res.status(400).json({ error: 'userId, owner, repo, and title are required' });
  }

  try {
    const issue = await GitHubActions.createIssue({ userId, owner, repo, title, body: body ?? '' });
    return res.json({ issue });
  } catch (error: any) {
    if (error instanceof MissingConnectionError) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to create issue', details: error?.message });
  }
});

export default router;
