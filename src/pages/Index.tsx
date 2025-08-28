
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Database, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchHeader } from "@/components/SearchHeader";
import { SearchFilters } from "@/components/SearchFilters";
import { SearchResults } from "@/components/SearchResults";
import { apiClient } from "@/lib/api";
import { SearchResult } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchParams] = useSearchParams();
  const hideHeader = searchParams.get('hideHeader') === 'true';
  const kbId = searchParams.get('kbId');
  
  const [query, setQuery] = useState("");
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>(kbId || "all");
  const [resultType, setResultType] = useState("both");
  const [searchMode, setSearchMode] = useState("both");
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
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
        limit: searchMode === 'slice' ? 15 : 10, // 切片模式每页15条，其他模式10条
      });
      
      setSearchResults(response.results || []);
      setTotalResults(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / (searchMode === 'slice' ? 15 : 10)));
      setCurrentPage(page);
      
      toast({
        title: "搜索完成",
        description: `找到 ${response.total || 0} 个相关结果`,
      });
    } catch (error) {
      // Enhanced mock data with more results for pagination testing
      const mockResults: SearchResult[] = [
        {
          type: 'document',
          id: 'doc_1',
          title: 'API接口设计规范文档 v2.1',
          content: '本文档详细介绍了**RESTful API**的设计原则和最佳实践。包括HTTP方法的正确使用、状态码规范、请求响应格式等。特别强调了*安全性*和**性能优化**的重要性。\n\n## 核心原则\n\n1. **统一接口**：所有API遵循统一的设计规范\n2. **无状态**：每个请求包含处理所需的所有信息\n3. **可缓存**：响应数据应明确标示是否可缓存\n\n```json\n{\n  "status": 200,\n  "data": {...},\n  "message": "Success"\n}\n```',
          file_path: '/docs/api/design-standards.md',
          tags: ['API', '技术文档', '规范'],
          score: 0.95,
          highlights: ['API设计原则遵循RESTful架构风格，确保系统的可扩展性和维护性', 'HTTP状态码和请求方法的标准化使用提升开发效率'],
          metadata: { author: '技术团队', version: '2.1.0', pages: 45, created_date: '2024-01-15' },
          knowledge_base_id: 'kb_1',
        },
        {
          type: 'slice',
          id: 'slice_1',
          title: '数据库连接池配置最佳实践',
          content: '在生产环境中，**连接池**的合理配置至关重要。以下是推荐的配置参数：\n\n### 连接数配置\n- **最小连接数**：5-10个\n- **最大连接数**：根据并发量调整，通常50-100个\n- **初始连接数**：与最小连接数相同\n\n### 超时设置\n- *连接超时*：30秒\n- *查询超时*：60秒  \n- *空闲超时*：300秒\n\n**注意**：连接池大小应该根据实际的并发用户数和数据库性能来调整。',
          file_path: '/docs/database/config.md',
          tags: ['数据库', '配置', '性能'],
          score: 0.87,
          highlights: ['连接池配置直接影响应用性能和稳定性，需要根据业务场景精确调优'],
          metadata: { chapter: 3, section: '3.2', document_id: 'doc_2', page_number: 23 },
          document_id: 'doc_2',
          chunk_index: 5,
          knowledge_base_id: 'kb_1',
        },
        {
          type: 'image',
          id: 'img_1',
          title: '系统架构设计图 - 微服务版本',
          content: '展示了**微服务架构**的整体设计，包括以下核心组件：\n\n- **API网关**：统一入口，负责路由和鉴权\n- **服务注册中心**：服务发现和健康检查\n- **配置中心**：统一配置管理\n- **消息队列**：异步通信和解耦\n\n该架构图清晰展示了各个微服务之间的*交互关系*和**数据流向**，是团队理解系统架构的重要参考资料。',
          file_path: '/images/architecture-v2.png',
          tags: ['架构', '设计', '微服务'],
          score: 0.82,
          highlights: ['微服务架构模式的完整实现方案，包含服务拆分和通信机制'],
          metadata: { resolution: '1920x1080', format: 'PNG', created_by: '架构师', file_size: '2.1MB' },
          dimensions: { width: 1920, height: 1080 },
          file_size: 2048000,
          knowledge_base_id: 'kb_2',
        },
        {
          type: 'video',
          id: 'vid_1',
          title: '产品演示：核心功能模块介绍',
          content: '详细演示了系统的**核心功能模块**，包括：\n\n## 主要内容\n1. **用户管理**：注册、登录、权限分配\n2. **数据分析**：报表生成、图表展示\n3. **系统监控**：性能指标、日志分析\n\n视频时长25分钟，适合新团队成员快速了解产品特性。*建议*配合文档一起学习，效果更佳。',
          file_path: '/videos/product-demo-2024.mp4',
          tags: ['演示', '培训', '产品'],
          score: 0.78,
          highlights: ['完整展示了产品的主要业务流程和核心功能特性'],
          metadata: { presenter: '产品经理', duration_minutes: 25, quality: '1080p', upload_date: '2024-02-01' },
          duration: 1500,
          dimensions: { width: 1920, height: 1080 },
          file_size: 125829120,
          knowledge_base_id: 'kb_3',
        },
        // 添加更多测试数据用于分页
        ...Array.from({ length: 16 }, (_, i) => ({
          type: i % 2 === 0 ? 'document' : 'slice' as 'document' | 'slice',
          id: `test_${i + 5}`,
          title: `测试文档 ${i + 5} - ${i % 2 === 0 ? '完整文档' : '文档片段'}`,
          content: `这是第 ${i + 5} 个测试${i % 2 === 0 ? '文档' : '片段'}的内容。包含了**重要信息**和*关键数据*。\n\n### 主要特点\n- 功能完整\n- 性能优秀\n- 易于维护\n\n适用于测试搜索和分页功能。`,
          file_path: `/test/doc_${i + 5}.md`,
          tags: ['测试', '示例', i % 3 === 0 ? 'PDF' : 'MD'],
          score: Math.random() * 0.3 + 0.5,
          highlights: [`测试文档${i + 5}包含了完整的功能说明`],
          metadata: { page: i + 5, total_pages: 20 },
          knowledge_base_id: i % 2 === 0 ? 'kb_1' : 'kb_2',
        }))
      ];

      // Filter by search mode, type, tags, and confidence
      let filteredResults = mockResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
                           result.content.toLowerCase().includes(query.toLowerCase());
        const matchesSearchMode = searchMode === 'both' || 
                                 (searchMode === 'document' && result.type !== 'slice') ||
                                 (searchMode === 'slice' && result.type === 'slice');
        const matchesType = resultType === 'both' || 
                           (resultType === 'documents' && result.type !== 'slice') ||
                           (resultType === 'slices' && result.type === 'slice');
        const matchesTags = selectedTags.length === 0 || 
                           selectedTags.some(tag => result.tags?.includes(tag));
        const matchesKB = selectedKnowledgeBase === 'all' || 
                         result.knowledge_base_id === selectedKnowledgeBase;
        const matchesConfidence = result.score >= confidenceThreshold;
        
        return matchesQuery && matchesSearchMode && matchesType && matchesTags && matchesKB && matchesConfidence;
      });

      // Pagination - 根据搜索模式调整每页数量
      const pageSize = searchMode === 'slice' ? 15 : 10;
      const totalFilteredResults = filteredResults.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedResults = filteredResults.slice(startIndex, endIndex);

      setSearchResults(paginatedResults);
      setTotalResults(totalFilteredResults);
      setTotalPages(Math.ceil(totalFilteredResults / pageSize));
      setCurrentPage(page);
      
      toast({
        title: "搜索完成",
        description: `找到 ${totalFilteredResults} 个模拟结果`,
        variant: "default",
      });
    } finally {
      setIsSearching(false);
    }
  }, [query, selectedKnowledgeBase, resultType, searchMode, selectedTags, confidenceThreshold, toast]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setResultType('both');
    setSearchMode('both');
    setConfidenceThreshold(0.5);
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
  }, [query, selectedKnowledgeBase, resultType, searchMode, selectedTags, confidenceThreshold]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-red-50 via-white to-orange-red-50/30">
      {/* Navigation Bar - 可选隐藏 */}
      {!hideHeader && (
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
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-8 max-w-6xl">
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
          showTitle={!hideHeader}
        />

        {/* Search Filters */}
        <SearchFilters
          resultType={resultType}
          onResultTypeChange={setResultType}
          searchMode={searchMode}
          onSearchModeChange={setSearchMode}
          confidenceThreshold={confidenceThreshold}
          onConfidenceThresholdChange={setConfidenceThreshold}
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
          searchMode={searchMode}
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
