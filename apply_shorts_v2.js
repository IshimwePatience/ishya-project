const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/PublicVisitorDashboard.jsx', 'utf8');

// 1. Update MovieRow signature
content = content.replace(
  `const MovieRow = ({ title, items, isLive = false, isVertical = false, isContinue = false }) => {`,
  `const MovieRow = ({ title, items, isLive = false, isVertical = false, isContinue = false, isShortsStyle = false }) => {`
);

// 2. Add Shorts icon to title
content = content.replace(
  `{title} <ChevronRight size={20} className="mt-0.5 group-hover:translate-x-1 transition-transform" />`,
  `{isShortsStyle && (
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-red-600 mr-1">
                <path d="M17.77,10.32l-1.2-.5L18,9.06a3.74,3.74,0,0,0-3.5-6.62L6,6.94a3.74,3.74,0,0,0,.23,6.74l1.2.49L6,14.93a3.75,3.75,0,0,0,3.5,6.63l8.5-4.5a3.74,3.74,0,0,0-.23-6.74Z" fill="currentColor"/>
                <polygon points="10 14.65 15 12 10 9.35 10 14.65" fill="#fff"/>
              </svg>
            )}
            {title} <ChevronRight size={20} className="mt-0.5 group-hover:translate-x-1 transition-transform" />`
);

// 3. Update container width
content = content.replace(
  `className={\`flex-shrink-0 \${isVertical ? 'w-[80vw] sm:w-[400px]' : 'w-[85vw] sm:w-[440px]'} group cursor-pointer p-2 hover:bg-theme-input-bg rounded-2xl transition-colors -m-2\`}`,
  `className={\`flex-shrink-0 \${isShortsStyle ? 'w-[160px] sm:w-[200px] md:w-[240px]' : (isVertical ? 'w-[80vw] sm:w-[400px]' : 'w-[85vw] sm:w-[440px]')} group cursor-pointer \${isShortsStyle ? '' : 'p-2 hover:bg-theme-input-bg'} rounded-2xl transition-colors \${isShortsStyle ? '' : '-m-2'}\`}`
);

// 4. Update aspect ratio of thumbnail container
content = content.replace(
  `<div className="pt-[56.25%] bg-theme-surface rounded-xl overflow-hidden relative shadow-sm">`,
  `<div className={\`\${isShortsStyle ? 'aspect-[9/16]' : 'pt-[56.25%]'} bg-theme-surface rounded-xl overflow-hidden relative shadow-sm\`}>`
);

// 5. Update text rendering below the thumbnail (Add 3 dots and views)
const textBlockRegex = /<div className="mt-3 flex gap-3 pr-2">\s*\{\/\* Text Content \*\/\}\s*<div className="flex-1 min-w-0">\s*<h4 className="text-base font-semibold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-2 leading-tight">\s*\{prod\.title\}\s*<\/h4>\s*<div className="text-\[13px\] text-theme-text-muted mt-1 truncate">\s*\{prod\.genre\}\s*<\/div>\s*<\/div>\s*<\/div>/;

const newTextBlock = `<div className={\`mt-3 flex \${isShortsStyle ? 'gap-1' : 'gap-3'} pr-2\`}>
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className={\`\${isShortsStyle ? 'text-sm' : 'text-base'} font-semibold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-2 leading-tight\`}>
                        {prod.title}
                      </h4>
                      <div className="text-[13px] text-theme-text-muted mt-1 truncate">
                        {isShortsStyle ? \`\${Math.floor(Math.random() * 900 + 10)}K views\` : prod.genre}
                      </div>
                    </div>
                    {isShortsStyle && (
                      <div className="flex-shrink-0 text-theme-text hover:text-theme-accent transition-colors cursor-pointer mt-1">
                        <MoreVertical size={16} />
                      </div>
                    )}
                  </div>`;
content = content.replace(textBlockRegex, newTextBlock);

// 6. Update Loading Skeleton to include Shorts
const loadingSkeletonRegex = /if \(loading\) \{[\s\S]*?return \([\s\S]*?<div className="space-y-12 py-10">([\s\S]*?)<\/div>\n    \);\n  \}/;
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
content = content.replace(loadingSkeletonRegex, newSkeleton);

// 7. Inject Recently Added between categories and filter by 30 days
const categoriesLogicRegex = /\{\/\* Recently Added \(Landscape\) - Only items from last 30 days \*\/\}([\s\S]*?)\{\/\* Dynamic Categories based on Typed Strings \*\/\}\n            \{\(\(\) => \{/m;

const newLogic = `{/* Dynamic Categories & Recently Added injected */}
            {(() => {`;

content = content.replace(categoriesLogicRegex, newLogic);

const dynamicCategoriesReturnRegex = /return \([\s\S]*?<\/>\n              \);\n            \}\)\(\)\}/m;

const newDynamicLogic = `
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              const recentProductions = productions
                .filter(p => p.createdAt && new Date(p.createdAt) >= thirtyDaysAgo)
                .reverse()
                .slice(0, 12);
                
              const recentRow = recentProductions.length > 0 ? (
                <MovieRow key="recently-added" title="Recently Added" items={recentProductions} isShortsStyle={true} />
              ) : null;

              let rows = [];
              
              allMediaCategories.forEach(catName => {
                const categoryProds = productions.filter(p =>
                  p.mediaFiles?.some(m => m.category?.toLowerCase() === catName.toLowerCase())
                );
                if (categoryProds.length > 0) {
                  rows.push(
                    <MovieRow
                      key={catName}
                      title={catName}
                      items={categoryProds}
                      isVertical={true}
                    />
                  );
                }
              });

              if (uncategorizedProds.length > 0) {
                rows.push(
                  <MovieRow
                    key="uncategorized"
                    title="Movies"
                    items={uncategorizedProds}
                    isVertical={true}
                  />
                );
              }
              
              // Insert Recent Row after the first category row
              if (recentRow) {
                if (rows.length > 0) {
                  rows.splice(1, 0, recentRow);
                } else {
                  rows.push(recentRow);
                }
              }

              return <>{rows}</>;
            })()}`;

content = content.replace(dynamicCategoriesReturnRegex, newDynamicLogic);

fs.writeFileSync('frontend/src/pages/PublicVisitorDashboard.jsx', content);
console.log('Shorts style applied accurately!');
