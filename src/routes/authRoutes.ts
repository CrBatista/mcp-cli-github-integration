import { Router } from 'express';
import { GitHubOAuth } from '../providers/github/oauth';
import { ConnectionRepository } from '../db/connectionRepository';

const router = Router();

router.post('/github/start', (req, res) => {
  const { userId } = req.body ?? {};
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const authUrl = GitHubOAuth.buildAuthorizationUrl(userId);
  return res.json({ authUrl });
});

router.get('/github/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
    return res.status(400).json({ error: 'code and state query parameters are required' });
  }

  try {
    const tokenResponse = await GitHubOAuth.exchangeCodeForToken(code);
    const expiresAt = tokenResponse.expires_in
      ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
      : null;

    ConnectionRepository.upsert({
      userId: state,
      provider: 'github',
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token ?? null,
      expiresAt
    });

    return res.send('<h1>GitHub authorization succeeded</h1><p>You may return to the app.</p>');
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to exchange code', details: error?.message });
  }
});

export default router;
