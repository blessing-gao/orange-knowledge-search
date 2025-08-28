
import { Filter, X, FileText, Layers, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface SearchFiltersProps {
  resultType: string;
  onResultTypeChange: (type: string) => void;
  selectedTags: string[];
  availableTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
  searchMode: string;
  onSearchModeChange: (mode: string) => void;
  confidenceThreshold: number;
  onConfidenceThresholdChange: (threshold: number) => void;
}

export function SearchFilters({
  resultType,
  onResultTypeChange,
  selectedTags,
  availableTags,
  onTagToggle,
  onClearFilters,
  searchMode,
  onSearchModeChange,
  confidenceThreshold,
  onConfidenceThresholdChange,
}: SearchFiltersProps) {
  const hasActiveFilters = resultType !== 'both' || selectedTags.length > 0 || searchMode !== 'both' || confidenceThreshold !== 0.5;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="search-card p-6">
        <div className="space-y-6">
          {/* 第一行：基础筛选 */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter className="w-5 h-5" />
              <span className="font-medium">筛选条件</span>
            </div>

            {/* 搜索模式 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 whitespace-nowrap">搜索模式:</span>
              <Select value={searchMode} onValueChange={onSearchModeChange}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">全部</SelectItem>
                  <SelectItem value="document">文档</SelectItem>
                  <SelectItem value="slice">切片</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 结果类型 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 whitespace-nowrap">结果类型:</span>
              <Select value={resultType} onValueChange={onResultTypeChange}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3 h-3" />
                      全部
                    </div>
                  </SelectItem>
                  <SelectItem value="documents">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      文档
                    </div>
                  </SelectItem>
                  <SelectItem value="slices">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3 h-3" />
                      片段
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 置信度设置 */}
            <div className="flex items-center gap-3 min-w-48">
              <span className="text-sm text-gray-600 whitespace-nowrap flex items-center gap-1">
                <Sliders className="w-4 h-4" />
                置信度:
              </span>
              <div className="flex items-center gap-3 flex-1">
                <Slider
                  value={[confidenceThreshold]}
                  onValueChange={(value) => onConfidenceThresholdChange(value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-700 min-w-12">
                  {Math.round(confidenceThreshold * 100)}%
                </span>
              </div>
            </div>

            {/* 清除筛选 */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                清除筛选
              </Button>
            )}
          </div>

          {/* 第二行：标签筛选 */}
          <div className="flex items-center gap-3 flex-wrap border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-600 whitespace-nowrap">标签筛选:</span>
            {availableTags.slice(0, 10).map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => onTagToggle(tag)}
                className={`h-8 text-xs ${
                  selectedTags.includes(tag)
                    ? 'search-gradient text-white'
                    : 'hover:bg-orange-red-50 hover:text-orange-red-700 hover:border-orange-red-300'
                }`}
              >
                {tag}
              </Button>
            ))}
            {availableTags.length > 10 && (
              <span className="text-xs text-gray-500">+{availableTags.length - 10} 更多</span>
            )}
          </div>

          {/* 已选标签显示 */}
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap border-t border-gray-100 pt-4">
              <span className="text-xs text-gray-500">已选标签:</span>
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-orange-red-100 text-orange-red-700 hover:bg-orange-red-200 cursor-pointer"
                  onClick={() => onTagToggle(tag)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
