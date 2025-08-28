
const API_BASE = '/api';

export class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
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
    return this.request<any[]>('/knowledge-bases');
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
  async getDocuments(knowledgeBaseId: string) {
    return this.request<any[]>(`/knowledge-bases/${knowledgeBaseId}/documents`);
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

  // Search API
  async search(params: {
    query: string;
    knowledge_base_id?: string;
    result_type?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }) {
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
