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
  const isFoodDetail = segments[1] === 'food' && segments[2];
  const foodId = isFoodDetail ? segments[2] : null;

  if (possibleUsername && !reservedPaths.includes(possibleUsername) && !possibleUsername.includes('.')) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && anonKey) {
      try {
        const headers = {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        };

        const shopUrl = `${supabaseUrl}/rest/v1/shops?username=eq.${possibleUsername}&select=name,description,logo,banner,tagline`;
        const shopPromise = fetch(shopUrl, { headers });

        let foodPromise = null;
        if (foodId) {
          const foodUrl = `${supabaseUrl}/rest/v1/food_items?id=eq.${foodId}&select=name,description,tagline,image`;
          foodPromise = fetch(foodUrl, { headers });
        }

        const [shopRes, foodRes] = await Promise.all([shopPromise, foodPromise]);

        let shop = null;
        if (shopRes.ok) {
          const shops = await shopRes.json();
          if (shops && shops.length > 0) shop = shops[0];
        }

        let food = null;
        if (foodRes && foodRes.ok) {
          const foods = await foodRes.json();
          if (foods && foods.length > 0) food = foods[0];
        }

        let title = 'Menuzo | Digital Menu';
        let description = 'Create premium QR menus for your restaurant in minutes.';
        let image = '/food-burger.jpg';

        if (food && shop) {
          title = `${food.name} | ${shop.name}`;
          description = food.description || food.tagline || `Check out ${food.name} at ${shop.name}!`;
          image = food.image || shop.logo || shop.banner || '/food-burger.jpg';
        } else if (shop) {
          title = `${shop.name} | Digital Menu`;
          description = shop.description || shop.tagline || `View the digital menu for ${shop.name} on Menuzo.`;
          image = shop.logo || shop.banner || '/food-burger.jpg';
        }

        if (shop || food) {
          // Replace the default tags in the HTML
          html = html
            .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
            .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
            .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
            .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`)
            .replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${image}" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:image" content="${image}" />`);
        }
      } catch (error) {
        console.error('Error fetching data for OG tags:', error);
      }
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
