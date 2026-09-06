import fs from 'fs';
import path from 'path';

/**
 * Read a template's HTML off disk.
 *
 * Each branch spells its path out at the call site rather than looking
 * one up. Next traces filesystem access statically at build time, and
 * anything it cannot follow - a variable, a lookup table, even a small
 * helper that returns the path - makes it give up and pull the whole
 * project into the serverless bundle, `public/` and all 3 MB of template
 * assets included. That is slow to deploy and can trip Vercel's size
 * limit. Written out like this, the trace covers exactly the two files
 * that are actually read.
 *
 * next.config.mjs names the same two files in outputFileTracingIncludes,
 * because a file under public/ would otherwise be treated as a CDN asset
 * and left out of the function entirely.
 */
export function loadTemplateHtml(id) {
  if (id === 'micare') {
    return fs.readFileSync(
      path.join(process.cwd(), 'public', 'micare', 'index.html'),
      'utf-8'
    );
  }
  // classic, and anything unrecognised
  return fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
}
