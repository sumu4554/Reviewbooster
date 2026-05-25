function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueSlug(pool, businessName, excludeId = null) {
  let base = slugify(businessName);
  if (!base) base = 'business';

  let slug = base;
  let counter = 1;

  while (true) {
    const params = [slug];
    let query = 'SELECT id FROM clients WHERE slug = ?';
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    if (rows.length === 0) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'css',
  'js',
  'contact',
  'services',
  'post-review',
  'business-review',
  'index',
  'favicon.ico',
]);

function isReservedSlug(slug) {
  if (!slug) return true;
  const lower = slug.toLowerCase();
  if (RESERVED_SLUGS.has(lower)) return true;
  if (lower.includes('.')) return true;
  return false;
}

module.exports = { slugify, generateUniqueSlug, isReservedSlug, RESERVED_SLUGS };
