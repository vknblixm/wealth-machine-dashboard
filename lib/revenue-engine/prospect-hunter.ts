import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { findEmailForProspect } from './email-finder';

const DATA_DIR = join(process.cwd(), '.revenue-engine');
const PROSPECTS_FILE = join(DATA_DIR, 'prospects.json');

export interface Prospect {
  id: string;
  name: string;
  email: string | null;
  website: string | null;
  industry: string;
  painPoints: string[];
  source: string;
  score: number;
  status: 'found' | 'contacted' | 'replied' | 'qualified' | 'closed' | 'dead';
  serviceType: string;
  estimatedValue: number;
  foundAt: string;
  contactedAt: string | null;
  repliedAt: string | null;
  notes: string;
}

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

function loadProspects(): Prospect[] {
  if (!existsSync(PROSPECTS_FILE)) return [];
  return JSON.parse(readFileSync(PROSPECTS_FILE, 'utf-8'));
}

function saveProspects(prospects: Prospect[]) {
  writeFileSync(PROSPECTS_FILE, JSON.stringify(prospects, null, 2));
}

// ═══════════════════════════════════════════════════════
// PAIN POINT DETECTION
// ═══════════════════════════════════════════════════════

function detectPainPoints(text: string, title: string): string[] {
  const combined = (title + ' ' + text).toLowerCase();
  const painPoints: string[] = [];

  const painMap: [RegExp, string][] = [
    [/need (a |some )?(website|landing page|web design)/i, 'web-design'],
    [/need (a |some )?(logo|brand|branding)/i, 'branding'],
    [/struggling with (seo|search|ranking|google)/i, 'seo'],
    [/need (more |better )?(traffic|visitors|leads|customers)/i, 'lead-gen'],
    [/don.t have (a |any )?(clients|customers|money|revenue)/i, 'business-dev'],
    [/looking for (a |some )?(developer|engineer|programmer|coder)/i, 'dev-services'],
    [/need (help with |someone for )?(marketing|ads|advertising)/i, 'marketing'],
    [/struggling to (scale|grow|get|find)/i, 'growth'],
    [/need (a |an )?(automat|system|tool)/i, 'automation'],
    [/low (traffic|conversion|sales|revenue)/i, 'optimization'],
    [/overwhelmed|drowning|too much work/i, 'outsourcing'],
    [/no time|busy|burned out/i, 'automation'],
    [/looking for (a |an )?(agency|consultant|freelancer)/i, 'consulting'],
    [/hiring|seeking|looking for work|freelance available/i, 'services-needed'],
    [/just (launched|shipped|released)/i, 'post-launch-growth'],
    [/need (a |an )?(co-founder|technical|cto)/i, 'dev-services'],
    [/build (a |an |my )?(mvp|app|platform|saas)/i, 'dev-services'],
    [/how (do i|can i) (get|find|acquire)/i, 'lead-gen'],
  ];

  for (const [pattern, pain] of painMap) {
    if (pattern.test(combined)) {
      painPoints.push(pain);
    }
  }

  return painPoints;
}

// ═══════════════════════════════════════════════════════
// SOURCE 1: HackerNews
// ═══════════════════════════════════════════════════════

interface HNComment {
  by: string;
  text?: string;
  id: number;
  kids?: number[];
}

async function fetchHNItem(id: number): Promise<any> {
  try {
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    return await res.json();
  } catch {
    return null;
  }
}

