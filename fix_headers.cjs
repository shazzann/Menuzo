const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const pages = [
  'AdminAnalyticsPage.tsx',
  'AdminPreviewPage.tsx',
  'AdminAddFoodPage.tsx',
  'UserDashboardPage.tsx',
  'AdminSettingsPage.tsx'
];

pages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Let's fix each file.
  if (page === 'AdminAnalyticsPage.tsx') {
    // Restore AdminAnalyticsPage return block
    // The previous edit removed everything from return ( to the end of the header.
    // Let's find the `const currentStats = viewStats[timeRange];`
    const target = 'const currentStats = viewStats[timeRange];';
    if (content.includes(target)) {
      const idx = content.indexOf(target) + target.length;
      const before = content.substring(0, idx);
      const after = content.substring(idx);
      if (!after.includes('return (')) {
        const fixedAfter = `

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center">
              <img src="/logo/Logo favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Analytics</h1>
              <p className="text-xs text-muted-foreground">Shop performance</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-settings' })}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Subscription Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 card-border">
          <div className="flex items-center justify-between mb-4">` + after.substring(after.indexOf('<div className="flex items-center gap-3">'));
        content = before + fixedAfter;
      }
    }
  }

  if (page === 'AdminPreviewPage.tsx') {
    // Restore AdminPreviewPage return block
    const target = 'break;\n    }\n  };\n';
    if (content.includes(target) && !content.substring(content.indexOf(target)).includes('return (')) {
      const idx = content.indexOf(target) + target.length;
      const before = content.substring(0, idx);
      const after = content.substring(idx);
      
      const fixedAfter = `
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Admin Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center">
              <img src="/logo/Logo favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Menu Preview</h1>
              <p className="text-xs text-muted-foreground">See what customers see</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-settings' })}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={shop.banner}` + after.substring(after.indexOf('          alt={shop.name}'));
      content = before + fixedAfter;
    }
  }

  if (page === 'AdminAddFoodPage.tsx') {
    const target = 'break;\n    }\n  };\n';
    if (content.includes(target) && !content.substring(content.indexOf(target)).includes('return (')) {
      const idx = content.indexOf(target) + target.length;
      const before = content.substring(0, idx);
      const after = content.substring(idx);
      
      const fixedAfter = `
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Admin Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center">
              <img src="/logo/Logo favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Menu Items</h1>
              <p className="text-xs text-muted-foreground">Manage your dishes</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-settings' })}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Search & Add */}
      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-3">` + after.substring(after.indexOf('          <div className="relative flex-1">'));
      content = before + fixedAfter;
    }
  }

  if (page === 'UserDashboardPage.tsx') {
    // Revert the header back to logo on left, settings on right
    content = content.replace(
      /<div className="flex items-center gap-3">\s*<Button[\s\S]*?<Settings className="w-5 h-5" \/>\s*<\/Button>\s*<div>\s*<h1 className="font-semibold text-sm">Dashboard<\/h1>\s*<p className="text-xs text-muted-foreground">\s*\{isLoadingData \? 'Loading\.\.\.' : shop\.name\}\s*<\/p>\s*<\/div>\s*<\/div>\s*<div className="w-8 h-8 flex items-center justify-center">\s*<img src="\/logo\/Logo favicon\.png" alt="Logo" className="w-full h-full object-contain" \/>\s*<\/div>/,
      `<div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center">
              <img src="/logo/Logo favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {isLoadingData ? 'Loading...' : shop.name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-settings' })}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
          </Button>`
    );
  }

  if (page === 'AdminSettingsPage.tsx') {
    // Revert the header back to logo on left, NO settings icon since they are on Settings page
    content = content.replace(
      /<div className="flex items-center gap-3">\s*<div className="w-9 h-9 flex items-center justify-center text-primary -ml-1">\s*<Settings className="w-5 h-5" \/>\s*<\/div>\s*<div>\s*<h1 className="font-semibold text-sm">Settings<\/h1>\s*<p className="text-xs text-muted-foreground">Manage your shop<\/p>\s*<\/div>\s*<\/div>\s*<div className="flex items-center gap-3">[\s\S]*?<div className="w-8 h-8 flex items-center justify-center">\s*<img src="\/logo\/Logo favicon\.png" alt="Logo" className="w-full h-full object-contain" \/>\s*<\/div>\s*<\/div>/,
      `<div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center">
              <img src="/logo/Logo favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Settings</h1>
              <p className="text-xs text-muted-foreground">Manage your shop</p>
            </div>
          </div>
          {activeTab === 'shop' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          )}`
    );
    
    // Add default icon imports
    if (!content.includes('ImageIcon')) {
       content = content.replace(/import \{([^}]+)\} from 'lucide-react';/, "import { $1, Image as ImageIcon, Store } from 'lucide-react';");
    }
    
    // Add SVGs for missing banner/logo
    content = content.replace(
      /<img\s*src=\{shop\.banner\}\s*alt="Banner"\s*className="w-full h-full object-cover"\s*\/>/,
      `{shop.banner ? (
                  <img src={shop.banner} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium">No Banner Uploaded</span>
                  </div>
                )}`
    );
    
    content = content.replace(
      /<img\s*src=\{shop\.logo\}\s*alt="Logo"\s*className="w-full h-full object-cover"\s*\/>/,
      `{shop.logo ? (
                    <img src={shop.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-8 h-8 text-muted-foreground/50" />
                  )}`
    );
  }

  fs.writeFileSync(filePath, content, 'utf-8');
});

console.log('Headers fixed and SVGs added!');
