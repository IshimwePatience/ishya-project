const fs = require('fs');
const file = fs.readFileSync('frontend/src/assets/images/ubuntu.png');
const b64 = 'data:image/png;base64,' + file.toString('base64');
const code = `import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const logoBase64 = '${b64}';

export const generatePDF = (title, columns, data) => {
  const doc = new jsPDF();
  
  // Add Logo
  doc.addImage(logoBase64, 'PNG', 14, 10, 20, 20);
  
  // Add Title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text(title, 40, 20);
  
  // Add Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(\`Generated on: \${new Date().toLocaleString()}\`, 40, 26);
  
  // Add Table
  doc.autoTable({
    startY: 35,
    head: [columns],
    body: data,
    theme: 'grid',
    headStyles: { fillColor: [229, 160, 13], textColor: [0, 0, 0] },
    styles: { fontSize: 10, cellPadding: 3 }
  });
  
  doc.save(\`\${title.replace(/\\s+/g, '_').toLowerCase()}_report.pdf\`);
};

export const generateExcel = (title, data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  
  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(k => ({ wch: 20 }));
  worksheet['!cols'] = colWidths;
  
  XLSX.writeFile(workbook, \`\${title.replace(/\\s+/g, '_').toLowerCase()}_report.xlsx\`);
};
`;
fs.writeFileSync('frontend/src/utils/reportGenerator.js', code);
console.log('Done!');
