
import React from 'react';

interface MarkdownHighlightProps {
  content: string;
  query: string;
  className?: string;
}

export function MarkdownHighlight({ content, query, className = '' }: MarkdownHighlightProps) {
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // 简单的markdown渲染
  const renderMarkdown = (text: string) => {
    // 处理粗体
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // 处理斜体
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // 处理代码
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>');
    
    return text;
  };

  const processedContent = renderMarkdown(content);
  const highlightedContent = highlightText(processedContent, query);

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: typeof highlightedContent === 'string' 
          ? highlightedContent 
          : highlightedContent.join('') 
      }}
    />
  );
}
