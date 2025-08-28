
import { Search, Database, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  knowledgeBases: any[];
  selectedKnowledgeBase?: string;
  onKnowledgeBaseChange: (id: string) => void;
  onManageClick: () => void;
  isLoadingKnowledgeBases?: boolean;
}

export function SearchHeader({
  query,
  onQueryChange,
  onSearch,
  knowledgeBases = [],
  selectedKnowledgeBase,
  onKnowledgeBaseChange,
  onManageClick,
  isLoadingKnowledgeBases = false,
}: SearchHeaderProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  // Ensure knowledgeBases is always an array
  const safeKnowledgeBases = Array.isArray(knowledgeBases) ? knowledgeBases : [];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 search-gradient rounded-xl flex items-center justify-center text-white text-xl font-bold">
            超
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">超融合智能搜索系统</h1>
        <p className="text-gray-600">基于知识库的智能文档检索平台</p>
      </div>

      {/* Knowledge Base Selector */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-gray-700">
          <Database className="w-5 h-5" />
          <span className="font-medium">知识库:</span>
        </div>
        <Select value={selectedKnowledgeBase} onValueChange={onKnowledgeBaseChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder={isLoadingKnowledgeBases ? "加载中..." : "选择知识库"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部知识库</SelectItem>
            {safeKnowledgeBases.map((kb) => (
              <SelectItem key={kb.id} value={kb.id}>
                {kb.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={onManageClick}
          className="ml-auto"
        >
          <Settings className="w-4 h-4 mr-2" />
          管理
        </Button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="输入关键词开始智能搜索..."
            className="pl-12 pr-24 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 search-gradient hover:opacity-90 transition-opacity"
          >
            搜索
          </Button>
        </div>
      </form>
    </div>
  );
}
