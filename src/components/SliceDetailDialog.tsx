
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, Tag, MapPin, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  allSlices: SearchResult[];
  onNavigate: (slice: SearchResult) => void;
}

export function SliceDetailDialog({
  isOpen,
  onClose,
  slice,
  query,
  allSlices,
  onNavigate
}: SliceDetailDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slice && allSlices.length > 0) {
      const index = allSlices.findIndex(s => s.id === slice.id);
      setCurrentIndex(index !== -1 ? index : 0);
    }
  }, [slice, allSlices]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const previousSlice = allSlices[currentIndex - 1];
      onNavigate(previousSlice);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < allSlices.length - 1) {
      const nextSlice = allSlices[currentIndex + 1];
      onNavigate(nextSlice);
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!slice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              切片详情
            </DialogTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {currentIndex + 1} / {allSlices.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex === allSlices.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* Document Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{slice.title}</h3>
                    {slice.file_path && (
                      <p className="text-sm text-gray-600">{slice.file_path}</p>
                    )}
                  </div>
                </div>

                {/* Slice Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {slice.chunk_index !== undefined && (
                    <span>切片 #{slice.chunk_index + 1}</span>
                  )}
                  {slice.metadata?.page_number && (
                    <span>第 {slice.metadata.page_number} 页</span>
                  )}
                  {slice.score && (
                    <span>匹配度: {Math.round(slice.score * 100)}%</span>
                  )}
                </div>

                {/* Tags */}
                {slice.tags && slice.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-gray-500" />
                    {slice.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Highlights */}
              {slice.highlights && slice.highlights.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    关键匹配片段
                  </h4>
                  <div className="space-y-2">
                    {slice.highlights.map((highlight, index) => (
                      <div key={index} className="text-sm text-yellow-700">
                        "
                        <MarkdownHighlight 
                          content={highlight} 
                          query={query}
                          className="inline"
                        />
                        "
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">切片内容</h4>
                <div className="bg-white border rounded-lg p-6">
                  <MarkdownHighlight 
                    content={slice.content} 
                    query={query}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              </div>

              {/* Additional Metadata */}
              {slice.metadata && Object.keys(slice.metadata).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">附加信息</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(slice.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <div className="font-medium text-gray-900">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Navigation Footer */}
        <div className="flex-shrink-0 border-t pt-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            上一个切片
          </Button>
          
          <span className="text-sm text-gray-500">
            切片 {currentIndex + 1} / {allSlices.length}
          </span>
          
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === allSlices.length - 1}
            className="flex items-center gap-2"
          >
            下一个切片
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
