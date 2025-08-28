
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
  
  const { toast } = useToast();

  // Fetch knowledge bases
  const { data: knowledgeBases = [] } = useQuery({
    queryKey: ['knowledge-bases'],
    queryFn: () => apiClient.getKnowledgeBases(),
    onError: () => {
      console.log('Using mock data for knowledge bases');
      return [
        { id: '1', name: '技术文档', description: '技术相关文档' },
        { id: '2', name: '产品手册', description: '产品使用手册' },
        { id: '3', name: '研发资料', description: '研发相关资料' },
      ];
    }
  });

  // Mock data for demonstration
  const mockTags = ["API", "技术", "产品", "用户指南", "开发", "部署", "配置", "故障排除"];
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
      type: 'document',
      id: '3',
      title: '产品功能概述',
      content: '我们的智能搜索系统提供了强大的文档检索能力，支持全文搜索、语义搜索、标签筛选等多种搜索方式。用户可以快速找到需要的信息。',
      file_path: '/docs/product/overview.md',
      tags: ['产品', '用户指南'],
      score: 0.82,
      highlights: ['智能搜索系统具备多种搜索模式'],
      metadata: { category: '产品介绍', priority: 'high' }
    }
  ];

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // In a real implementation, this would call the API
      // const results = await apiClient.search({
      //   query,
      //   knowledge_base_id: selectedKnowledgeBase === 'all' ? undefined : selectedKnowledgeBase,
      //   result_type: resultType === 'both' ? undefined : resultType,
      //   tags: selectedTags.length > 0 ? selectedTags : undefined,
      // });
      
      // For demo purposes, filter mock results
      const filteredResults = mockResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
                           result.content.toLowerCase().includes(query.toLowerCase());
        const matchesType = resultType === 'both' || result.type === resultType;
        const matchesTags = selectedTags.length === 0 || 
                           selectedTags.some(tag => result.tags?.includes(tag));
        
        return matchesQuery && matchesType && matchesTags;
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSearchResults(filteredResults);
      
      toast({
        title: "搜索完成",
        description: `找到 ${filteredResults.length} 个相关结果`,
      });
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "搜索失败",
        description: "请稍后重试",
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

  // Auto-search on query change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-red-50 to-white">
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Search Header */}
        <SearchHeader
          query={query}
          onQueryChange={setQuery}
          onSearch={performSearch}
          knowledgeBases={knowledgeBases}
          selectedKnowledgeBase={selectedKnowledgeBase}
          onKnowledgeBaseChange={setSelectedKnowledgeBase}
          onManageClick={() => setShowManagement(true)}
        />

        {/* Search Filters */}
        <SearchFilters
          resultType={resultType}
          onResultTypeChange={setResultType}
          selectedTags={selectedTags}
          availableTags={mockTags}
          onTagToggle={handleTagToggle}
          onClearFilters={handleClearFilters}
        />

        {/* Search Results */}
        <SearchResults
          results={searchResults}
          loading={isSearching}
          query={query}
          onViewDetails={handleViewDetails}
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
