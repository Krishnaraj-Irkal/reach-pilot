export type Connection = {
  id: string;
  created_at: string;
  created_by_email: string;
  email: string;
  name?: string | null;
  linkedin_url?: string | null;
};

export type CreateConnectionRequest = {
  email: string;
  name?: string;
  linkedin_url?: string;
};

export type UpdateConnectionRequest = {
  email?: string;
  name?: string;
  linkedin_url?: string;
};

export type ConnectionsListResponse = {
  data: Connection[];
  has_more?: boolean;
  next_cursor?: string;
};

export type ConnectionResponse = {
  data: Connection;
};

export type ConnectionError = {
  error: 'duplicate_email' | 'invalid_linkedin_url' | 'unauthorized' | 'not_found' | 'validation_error';
  message?: string;
};

export type SearchConnectionsParams = {
  search?: string;
  limit?: number;
  cursor?: string;
};