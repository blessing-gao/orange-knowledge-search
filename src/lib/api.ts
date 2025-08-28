
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

  // Search API - 修正搜索接口调用
  async search(params: {
    query: string;
    knowledge_base_id?: string;
    result_type?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }) {
    try {
      // 构建搜索请求 - 可能需要POST方法而不是GET
      const searchData = {
        query: params.query,
        knowledge_base_id: params.knowledge_base_id,
        result_type: params.result_type,
        tags: params.tags,
        page: params.page || 1,
        limit: params.limit || 10
      };

      console.log('Search request data:', searchData);

      // 尝试POST请求
      const response = await this.request<any>('/search', {
        method: 'POST',
        body: JSON.stringify(searchData),
      });

      return response;
    } catch (error) {
      console.error('POST search failed, trying GET:', error);
      
      // 如果POST失败，回退到GET请求
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
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
