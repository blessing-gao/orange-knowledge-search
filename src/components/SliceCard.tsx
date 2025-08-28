
import { Layers, Eye, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchResult } from "@/types/api";
import { MarkdownHighlight } from "./MarkdownHighlight";

interface SliceCardProps {
  result: SearchResult;
  query: string;
  onViewDetails: (result: SearchResult) => void;
}

export function SliceCard({ result, query, onViewDetails }: SliceCardProps) {
  return (
    <div className="search-card p-6 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-green-600" />
          </div>
          <Badge variant="outline" className="text-xs font-medium bg-green-50 text-green-700 border-green-200">
            切片
          </Badge>
        </div>
        <span className="text-xs font-medium text-primary">
          {Math.round(result.score * 100)}%
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 flex-shrink-0">
        <MarkdownHighlight content={result.title} query={query} />
      </h3>

      {/* Content Preview */}
      <div className="flex-1 mb-4">
        <div className="text-gray-700 text-sm leading-relaxed line-clamp-4">
          <MarkdownHighlight content={result.content} query={query} />
        </div>
      </div>

      {/* Highlights */}
      {result.highlights && result.highlights.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="text-xs text-green-700 line-clamp-2">
            "<MarkdownHighlight content={result.highlights[0]} query={query} />"
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        {result.metadata?.page_number && (
          <span>第 {result.metadata.page_number} 页</span>
        )}
        {result.chunk_index !== undefined && (
          <span>片段 {result.chunk_index + 1}</span>
        )}
      </div>

      {/* Tags */}
      {result.tags && result.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-4">
          {result.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
          {result.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{result.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Action Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewDetails(result)}
        className="w-full mt-auto"
      >
        <Eye className="w-4 h-4 mr-2" />
        查看详情
      </Button>
    </div>
  );
}
