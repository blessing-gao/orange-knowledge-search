
export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  document_count?: number;
}

export interface Document {
  id: string;
  knowledge_base_id: string;
  filename: string;
  file_path: string;
  content_type: string;
  size: number;
  tags: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DocumentSlice {
  id: string;
  document_id: string;
  content: string;
  metadata?: Record<string, any>;
  embedding_vector?: number[];
  created_at: string;
}

export interface SearchResult {
  type: 'document' | 'slice';
  id: string;
  title: string;
  content: string;
  file_path?: string;
  tags?: string[];
  score: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

export interface SearchRequest {
  query: string;
  knowledge_base_id?: string;
  result_type?: 'documents' | 'slices' | 'both';
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query_time: number;
}
