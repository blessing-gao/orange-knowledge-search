
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Layers, Image, Video, Grid3X3 } from "lucide-react";
import { SearchResult } from "@/types/api";
import { ResultTypeCard } from "./ResultTypeCard";

interface SearchResultTabsProps {
  results: SearchResult[];
  query: string;
  onViewDetails: (result: SearchResult) => void;
}

export function SearchResultTabs({ results, query, onViewDetails }: SearchResultTabsProps) {
  const [activeTab, setActiveTab] = useState("all");

  // 按类型分组结果
  const groupedResults = {
    all: results,
    document: results.filter(r => r.type === 'document'),
    slice: results.filter(r => r.type === 'slice'),
    image: results.filter(r => r.type === 'image'),
    video: results.filter(r => r.type === 'video'),
  };

  const tabConfig = [
    {
      id: 'all',
      label: '全部',
      icon: Grid3X3,
      count: groupedResults.all.length,
      color: 'bg-gray-100 text-gray-700'
    },
    {
      id: 'document',
      label: '文档',
      icon: FileText,
      count: groupedResults.document.length,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'slice',
      label: '切片',
      icon: Layers,
      count: groupedResults.slice.length,
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'image',
      label: '图片',
      icon: Image,
      count: groupedResults.image.length,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'video',
      label: '视频',
      icon: Video,
      count: groupedResults.video.length,
      color: 'bg-red-100 text-red-700'
    }
  ];

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* 大气的标签页头部 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-8">
          <TabsList className="grid w-full grid-cols-5 gap-1 bg-transparent h-auto p-0">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-3 px-6 py-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-gray-50 text-sm font-medium"
                  disabled={tab.count === 0}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <Badge 
                    variant="secondary" 
                    className={`ml-1 ${
                      activeTab === tab.id 
                        ? 'bg-white/20 text-white hover:bg-white/30' 
                        : tab.color
                    }`}
                  >
                    {tab.count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* 标签页内容 */}
        {tabConfig.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            {groupedResults[tab.id as keyof typeof groupedResults].length > 0 ? (
              <div className="space-y-6">
                {groupedResults[tab.id as keyof typeof groupedResults].map((result, index) => (
                  <ResultTypeCard
                    key={`${result.type}-${result.id}-${tab.id}`}
                    result={result}
                    query={query}
                    onViewDetails={onViewDetails}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="search-card p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <tab.icon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  暂无{tab.label}结果
                </h3>
                <p className="text-gray-600 mb-6">
                  当前查询没有找到相关的{tab.label}内容
                </p>
                <div className="text-sm text-gray-500">
                  <p>建议：</p>
                  <ul className="mt-2 space-y-1 text-left inline-block">
                    <li>• 尝试不同的关键词</li>
                    <li>• 检查拼写是否正确</li>
                    <li>• 使用更通用的搜索词</li>
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
