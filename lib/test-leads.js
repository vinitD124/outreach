/* Rows addressed to one of our own inboxes are test sends, not prospects.
   They were skewing everything: every test demo gets opened, so "opened
   demo" and the visit rate both read higher than reality.

   This lives in its own module because the table hides these rows and the
   page header counts them, and the two have to agree. */

export const TEST_INBOXES = [
  'vedix124@gmail.com',
  'accretevinit@gmail.com',
  'vinitdharaiya124@gmail.com',
  'vinit@accreteinfo.com',
];

export function isTestLead(lead) {
  return TEST_INBOXES.includes((lead.email || '').trim().toLowerCase());
}
