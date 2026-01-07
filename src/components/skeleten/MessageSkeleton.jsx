import React from "react";

const MessageSkeleton = () => {
  // Create an array of 6 items (9 might be too long for some screens)
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
      {skeletonMessages.map((_, index) => {
        const isAlignLeft = index % 2 === 0;

        return (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              isAlignLeft ? "justify-start" : "justify-end flex-row-reverse"
            }`}
          >
            {/* Avatar Skeleton */}
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />

            {/* Message Bubbles Skeleton */}
            <div className={`flex flex-col ${isAlignLeft ? "items-start" : "items-end"}`}>
              {/* Name/Time tag placeholder */}
              <div className="h-3 w-16 bg-gray-200 rounded mb-2 animate-pulse" />
              
              {/* The Bubble - Varied widths for a natural look */}
              <div 
                className={`h-12 bg-gray-200 rounded-2xl animate-pulse ${
                  index % 3 === 0 ? "w-[200px]" : "w-[140px]"
                }`} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;