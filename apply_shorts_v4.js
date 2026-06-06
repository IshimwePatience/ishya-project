const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/PublicVisitorDashboard.jsx', 'utf8');

// 1. Update MovieRow signature
content = content.replace(
  `const MovieRow = ({ title, items, isLive = false, isVertical = false, isContinue = false }) => {`,
  `const MovieRow = ({ title, items, isLive = false, isVertical = false, isContinue = false, isShortsStyle = false }) => {`
);

// 2. Update width class
content = content.replace(
  `className={\`flex-shrink-0 \${isVertical ? 'w-[80vw] sm:w-[400px]' : 'w-[85vw] sm:w-[440px]'} group cursor-pointer p-2 hover:bg-theme-input-bg rounded-2xl transition-colors -m-2\`}`,
  `className={\`flex-shrink-0 \${isShortsStyle ? 'w-[160px] sm:w-[200px] md:w-[240px]' : (isVertical ? 'w-[80vw] sm:w-[400px]' : 'w-[85vw] sm:w-[440px]')} group cursor-pointer \${isShortsStyle ? '' : 'p-2 hover:bg-theme-input-bg'} rounded-2xl transition-colors \${isShortsStyle ? '' : '-m-2'}\`}`
);

// 3. Update aspect ratio
content = content.replace(
  `<div className="pt-[56.25%] bg-theme-surface rounded-xl overflow-hidden relative shadow-sm">`,
  `<div className={\`\${isShortsStyle ? 'aspect-[9/16]' : 'pt-[56.25%]'} bg-theme-surface rounded-xl overflow-hidden relative shadow-sm\`}>`
);

// 4. Update text below thumbnail to include MoreVertical and smaller gap for Shorts
const textContentRegex = /<div className="mt-3 flex gap-3 pr-2">\s*\{\/\* Text Content \*\/\}\s*<div className="flex-1 min-w-0">\s*<h4 className="text-base font-semibold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-2 leading-tight">\s*\{prod\.title\}\s*<\/h4>\s*<div className="text-\[13px\] text-theme-text-muted mt-1 truncate">\s*\{prod\.genre\}\s*<\/div>\s*<\/div>\s*<\/div>/;

const newTextContent = `<div className={\`mt-3 flex \${isShortsStyle ? 'gap-1' : 'gap-3'} pr-2\`}>
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className={\`\${isShortsStyle ? 'text-sm' : 'text-base'} font-semibold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-2 leading-tight\`}>
                        {prod.title}
                      </h4>
                      <div className="text-[13px] text-theme-text-muted mt-1 truncate">
                        {prod.genre}
                      </div>
                    </div>
                    {isShortsStyle && (
                      <div className="flex-shrink-0 text-theme-text hover:text-theme-accent transition-colors cursor-pointer mt-1">
                        <MoreVertical size={16} />
                      </div>
                    )}
                  </div>`;
content = content.replace(textContentRegex, newTextContent);

// 5. Pass isShortsStyle=true to Recently Added
const recentsRenderRegex = /return <MovieRow title="Recently Added" items=\{recentProductions\} \/>;/;
content = content.replace(recentsRenderRegex, `return <MovieRow title="Recently Added" items={recentProductions} isShortsStyle={true} />;`);

// 6. Update Skeleton Loading to reflect Shorts layout for row 2
const skeletonRegex = /if \(loading\) \{[\s\S]*?return \([\s\S]*?<div className="space-y-12 py-10">([\s\S]*?)<\/div>\n    \);\n  \}/;
const newSkeleton = `if (loading) {
    return (
      <div className="space-y-12 py-10">
        {[1, 2, 3].map(i => {
          const isShortsRow = i === 2; // Make the second row look like Shorts
          return (
            <div key={i} className="space-y-4">
              <div className="h-8 w-48 bg-theme-input-bg animate-pulse rounded-sm ml-2" />
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map(j => (
                  <div key={j} className={\`flex-shrink-0 \${isShortsRow ? 'w-[160px] sm:w-[200px] md:w-[240px]' : 'w-[440px]'}\`}>
                    <div className={\`w-full \${isShortsRow ? 'aspect-[9/16]' : 'pt-[56.25%]'} bg-theme-input-bg animate-pulse rounded-xl\`} />
                    <div className="mt-3 space-y-2">
                      <div className="h-4 w-3/4 bg-theme-input-bg animate-pulse rounded" />
                      {!isShortsRow && <div className="h-3 w-1/2 bg-theme-input-bg animate-pulse rounded" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }`;
content = content.replace(skeletonRegex, newSkeleton);

fs.writeFileSync('frontend/src/pages/PublicVisitorDashboard.jsx', content);
console.log('Shorts style applied correctly');
