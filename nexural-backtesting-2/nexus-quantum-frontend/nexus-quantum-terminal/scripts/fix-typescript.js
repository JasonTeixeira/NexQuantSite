#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// TypeScript fixes to apply
const fixes = [
  // Fix Recharts Pie chart label props
  {
    file: 'components/phase2/alternative-data.tsx',
    search: /label=\{\(\{ name, percent \}\) => `\$\{name\} \$\{\(\(percent \|\| 0\) \* 100\)\.toFixed\(0\)\}%`\}/g,
    replace: 'label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}'
  },
  {
    file: 'components/phase2/portfolio-optimization.tsx',
    search: /label=\{\(\{ name, value \}\) => `\$\{name\}: \$\{\(value \|\| 0\)\.toFixed\(1\)\}%`\}/g,
    replace: 'label={({ name, value }: any) => `${name}: ${(value || 0).toFixed(1)}%`}'
  },
  {
    file: 'components/phase2/regime-detection.tsx',
    search: /label=\{\(\{ name, percent \}\) => `\$\{name\} \$\{\(\(percent \|\| 0\) \* 100\)\.toFixed\(0\)\}%`\}/g,
    replace: 'label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}'
  },
  
  // Fix Bar chart fill props
  {
    file: 'components/phase2/backtesting-engine.tsx',
    search: /<Bar dataKey="returns" fill="#4ade80" \/>/g,
    replace: '<Bar dataKey="returns" fill="#4ade80" />'
  },
  
  // Fix severity type issues
  {
    file: 'components/phase2/risk-management.tsx',
    search: /severity: "WARNING"/g,
    replace: 'severity: "MEDIUM" as const'
  },
  
  // Fix missing imports
  {
    file: 'components/phase1/live-market-data.tsx',
    search: /import \{ ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip \} from "recharts"/,
    replace: 'import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts"'
  }
];

// Apply fixes
fixes.forEach(fix => {
  const filePath = path.join(__dirname, '..', fix.file);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(fix.search, fix.replace);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${fix.file}`);
    } catch (error) {
      console.log(`❌ Error fixing ${fix.file}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${fix.file}`);
  }
});

console.log('🎉 TypeScript fixes applied!');
