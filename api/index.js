export default async function handler(req, res) {
  // Try to get the protocol and host from headers
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  
  // The path requested (e.g. /cafe14, or /login)
  // Vercel maps the path to req.url
  const path = req.url.split('?')[0];
  const segments = path.split('/').filter(Boolean);
  
  // Try to fetch the built static HTML
  let html = '';
  
  try {
    // Try reading from filesystem first (fastest, most reliable if packaged correctly)
    const fs = await import('fs');
    const path = await import('path');
    
    try {
      html = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf-8');
    } catch (e) {
      html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
    }
  } catch (fsError) {
    try {
      // Fallback to fetching via HTTP
      const response = await fetch(`${protocol}://${host}/index.html`);
      if (response.ok) {
        html = await response.text();
      }
    } catch (err) {
      console.error('Failed to load index.html via fetch:', err);
    }
  }

  // Final fallback (should theoretically never happen if deployed correctly)
  if (!html) {
    html = '<!DOCTYPE html><html><head></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>';
  }

  // Define a list of reserved paths that aren't shop usernames
  const reservedPaths = [
    'login', 'signup', 'contact', 'privacy', 'terms', 'demo', 
    'onboarding', 'dashboard', 'admin', 'company-admin', 'api'
  ];

  // If there's a first segment and it's not reserved, treat it as a username
  const possibleUsername = segments[0];
  if (possibleUsername && !reservedPaths.includes(possibleUsername) && !possibleUsername.includes('.')) {
    // Fetch shop details from Supabase using the REST API
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && anonKey) {
      try {
        const url = `${supabaseUrl}/rest/v1/shops?username=eq.${possibleUsername}&select=name,description,logo,banner,tagline`;
        const shopRes = await fetch(url, {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (shopRes.ok) {
          const shops = await shopRes.json();
          if (shops && shops.length > 0) {
            const shop = shops[0];
            const title = `${shop.name} | Digital Menu`;
            const description = shop.description || shop.tagline || `View the digital menu for ${shop.name} on Menuzo.`;
            const image = shop.logo || shop.banner || '/food-burger.jpg';
            
            // Replace the default tags in the HTML
            html = html
              .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
              .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
              .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
              .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`)
              .replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${image}" />`);
          }
        }
      } catch (error) {
        console.error('Error fetching shop for OG tags:', error);
      }
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
