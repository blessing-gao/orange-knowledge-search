
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Database, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchHeader } from "@/components/SearchHeader";
import { SearchFilters } from "@/components/SearchFilters";
import { SearchResults } from "@/components/SearchResults";
import { apiClient } from "@/lib/api";
import { SearchResult } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [query, setQuery] = useState("");
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>("all");
  const [resultType, setResultType] = useState("both");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Fetch knowledge bases with proper error handling
  const { data: knowledgeBases = [], error: knowledgeBasesError, isLoading: isLoadingKB } = useQuery({
    queryKey: ['knowledge-bases'],
    queryFn: async () => {
      try {
        console.log('Fetching knowledge bases...');
        const result = await apiClient.getKnowledgeBases();
        console.log('Knowledge bases fetched:', result);
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('Failed to fetch knowledge bases:', error);
        // Return empty array as fallback
        return [];
      }
    },
  });

  // Fetch tags based on selected knowledge base
  const { data: tags = [] } = useQuery({
    queryKey: ['tags', selectedKnowledgeBase],
    queryFn: () => apiClient.getTags(selectedKnowledgeBase === 'all' ? undefined : selectedKnowledgeBase),
    enabled: true,
  });

  // Update available tags when tags data changes
  useEffect(() => {
    if (tags && tags.length > 0) {
      setAvailableTags(tags);
    } else {
      // Fallback tags based on common file types
      setAvailableTags(["PDF", "DOC", "DOCX", "TXT", "MD", "API", "技术", "产品", "用户指南", "图片", "视频"]);
    }
  }, [tags]);

  // Handle knowledge base fetch error with fallback data
  useEffect(() => {
    if (knowledgeBasesError) {
      console.log('Failed to fetch knowledge bases, using mock data:', knowledgeBasesError);
      toast({
        title: "连接提示",
        description: "无法连接到后端服务，正在使用模拟数据",
        variant: "destructive",
      });
    }
  }, [knowledgeBasesError, toast]);

  const performSearch = useCallback(async (page: number = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setTotalPages(0);
      setTotalResults(0);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiClient.search({
        query,
        knowledge_base_id: selectedKnowledgeBase === 'all' ? undefined : selectedKnowledgeBase,
        result_type: resultType === 'both' ? undefined : resultType,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        page,
        limit: 10,
      });
      
      setSearchResults(response.results || []);
      setTotalResults(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / 10));
      setCurrentPage(page);
      
      toast({
        title: "搜索完成",
        description: `找到 ${response.total || 0} 个相关结果`,
      });
    } catch (error) {
      // Enhanced mock data with different types and proper highlights
      const mockResults: SearchResult[] = [
        {
          type: 'document',
          id: 'doc_1',
          title: 'API接口设计规范文档',
          content: '本文档详细介绍了RESTful API的设计原则和最佳实践。包括HTTP方法的正确使用、状态码规范、请求响应格式等。特别强调了**安全性**和*性能优化*的重要性。\n\n```json\n{\n  "status": 200,\n  "data": {...}\n}\n```',
          file_path: '/docs/api/design-standards.md',
          tags: ['API', '技术文档', '规范'],
          score: 0.95,
          highlights: ['API设计原则遵循RESTful架构风格', 'HTTP状态码和请求方法的标准化使用'],
          metadata: { author: '技术团队', version: '2.1.0', pages: 45 },
          knowledge_base_id: 'kb_1',
        },
        {
          type: 'slice',
          id: 'slice_1',
          title: '数据库连接池配置 - 第3章节',
          content: '在生产环境中，**连接池**的合理配置至关重要。建议最小连接数设为5，最大连接数根据并发量调整，通常不超过100。\n\n*超时设置*：\n- 连接超时：30秒\n- 查询超时：60秒\n- 空闲超时：300秒',
          file_path: '/docs/database/config.md',
          tags: ['数据库', '配置', '性能'],
          score: 0.87,
          highlights: ['连接池配置直接影响应用性能和稳定性'],
          metadata: { chapter: 3, section: '3.2', document_id: 'doc_2' },
          document_id: 'doc_2',
          chunk_index: 5,
          knowledge_base_id: 'kb_1',
        },
        {
          type: 'image',
          id: 'img_1',
          title: '系统架构设计图',
          content: '展示了**微服务架构**的整体设计，包括API网关、服务注册中心、配置中心等核心组件的交互关系。',
          file_path: '/images/architecture-v2.png',
          tags: ['架构', '设计', '微服务'],
          score: 0.82,
          highlights: ['微服务架构模式的完整实现方案'],
          metadata: { resolution: '1920x1080', format: 'PNG', created_by: '架构师' },
          dimensions: { width: 1920, height: 1080 },
          file_size: 2048000,
          knowledge_base_id: 'kb_2',
        },
        {
          type: 'video',
          id: 'vid_1',
          title: '产品演示：核心功能介绍',
          content: '详细演示了系统的**核心功能模块**，包括用户管理、权限控制、数据分析等。适合新团队成员快速了解产品特性。',
          file_path: '/videos/product-demo-2024.mp4',
          tags: ['演示', '培训', '产品'],
          score: 0.78,
          highlights: ['完整展示了产品的主要业务流程'],
          metadata: { presenter: '产品经理', duration_minutes: 25, quality: '1080p' },
          duration: 1500,
          dimensions: { width: 1920, height: 1080 },
          file_size: 125829120,
          knowledge_base_id: 'kb_3',
        }
      ];

      // Filter by search type and tags
      const filteredResults = mockResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
                           result.content.toLowerCase().includes(query.toLowerCase());
        const matchesType = resultType === 'both' || 
                           (resultType === 'documents' && result.type === 'document') ||
                           (resultType === 'slices' && result.type === 'slice') ||
                           (resultType === 'images' && result.type === 'image') ||
                           (resultType === 'videos' && result.type === 'video');
        const matchesTags = selectedTags.length === 0 || 
                           selectedTags.some(tag => result.tags?.includes(tag));
        const matchesKB = selectedKnowledgeBase === 'all' || 
                         result.knowledge_base_id === selectedKnowledgeBase;
        
        return matchesQuery && matchesType && matchesTags && matchesKB;
      });

      setSearchResults(filteredResults);
      setTotalResults(filteredResults.length);
      setTotalPages(1);
      setCurrentPage(1);
      
      toast({
        title: "搜索完成",
        description: `找到 ${filteredResults.length} 个模拟结果`,
        variant: "default",
      });
    } finally {
      setIsSearching(false);
    }
  }, [query, selectedKnowledgeBase, resultType, selectedTags, toast]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setResultType('both');
    setSelectedTags([]);
  };

  const handleViewDetails = (result: SearchResult) => {
    toast({
      title: "查看详情",
      description: `正在打开: ${result.title}`,
    });
    // In a real app, this would navigate to a detail view
  };

  const handlePageChange = (page: number) => {
    performSearch(page);
  };

  // Auto-search on query change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedKnowledgeBase, resultType, selectedTags]); // Remove performSearch dependency to avoid infinite loop

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-red-50 via-white to-orange-red-50/30">
      {/* Navigation Bar */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 search-gradient rounded-lg flex items-center justify-center text-white text-sm font-bold">
                超
              </div>
              <span className="font-semibold text-gray-900">超融合智能搜索</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/knowledge-bases">
                <Button variant="ghost" size="sm">
                  <Database className="w-4 h-4 mr-2" />
                  知识库管理
                </Button>
              </Link>
              <Link to="/tasks">
                <Button variant="ghost" size="sm">
                  <List className="w-4 h-4 mr-2" />
                  任务管理
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 space-y-10 max-w-6xl">
        {/* Search Header */}
        <SearchHeader
          query={query}
          onQueryChange={setQuery}
          onSearch={() => performSearch(1)}
          knowledgeBases={knowledgeBases}
          selectedKnowledgeBase={selectedKnowledgeBase}
          onKnowledgeBaseChange={setSelectedKnowledgeBase}
          onManageClick={() => {}}
          isLoadingKnowledgeBases={isLoadingKB}
        />

        {/* Search Filters */}
        <SearchFilters
          resultType={resultType}
          onResultTypeChange={setResultType}
          selectedTags={selectedTags}
          availableTags={availableTags}
          onTagToggle={handleTagToggle}
          onClearFilters={handleClearFilters}
        />

        {/* Search Results */}
        <SearchResults
          results={searchResults}
          loading={isSearching}
          query={query}
          onViewDetails={handleViewDetails}
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalResults}
          onPageChange={handlePageChange}
        />

        {/* Enhanced Empty State */}
        {!query && (
          <div className="w-full text-center py-20">
            <div className="search-card p-12 bg-gradient-to-br from-white to-gray-50">
              <div className="w-28 h-28 mx-auto mb-8 search-gradient rounded-2xl flex items-center justify-center text-white text-3xl font-bold animate-pulse-orange shadow-2xl">
                AI
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                智能搜索引擎
              </h3>
              <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                基于向量数据库和语义理解的企业级知识检索平台，支持多模态内容智能搜索
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {[
                  { icon: "📄", title: "文档搜索", desc: "全文智能检索" },
                  { icon: "🧩", title: "内容切片", desc: "精准片段匹配" },
                  { icon: "🖼️", title: "图片识别", desc: "视觉内容分析" },
                  { icon: "🎥", title: "视频检索", desc: "多媒体内容搜索" }
                ].map((feature, index) => (
                  <div key={index} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
