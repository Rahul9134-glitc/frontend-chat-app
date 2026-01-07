import React from 'react';
import { Users } from "lucide-react";

const SideBarSkeleton = () => {
  // Create 8 placeholder items
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-gray-200 flex flex-col transition-all duration-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-gray-400" />
          <span className="font-medium hidden lg:block text-gray-800">
            Contacts
          </span>
        </div>
      </div>

      {/* Skeleton Contacts List */}
      <div className="overflow-y-auto w-full py-3">
        {skeletonContacts.map((_, index) => (
          <div key={index} className="w-full p-3 flex items-center gap-3">
            
            {/* Avatar skeleton */}
            <div className="relative mx-auto lg:mx-0">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            </div>

            {/* Text skeleton - only visible on large screens */}
            <div className="hidden lg:flex flex-col gap-2 flex-1">
              {/* Name placeholder */}
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              {/* Status placeholder */}
              <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SideBarSkeleton;