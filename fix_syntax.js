const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/PublicVisitorDashboard.jsx', 'utf8');

const target = `                  {!isShortsStyle && (
                  <div className="mt-3 flex gap-3 pr-2">
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-2 leading-tight">
                        {prod.title}
                      </h4>
                      <div className="text-[13px] text-theme-text-muted mt-1 truncate">
                        {prod.genre}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}`;

const replacement = `                  {!isShortsStyle && (
                  <div className="mt-3 flex gap-3 pr-2">
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-2 leading-tight">
                        {prod.title}
                      </h4>
                      <div className="text-[13px] text-theme-text-muted mt-1 truncate">
                        {prod.genre}
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              );
            })}`;

content = content.replace(target, replacement);

fs.writeFileSync('frontend/src/pages/PublicVisitorDashboard.jsx', content);
console.log('Fixed syntax error');
