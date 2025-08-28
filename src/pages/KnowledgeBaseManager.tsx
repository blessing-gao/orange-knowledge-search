
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Database, FileText, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { KnowledgeBase } from "@/types/api";

const KnowledgeBaseManager = () => {
  const [selectedKB, setSelectedKB] = useState<string | null>(null);

  const { data: knowledgeBases = [], isLoading } = useQuery({
    queryKey: ['knowledge-bases'],
    queryFn: () => apiClient.getKnowledgeBases(),
  });

  // Mock data for demonstration
  const mockKnowledgeBases: KnowledgeBase[] = [
    {
      id: 'kb_1',
      name: 'API技术文档',
      description: '包含所有API接口设计文档、开发规范和最佳实践指南',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T15:30:00Z',
      document_count: 45,
      file_count: 128,
      source_path: '/docs/api'
    },
    {
      id: 'kb_2',
      name: '产品设计资料',
      description: '产品原型、UI设计稿、交互说明和用户体验研究报告',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-22T11:45:00Z',
      document_count: 67,
      file_count: 234,
      source_path: '/design/product'
    },
    {
      id: 'kb_3',
      name: '培训视频库',
      description: '员工培训视频、产品演示和技术分享录像',
      created_at: '2024-01-05T14:20:00Z',
      updated_at: '2024-01-18T16:10:00Z',
      document_count: 23,
      file_count: 89,
      source_path: '/videos/training'
    }
  ];

  const displayKnowledgeBases = knowledgeBases.length > 0 ? knowledgeBases : mockKnowledgeBases;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-red-50 via-white to-orange-red-50/30">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回搜索
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">知识库管理</h1>
            </div>
            <Button className="search-gradient">
              <Plus className="w-4 h-4 mr-2" />
              创建知识库
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">总知识库数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{displayKnowledgeBases.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">总文档数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {displayKnowledgeBases.reduce((sum, kb) => sum + (kb.document_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">总文件数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {displayKnowledgeBases.reduce((sum, kb) => sum + (kb.file_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Knowledge Base List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayKnowledgeBases.map((kb) => (
            <Card key={kb.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    <Database className="w-6 h-6" />
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg font-semibold line-clamp-1">{kb.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">{kb.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{kb.document_count || 0} 文档</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(kb.updated_at)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {kb.file_count || 0} 个文件
                  </Badge>
                  {kb.source_path && (
                    <Badge variant="outline" className="text-xs">
                      {kb.source_path}
                    </Badge>
                  )}
                </div>

                <Link to={`/knowledge-bases/${kb.id}`} className="block">
                  <Button className="w-full mt-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    查看详情
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayKnowledgeBases.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Database className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">还没有知识库</h3>
            <p className="text-gray-600 mb-8">创建你的第一个知识库开始使用智能搜索功能</p>
            <Button className="search-gradient">
              <Plus className="w-4 h-4 mr-2" />
              创建知识库
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;
