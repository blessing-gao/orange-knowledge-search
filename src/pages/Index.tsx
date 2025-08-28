import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { KnowledgeBase, SearchResult } from "@/types/api";
import { SearchResults } from "@/components/SearchResults";
import { SearchFilters } from "@/components/SearchFilters";
import { useDebounce } from "@/hooks/use-debounce";
import { SliceDetailDialog } from "@/components/SliceDetailDialog";

interface SearchHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  loading: boolean;
}

function SearchHeader({ query, onQueryChange, onSearch, loading }: SearchHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Input
        type="search"
        placeholder="输入关键词进行搜索..."
        className="h-11 flex-1"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch();
          }
        }}
      />
      <Button onClick={onSearch} disabled={loading}>
        搜索
      </Button>
    </div>
  );
}

export default function Index() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>("all");
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [resultType, setResultType] = useState<string>("slice");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const debouncedQuery = useDebounce(query, 300);
  const [selectedSlice, setSelectedSlice] = useState<SearchResult | null>(null);
  const [isSliceDialogOpen, setIsSliceDialogOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<string>("both");
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.5);

  const fetchKnowledgeBases = useCallback(async () => {
    try {
      const kbs = await apiClient.getKnowledgeBases();
      setKnowledgeBases(kbs);
    } catch (error) {
      console.error("Failed to fetch knowledge bases:", error);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const tags = await apiClient.getTags(selectedKnowledgeBase === "all" ? undefined : selectedKnowledgeBase);
      setAvailableTags(tags);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  }, [selectedKnowledgeBase]);

  useEffect(() => {
    fetchKnowledgeBases();
    fetchTags();
  }, [fetchKnowledgeBases, fetchTags]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setCurrentPage(1); // Reset to first page on new search

    try {
      const searchParams = {
        query: debouncedQuery,
        knowledge_base_id: selectedKnowledgeBase === "all" ? undefined : selectedKnowledgeBase,
        tags: selectedTags,
        result_type: resultType,
        page: 1, // Start from page 1
      };

      const response = await apiClient.search(searchParams);
      setResults(response.results);
      setTotalPages(response.total_pages || 1);
      setTotalResults(response.total);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedKnowledgeBase, selectedTags, resultType]);

  const handlePageChange = useCallback(async (page: number) => {
    setLoading(true);
    setCurrentPage(page);

    try {
      const searchParams = {
        query: debouncedQuery,
        knowledge_base_id: selectedKnowledgeBase === "all" ? undefined : selectedKnowledgeBase,
        tags: selectedTags,
        result_type: resultType,
        page: page,
      };

      const response = await apiClient.search(searchParams);
      setResults(response.results);
      setTotalPages(response.total_pages || 1);
      setTotalResults(response.total);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedKnowledgeBase, selectedTags, resultType]);

  useEffect(() => {
    if (debouncedQuery) {
      handleSearch();
    } else {
      setResults([]);
      setTotalPages(1);
      setTotalResults(0);
    }
  }, [debouncedQuery, handleSearch]);

  const handleViewDetails = (result: SearchResult) => {
    console.log('Viewing details for:', result);
    if (result.type === 'slice') {
      setSelectedSlice(result);
      setIsSliceDialogOpen(true);
    } else {
      // Handle document details (existing functionality)
      console.log('Document details not implemented yet');
    }
  };

  const handleSliceNavigate = (slice: SearchResult) => {
    setSelectedSlice(slice);
  };

  const handleCloseSliceDialog = () => {
    setIsSliceDialogOpen(false);
    setSelectedSlice(null);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setResultType("both");
    setSearchMode("both");
    setConfidenceThreshold(0.5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-red-50 via-white to-orange-red-50/30">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">智能搜索</span>
              </Link>
              
              {/* Knowledge Base Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">知识库:</span>
                <Select value={selectedKnowledgeBase} onValueChange={setSelectedKnowledgeBase}>
                  <SelectTrigger className="w-48 h-9">
                    <SelectValue placeholder="选择知识库..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部知识库</SelectItem>
                    {knowledgeBases.map((kb) => (
                      <SelectItem key={kb.id} value={kb.id}>
                        {kb.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <nav className="flex items-center gap-6">
              <Link to="/knowledge-bases" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                知识库管理
              </Link>
              <Link to="/tasks" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                任务管理
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Search Header */}
        <SearchHeader
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Search Filters */}
        {(query || results.length > 0) && (
          <div className="mb-8">
            <SearchFilters
              resultType={resultType}
              onResultTypeChange={setResultType}
              selectedTags={selectedTags}
              availableTags={availableTags}
              onTagToggle={handleTagToggle}
              onClearFilters={handleClearFilters}
              searchMode={searchMode}
              onSearchModeChange={setSearchMode}
              confidenceThreshold={confidenceThreshold}
              onConfidenceThresholdChange={setConfidenceThreshold}
            />
          </div>
        )}

        {/* Search Results */}
        {(query || results.length > 0) && (
          <SearchResults
            results={results}
            loading={loading}
            query={query}
            onViewDetails={handleViewDetails}
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={totalResults}
            onPageChange={handlePageChange}
            searchMode={resultType}
          />
        )}
      </div>

      {/* Slice Detail Dialog */}
      <SliceDetailDialog
        isOpen={isSliceDialogOpen}
        onClose={handleCloseSliceDialog}
        slice={selectedSlice}
        query={query}
        allSlices={results.filter(r => r.type === 'slice')}
        onNavigate={handleSliceNavigate}
      />
    </div>
  );
}
