import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const [showManagement, setShowManagement] = useState(false);
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
      console.log('Performing search with params:', {
        query,
        knowledge_base_id: selectedKnowledgeBase === 'all' ? undefined : selectedKnowledgeBase,
        result_type: resultType === 'both' ? undefined : resultType,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        page,
        limit: 10,
      });

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
      console.error('Search failed:', error);
      // Enhanced mock data with different media types
      const mockResults: SearchResult[] = [
        {
          type: 'document',
          id: '1',
          title: 'API接口文档 - 用户认证模块',
          content: '本文档详细介绍了用户认证相关的API接口，包括登录、注册、密码重置等功能。支持多种认证方式，包括用户名密码、手机号验证码、第三方登录等。',
          file_path: '/docs/api/auth.md',
          tags: ['API', '技术', '用户指南'],
          score: 0.95,
          highlights: ['用户认证模块提供了完整的身份验证功能', 'API接口支持RESTful设计规范'],
          metadata: { author: '技术团队', version: '1.2.0' }
        },
        {
          type: 'slice',
          id: '2',
          title: '数据库配置说明',
          content: '在生产环境中部署应用时，需要正确配置数据库连接参数。建议使用连接池来优化数据库性能，同时确保设置适当的超时时间和重试机制。',
          file_path: '/docs/deployment/database.md',
          tags: ['配置', '部署', '技术'],
          score: 0.87,
          highlights: ['数据库连接池配置对性能至关重要'],
          metadata: { section: '部署配置', chapter: 3 }
        },
        {
          type: 'image',
          id: '3',
          title: '系统架构图',
          content: '展示了整个系统的架构设计，包括前端、后端、数据库和缓存层的关系。',
          file_path: '/images/architecture-diagram.png',
          tags: ['架构', '图片', '设计'],
          score: 0.82,
          highlights: ['清晰展示了微服务架构的各个组件'],
          metadata: { author: '架构师', created_date: '2024-01-15' },
          dimensions: { width: 1920, height: 1080 },
          file_size: 2048000
        },
        {
          type: 'video',
          id: '4',
          title: '产品功能演示视频',
          content: '详细演示了产品的核心功能和用户操作流程，适合新用户快速了解产品特性。',
          file_path: '/videos/product-demo.mp4',
          tags: ['演示', '视频', '产品'],
          score: 0.78,
          highlights: ['完整的功能演示流程'],
          metadata: { author: '产品团队', duration_minutes: 15 },
          duration: 900,
          dimensions: { width: 1280, height: 720 },
          file_size: 52428800
        }
      ];

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
        
        return matchesQuery && matchesType && matchesTags;
      });

      setSearchResults(filteredResults);
      setTotalResults(filteredResults.length);
      setTotalPages(1);
      setCurrentPage(1);
      
      toast({
        title: "搜索失败",
        description: "无法连接到后端，显示模拟数据",
        variant: "destructive",
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
      <div className="container mx-auto px-6 py-16 space-y-10">
        {/* Search Header */}
        <SearchHeader
          query={query}
          onQueryChange={setQuery}
          onSearch={() => performSearch(1)}
          knowledgeBases={knowledgeBases}
          selectedKnowledgeBase={selectedKnowledgeBase}
          onKnowledgeBaseChange={setSelectedKnowledgeBase}
          onManageClick={() => setShowManagement(true)}
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
          <div className="w-full max-w-6xl mx-auto text-center py-20">
            <div className="search-card p-12 bg-gradient-to-br from-white to-gray-50">
              <div className="w-28 h-28 mx-auto mb-8 search-gradient rounded-2xl flex items-center justify-center text-white text-3xl font-bold animate-pulse-orange shadow-2xl">
                AI
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                智能搜索引擎
              </h3>
              <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                体验强大的AI驱动搜索功能，支持文档、切片、图片、视频等多种内容类型的智能检索
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
