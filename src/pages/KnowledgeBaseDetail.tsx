
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Image, Video, File, Calendar, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { Document } from "@/types/api";

const KnowledgeBaseDetail = () => {
  const { kbId } = useParams<{ kbId: string }>();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const mockDocuments: Document[] = [
    {
      id: 'doc_1',
      knowledge_base_id: kbId || '',
      filename: 'API设计规范.md',
      file_path: '/docs/api/design-standards.md',
      content_type: 'text/markdown',
      size: 25600,
      tags: ['API', '规范', '技术文档'],
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T15:45:00Z',
      chunk_count: 12,
      metadata: { author: '技术团队', version: '2.1' }
    },
    {
      id: 'doc_2',
      knowledge_base_id: kbId || '',
      filename: '数据库配置手册.pdf',
      file_path: '/docs/database/config-manual.pdf',
      content_type: 'application/pdf',
      size: 1024000,
      tags: ['数据库', '配置', '运维'],
      created_at: '2024-01-12T09:15:00Z',
      updated_at: '2024-01-18T14:20:00Z',
      chunk_count: 8,
      metadata: { pages: 24, author: 'DBA团队' }
    },
    {
      id: 'doc_3',
      knowledge_base_id: kbId || '',
      filename: '架构设计图.png',
      file_path: '/images/architecture-diagram.png',
      content_type: 'image/png',
      size: 2048000,
      tags: ['架构', '设计图'],
      created_at: '2024-01-10T16:45:00Z',
      updated_at: '2024-01-15T11:30:00Z',
      chunk_count: 1,
      metadata: { width: 1920, height: 1080, created_by: '架构师' }
    },
    {
      id: 'doc_4',
      knowledge_base_id: kbId || '',
      filename: '产品演示视频.mp4',
      file_path: '/videos/product-demo.mp4',
      content_type: 'video/mp4',
      size: 125829120,
      tags: ['演示', '产品', '培训'],
      created_at: '2024-01-08T13:20:00Z',
      updated_at: '2024-01-12T10:15:00Z',
      chunk_count: 5,
      metadata: { duration: 900, resolution: '1920x1080', presenter: '产品经理' }
    }
  ];

  const knowledgeBaseName = "API技术文档";

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    } else if (contentType.startsWith('video/')) {
      return <Video className="w-5 h-5" />;
    } else if (contentType.includes('pdf') || contentType.includes('document')) {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDocuments = mockDocuments.filter(doc => 
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-red-50 via-white to-orange-red-50/30">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/knowledge-bases">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回列表
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{knowledgeBaseName}</h1>
                <p className="text-sm text-gray-500">共 {filteredDocuments.length} 个文件</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                上传文件
              </Button>
              <Button className="search-gradient" size="sm">
                <Download className="w-4 h-4 mr-2" />
                批量下载
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Search and Filters */}
        <div className="mb-6">
          <Input
            placeholder="搜索文件名或标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {mockDocuments.filter(d => d.content_type.includes('text') || d.content_type.includes('pdf')).length}
              </div>
              <p className="text-sm text-gray-600">文档文件</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {mockDocuments.filter(d => d.content_type.startsWith('image')).length}
              </div>
              <p className="text-sm text-gray-600">图片文件</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {mockDocuments.filter(d => d.content_type.startsWith('video')).length}
              </div>
              <p className="text-sm text-gray-600">视频文件</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">
                {mockDocuments.reduce((sum, d) => sum + (d.chunk_count || 0), 0)}
              </div>
              <p className="text-sm text-gray-600">总切片数</p>
            </CardContent>
          </Card>
        </div>

        {/* File Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                    {getFileIcon(doc.content_type)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {doc.chunk_count} 切片
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold line-clamp-2" title={doc.filename}>
                  {doc.filename}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatFileSize(doc.size)}</span>
                  <span>{formatDate(doc.updated_at)}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {doc.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {doc.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{doc.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {doc.metadata && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {doc.metadata.author && <div>作者: {doc.metadata.author}</div>}
                    {doc.metadata.pages && <div>页数: {doc.metadata.pages}</div>}
                    {doc.metadata.duration && <div>时长: {Math.floor(doc.metadata.duration / 60)}分{doc.metadata.duration % 60}秒</div>}
                  </div>
                )}

                <Link to={`/knowledge-bases/${kbId}/documents/${doc.id}`} className="block">
                  <Button className="w-full mt-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    查看切片
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {searchTerm ? "没有找到匹配的文件" : "还没有文件"}
            </h3>
            <p className="text-gray-600 mb-8">
              {searchTerm ? "尝试使用不同的关键词搜索" : "上传文件到这个知识库开始使用"}
            </p>
            {!searchTerm && (
              <Button className="search-gradient">
                <Upload className="w-4 h-4 mr-2" />
                上传文件
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseDetail;
