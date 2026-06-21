import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-sm animate-pulse h-[185px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="h-3 w-20 bg-[#f5f5f7] rounded-full" />
          <div className="h-3 w-14 bg-[#f5f5f7] rounded-full" />
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#f5f5f7] shrink-0" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-[#f5f5f7] rounded mb-2" />
            <div className="h-3 w-24 bg-[#f5f5f7] rounded" />
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-[#f5f5f7]">
        <div className="flex justify-between mb-2">
          <div className="h-3 w-16 bg-[#f5f5f7] rounded" />
          <div className="h-3 w-12 bg-[#f5f5f7] rounded" />
        </div>
        <div className="w-full h-[4px] bg-[#f5f5f7] rounded-full" />
      </div>
    </div>
  );
}
