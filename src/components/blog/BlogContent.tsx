import React from 'react';

interface BlogContentProps {
  content: string;
  className?: string;
}

const BlogContent: React.FC<BlogContentProps> = ({ content, className = '' }) => {
  return (
    <div 
      className={`
        prose prose-invert max-w-none
        // Headers
        prose-headings:font-anton 
        prose-h1:text-4xl prose-h1:text-neon-cyan
        prose-h2:text-3xl prose-h2:text-neon-purple
        prose-h3:text-2xl prose-h3:text-neon-pink
        
        // Links and Interactive Elements
        prose-a:text-neon-cyan prose-a:no-underline hover:prose-a:text-neon-purple
        prose-strong:text-neon-cyan
        
        // Lists and Quotes
        prose-ul:list-disc prose-ul:text-gray-300
        prose-ol:text-gray-300
        prose-blockquote:border-neon-cyan prose-blockquote:bg-neon-cyan/5
        prose-blockquote:rounded-lg prose-blockquote:px-6 prose-blockquote:py-4
        
        // Code Blocks
        prose-code:text-neon-pink prose-code:bg-neon-pink/5
        prose-code:rounded prose-code:px-2 prose-code:py-1
        prose-pre:bg-black/50 prose-pre:border prose-pre:border-neon-cyan/20
        
        // Tables
        prose-table:border-collapse
        prose-th:border prose-th:border-neon-cyan/20 prose-th:p-2 prose-th:bg-neon-cyan/5
        prose-td:border prose-td:border-neon-cyan/20 prose-td:p-2
        
        // Images and Figures
        prose-img:rounded-lg prose-img:shadow-lg prose-img:shadow-neon-cyan/20
        prose-img:mx-auto prose-img:my-8
        prose-figure:mx-auto prose-figure:my-8
        prose-figcaption:text-center prose-figcaption:text-gray-400
        
        // Custom Divs (for AI-generated layouts)
        [&>div]:rounded-lg
        [&>.highlight]:bg-neon-cyan/5 [&>.highlight]:p-6 [&>.highlight]:rounded-lg
        [&>.note]:bg-neon-purple/5 [&>.note]:p-6 [&>.note]:rounded-lg
        [&>.warning]:bg-red-500/5 [&>.warning]:p-6 [&>.warning]:rounded-lg
        
        // Grid and Flex Layouts
        [&>.grid]:grid [&>.grid]:gap-4
        [&>.flex]:flex [&>.flex]:gap-4
        
        // Custom Classes
        [&>.neon-box]:border-2 [&>.neon-box]:border-neon-cyan/30 [&>.neon-box]:p-6 [&>.neon-box]:rounded-lg
        [&>.neon-text]:text-neon-cyan
        [&>.gradient-text]:bg-gradient-to-r [&>.gradient-text]:from-neon-cyan [&>.gradient-text]:to-neon-purple [&>.gradient-text]:bg-clip-text [&>.gradient-text]:text-transparent
        
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default BlogContent; 