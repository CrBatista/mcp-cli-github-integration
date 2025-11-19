export interface Connection {
  id: number;
  user_id: string;
  provider: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ConnectionUpsertInput = Omit<Connection, 'id' | 'created_at' | 'updated_at'> & {
  id?: number;
};
