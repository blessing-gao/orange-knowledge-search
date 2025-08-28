
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
      const response = await this.request<{knowledge_bases: any[], total: number, page: number, size: number}>('/knowledge-bases');
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
      const endpoint = knowledgeBaseId ? `/knowledge-bases/${knowledgeBaseId}/tags` : '/tags';
      const response = await this.request<{tags: {tag: string, count: number}[]}>(endpoint);
      // Extract tag names from the response
      return response.tags ? response.tags.map(t => t.tag) : [];
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      return [];
    }
  }

  // Search API - 修正搜索接口调用，使用知识库特定的搜索端点
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
      if (params.knowledge_base_id) {
        const searchData = {
          query: params.query,
          result_type: params.result_type,
          tags: params.tags,
          page: params.page || 1,
          limit: params.limit || 10
        };

        console.log('Knowledge base specific search request:', searchData);

        // 尝试POST请求到知识库特定端点
        try {
          const response = await this.request<any>(`/knowledge-bases/${params.knowledge_base_id}/search`, {
            method: 'POST',
            body: JSON.stringify(searchData),
          });
          return response;
        } catch (error) {
          console.error('POST to KB search failed, trying GET:', error);
          
          // 如果POST失败，尝试GET请求
          const queryParams = new URLSearchParams();
          queryParams.append('query', params.query);
          if (params.result_type) queryParams.append('result_type', params.result_type);
          if (params.tags && params.tags.length > 0) queryParams.append('tags', JSON.stringify(params.tags));
          queryParams.append('page', (params.page || 1).toString());
          queryParams.append('limit', (params.limit || 10).toString());

          return this.request<any>(`/knowledge-bases/${params.knowledge_base_id}/search?${queryParams}`);
        }
      } else {
        // 全局搜索，尝试不同的端点
        const searchData = {
          query: params.query,
          result_type: params.result_type,
          tags: params.tags,
          page: params.page || 1,
          limit: params.limit || 10
        };

        console.log('Global search request:', searchData);

        // 尝试全局搜索端点
        try {
          const response = await this.request<any>('/search', {
            method: 'POST',
            body: JSON.stringify(searchData),
          });
          return response;
        } catch (error) {
          console.error('Global POST search failed, trying global GET:', error);
          
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && key !== 'knowledge_base_id') {
              if (Array.isArray(value)) {
                queryParams.append(key, JSON.stringify(value));
              } else {
                queryParams.append(key, value.toString());
              }
            }
          });

          return this.request<any>(`/search?${queryParams}`);
        }
      }
    } catch (error) {
      console.error('All search attempts failed:', error);
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
}

export const apiClient = new ApiClient();