async function huntHackerNews(): Promise<Partial<Prospect>[]> {
  const prospects: Partial<Prospect>[] = [];

  try {
    const [jobIds, askIds, showIds] = await Promise.all([
      fetch('https://hacker-news.firebaseio.com/v0/jobstories.json').then(r => r.json()).catch(() => []),
      fetch('https://hacker-news.firebaseio.com/v0/askstories.json').then(r => r.json()).catch(() => []),
      fetch('https://hacker-news.firebaseio.com/v0/showstories.json').then(r => r.json()).catch(() => []),
    ]);

    // Job stories — real companies hiring (have budget!)
    const topJobs = (jobIds || []).slice(0, 25);
    for (let i = 0; i < topJobs.length; i += 5) {
      const batch = topJobs.slice(i, i + 5);
      const items = await Promise.all(batch.map(fetchHNItem));

      for (const item of items) {
        if (!item?.by || !item?.title) continue;
        const text = item.title + ' ' + (item.text || '');
        const painPoints = detectPainPoints(text, item.title);
        const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
        const websiteMatch = text.match(/https?:\/\/[^\s<"']+/);

        prospects.push({
          name: item.by,
          email: emailMatch ? emailMatch[0] : null,
          website: websiteMatch ? websiteMatch[0] : null,
          industry: 'tech-startup',
          painPoints: painPoints.length > 0 ? painPoints : ['services-needed', 'post-launch-growth'],
          source: 'hackernews-jobs',
          score: 70 + painPoints.length * 10,
          notes: item.title.substring(0, 300),
          estimatedValue: 2500,
        });
        console.log(`  🎯 HN job: ${item.by} — ${item.title.substring(0, 70)}`);
      }
    }

    // Ask HN — people asking for help
    const topAsk = (askIds || []).slice(0, 12);
    for (const threadId of topAsk) {
      const thread = await fetchHNItem(threadId);
      if (!thread?.title) continue;

      const text = thread.title + ' ' + (thread.text || '');
      const painPoints = detectPainPoints(text, thread.title);

      if (painPoints.length > 0) {
        prospects.push({
          name: thread.by || 'HN user',
          email: null,
          website: thread.url || null,
          industry: 'tech-startup',
          painPoints,
          source: 'hackernews-ask',
          score: 55 + painPoints.length * 10,
          notes: thread.title,
          estimatedValue: 1500,
        });
        console.log(`  🎯 Ask HN: ${thread.by} — ${thread.title.substring(0, 60)}`);
      }

      // Scan comments for people describing problems
      if (thread.kids) {
        const commentIds = thread.kids.slice(0, 15);
        for (let i = 0; i < commentIds.length; i += 5) {
          const batch = commentIds.slice(i, i + 5);
          const comments = await Promise.all(batch.map(fetchHNItem));
          for (const comment of comments) {
            if (!comment?.by || !comment?.text) continue;
            const cp = detectPainPoints(comment.text, '');
            if (cp.length > 0) {
              const emailMatch = comment.text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
              prospects.push({
                name: comment.by,
                email: emailMatch ? emailMatch[0] : null,
                website: null,
                industry: 'tech-startup',
                painPoints: cp,
                source: 'hackernews-ask-comment',
                score: 50 + cp.length * 10,
                notes: comment.text.substring(0, 300).replace(/<[^>]*>/g, ''),
                estimatedValue: 1500,
              });
            }
          }
        }
      }
    }

    // Show HN — founders who just launched
    const topShow = (showIds || []).slice(0, 15);
    for (const threadId of topShow) {
      const thread = await fetchHNItem(threadId);
      if (!thread?.title) continue;

      prospects.push({
        name: thread.by || 'HN founder',
        email: null,
        website: thread.url || null,
        industry: 'startup',
        painPoints: ['post-launch-growth', 'lead-gen', 'marketing'],
        source: 'hackernews-show',
        score: 65,
        notes: thread.title,
        estimatedValue: 2500,
      });
      console.log(`  🎯 Show HN: ${thread.by} — ${thread.title.substring(0, 60)}`);
    }
  } catch (e) {
    console.error('HackerNews hunt failed:', (e as Error).message);
  }

  return prospects;
}

// ═══════════════════════════════════════════════════════
// SOURCE 2: Reddit — real users asking for help
// ═══════════════════════════════════════════════════════

async function huntReddit(keywords: string[]): Promise<Partial<Prospect>[]> {
  const prospects: Partial<Prospect>[] = [];

  const subreddits = [
    'smallbusiness', 'Entrepreneur', 'startups', 'freelance',
    'webdev', 'digital_marketing', 'SEO', 'SaaS',
    'indiehackers', 'SideProject', 'AdvancedEntrepreneur',
  ];

  for (const sub of subreddits) {
    try {
      const url = `https://old.reddit.com/r/${sub}/new.json?limit=15`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'RevenueBot/1.0 (compatible)' },
      });
      if (!res.ok) continue;
      const data = await res.json();

      if (data?.data?.children) {
        for (const post of data.data.children) {
          const d = post.data;
          if (!d.author || !d.title) continue;

          const fullText = d.title + ' ' + (d.selftext || '');
          const painPoints = detectPainPoints(fullText, d.title);

          if (painPoints.length > 0) {
            const emailMatch = fullText.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
            const websiteMatch = fullText.match(/https?:\/\/[^\s<"')]+/);

            prospects.push({
              name: d.author,
              email: emailMatch ? emailMatch[0] : null,
              website: websiteMatch ? websiteMatch[0] : (d.url !== `https://www.reddit.com${d.permalink}` ? d.url : null),
              industry: sub,
              painPoints,
              source: `reddit-r/${sub}`,
              score: 55 + painPoints.length * 10,
              notes: d.title.substring(0, 200),
              estimatedValue: 1500,
            });
            console.log(`  🎯 Reddit r/${sub}: u/${d.author} — ${d.title.substring(0, 60)}`);
          }
        }
      }

      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`Reddit hunt failed for r/${sub}:`, (e as Error).message);
    }
  }

  return prospects;
}

