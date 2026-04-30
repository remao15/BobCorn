/**
 * Comprehensive lookup table of ~200 known subscription services
 * Used for high-confidence classification (Tier 1)
 */

export const knownServices = new Map([
  // Streaming Services
  ['netflix.com', { name: 'Netflix', category: 'streaming', logo: null }],
  ['hulu.com', { name: 'Hulu', category: 'streaming', logo: null }],
  ['disneyplus.com', { name: 'Disney+', category: 'streaming', logo: null }],
  ['hbomax.com', { name: 'HBO Max', category: 'streaming', logo: null }],
  ['max.com', { name: 'Max', category: 'streaming', logo: null }],
  ['primevideo.com', { name: 'Prime Video', category: 'streaming', logo: null }],
  ['amazon.com', { name: 'Amazon Prime', category: 'streaming', logo: null }],
  ['paramountplus.com', { name: 'Paramount+', category: 'streaming', logo: null }],
  ['peacocktv.com', { name: 'Peacock', category: 'streaming', logo: null }],
  ['appletv.com', { name: 'Apple TV+', category: 'streaming', logo: null }],
  ['crunchyroll.com', { name: 'Crunchyroll', category: 'streaming', logo: null }],
  ['funimation.com', { name: 'Funimation', category: 'streaming', logo: null }],
  
  // Music Services
  ['spotify.com', { name: 'Spotify', category: 'music', logo: null }],
  ['apple.com', { name: 'Apple Music', category: 'music', logo: null }],
  ['music.apple.com', { name: 'Apple Music', category: 'music', logo: null }],
  ['youtube.com', { name: 'YouTube Premium', category: 'music', logo: null }],
  ['tidal.com', { name: 'Tidal', category: 'music', logo: null }],
  ['deezer.com', { name: 'Deezer', category: 'music', logo: null }],
  ['pandora.com', { name: 'Pandora', category: 'music', logo: null }],
  ['soundcloud.com', { name: 'SoundCloud', category: 'music', logo: null }],
  ['amazonmusic.com', { name: 'Amazon Music', category: 'music', logo: null }],
  
  // Software & Productivity
  ['adobe.com', { name: 'Adobe Creative Cloud', category: 'software', logo: null }],
  ['microsoft.com', { name: 'Microsoft 365', category: 'software', logo: null }],
  ['office365.com', { name: 'Microsoft 365', category: 'software', logo: null }],
  ['notion.so', { name: 'Notion', category: 'software', logo: null }],
  ['evernote.com', { name: 'Evernote', category: 'software', logo: null }],
  ['todoist.com', { name: 'Todoist', category: 'software', logo: null }],
  ['trello.com', { name: 'Trello', category: 'software', logo: null }],
  ['asana.com', { name: 'Asana', category: 'software', logo: null }],
  ['monday.com', { name: 'Monday.com', category: 'software', logo: null }],
  ['slack.com', { name: 'Slack', category: 'software', logo: null }],
  ['zoom.us', { name: 'Zoom', category: 'software', logo: null }],
  ['canva.com', { name: 'Canva', category: 'software', logo: null }],
  ['figma.com', { name: 'Figma', category: 'software', logo: null }],
  ['sketch.com', { name: 'Sketch', category: 'software', logo: null }],
  ['grammarly.com', { name: 'Grammarly', category: 'software', logo: null }],
  ['lastpass.com', { name: 'LastPass', category: 'software', logo: null }],
  ['1password.com', { name: '1Password', category: 'software', logo: null }],
  ['dashlane.com', { name: 'Dashlane', category: 'software', logo: null }],
  
  // Cloud Storage
  ['dropbox.com', { name: 'Dropbox', category: 'cloud_storage', logo: null }],
  ['google.com', { name: 'Google One', category: 'cloud_storage', logo: null }],
  ['icloud.com', { name: 'iCloud+', category: 'cloud_storage', logo: null }],
  ['onedrive.com', { name: 'OneDrive', category: 'cloud_storage', logo: null }],
  ['box.com', { name: 'Box', category: 'cloud_storage', logo: null }],
  ['sync.com', { name: 'Sync.com', category: 'cloud_storage', logo: null }],
  ['pcloud.com', { name: 'pCloud', category: 'cloud_storage', logo: null }],
  
  // Development & Hosting
  ['github.com', { name: 'GitHub', category: 'development', logo: null }],
  ['gitlab.com', { name: 'GitLab', category: 'development', logo: null }],
  ['vercel.com', { name: 'Vercel', category: 'development', logo: null }],
  ['netlify.com', { name: 'Netlify', category: 'development', logo: null }],
  ['heroku.com', { name: 'Heroku', category: 'development', logo: null }],
  ['digitalocean.com', { name: 'DigitalOcean', category: 'development', logo: null }],
  ['aws.amazon.com', { name: 'AWS', category: 'development', logo: null }],
  ['cloud.google.com', { name: 'Google Cloud', category: 'development', logo: null }],
  ['azure.microsoft.com', { name: 'Azure', category: 'development', logo: null }],
  
  // AI & ML Services
  ['openai.com', { name: 'OpenAI', category: 'ai', logo: null }],
  ['anthropic.com', { name: 'Claude', category: 'ai', logo: null }],
  ['midjourney.com', { name: 'Midjourney', category: 'ai', logo: null }],
  ['jasper.ai', { name: 'Jasper', category: 'ai', logo: null }],
  ['copy.ai', { name: 'Copy.ai', category: 'ai', logo: null }],
  
  // News & Media
  ['nytimes.com', { name: 'New York Times', category: 'news', logo: null }],
  ['wsj.com', { name: 'Wall Street Journal', category: 'news', logo: null }],
  ['washingtonpost.com', { name: 'Washington Post', category: 'news', logo: null }],
  ['economist.com', { name: 'The Economist', category: 'news', logo: null }],
  ['ft.com', { name: 'Financial Times', category: 'news', logo: null }],
  ['medium.com', { name: 'Medium', category: 'news', logo: null }],
  ['substack.com', { name: 'Substack', category: 'news', logo: null }],
  ['audible.com', { name: 'Audible', category: 'media', logo: null }],
  ['scribd.com', { name: 'Scribd', category: 'media', logo: null }],
  ['kindle.com', { name: 'Kindle Unlimited', category: 'media', logo: null }],
  
  // Fitness & Health
  ['peloton.com', { name: 'Peloton', category: 'fitness', logo: null }],
  ['classpass.com', { name: 'ClassPass', category: 'fitness', logo: null }],
  ['myfitnesspal.com', { name: 'MyFitnessPal', category: 'fitness', logo: null }],
  ['strava.com', { name: 'Strava', category: 'fitness', logo: null }],
  ['headspace.com', { name: 'Headspace', category: 'fitness', logo: null }],
  ['calm.com', { name: 'Calm', category: 'fitness', logo: null }],
  ['noom.com', { name: 'Noom', category: 'fitness', logo: null }],
  
  // Gaming
  ['playstation.com', { name: 'PlayStation Plus', category: 'gaming', logo: null }],
  ['xbox.com', { name: 'Xbox Game Pass', category: 'gaming', logo: null }],
  ['nintendo.com', { name: 'Nintendo Switch Online', category: 'gaming', logo: null }],
  ['ea.com', { name: 'EA Play', category: 'gaming', logo: null }],
  ['ubisoft.com', { name: 'Ubisoft+', category: 'gaming', logo: null }],
  ['epicgames.com', { name: 'Epic Games', category: 'gaming', logo: null }],
  ['steam.com', { name: 'Steam', category: 'gaming', logo: null }],
  ['twitch.tv', { name: 'Twitch', category: 'gaming', logo: null }],
  
  // Communication
  ['discord.com', { name: 'Discord Nitro', category: 'communication', logo: null }],
  ['telegram.org', { name: 'Telegram Premium', category: 'communication', logo: null }],
  ['whatsapp.com', { name: 'WhatsApp Business', category: 'communication', logo: null }],
  
  // VPN & Security
  ['nordvpn.com', { name: 'NordVPN', category: 'security', logo: null }],
  ['expressvpn.com', { name: 'ExpressVPN', category: 'security', logo: null }],
  ['surfshark.com', { name: 'Surfshark', category: 'security', logo: null }],
  ['protonvpn.com', { name: 'ProtonVPN', category: 'security', logo: null }],
  ['malwarebytes.com', { name: 'Malwarebytes', category: 'security', logo: null }],
  ['norton.com', { name: 'Norton', category: 'security', logo: null }],
  ['mcafee.com', { name: 'McAfee', category: 'security', logo: null }],
  
  // E-commerce & Delivery
  ['instacart.com', { name: 'Instacart+', category: 'delivery', logo: null }],
  ['doordash.com', { name: 'DoorDash DashPass', category: 'delivery', logo: null }],
  ['ubereats.com', { name: 'Uber Eats Pass', category: 'delivery', logo: null }],
  ['grubhub.com', { name: 'Grubhub+', category: 'delivery', logo: null }],
  
  // Education & Learning
  ['coursera.org', { name: 'Coursera Plus', category: 'education', logo: null }],
  ['udemy.com', { name: 'Udemy', category: 'education', logo: null }],
  ['linkedin.com', { name: 'LinkedIn Premium', category: 'education', logo: null }],
  ['skillshare.com', { name: 'Skillshare', category: 'education', logo: null }],
  ['masterclass.com', { name: 'MasterClass', category: 'education', logo: null }],
  ['duolingo.com', { name: 'Duolingo Plus', category: 'education', logo: null }],
  ['babbel.com', { name: 'Babbel', category: 'education', logo: null }],
  
  // Finance & Banking
  ['mint.com', { name: 'Mint', category: 'finance', logo: null }],
  ['ynab.com', { name: 'YNAB', category: 'finance', logo: null }],
  ['quickbooks.com', { name: 'QuickBooks', category: 'finance', logo: null }],
  ['freshbooks.com', { name: 'FreshBooks', category: 'finance', logo: null }],
  ['wave.com', { name: 'Wave', category: 'finance', logo: null }],
  
  // Marketing & Analytics
  ['mailchimp.com', { name: 'Mailchimp', category: 'marketing', logo: null }],
  ['hubspot.com', { name: 'HubSpot', category: 'marketing', logo: null }],
  ['salesforce.com', { name: 'Salesforce', category: 'marketing', logo: null }],
  ['semrush.com', { name: 'SEMrush', category: 'marketing', logo: null }],
  ['ahrefs.com', { name: 'Ahrefs', category: 'marketing', logo: null }],
  ['moz.com', { name: 'Moz', category: 'marketing', logo: null }],
  ['hootsuite.com', { name: 'Hootsuite', category: 'marketing', logo: null }],
  ['buffer.com', { name: 'Buffer', category: 'marketing', logo: null }],
  
  // E-commerce Platforms
  ['shopify.com', { name: 'Shopify', category: 'ecommerce', logo: null }],
  ['squarespace.com', { name: 'Squarespace', category: 'ecommerce', logo: null }],
  ['wix.com', { name: 'Wix', category: 'ecommerce', logo: null }],
  ['wordpress.com', { name: 'WordPress', category: 'ecommerce', logo: null }],
  
  // Other Services
  ['patreon.com', { name: 'Patreon', category: 'creator', logo: null }],
  ['onlyfans.com', { name: 'OnlyFans', category: 'creator', logo: null }],
  ['buymeacoffee.com', { name: 'Buy Me a Coffee', category: 'creator', logo: null }],
  ['ko-fi.com', { name: 'Ko-fi', category: 'creator', logo: null }],
]);

/**
 * Get service info by domain
 * @param {string} domain
 * @returns {object|null} service info or null
 */
export function getServiceByDomain(domain) {
  return knownServices.get(domain) || null;
}

/**
 * Check if domain is a known service
 * @param {string} domain
 * @returns {boolean}
 */
export function isKnownService(domain) {
  return knownServices.has(domain);
}

/**
 * Get all known domains (for search queries)
 * @returns {string[]} array of domains
 */
export function getAllKnownDomains() {
  return Array.from(knownServices.keys());
}

/**
 * Get domains by category
 * @param {string} category
 * @returns {string[]} array of domains
 */
export function getDomainsByCategory(category) {
  const domains = [];
  for (const [domain, info] of knownServices.entries()) {
    if (info.category === category) {
      domains.push(domain);
    }
  }
  return domains;
}

// Made with Bob
