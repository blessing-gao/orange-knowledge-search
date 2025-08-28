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
      setAvailableTags(["PDF", "DOC", "DOCX", "TXT", "MD", "API", "技术", "产品", "用户指南"]);
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
      // Fallback to mock data for demo purposes
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
        }
      ];

      const filteredResults = mockResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
                           result.content.toLowerCase().includes(query.toLowerCase());
        const matchesType = resultType === 'both' || result.type === resultType;
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
    <div className="min-h-screen bg-gradient-to-b from-orange-red-50 to-white">
      <div className="container mx-auto px-4 py-12 space-y-8">
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

        {/* Empty State */}
        {!query && (
          <div className="w-full max-w-4xl mx-auto text-center py-16">
            <div className="search-card p-8">
              <div className="w-20 h-20 mx-auto mb-6 search-gradient rounded-full flex items-center justify-center text-white text-2xl font-bold animate-pulse-orange">
                搜
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                开始您的智能搜索
              </h3>
              <p className="text-gray-600 mb-6">
                输入关键词来搜索文档和知识片段，我们的AI将为您找到最相关的内容
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>全文智能检索</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>多知识库支持</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>标签筛选功能</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
