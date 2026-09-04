// ═══════════════════════════════════════════════════════
// EMAIL FINDER — Advanced email discovery
// Finds real email addresses through multiple strategies
// ═══════════════════════════════════════════════════════

export interface EmailFindResult {
  email: string;
  confidence: number; // 0-100
  method: string;
}

// Common first-name patterns from usernames
function extractFirstName(username: string): string {
  // Remove numbers, special chars
  const clean = username.replace(/[0-9_-]/g, '').toLowerCase();
  // Common first name patterns in usernames
  const parts = clean.split(/[A-Z]/).join('').split('.');
  return parts[0] || clean;
}

function extractDomain(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    // Remove www. prefix
    return hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function extractNameParts(name: string): { first: string; last: string } {
  // Handle various name formats
  const clean = name.replace(/[0-9_\-]/g, ' ').trim();
  const parts = clean.split(/\s+/).filter(p => p.length > 1);
  return {
    first: (parts[0] || '').toLowerCase(),
    last: (parts[1] || '').toLowerCase(),
  };
}

// ═══════════════════════════════════════════════════════
// STRATEGY 1: Email Pattern Guessing
// Given a name and domain, try common email patterns
// ═══════════════════════════════════════════════════════

function generateEmailPatterns(name: string, domain: string): string[] {
  const { first, last } = extractNameParts(name);
  if (!first) return [];

  const patterns = [
    `${first}@${domain}`,
    `${first}.${last}@${domain}`,
    `${first}${last}@${domain}`,
    `${first[0]}${last}@${domain}`,
    `${first}_${last}@${domain}`,
    `${first}-${last}@${domain}`,
    `${last}@${domain}`,
    `${last}.${first}@${domain}`,
    `hello@${domain}`,
    `contact@${domain}`,
    `info@${domain}`,
    `hi@${domain}`,
  ];

  // Also try without double extensions
  const baseDomain = domain.replace(/\.(com|co|io|ai|dev|app|net|org|xyz)$/, '');
  if (baseDomain !== domain) {
    patterns.push(`${first}@${baseDomain}.com`);
    `${first}.${last}@${baseDomain}.com`;
  }

  return [...new Set(patterns)]; // deduplicate
}

// ═══════════════════════════════════════════════════════
// STRATEGY 2: Deep Website Scraping
// Crawl contact/about pages for email addresses
// ═══════════════════════════════════════════════════════

const SKIP_EMAILS = new Set([
  'noreply@', 'no-reply@', 'support@', 'admin@', 'info@',
  'hello@', 'contact@', 'webmaster@', 'abuse@', 'postmaster@',
  'donotreply@', 'mailer-daemon@', 'bounce@', 'auto@',
]);

function isValidPersonalEmail(email: string): boolean {
  if (!email || email.length < 5) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  if (email.includes('example.com') || email.includes('test.com') || email.includes('sentry.io')) return false;
  if (email.includes('.png') || email.includes('.jpg') || email.includes('.gif')) return false;

  const local = email.split('@')[0].toLowerCase();
  for (const skip of SKIP_EMAILS) {
    if (local.startsWith(skip.replace('@', ''))) return false;
  }

  return true;
}

async function scrapeWebsiteForEmails(url: string): Promise<EmailFindResult[]> {
  const emails: EmailFindResult[] = [];

  const pagesToCheck = [
    url,
    url.replace(/\/$/, '') + '/contact',
    url.replace(/\/$/, '') + '/about',
    url.replace(/\/$/, '') + '/team',
    url.replace(/\/$/, '') + '/about-us',
  ];

  for (const pageUrl of pagesToCheck) {
    try {
      const res = await fetch(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue;
      const html = await res.text();

      // Look for mailto: links first (highest confidence)
      const mailtoMatches = html.matchAll(/mailto:([^\s"'<>]+@[^\s"'<>]+)/gi);
      for (const match of mailtoMatches) {
        const email = match[1].toLowerCase().trim();
        if (isValidPersonalEmail(email)) {
          emails.push({ email, confidence: 90, method: 'mailto-link' });
        }
      }

      // Look for email patterns in text
      const emailMatches = html.matchAll(/[\w.+-]+@[\w-]+\.[\w.]{2,}/gi);
      for (const match of emailMatches) {
        const email = match[0].toLowerCase().trim();
        if (isValidPersonalEmail(email)) {
          emails.push({ email, confidence: 70, method: 'website-scrape' });
        }
      }

      // Look for structured data with emails
      const jsonLdMatches = html.matchAll(/"email"\s*:\s*"([^"]+)"/gi);
      for (const match of jsonLdMatches) {
        const email = match[1].toLowerCase().trim();
        if (isValidPersonalEmail(email)) {
          emails.push({ email, confidence: 85, method: 'structured-data' });
        }
      }

      await new Promise(r => setTimeout(r, 300));
    } catch {
      // Skip failed pages
    }
  }

  // Deduplicate, keeping highest confidence
  const best = new Map<string, EmailFindResult>();
  for (const e of emails) {
    const existing = best.get(e.email);
    if (!existing || e.confidence > existing.confidence) {
      best.set(e.email, e);
    }
  }

  return Array.from(best.values()).sort((a, b) => b.confidence - a.confidence);
}

// ═══════════════════════════════════════════════════════
// STRATEGY 3: GitHub Commit Email Extraction
// Many developers have their email in git commits
// ═══════════════════════════════════════════════════════

async function findEmailFromGitHub(username: string): Promise<EmailFindResult | null> {
  try {
    // Check recent commits for email
    const res = await fetch(
      `https://api.github.com/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=5`,
      {
        headers: {
          'User-Agent': 'RevenueBot/1.0',
          'Accept': 'application/vnd.github.cloak-preview+json',
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();

    for (const item of (data.items || []).slice(0, 3)) {
      const email = item.commit?.author?.email;
      if (email && isValidPersonalEmail(email)) {
        return { email, confidence: 80, method: 'github-commits' };
      }
    }

    // Also check the user's profile directly
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'RevenueBot/1.0', 'Accept': 'application/vnd.github.v3+json' },
    });
    if (userRes.ok) {
      const user = await userRes.json();
      if (user.email && isValidPersonalEmail(user.email)) {
        return { email: user.email, confidence: 75, method: 'github-profile' };
      }
      // Check blog/website for emails
      if (user.blog) {
        const domain = extractDomain(user.blog);
        if (domain) {
          const patterns = generateEmailPatterns(username, domain);
          // We can't verify these without SMTP verification, but include as low-confidence
          if (patterns.length > 0) {
            return { email: patterns[0], confidence: 25, method: 'github-blog-pattern' };
          }
        }
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

// ═══════════════════════════════════════════════════════
// MAIN: Find email for a prospect using all strategies
// ═══════════════════════════════════════════════════════

export async function findEmailForProspect(
  name: string,
  website: string | null,
  source: string
): Promise<EmailFindResult | null> {
  const results: EmailFindResult[] = [];

  // Strategy 1: Deep website scraping
  if (website) {
    const websiteEmails = await scrapeWebsiteForEmails(website);
    results.push(...websiteEmails);
  }

  // Strategy 2: GitHub profile & commits
  if (source.includes('github') || source.includes('hackernews')) {
    const ghEmail = await findEmailFromGitHub(name);
    if (ghEmail) results.push(ghEmail);
  }

  // Strategy 3: Pattern guessing from name + website domain
  if (website && results.length === 0) {
    const domain = extractDomain(website);
    if (domain) {
      const patterns = generateEmailPatterns(name, domain);
      // Return lowest-confidence patterns as guesses
      for (const pattern of patterns.slice(0, 3)) {
        results.push({ email: pattern, confidence: 15, method: 'pattern-guess' });
      }
    }
  }

  // Return best result (highest confidence, but only if confidence >= 50 for real sending)
  const sorted = results.sort((a, b) => b.confidence - a.confidence);
  return sorted[0] || null;
}

// ═══════════════════════════════════════════════════════
// Bulk enrichment for prospects without emails
// ═══════════════════════════════════════════════════════

export async function enrichProspectsWithEmails(
  prospects: Array<{ name: string; email: string | null; website: string | null; source: string }>
): Promise<number> {
  const needsEmail = prospects.filter(p => !p.email);
  console.log(`  🔎 Finding emails for ${needsEmail.length} prospects...`);

  let found = 0;

  for (const prospect of needsEmail.slice(0, 25)) {
    const result = await findEmailForProspect(prospect.name, prospect.website, prospect.source);
    if (result && result.confidence >= 50) {
      prospect.email = result.email;
      found++;
      console.log(`  ✅ ${prospect.name} → ${result.email} (${result.method}, confidence: ${result.confidence}%)`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`  📧 Email discovery: ${found} found out of ${needsEmail.length} searched`);
  return found;
}
