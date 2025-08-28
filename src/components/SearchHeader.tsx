
import { Search, Database } from "lucide-react";
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
  showTitle?: boolean;
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
  showTitle = true,
}: SearchHeaderProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const safeKnowledgeBases = Array.isArray(knowledgeBases) ? knowledgeBases : [];

  return (
    <div className="w-full space-y-6">
      {showTitle && (
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 search-gradient rounded-xl flex items-center justify-center text-white text-xl font-bold">
              超
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">超融合智能搜索系统</h1>
          <p className="text-gray-600">基于向量数据库和语义理解的企业级知识检索平台</p>
        </div>
      )}

      {/* Knowledge Base Selector - 移到顶部 */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="flex items-center gap-3 text-gray-700">
          <Database className="w-5 h-5" />
          <span className="font-medium">知识库:</span>
        </div>
        <Select value={selectedKnowledgeBase} onValueChange={onKnowledgeBaseChange}>
          <SelectTrigger className="w-80">
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
      </div>

      {/* Search Form - 增加高度 */}
      <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="输入关键词开始智能搜索..."
            className="pl-14 pr-28 py-6 text-lg rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-16"
          />
          <Button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 search-gradient hover:opacity-90 transition-opacity px-8 py-3 h-10"
          >
            搜索
          </Button>
        </div>
      </form>
    </div>
  );
}
