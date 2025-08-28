
const API_BASE = '/api';

export class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    console.log('Making request to:', url);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Knowledge Base API
  async getKnowledgeBases() {
    try {
      const response = await this.request<{knowledge_bases: any[], total: number, page: number, size: number}>('/knowledge-bases/');
      console.log('API response for knowledge bases:', response);
      // Extract the knowledge_bases array from the response
      return Array.isArray(response.knowledge_bases) ? response.knowledge_bases : [];
    } catch (error) {
      console.error('Failed to fetch knowledge bases:', error);
      return [];
    }
  }

  async createKnowledgeBase(data: { name: string; description?: string }) {
    return this.request<any>('/knowledge-bases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKnowledgeBase(id: string, data: { name?: string; description?: string }) {
    return this.request<any>(`/knowledge-bases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteKnowledgeBase(id: string) {
    return this.request<void>(`/knowledge-bases/${id}`, {
      method: 'DELETE',
    });
  }

  // Document API
  async getDocuments(knowledgeBaseId: string, page: number = 1, limit: number = 10) {
    return this.request<any>(`/knowledge-bases/${knowledgeBaseId}/documents?page=${page}&limit=${limit}`);
  }

  async uploadDocument(knowledgeBaseId: string, file: File, tags?: string[]) {
    const formData = new FormData();
    formData.append('file', file);
    if (tags) {
      formData.append('tags', JSON.stringify(tags));
    }

    const response = await fetch(`${API_BASE}/knowledge-bases/${knowledgeBaseId}/documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteDocument(knowledgeBaseId: string, documentId: string) {
    return this.request<void>(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Get tags for a specific knowledge base
  async getTags(knowledgeBaseId?: string) {
    try {
      if (!knowledgeBaseId) {
        return [];
      }
      const endpoint = `/kb/${knowledgeBaseId}/tags`;
      const response = await this.request<{tags: string[], total_count: number, usage_stats: Record<string, number>}>(endpoint);
      // Extract tag names from the response
      return Array.isArray(response.tags) ? response.tags : [];
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      return [];
    }
  }

  // Search API - 使用正确的后端搜索接口
  async search(params: {
    query: string;
    knowledge_base_id?: string;
    result_type?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }) {
    try {
      // 如果指定了知识库ID，使用知识库特定的搜索端点
      if (params.knowledge_base_id && params.knowledge_base_id !== 'all') {
        const searchData = {
          query: params.query,
          search_mode: params.result_type === 'slices' ? 'chunk' : 'document',
          tags: params.tags || [],
          page: params.page || 1,
          size: params.limit || 10
        };

        console.log('Knowledge base specific search request:', searchData);

        // 使用POST请求到知识库搜索端点
        const response = await this.request<any>(`/search/${params.knowledge_base_id}`, {
          method: 'POST',
          body: JSON.stringify(searchData),
        });
        return response;
      } else {
        // 全局搜索：获取第一个可用的知识库进行搜索
        const kbs = await this.getKnowledgeBases();
        if (kbs.length === 0) {
          throw new Error('No knowledge bases available');
        }

        const searchData = {
          query: params.query,
          search_mode: params.result_type === 'slices' ? 'chunk' : 'document',
          tags: params.tags || [],
          page: params.page || 1,
          size: params.limit || 10
        };

        console.log('Global search request (using first KB):', searchData);

        const response = await this.request<any>(`/search/${kbs[0].id}`, {
          method: 'POST',
          body: JSON.stringify(searchData),
        });
        return response;
      }
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  // Document Slices API
  async getDocumentSlices(documentId: string) {
    return this.request<any[]>(`/documents/${documentId}/slices`);
  }

  async updateDocumentSlice(sliceId: string, content: string) {
    return this.request<any>(`/document-slices/${sliceId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  // Task Management API
  async getTaskStats(knowledgeBaseId?: string) {
    try {
      const endpoint = knowledgeBaseId ? `/tasks/${knowledgeBaseId}/stats` : '/tasks/stats';
      return this.request<any>(endpoint);
    } catch (error) {
      console.error('Failed to fetch task stats:', error);
      return {
        total_tasks: 0,
        pending_tasks: 0,
        running_tasks: 0,
        completed_tasks: 0,
        failed_tasks: 0
      };
    }
  }

  async getTasks(knowledgeBaseId?: string, page: number = 1, size: number = 20) {
    try {
      const endpoint = knowledgeBaseId ? `/tasks/${knowledgeBaseId}/list` : '/tasks/list';
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      return this.request<any>(`${endpoint}?${params}`);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return {
        tasks: [],
        total: 0,
        page: 1,
        size: 20,
        total_pages: 0
      };
    }
  }

  // Knowledge Base Detail API
  async getKnowledgeBaseDetail(id: string) {
    try {
      return this.request<any>(`/knowledge-bases/${id}`);
    } catch (error) {
      console.error('Failed to fetch knowledge base detail:', error);
      throw error;
    }
  }

  // Document Detail API
  async getDocumentDetail(knowledgeBaseId: string, documentId: string) {
    try {
      return this.request<any>(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`);
    } catch (error) {
      console.error('Failed to fetch document detail:', error);
      throw error;
    }
  }

  async getDocumentChunks(knowledgeBaseId: string, documentId: string) {
    try {
      return this.request<any>(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}/chunks`);
    } catch (error) {
      console.error('Failed to fetch document chunks:', error);
      return [];
    }
  }
}

export const apiClient = new ApiClient();
