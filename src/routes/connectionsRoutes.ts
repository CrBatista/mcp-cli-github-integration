import { Router } from 'express';
import { ConnectionRepository } from '../db/connectionRepository';

const router = Router();

router.get('/', (_req, res) => {
  const userId = typeof _req.query.userId === 'string' ? _req.query.userId : undefined;
  const connections = ConnectionRepository.findAll(userId).map((connection) => ({
    id: connection.id,
    userId: connection.user_id,
    provider: connection.provider,
    expiresAt: connection.expires_at,
    createdAt: connection.created_at,
    updatedAt: connection.updated_at
  }));
  return res.json({ connections });
});

export default router;
