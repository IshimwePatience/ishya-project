import React from 'react';
import { LayoutGrid } from 'lucide-react';

const PageHeader = ({ title, actions, zoom, setZoom, viewMode, setViewMode }) => {
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
            <input 
              type="range" 
              min="20" 
              max="100" 
              value={zoom || 50} 
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="w-20 h-[2px] bg-white/10 accent-[#e5a00d] cursor-pointer appearance-none rounded-full"
            />
          </div>
          
          {/* Grid Icon */}
          <div 
            onClick={() => setViewMode?.(viewMode === 'grid' ? 'list' : 'grid')}
            className={`transition-colors cursor-pointer ${viewMode === 'grid' ? 'text-[#e5a00d]' : 'text-white/20 hover:text-white'}`}
          >
            <LayoutGrid size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
