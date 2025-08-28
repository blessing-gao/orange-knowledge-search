
import { FileText } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { SearchResult } from "@/types/api";
import { SearchResultTabs } from "./SearchResultTabs";

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  onViewDetails: (result: SearchResult) => void;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
}

export function SearchResults({ 
  results, 
  loading, 
  query, 
  onViewDetails,
  currentPage,
  totalPages,
  totalResults,
  onPageChange
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="search-card p-8 animate-pulse">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/5"></div>
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
      <div className="w-full max-w-6xl mx-auto">
        <div className="search-card p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">未找到相关结果</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            很抱歉，没有找到与 "<span className="font-semibold text-primary">{query}</span>" 相关的内容
          </p>
          <div className="bg-gray-50 rounded-xl p-6 max-w-lg mx-auto">
            <h4 className="font-semibold text-gray-900 mb-3">搜索建议：</h4>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                检查关键词拼写是否正确
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                尝试使用更通用的词汇
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                使用不同的标签筛选条件
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                切换到其他知识库搜索
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* 搜索统计信息 - 更大气的设计 */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              搜索结果
            </h2>
            <p className="text-gray-600">
              找到 <span className="font-bold text-primary text-xl">{totalResults.toLocaleString()}</span> 个相关结果
              {totalPages > 1 && (
                <span className="ml-3 text-sm">
                  第 {currentPage} 页，共 {totalPages} 页
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>查询词: <span className="font-medium text-gray-700">"{query}"</span></span>
          </div>
        </div>
      </div>

      {/* 搜索结果标签页 */}
      <SearchResultTabs
        results={results}
        query={query}
        onViewDetails={onViewDetails}
      />

      {/* 分页组件 - 更精致的设计 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            <Pagination>
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) onPageChange(currentPage - 1);
                    }}
                    className={`${
                      currentPage === 1 
                        ? 'pointer-events-none opacity-50' 
                        : 'cursor-pointer hover:bg-primary/5'
                    } px-4 py-2 rounded-lg`}
                  />
                </PaginationItem>
                
                {generatePageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === '...' ? (
                      <span className="px-4 py-2 text-gray-500">...</span>
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(page as number);
                        }}
                        isActive={currentPage === page}
                        className={`cursor-pointer px-4 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) onPageChange(currentPage + 1);
                    }}
                    className={`${
                      currentPage === totalPages 
                        ? 'pointer-events-none opacity-50' 
                        : 'cursor-pointer hover:bg-primary/5'
                    } px-4 py-2 rounded-lg`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}
