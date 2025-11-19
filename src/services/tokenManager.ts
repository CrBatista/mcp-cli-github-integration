import { Connection } from '../models/connection';
import { ConnectionRepository } from '../db/connectionRepository';

const REFRESH_THRESHOLD_SECONDS = 60 * 5;

export class MissingConnectionError extends Error {
  constructor() {
    super('Connection not found for this user and provider');
  }
}

export const TokenManager = {
  getConnectionOrThrow(userId: string, provider: string): Connection {
    const connection = ConnectionRepository.findByUserAndProvider(userId, provider);
    if (!connection) {
      throw new MissingConnectionError();
    }
    return connection;
  },

  needsRefresh(expiresAt: string | null): boolean {
    if (!expiresAt) {
      return false;
    }
    const expiry = new Date(expiresAt).getTime();
    const threshold = Date.now() + REFRESH_THRESHOLD_SECONDS * 1000;
    return expiry <= threshold;
  },

  async ensureFreshToken(userId: string, provider: string): Promise<Connection> {
    const connection = this.getConnectionOrThrow(userId, provider);
    if (!this.needsRefresh(connection.expires_at)) {
      return connection;
    }
    return this.refreshToken(connection);
  },

  async refreshToken(connection: Connection): Promise<Connection> {
    // GitHub tokens typically do not expire for this flow, but the hook exists for future support.
    return connection;
  }
};
