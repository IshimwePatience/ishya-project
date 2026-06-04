const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// 1. Replace DoughnutChart with a LineChart style (Forecast clone)
const oldDoughnutChartRegex = /\/\/ 📊 Custom High-End SVG Doughnut Chart for Talent Specialties[\s\S]*?(?=\/\/ 📊 Custom High-End SVG Glowing Area Chart for User Roles)/;
const newLineChart = `// 📊 Tableau-style Forecast Line Chart (Replacing Doughnut)
const DoughnutChart = ({ data }) => {
  const chartData = data.length > 0 ? data : [
    { label: 'Actors', count: 2 }, { label: 'Directors', count: 5 }, { label: 'Crew', count: 3 }
  ];
  const maxVal = Math.max(...chartData.map(d => d.count), 1);
  const width = 300;
  const height = 150;
  
  // Generate squiggly line path
  const generatePath = (data, offset) => {
    return data.map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * width;
      const y = height - ((d.count + offset) / (maxVal * 2)) * height - 20;
      return \`\${i === 0 ? 'M' : 'L'} \${x} \${y}\`;
    }).join(' ');
  };

  return (
    <TableauCard title="Talent Specialty Forecast" subtitle="Trending specialty distribution" noPadding>
      <div className="w-full h-[200px] bg-[#6c757d] relative overflow-hidden flex items-end">
        {/* Top right trending tag (like screenshot) */}
        <div className="absolute top-0 right-0 bg-[#3b82f6] text-white text-[9px] font-bold px-2 py-1 flex items-center gap-1">
          <TrendingUp size={10} /> Trending
        </div>
        <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-full drop-shadow-md">
          <path d={generatePath(chartData, 0)} fill="none" stroke="#2563eb" strokeWidth="1.5" />
          <path d={generatePath(chartData, maxVal * 0.5)} fill="none" stroke="#ea580c" strokeWidth="1.5" opacity="0.7" />
        </svg>
      </div>
    </TableauCard>
  );
};

`;

content = content.replace(oldDoughnutChartRegex, newLineChart);

// 2. Replace AreaChart with a Horizontal Bar Chart (Overview middle clone)
const oldAreaChartRegex = /\/\/ 📊 Custom High-End SVG Glowing Area Chart for User Roles[\s\S]*?(?=\/\/ 🏛️ The Main Staff \/ Admin Dashboard Component Layout)/;
const newHorizontalBarChart = `// 📊 Tableau-style Horizontal Bar Chart (Replacing Area)
const AreaChart = ({ data }) => {
  const chartData = data.length > 0 ? data : [
    { label: 'Admin', count: 5 }, { label: 'Partner', count: 3 }, { label: 'Public', count: 8 }
  ];
  const maxVal = Math.max(...chartData.map(d => d.count), 1);

  return (
    <TableauCard title="System Role Allocation" subtitle="User distribution across roles" noPadding>
      <div className="w-full h-[200px] bg-white p-4 flex flex-col justify-center gap-3">
        {chartData.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-gray-500 w-12 truncate text-right">{d.label}</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-sm overflow-hidden relative flex items-center">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: \`\${(d.count / maxVal) * 100}%\` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="h-full bg-[#3b82f6]"
              />
              {/* Add a red target line like the screenshot */}
              <div className="absolute right-[20%] top-0 bottom-0 w-0.5 bg-red-500 z-10" />
            </div>
            <span className="text-[9px] text-gray-400 font-mono w-4">{d.count}</span>
          </div>
        ))}
      </div>
    </TableauCard>
  );
};

`;

content = content.replace(oldAreaChartRegex, newHorizontalBarChart);

// 3. Replace BarChart with a Vertical Bar Chart (Right clone)
const oldBarChartRegex = /\/\/ 📊 Custom High-End SVG Bar Chart for Production Budgets[\s\S]*?(?=\/\/ 📊 Custom High-End SVG Doughnut Chart for Talent Specialties)/;
const newVerticalBarChart = `// 📊 Tableau-style Vertical Bar Chart
const BarChart = ({ data, zoom }) => {
  const chartData = data.length > 0 ? data : [
    { label: 'Prod A', value: 100 }, { label: 'Prod B', value: 200 }, { label: 'Prod C', value: 150 }, { label: 'Prod D', value: 50 }, { label: 'Prod E', value: 180 }
  ];
  const maxVal = Math.max(...chartData.map(d => d.value), 10);
  const colors = ['#ea580c', '#c2410c', '#9a3412', '#78350f', '#3b82f6', '#2563eb'];

  return (
    <TableauCard title="Production Budgets" subtitle="Budget overview for top 5 productions" noPadding>
      <div className="w-full h-[250px] bg-white flex items-end justify-between px-6 pt-8 pb-2 relative">
        <div className="absolute top-0 right-0 bg-[#0891b2] text-white text-[9px] font-bold px-2 py-1 flex items-center gap-1">
          <TrendingUp size={10} />
        </div>
        
        {chartData.map((d, i) => {
          const pct = Math.max((d.value / maxVal) * 100, 5);
          return (
            <div key={i} className="flex flex-col items-center gap-2 group flex-1">
              <div className="w-full px-1 h-36 flex items-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: \`\${pct}%\` }}
                  transition={{ duration: 1 }}
                  className="w-full relative group-hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: colors[i % colors.length] }}
                >
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {Number(d.value).toLocaleString()}
                  </div>
                </motion.div>
              </div>
              <span className="text-[8px] font-bold text-gray-500 uppercase truncate w-12 text-center">{d.label}</span>
            </div>
          );
        })}
      </div>
    </TableauCard>
  );
};

`;

content = content.replace(oldBarChartRegex, newVerticalBarChart);

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', content);
console.log('Charts replaced successfully!');
