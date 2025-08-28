
export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  document_count?: number;
  file_count?: number;
  source_path?: string;
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
  chunk_count?: number;
}

export interface DocumentSlice {
  id: string;
  document_id: string;
  content: string;
  metadata?: Record<string, any>;
  embedding_vector?: number[];
  created_at: string;
  chunk_index: number;
  start_position: number;
  end_position: number;
}

export interface SearchResult {
  type: 'document' | 'slice' | 'image' | 'video';
  id: string;
  title: string;
  content: string;
  file_path?: string;
  tags?: string[];
  score: number;
  highlights?: string[];
  metadata?: Record<string, any>;
  preview_url?: string;
  thumbnail_url?: string;
  duration?: number;
  dimensions?: { width: number; height: number };
  file_size?: number;
  document_id?: string;
  knowledge_base_id?: string;
  chunk_index?: number;
}

export interface SearchRequest {
  query: string;
  knowledge_base_id?: string;
  result_type?: 'documents' | 'slices' | 'images' | 'videos' | 'both';
  tags?: string[];
  limit?: number;
  offset?: number;
  page?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query_time: number;
}

export interface Task {
  id: string;
  type: 'index' | 'upload' | 'delete' | 'rebuild';
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  knowledge_base_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
}
