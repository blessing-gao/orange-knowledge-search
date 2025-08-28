import { FileText, Layers, Image, Video, ExternalLink, Eye, Calendar, User, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchResult } from "@/types/api";
import { MarkdownHighlight } from "./MarkdownHighlight";

interface ResultTypeCardProps {
  result: SearchResult;
  query: string;
  onViewDetails: (result: SearchResult) => void;
  index: number;
}

export function ResultTypeCard({ result, query, onViewDetails, index }: ResultTypeCardProps) {
  const getTypeIcon = () => {
    switch (result.type) {
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'slice':
        return <Layers className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeName = () => {
    switch (result.type) {
      case 'document':
        return '文档';
      case 'slice':
        return '切片';
      case 'image':
        return '图片';
      case 'video':
        return '视频';
      default:
        return '文档';
    }
  };

  const getTypeColor = () => {
    switch (result.type) {
      case 'document':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'slice':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'image':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'video':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div
      className="search-card p-8 hover:shadow-xl transition-all duration-300 animate-slide-up border-l-4 border-l-primary/20"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-6">
        {/* Type Icon with gradient background */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 search-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
            {getTypeIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 break-words leading-tight">
                <MarkdownHighlight content={result.title} query={query} />
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <Badge variant="outline" className={`text-xs font-medium ${getTypeColor()}`}>
                  {getTypeName()}
                </Badge>
                {result.file_path && (
                  <span className="flex items-center gap-1.5 truncate max-w-xs">
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{result.file_path}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-medium">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  匹配度: {Math.round(result.score * 100)}%
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(result)}
                className="flex-shrink-0 hover:bg-primary/5"
              >
                <Eye className="w-4 h-4 mr-1.5" />
                查看详情
              </Button>
              {(result.type === 'image' || result.type === 'video') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Media Preview for images and videos */}
          {(result.type === 'image' || result.type === 'video') && result.file_path && (
            <div className="mb-4">
              <div className="relative bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
                {result.type === 'image' ? (
                  <div className="flex items-center gap-3">
                    <Image className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">图片预览</p>
                      <p className="text-xs text-gray-500">点击查看详情以预览图片</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Video className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">视频文件</p>
                      <p className="text-xs text-gray-500">点击查看详情以播放视频</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Preview with Markdown highlighting */}
          <div className="mb-6">
            <div className="text-gray-700 leading-relaxed text-base line-clamp-3">
              <MarkdownHighlight content={result.content} query={query} />
            </div>
            {result.highlights && result.highlights.length > 0 && (
              <div className="mt-3 p-3 bg-orange-red-50 rounded-lg border border-orange-red-100">
                <span className="text-sm font-medium text-orange-red-800 block mb-1">相关片段:</span>
                <div className="space-y-1">
                  {result.highlights.slice(0, 2).map((highlight, idx) => (
                    <div key={idx} className="text-sm text-orange-red-700">
                      "<MarkdownHighlight content={highlight} query={query} />"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          {result.metadata && (
            <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-500">
              {result.metadata.author && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {result.metadata.author}
                </span>
              )}
              {result.metadata.version && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  版本 {result.metadata.version}
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {result.tags && result.tags.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {result.tags.slice(0, 6).map((tag) => (
                  <span key={tag} className="knowledge-tag">
                    {tag}
                  </span>
                ))}
                {result.tags.length > 6 && (
                  <span className="text-xs text-gray-400">
                    +{result.tags.length - 6} 个标签
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
