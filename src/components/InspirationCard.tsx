import { useEffect, useState } from 'react';

/**
 * Props for the InspirationCard component
 */
export interface InspirationCardProps {
  content: string | null;
  isLoading: boolean;
}

/**
 * InspirationCard component displays AI-generated inspirational content
 * with loading animations and smooth transitions.
 *
 * @example
 * ```tsx
 * <InspirationCard
 *   content="Your inspirational message"
 *   isLoading={false}
 * />
 * ```
 */
export function InspirationCard({ content, isLoading }: InspirationCardProps) {
  const [displayContent, setDisplayContent] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!content) {
      return;
    }

    // Start transition
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTransitioning(true);

    // Small delay before showing new content for smooth transition
    const timer = setTimeout(() => {
      setDisplayContent(content);
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [content]);

  // Don't render anything if no content and not loading
  if (!content && !isLoading) {
    return null;
  }

  const isVisible = displayContent && !isLoading && !isTransitioning;

  return (
    <div className="w-full flex justify-center mt-8">
      <div
        className={`
          w-full
          max-w-2xl
          bg-white
          rounded-2xl
          shadow-lg
          p-8
          transition-all
          duration-200
          ${isLoading ? 'animate-pulse' : ''}
          ${isVisible ? 'opacity-100 scale-100 animate-shadow-pulse motion-reduce:animate-none' : 'opacity-0 scale-95'}
        `}
      >
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          // Content display
          <p
            className={`
              text-xl
              leading-relaxed
              text-gray-900
              text-center
              transition-opacity
              duration-300
            `}
          >
            {displayContent}
          </p>
        )}
      </div>
    </div>
  );
}
