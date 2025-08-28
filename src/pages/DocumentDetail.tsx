
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Save, X, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DocumentSlice } from "@/types/api";
import { MarkdownHighlight } from "@/components/MarkdownHighlight";

const DocumentDetail = () => {
  const { kbId, docId } = useParams<{ kbId: string; docId: string }>();
  const [editingSlice, setEditingSlice] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Mock data for demonstration
  const documentInfo = {
    id: docId || '',
    filename: 'API设计规范.md',
    file_path: '/docs/api/design-standards.md',
    content_type: 'text/markdown',
    size: 25600,
    tags: ['API', '规范', '技术文档'],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T15:45:00Z',
  };

  const mockSlices: DocumentSlice[] = [
    {
      id: 'slice_1',
      document_id: docId || '',
      content: '# API设计规范\n\n本文档详细介绍了**RESTful API**的设计原则和最佳实践。我们遵循以下核心原则：\n\n- 使用HTTP方法表示操作类型\n- 资源路径应该简洁明了\n- 返回适当的HTTP状态码\n- 提供清晰的错误信息\n\n> 良好的API设计是系统可维护性的基础',
      chunk_index: 0,
      start_position: 0,
      end_position: 200,
      created_at: '2024-01-15T10:30:00Z',
      metadata: { section: 'introduction', tokens: 150 }
    },
    {
      id: 'slice_2',
      document_id: docId || '',
      content: '## HTTP方法规范\n\n### GET请求\n用于**获取资源**，不应有副作用。\n\n```http\nGET /api/users/123\nGET /api/users?page=1&limit=10\n```\n\n### POST请求\n用于*创建新资源*。\n\n```http\nPOST /api/users\nContent-Type: application/json\n\n{\n  "name": "张三",\n  "email": "zhangsan@example.com"\n}\n```',
      chunk_index: 1,
      start_position: 200,
      end_position: 450,
      created_at: '2024-01-15T10:30:00Z',
      metadata: { section: 'http-methods', tokens: 180 }
    },
    {
      id: 'slice_3',
      document_id: docId || '',
      content: '## 状态码规范\n\n正确使用HTTP状态码对于**API可用性**至关重要：\n\n- `200 OK` - 请求成功\n- `201 Created` - 资源创建成功\n- `400 Bad Request` - 请求参数错误\n- `401 Unauthorized` - 未认证\n- `403 Forbidden` - 无权限\n- `404 Not Found` - 资源不存在\n- `500 Internal Server Error` - 服务器内部错误\n\n*建议*：为每个状态码提供详细的错误信息。',
      chunk_index: 2,
      start_position: 450,
      end_position: 720,
      created_at: '2024-01-15T10:30:00Z',
      metadata: { section: 'status-codes', tokens: 165 }
    },
    {
      id: 'slice_4',
      document_id: docId || '',
      content: '## 错误处理\n\n统一的错误响应格式：\n\n```json\n{\n  "error": {\n    "code": "INVALID_PARAMETER",\n    "message": "用户名不能为空",\n    "details": {\n      "field": "username",\n      "reason": "required_field_missing"\n    }\n  },\n  "timestamp": "2024-01-20T10:30:00Z",\n  "path": "/api/users"\n}\n```\n\n**注意**：错误信息应该对开发者友好，同时不暴露敏感信息。',
      chunk_index: 3,
      start_position: 720,
      end_position: 1050,
      created_at: '2024-01-15T10:30:00Z',
      metadata: { section: 'error-handling', tokens: 195 }
    }
  ];

  const handleEdit = (slice: DocumentSlice) => {
    setEditingSlice(slice.id);
    setEditContent(slice.content);
  };

  const handleSave = () => {
    // Save logic would go here
    setEditingSlice(null);
    setEditContent("");
  };

  const handleCancel = () => {
    setEditingSlice(null);
    setEditContent("");
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-red-50 via-white to-orange-red-50/30">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/knowledge-bases/${kbId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回文件列表
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{documentInfo.filename}</h1>
                <p className="text-sm text-gray-500">共 {mockSlices.length} 个切片</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                查看原文件
              </Button>
              <div className="flex gap-2">
                {documentInfo.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Document Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>文档信息</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">文件类型</span>
              <div className="font-medium">{documentInfo.content_type}</div>
            </div>
            <div>
              <span className="text-gray-500">文件大小</span>
              <div className="font-medium">{(documentInfo.size / 1024).toFixed(1)} KB</div>
            </div>
            <div>
              <span className="text-gray-500">创建时间</span>
              <div className="font-medium">
                {new Date(documentInfo.created_at).toLocaleDateString('zh-CN')}
              </div>
            </div>
            <div>
              <span className="text-gray-500">更新时间</span>
              <div className="font-medium">
                {new Date(documentInfo.updated_at).toLocaleDateString('zh-CN')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slices */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">文档切片</h2>
          
          {mockSlices.map((slice) => (
            <Card key={slice.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">切片 {slice.chunk_index + 1}</Badge>
                    <span className="text-sm text-gray-500">
                      位置 {slice.start_position}-{slice.end_position}
                    </span>
                    {slice.metadata?.tokens && (
                      <span className="text-sm text-gray-500">
                        {slice.metadata.tokens} tokens
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(slice.content)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {editingSlice === slice.id ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={handleSave}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancel}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(slice)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {editingSlice === slice.id ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="编辑切片内容..."
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <MarkdownHighlight 
                      content={slice.content} 
                      query=""
                      className="text-sm leading-relaxed"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