// ═══════════════════════════════════════════════════════
// SOURCE 3: IndieHackers
// ═══════════════════════════════════════════════════════

async function huntIndieHackers(): Promise<Partial<Prospect>[]> {
  const prospects: Partial<Prospect>[] = [];

  try {
    const res = await fetch('https://www.indiehackers.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RevenueBot/1.0)' },
    });
    const html = await res.text();

    const productMatches = html.match(/\/product\/[^"]+"/g) || [];
    const nameMatches = html.match(/class="[^"]*product-name[^"]*"[^>]*>([^<]+)/g) || [];

    for (let i = 0; i < Math.min(productMatches.length, 15); i++) {
      const slug = productMatches[i].replace(/"/g, '');
      const name = nameMatches[i]?.replace(/class="[^"]*"[^>]*>/, '') || slug.split('/').pop();

      prospects.push({
        name: name || 'IH Founder',
        website: `https://www.indiehackers.com${slug}`,
        industry: 'indie-startup',
        painPoints: ['post-launch-growth', 'lead-gen', 'marketing'],
        source: 'indiehackers',
        score: 60,
        notes: `IndieHackers product: ${name}`,
        estimatedValue: 2000,
      });
    }
  } catch (e) {
    console.error('IndieHackers hunt failed:', (e as Error).message);
  }

  return prospects;
}

// ═══════════════════════════════════════════════════════
// SOURCE 4: RSS Feeds
// ═══════════════════════════════════════════════════════

async function huntRSSFeeds(): Promise<Partial<Prospect>[]> {
  const prospects: Partial<Prospect>[] = [];

  const feeds = [
    'https://www.reddit.com/r/startups/new/.rss',
    'https://www.reddit.com/r/SideProject/new/.rss',
    'https://www.reddit.com/r/Entrepreneur/new/.rss',
    'https://www.reddit.com/r/smallbusiness/new/.rss',
  ];

  for (const feedUrl of feeds) {
    try {
      const res = await fetch(feedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RevenueBot/1.0)' },
      });
      if (!res.ok) continue;
      const xml = await res.text();

      const items = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
      for (const item of items.slice(0, 15)) {
        const title = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] || '';
        const link = item.match(/<link[^>]*href="([^"]+)"/)?.[1] || '';
        const content = item.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] || '';
        const author = item.match(/<name>([\s\S]*?)<\/name>/)?.[1] || '';

        const cleanTitle = title.replace(/<!\[CDATA\[|\]\]>/g, '');
        const cleanContent = content.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '');
        const painPoints = detectPainPoints(cleanTitle + ' ' + cleanContent, cleanTitle);

        if (painPoints.length > 0 && cleanTitle.length > 10) {
          prospects.push({
            name: author || cleanTitle.substring(0, 40),
            website: link || null,
            industry: feedUrl.includes('startups') ? 'startup' : 'entrepreneur',
            painPoints,
            source: `rss-${new URL(feedUrl).hostname}`,
            score: 50 + painPoints.length * 10,
            notes: cleanTitle.substring(0, 200),
            estimatedValue: 1500,
          });
        }
      }

      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`RSS feed failed (${feedUrl}):`, (e as Error).message);
    }
  }

  return prospects;
}

