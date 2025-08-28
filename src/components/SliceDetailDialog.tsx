
import React from 'react';
import { ChevronLeft, ChevronRight, X, FileText, Tag, Hash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchResult } from '@/types/api';
import { MarkdownHighlight } from './MarkdownHighlight';

interface SliceDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  slice: SearchResult | null;
  query: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function SliceDetailDialog({
  isOpen,
  onClose,
  slice,
  query,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: SliceDetailDialogProps) {
  if (!slice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Tags */}
              {slice.tags && slice.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {slice.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Title */}
              <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                <MarkdownHighlight content={slice.title} query={query} />
              </DialogTitle>
              
              {/* Document Path */}
              {slice.file_path && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <FileText className="w-4 h-4" />
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {slice.file_path}
                  </span>
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {slice.metadata?.page_number && (
                  <span>第 {slice.metadata.page_number} 页</span>
                )}
                {slice.chunk_index !== undefined && (
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    <span>片段 {slice.chunk_index + 1}</span>
                  </div>
                )}
                <span className="text-primary font-medium">
                  匹配度: {Math.round(slice.score * 100)}%
                </span>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                disabled={!hasPrevious}
              >
                <ChevronLeft className="w-4 h-4" />
                上一个
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!hasNext}
              >
                下一个
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6 flex-1">
          <ScrollArea className="h-[60vh]">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <MarkdownHighlight 
                content={slice.content} 
                query={query}
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
              />
            </div>

            {/* Highlights - 如果有的话，显示在内容下方 */}
            {slice.highlights && slice.highlights.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">关键片段</h4>
                <div className="space-y-2">
                  {slice.highlights.map((highlight, index) => (
                    <div key={index} className="text-sm text-yellow-700 italic">
                      "<MarkdownHighlight content={highlight} query={query} />"
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Metadata - 如果需要的话 */}
            {slice.metadata && Object.keys(slice.metadata).length > 1 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">元数据</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(slice.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium text-gray-600">{key}:</span>
                        <span className="ml-2 text-gray-800">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
