import { toScriptJSON } from '../templates.js';

/**
 * The Micare template.
 *
 * Its page reads everything from one `const CLINIC = {...};` block and
 * binds it through data-c attributes, so personalising it is a single
 * substitution - no string-replacing names scattered through the markup
 * the way the classic template has to.
 *
 * Empty fields are left empty on purpose. The page itself falls back to
 * our own phone and email when a field is blank, which keeps the
 * fallback in one place rather than splitting it between here and there.
 */
export function renderMicare(html, lead) {
  // css/, js/ and image/ are relative inside the template folder.
  // Shared images are referenced as /img/..., which <base> leaves alone.
  if (!html.includes('<base href="/micare/"')) {
    html = html.replace('<head>', '<head>\n    <base href="/micare/" />');
  }

  const clinic = {
    name: lead.clinicname || '',
    doctor: lead.doctorname || '',
    phone: lead.phone || '',
    email: lead.email || '',
    address: lead.address || '',
  };

  return html.replace(
    /const CLINIC = {[\s\S]*?};/m,
    () => `const CLINIC = ${toScriptJSON(clinic)};`
  );
}