// ═══════════════════════════════════════════════════════
// SOURCE 5: Product Hunt
// ═══════════════════════════════════════════════════════

async function huntProductLaunches(): Promise<Partial<Prospect>[]> {
  const prospects: Partial<Prospect>[] = [];

  try {
    const res = await fetch('https://www.producthunt.com/frontend/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify({
        query: `query { posts(order: VOTES, first: 20) { edges { node { name tagline url website } } } }`,
      }),
    });
    const data = await res.json();
    const posts = data?.data?.posts?.edges || [];

    for (const { node } of posts) {
      prospects.push({
        name: node.name,
        website: node.url || node.website,
        industry: 'startup',
        painPoints: ['post-launch-growth', 'lead-gen', 'marketing'],
        source: 'producthunt',
        score: 60,
        notes: node.tagline,
        estimatedValue: 2500,
      });
    }
  } catch (e) {
    console.error('ProductHunt hunt failed:', (e as Error).message);
  }

  return prospects;
}

// ═══════════════════════════════════════════════════════
// SOURCE 6: GitHub — find developers with contact info
// ═══════════════════════════════════════════════════════

async function huntGitHub(): Promise<Partial<Prospect>[]> {
  const prospects: Partial<Prospect>[] = [];

  const queries = [
    'looking for clients',
    'available for hire',
    'need funding',
    'just launched',
    'looking for co-founder',
    'need a developer',
    'open to work',
  ];

  for (const query of queries.slice(0, 3)) {
    try {
      const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query + ' is:issue is:open')}&sort=created&order=desc&per_page=10`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'RevenueBot/1.0', 'Accept': 'application/vnd.github.v3+json' },
      });
      if (!res.ok) continue;
      const data = await res.json();

      for (const item of (data.items || []).slice(0, 5)) {
        if (!item.user) continue;
        const text = item.title + ' ' + (item.body || '');
        const painPoints = detectPainPoints(text, item.title);

        prospects.push({
          name: item.user.login,
          email: null,
          website: item.user.html_url,
          industry: 'developer',
          painPoints: painPoints.length > 0 ? painPoints : ['services-needed'],
          source: 'github',
          score: 50,
          notes: item.title.substring(0, 200),
          estimatedValue: 1500,
        });
      }
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.error(`GitHub hunt failed for "${query}":`, (e as Error).message);
    }
  }

  return prospects;
}

// ═══════════════════════════════════════════════════════
// SERVICE MATCHING
// ═══════════════════════════════════════════════════════

const SERVICE_MAP: Record<string, { name: string; price: number; deliveryTime: string }> = {
  'web-design': { name: 'Website Build', price: 2500, deliveryTime: '7 days' },
  'branding': { name: 'Brand Package', price: 800, deliveryTime: '3 days' },
  'seo': { name: 'SEO Audit + Fix', price: 1500, deliveryTime: '14 days' },
  'lead-gen': { name: 'Lead Generation System', price: 3000, deliveryTime: '10 days' },
  'business-dev': { name: 'Business Growth Package', price: 5000, deliveryTime: '30 days' },
  'dev-services': { name: 'Development Sprint', price: 4000, deliveryTime: '21 days' },
  'marketing': { name: 'Marketing Campaign', price: 2000, deliveryTime: '7 days' },
  'growth': { name: 'Growth Strategy', price: 3500, deliveryTime: '14 days' },
  'automation': { name: 'Automation Setup', price: 2500, deliveryTime: '10 days' },
  'optimization': { name: 'Conversion Optimization', price: 1800, deliveryTime: '10 days' },
  'outsourcing': { name: 'Team Augmentation', price: 2000, deliveryTime: '3 days' },
  'consulting': { name: 'Strategy Consulting', price: 500, deliveryTime: '1 session' },
  'services-needed': { name: 'Growth Package', price: 1500, deliveryTime: '14 days' },
  'post-launch-growth': { name: 'Launch Growth Sprint', price: 3000, deliveryTime: '10 days' },
};

export function matchService(painPoints: string[]): { name: string; price: number; deliveryTime: string } | null {
  if (painPoints.length === 0) return null;
  const topPain = painPoints[0];
  return SERVICE_MAP[topPain] || { name: 'General Service', price: 1000, deliveryTime: '14 days' };
}

// ═══════════════════════════════════════════════════════
// EMAIL ENRICHMENT — Find real email addresses
// ═══════════════════════════════════════════════════════

function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  if (email.includes('example.com') || email.includes('test.com') || email.includes('sentry.io')) return false;
  return true;
}

async function enrichHNProfile(username: string): Promise<{ email: string | null; website: string | null }> {
  try {
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/user/${username}.json`);
    const user = await res.json();
    if (!user) return { email: null, website: null };

    const about = user.about || '';
    const emailMatch = about.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    const websiteMatch = about.match(/https?:\/\/[^\s<"']+/);

    return {
      email: emailMatch ? emailMatch[0] : null,
      website: websiteMatch ? websiteMatch[0] : null,
    };
  } catch {
    return { email: null, website: null };
  }
}

