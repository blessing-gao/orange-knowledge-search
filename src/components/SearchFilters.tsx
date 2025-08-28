
import { Filter, X, FileText, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFiltersProps {
  resultType: string;
  onResultTypeChange: (type: string) => void;
  selectedTags: string[];
  availableTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

export function SearchFilters({
  resultType,
  onResultTypeChange,
  selectedTags,
  availableTags,
  onTagToggle,
  onClearFilters,
}: SearchFiltersProps) {
  const hasActiveFilters = resultType !== 'both' || selectedTags.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="search-card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Filter Icon and Title */}
          <div className="flex items-center gap-2 text-gray-700">
            <Filter className="w-4 h-4" />
            <span className="font-medium">筛选条件</span>
          </div>

          {/* Result Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">结果类型:</span>
            <Select value={resultType} onValueChange={onResultTypeChange}>
              <SelectTrigger className="w-32 h-8">
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

          {/* Tags Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">标签:</span>
            {availableTags.slice(0, 8).map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => onTagToggle(tag)}
                className={`h-7 text-xs ${
                  selectedTags.includes(tag)
                    ? 'search-gradient text-white'
                    : 'hover:bg-orange-red-50 hover:text-orange-red-700 hover:border-orange-red-300'
                }`}
              >
                {tag}
              </Button>
            ))}
            {availableTags.length > 8 && (
              <span className="text-xs text-gray-500">+{availableTags.length - 8} 更多</span>
            )}
          </div>

          {/* Clear Filters */}
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

        {/* Active Filters Display */}
        {selectedTags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
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
          </div>
        )}
      </div>
    </div>
  );
}
