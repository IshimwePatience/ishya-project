import React from 'react';
import { LayoutGrid } from 'lucide-react';

const PageHeader = ({ title, actions }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/5 pb-6 mb-10">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-medium text-white/90 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Custom Actions */}
        {actions && (
          <div className="flex items-center gap-4 mr-2 pr-6 border-r border-white/5">
            {actions}
          </div>
        )}

        {/* Cinematic Controls (Zoom/Grid) */}
        <div className="flex items-center gap-5">
          {/* Zoom Slider */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-20 h-[1.5px] bg-white/10 relative rounded-full">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/60 shadow-sm cursor-pointer hover:bg-white transition-colors" />
            </div>
          </div>
          
          {/* Grid Icon */}
          <div className="text-white/20 hover:text-white transition-colors cursor-pointer">
            <LayoutGrid size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