async function enrichFromWebsite(url: string): Promise<{ email: string | null }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RevenueBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();

    // Look for email in common patterns
    const emailPatterns = [
      /mailto:([\w.+-]+@[\w-]+\.[\w.]+)/i,
      /[\w.+-]+@[\w-]+\.[\w.]+/,
    ];

    for (const pattern of emailPatterns) {
      const match = html.match(pattern);
      if (match) {
        const email = match[1] || match[0];
        if (!email.match(/(noreply|no-reply|support|admin|info|hello|contact|webmaster|abuse|postmaster)@/i)) {
          return { email };
        }
      }
    }

    return { email: null };
  } catch {
    return { email: null };
  }
}

async function enrichGitHubProfile(username: string): Promise<{ email: string | null; website: string | null }> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'RevenueBot/1.0', 'Accept': 'application/vnd.github.v3+json' },
    });
    if (!res.ok) return { email: null, website: null };
    const user = await res.json();

    return {
      email: user.email || null,
      website: user.blog || user.html_url,
    };
  } catch {
    return { email: null, website: null };
  }
}

async function enrichRedditUser(username: string): Promise<{ email: string | null; website: string | null }> {
  try {
    const res = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
      headers: { 'User-Agent': 'RevenueBot/1.0 (compatible)' },
    });
    if (!res.ok) return { email: null, website: null };
    const data = await res.json();
    const about = data?.data?.subreddit?.public_description || data?.data?.subreddit?.description || '';

    const emailMatch = about.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    const websiteMatch = about.match(/https?:\/\/[^\s<"']+/);

    return {
      email: emailMatch ? emailMatch[0] : null,
      website: websiteMatch ? websiteMatch[0] : null,
    };
  } catch {
    return { email: null, website: null };
  }
}

