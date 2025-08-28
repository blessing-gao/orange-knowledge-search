
import { FileText, Layers, Clock, Tag, ExternalLink, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchResult } from "@/types/api";

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  onViewDetails: (result: SearchResult) => void;
}

export function SearchResults({ results, loading, query, onViewDetails }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="search-card p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="search-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关结果</h3>
          <p className="text-gray-600 mb-4">
            尝试使用不同的关键词或调整筛选条件
          </p>
          <div className="text-sm text-gray-500">
            搜索建议：
            <ul className="mt-2 space-y-1">
              <li>• 检查关键词拼写</li>
              <li>• 尝试更通用的词汇</li>
              <li>• 使用不同的标签筛选</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="search-highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Results Summary */}
      <div className="text-sm text-gray-600 mb-6">
        找到 <span className="font-semibold text-primary">{results.length}</span> 个相关结果
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={`${result.type}-${result.id}`}
            className="search-card p-6 hover:shadow-lg transition-all duration-200 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-4">
              {/* Type Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 search-gradient rounded-lg flex items-center justify-center text-white">
                  {result.type === 'document' ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <Layers className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 break-words">
                      {highlightText(result.title, query)}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Badge variant="outline" className="text-xs">
                        {result.type === 'document' ? '文档' : '片段'}
                      </Badge>
                      {result.file_path && (
                        <span className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {result.file_path}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        匹配度: {Math.round(result.score * 100)}%
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(result)}
                    className="flex-shrink-0"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    详情
                  </Button>
                </div>

                {/* Content Preview */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed line-clamp-3">
                    {highlightText(result.content, query)}
                  </p>
                  {result.highlights && result.highlights.length > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">相关片段: </span>
                      {result.highlights.slice(0, 2).map((highlight, idx) => (
                        <span key={idx} className="inline-block mr-2">
                          "{highlightText(highlight, query)}"
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {result.tags && result.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-gray-400" />
                    {result.tags.map((tag) => (
                      <span key={tag} className="knowledge-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