async function enrichProspects(prospects: Prospect[]): Promise<void> {
  const needsEnrichment = prospects.filter(p => !p.email && p.score >= 40);
  console.log(`  🔎 Enriching ${needsEnrichment.length} prospects for contact info...`);

  let enriched = 0;

  for (const prospect of needsEnrichment.slice(0, 30)) {
    // HN profile enrichment
    if (prospect.source.includes('hackernews') && !prospect.email) {
      const hnUsername = prospect.name.replace(/ \(HN\)/, '').trim();
      const hnData = await enrichHNProfile(hnUsername);
      if (hnData.email) {
        prospect.email = hnData.email;
        enriched++;
        console.log(`  ✅ HN email: ${prospect.name} → ${hnData.email}`);
      }
      if (hnData.website && !prospect.website) {
        prospect.website = hnData.website;
      }
    }

    // GitHub profile enrichment
    if (prospect.source === 'github' && !prospect.email) {
      const ghData = await enrichGitHubProfile(prospect.name);
      if (ghData.email) {
        prospect.email = ghData.email;
        enriched++;
        console.log(`  ✅ GitHub email: ${prospect.name} → ${ghData.email}`);
      }
      if (ghData.website && !prospect.website) {
        prospect.website = ghData.website;
      }
    }

    // Reddit profile enrichment
    if (prospect.source.includes('reddit') && !prospect.email) {
      const redditUser = prospect.name.replace(/^\//, '').replace('u/', '');
      const redditData = await enrichRedditUser(redditUser);
      if (redditData.email) {
        prospect.email = redditData.email;
        enriched++;
        console.log(`  ✅ Reddit email: ${prospect.name} → ${redditData.email}`);
      }
      if (redditData.website && !prospect.website) {
        prospect.website = redditData.website;
      }
    }

    // Website scraping for any prospect with a website
    if (!prospect.email && prospect.website) {
      const webData = await enrichFromWebsite(prospect.website);
      if (webData.email) {
        prospect.email = webData.email;
        enriched++;
        console.log(`  ✅ Website email: ${prospect.name} → ${webData.email}`);
      }
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`  📧 Enrichment complete: ${enriched} emails found`);
}

// ═══════════════════════════════════════════════════════
// MAIN HUNT FUNCTION
// ═══════════════════════════════════════════════════════

export async function runProspectHunt(): Promise<{ found: number; total: number; topProspects: Prospect[] }> {
  console.log('🔍 Starting prospect hunt...');
  const startTime = Date.now();

  // Run all hunters in parallel
  const results = await Promise.allSettled([
    huntHackerNews(),
    huntReddit([]),
    huntIndieHackers(),
    huntProductLaunches(),
    huntRSSFeeds(),
    huntGitHub(),
  ]);

  const rawProspects = results
    .filter((r): r is PromiseFulfilledResult<Partial<Prospect>[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);

  console.log(`📡 Raw prospects from all sources: ${rawProspects.length}`);

  // Load existing and deduplicate
  const existing = loadProspects();
  const existingKeys = new Set(existing.map(p => `${p.name.toLowerCase()}-${p.source}`));

  let newCount = 0;
  for (const raw of rawProspects) {
    const name = (raw.name || '').toLowerCase().trim();
    if (!name || name === 'unknown business' || name.length < 2) continue;

    const key = `${name}-${raw.source}`;
    if (existingKeys.has(key)) continue;

    const service = matchService(raw.painPoints || []);
    const prospect: Prospect = {
      id: `prospect-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: raw.name!,
      email: raw.email || null,
      website: raw.website || null,
      industry: raw.industry || 'unknown',
      painPoints: raw.painPoints || [],
      source: raw.source || 'unknown',
      score: raw.score || 30,
      status: 'found',
      serviceType: service?.name || 'General Service',
      estimatedValue: service?.price || 1000,
      foundAt: new Date().toISOString(),
      contactedAt: null,
      repliedAt: null,
      notes: raw.notes || '',
    };

    existing.push(prospect);
    existingKeys.add(key);
    newCount++;
  }

  existing.sort((a, b) => b.score - a.score);
  saveProspects(existing);

  // Enrichment: find emails for prospects that don't have them
  try {
    // First pass: basic enrichment (HN profiles, Reddit profiles)
    await enrichProspects(existing);

    // Second pass: advanced email finder (website scraping, pattern guessing, GitHub commits)
    const stillNeedEmail = existing.filter(p => !p.email && p.score >= 30);
    console.log(`  🔎 Advanced email discovery for ${stillNeedEmail.length} prospects...`);
    let advancedFound = 0;
    for (const prospect of stillNeedEmail.slice(0, 30)) {
      try {
        const result = await findEmailForProspect(prospect.name, prospect.website, prospect.source);
        if (result && result.confidence >= 50) {
          prospect.email = result.email;
          advancedFound++;
          console.log(`  ✅ Found: ${prospect.name} → ${result.email} (${result.method})`);
        }
        await new Promise(r => setTimeout(r, 200));
      } catch {}
    }
    console.log(`  📧 Advanced discovery: ${advancedFound} emails found`);

    saveProspects(existing);
  } catch (e) {
    console.error('Enrichment error:', (e as Error).message);
  }

  const elapsed = Date.now() - startTime;
  const pipeline = existing.reduce((s, p) => s + p.estimatedValue, 0);
  const withEmails = existing.filter(p => p.email).length;

  console.log(`✅ Hunt complete: ${newCount} new prospects in ${elapsed}ms`);
  console.log(`📊 Total: ${existing.length} prospects | ${withEmails} with emails | $${pipeline.toLocaleString()} pipeline`);

  return {
    found: newCount,
    total: existing.length,
    topProspects: existing.slice(0, 10),
  };
}

export { loadProspects, saveProspects };
