'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail, FileText, CheckCircle2, Clock, MapPin, Edit3, Save, Send, ExternalLink,
  Search, Copy, Eye, AlertTriangle, Layout, MoreHorizontal, Phone, X, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { updateLead, setLeadTemplate, setTemplateForLeads } from './actions';
import { TEMPLATE_LIST, resolveTemplate } from '@/lib/templates';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';

/* Pipeline stages, in the order a lead actually moves through them.
   `test` is what decides which chip a row belongs to. */
const FILTERS = [
  { key: 'all', label: 'All', test: () => true, tone: 'new' },
  { key: 'ready', label: 'Ready to pitch', test: (l) => l.email && !l.emailsent, tone: 'ready' },
  { key: 'sent', label: 'Pitched', test: (l) => l.emailsent, tone: 'sent' },
  { key: 'visited', label: 'Visited', test: (l) => l.demovisited, tone: 'visited' },
  { key: 'noemail', label: 'No email', test: (l) => !l.email, tone: 'blocked' },
];

// Dates are formatted deterministically rather than with toLocaleDateString,
// which can disagree between the server render and the client and trip a
// hydration warning.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function shortDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

const STAGE_BG = {
  new: 'bg-stage-new',
  ready: 'bg-stage-ready',
  sent: 'bg-stage-sent',
  visited: 'bg-stage-visited',
  blocked: 'bg-stage-blocked',
};

export default function LeadTable({ leads }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState({});
  const [bulkMode, setBulkMode] = useState(false);
  // Set only when you explicitly confirm a re-send. Without it the send loop
  // skips anyone already pitched, so ticking a "Sent" row by hand cannot
  // quietly mail the same doctor twice.
  const [allowResend, setAllowResend] = useState(false);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sentProgress, setSentProgress] = useState(null);
  // In-app replacement for window.confirm, which renders the deployment
  // hostname and looks nothing like the rest of the app.
  const [ask, setAsk] = useState(null);
  const [templateBusy, setTemplateBusy] = useState(null);

  const confirmDialog = (opts) => new Promise((resolve) => setAsk({ ...opts, resolve }));
  const answer = (value) => { if (ask) { ask.resolve(value); setAsk(null); } };

  /* ---- counts for the filter chips and the pipeline strip ---- */
  const counts = useMemo(() => {
    const c = {};
    FILTERS.forEach((f) => { c[f.key] = leads.filter(f.test).length; });
    return c;
  }, [leads]);

  const visitRate = counts.sent > 0 ? Math.round((counts.visited / counts.sent) * 100) : null;

  /* ---- the rows actually on screen ---- */
  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter) || FILTERS[0];
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (!f.test(l)) return false;
      if (!q) return true;
      return [l.clinicname, l.doctorname, l.email, l.phone, l.address]
        .some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [leads, filter, query]);

  // Only these are worth a pitch: reachable, and not already pitched.
  const sendable = useMemo(() => visible.filter((l) => l.email && !l.emailsent), [visible]);
  const selectedCount = selectedIds.size;

  const wasPitched = (l) => Boolean(l.emailsent) || emailStatus[l.id] === 'sent';
  const selectedLeads = useMemo(() => leads.filter((l) => selectedIds.has(l.id)), [leads, selectedIds]);
  // Counted so the two never overlap — a lead with no email is reported once,
  // under "no email", even if it was pitched before the address was cleared.
  const selectedNoEmail = selectedLeads.filter((l) => !l.email).length;
  const selectedPitched = selectedLeads.filter((l) => l.email && wasPitched(l)).length;

  /* Select-all reflects the sendable rows it actually controls. Comparing it
     against every row is why the box never looked checked. */
  const allSendableSelected = sendable.length > 0 && sendable.every((l) => selectedIds.has(l.id));
  const someSelected = selectedCount > 0 && !allSendableSelected;

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (allSendableSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(sendable.map((l) => l.id)));
  };

  // Changing the view drops the selection, so a bulk send can never reach a
  // row that scrolled out of the filter.
  const changeFilter = (key) => { setFilter(key); setSelectedIds(new Set()); };

  // Escape clears a selection, the way it does in every other table.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && selectedCount > 0 && !selectedLead && !bulkMode && !editingLead && !ask) {
        setSelectedIds(new Set());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedCount, selectedLead, bulkMode, editingLead, ask]);

  /* Changing the template only changes what /{slug} serves from now on.
     The slug is untouched, so a link already in someone's inbox keeps
     working - it just renders the other template next time it is opened. */
  async function changeTemplate(lead, template) {
    if (resolveTemplate(lead.template).id === template) return;
    setTemplateBusy(lead.id);
    try {
      await setLeadTemplate(lead.id, template);
      const label = resolveTemplate(template).label;
      toast.success(`${lead.clinicname} now uses ${label}`, {
        description: lead.emailsent
          ? 'Already pitched — the link they have will now open this template.'
          : undefined,
      });
      router.refresh();
    } catch (err) {
      toast.error('Could not change the template', { description: err.message });
    } finally {
      setTemplateBusy(null);
    }
  }

  async function bulkChangeTemplate(template) {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setTemplateBusy('bulk');
    try {
      const { updated } = await setTemplateForLeads(ids, template);
      toast.success(`${updated} lead${updated === 1 ? '' : 's'} set to ${resolveTemplate(template).label}`);
      router.refresh();
    } catch (err) {
      toast.error('Could not change the template', { description: err.message });
    } finally {
      setTemplateBusy(null);
    }
  }

  async function copyEmail(email) {
    try {
      await navigator.clipboard.writeText(email);
      toast.success(`Copied ${email}`);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  }

  async function handleSendEmail(e) {
    e.preventDefault();
    setIsSending(true);

    const formData = new FormData(e.target);
    const emailBody = formData.get('emailBody');
    const emailSubject = formData.get('emailSubject');

    const targets = bulkMode ? Array.from(selectedIds) : [selectedLead.id];
    let successCount = 0;
    const failures = [];
    const skippedNoEmail = [];
    const skippedPitched = [];

    for (let i = 0; i < targets.length; i++) {
      const lead = leads.find((l) => l.id === targets[i]);
      if (!lead) continue;
      if (!lead.email) { skippedNoEmail.push(lead.clinicname || targets[i]); continue; }
      // The row button is disabled once a lead is pitched, but a hand-ticked
      // checkbox used to walk straight past that and mail them twice.
      if (!allowResend && wasPitched(lead)) { skippedPitched.push(lead.clinicname || targets[i]); continue; }

      if (targets.length > 1) setSentProgress({ done: i, total: targets.length, name: lead.clinicname });

      try {
        const res = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: lead.id,
            subjectTemplate: emailSubject,
            bodyTemplate: emailBody,
          }),
        });

        if (res.ok) {
          setEmailStatus((prev) => ({ ...prev, [lead.id]: 'sent' }));
          successCount++;
        } else {
          const data = await res.json().catch(() => ({}));
          failures.push(`${lead.clinicname}: ${data.error || 'HTTP ' + res.status}`);
          setEmailStatus((prev) => ({ ...prev, [lead.id]: 'failed' }));
        }
      } catch (err) {
        failures.push(`${lead.clinicname}: ${err.message || 'network error'}`);
        setEmailStatus((prev) => ({ ...prev, [lead.id]: 'failed' }));
      }
      // Gmail throttles bursts from a personal account. 500ms was fast
      // enough to get flagged; 3s keeps a run of 55 clear of it.
      if (targets.length > 1 && i < targets.length - 1) await new Promise((r) => setTimeout(r, 3000));
    }

    setIsSending(false);
    setSentProgress(null);
    closeComposer();
    setSelectedIds(new Set());

    if (failures.length) {
      console.error('Failed sends:\n' + failures.join('\n'));
      toast.error(`${successCount} sent, ${failures.length} failed. First: ${failures[0]}`, { duration: 12000 });
    } else if (targets.length > 1) {
      toast.success(`Successfully sent ${successCount} emails!`);
    } else if (successCount === 1) {
      toast.success('Pitch sent successfully!');
    }
    if (skippedNoEmail.length) {
      toast.warning(`${skippedNoEmail.length} skipped, no email address on file.`);
    }
    if (skippedPitched.length) {
      toast.warning(`${skippedPitched.length} skipped, already pitched.`);
    }
    // Pull the fresh emailsent / emailsentat values instead of relying on
    // local state that disappears on reload.
    router.refresh();
  }

  async function handleUpdateLead(e) {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.target);
    const data = {
      clinicname: formData.get('clinicname'),
      doctorname: formData.get('doctorname'),
      email: formData.get('email'),
      phone: formData.get('phone'),
    };

    try {
      await updateLead(editingLead.id, data);
      setEditingLead(null);
      toast.success('Lead updated successfully');
    } catch (err) {
      toast.error('Error saving lead details.');
    } finally {
      setIsSaving(false);
    }
  }

  function openComposer(lead) {
    if (!lead.email) {
      toast.error("This lead doesn't have an email address! Click 'Edit' to add one first.");
      return;
    }
    setBulkMode(false);
    setSelectedLead(lead);
  }

  async function openBulkComposer() {
    const missingEmails = selectedLeads.filter((l) => !l.email);
    const pitched = selectedLeads.filter((l) => l.email && wasPitched(l));

    if (missingEmails.length > 0) {
      const proceed = await confirmDialog({
        title: 'Some leads have no email',
        body: `${missingEmails.length} of the ${selectedLeads.length} leads you selected have no email address on file. They can't be pitched.`,
        names: missingEmails.map((l) => l.clinicname),
        confirmLabel: `Send to the other ${selectedLeads.length - missingEmails.length}`,
        cancelLabel: 'Go back',
      });
      if (!proceed) return;
    }

    // Already-pitched leads need a deliberate yes. Declining drops them from
    // the selection rather than cancelling the whole send.
    let resend = false;
    if (pitched.length > 0) {
      resend = await confirmDialog({
        title: pitched.length === 1 ? 'This lead was already pitched' : `${pitched.length} leads were already pitched`,
        body: 'They have had this email once already. Sending again will overwrite the record of when the first one went out.',
        names: pitched.map((l) => l.clinicname),
        confirmLabel: 'Email them again',
        cancelLabel: 'Skip them, send to the rest',
        tone: 'danger',
      });
      if (!resend) {
        const keep = new Set(selectedIds);
        pitched.forEach((l) => keep.delete(l.id));
        setSelectedIds(keep);
        if (keep.size === 0) {
          toast.error('Everyone selected has already been pitched. Nothing left to send.');
          return;
        }
      }
    }
    setAllowResend(resend);

    const reachable = selectedLeads.filter((l) => l.email && (resend || !wasPitched(l)));
    if (reachable.length === 0) {
      toast.error('None of the selected leads can be pitched right now.');
      return;
    }
    setBulkMode(true);
    setSelectedLead(null);
  }

  // One place to close the composer, so allowResend can never leak into the
  // next send.
  function closeComposer() {
    setSelectedLead(null);
    setBulkMode(false);
    setAllowResend(false);
  }

  const composerOpen = Boolean(selectedLead || bulkMode);
  const templateSpread = useMemo(() => {
    const pool = bulkMode ? selectedLeads : (selectedLead ? [selectedLead] : []);
    const acc = {};
    pool.forEach((l) => {
      const id = resolveTemplate(l.template).id;
      acc[id] = (acc[id] || 0) + 1;
    });
    return Object.entries(acc);
  }, [bulkMode, selectedLeads, selectedLead]);

  return (
    <TooltipProvider delay={200}>
      <div className="relative w-full space-y-5 pb-28">

        <Pipeline counts={counts} total={leads.length} visitRate={visitRate} />

        {/* ---------- Filters + search ---------- */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1 shadow-xs">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => changeFilter(f.key)}
                  aria-pressed={active}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn('h-1.5 w-1.5 rounded-full', STAGE_BG[f.tone], active && 'ring-2 ring-primary-foreground/30')}
                  />
                  {f.label}
                  <span className={cn('nums text-[11px]', active ? 'text-primary-foreground/60' : 'text-muted-foreground/60')}>
                    {counts[f.key]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative lg:w-80">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clinic, doctor, email, area…"
              className="h-9 bg-card pl-9 text-[13px]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ---------- Table ---------- */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      checked={allSendableSelected}
                      indeterminate={someSelected}
                      onCheckedChange={toggleAll}
                      disabled={sendable.length === 0}
                      aria-label={sendable.length ? `Select ${sendable.length} pitchable leads` : 'Nothing pitchable in this view'}
                    />
                  </TableHead>
                  <Th>Clinic</Th>
                  <Th>Contact</Th>
                  <Th>Demo</Th>
                  <Th>Stage</Th>
                  <Th className="pr-4 text-right">Actions</Th>
                </TableRow>
              </TableHeader>

              <TableBody>
                {visible.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="py-20 text-center">
                      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/50">
                        <FileText className="text-muted-foreground/60" size={18} />
                      </div>
                      {leads.length === 0 ? (
                        <>
                          <p className="text-sm font-medium">No leads yet</p>
                          <p className="mt-1 text-xs text-muted-foreground">Import a list or use the scraper to find targets.</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium">Nothing matches this view</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {query ? <>No result for &ldquo;{query}&rdquo;. </> : null}
                            <button
                              onClick={() => { changeFilter('all'); setQuery(''); }}
                              className="font-medium text-brand underline-offset-2 hover:underline"
                            >
                              Reset filters
                            </button>
                          </p>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  visible.map((lead) => {
                    const isChecked = selectedIds.has(lead.id);
                    const isSent = emailStatus[lead.id] === 'sent' || lead.emailsent;
                    const failed = emailStatus[lead.id] === 'failed';
                    const sentOn = shortDate(lead.emailsentat);
                    const tpl = resolveTemplate(lead.template);

                    return (
                      <TableRow
                        key={lead.id}
                        data-state={isChecked ? 'selected' : undefined}
                        className={cn('group align-top transition-colors', isChecked && 'bg-brand-muted/60')}
                      >
                        <TableCell className="pl-4 pt-4">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleSelect(lead.id)}
                            aria-label={`Select ${lead.clinicname}`}
                          />
                        </TableCell>

                        <TableCell className="max-w-[300px] py-3">
                          <div className="text-[13px] font-medium leading-snug">{lead.clinicname}</div>
                          {lead.doctorname && (
                            <div className="mt-0.5 text-[11.5px] text-muted-foreground">{lead.doctorname}</div>
                          )}
                          <div className="mt-1 flex items-start gap-1 text-[11px] text-muted-foreground/70">
                            <MapPin size={10} className="mt-[3px] shrink-0" />
                            <span className="line-clamp-2">{lead.address || 'No address'}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          {lead.email ? (
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <button
                                    onClick={() => copyEmail(lead.email)}
                                    className="flex max-w-[210px] items-center gap-1.5 font-mono text-[11.5px] transition-colors hover:text-brand"
                                  />
                                }
                              >
                                <span className="truncate">{lead.email}</span>
                                <Copy size={10} className="shrink-0 text-muted-foreground/40" />
                              </TooltipTrigger>
                              <TooltipContent>Copy email</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Badge variant="outline" className="border-stage-blocked/30 bg-stage-blocked/10 text-[10px] font-semibold text-stage-blocked">
                              NO EMAIL
                            </Badge>
                          )}
                          <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                            <Phone size={9} className="shrink-0 text-muted-foreground/50" />
                            {lead.phone || '—'}
                          </div>
                        </TableCell>

                        {/* The link and the template that renders it belong
                            together - one is meaningless without the other. */}
                        <TableCell className="py-3">
                          <a
                            href={`/${lead.slug}`}
                            target="_blank"
                            rel="noopener"
                            className="flex max-w-[170px] items-center gap-1 font-mono text-[11.5px] text-muted-foreground transition-colors hover:text-brand"
                          >
                            <span className="truncate">/{lead.slug}</span>
                            <ExternalLink size={10} className="shrink-0 opacity-50" />
                          </a>

                          <div className="mt-1.5 flex items-center gap-1">
                            <Select
                              value={tpl.id}
                              onValueChange={(v) => changeTemplate(lead, v)}
                              disabled={templateBusy === lead.id}
                            >
                              <SelectTrigger
                                size="sm"
                                className="h-6 w-auto gap-1 border-dashed px-2 text-[11px] font-medium"
                              >
                                {templateBusy === lead.id
                                  ? <Loader2 size={11} className="animate-spin" />
                                  : <Layout size={11} className="text-muted-foreground" />}
                                {tpl.label}
                              </SelectTrigger>
                              <SelectContent>
                                {TEMPLATE_LIST.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    <div className="flex flex-col">
                                      <span className="text-[13px] font-medium">{t.label}</span>
                                      <span className="text-[11px] text-muted-foreground">{t.blurb}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <a
                                    href={`/admin/preview/${tpl.id}?clinic=${encodeURIComponent(lead.clinicname || '')}&doctor=${encodeURIComponent(lead.doctorname || '')}`}
                                    target="_blank"
                                    rel="noopener"
                                    className="rounded-md p-1 text-muted-foreground/40 transition-colors hover:bg-accent hover:text-foreground"
                                  />
                                }
                              >
                                <Eye size={12} />
                              </TooltipTrigger>
                              <TooltipContent>Preview this template with their details</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          <StageDot
                            tone={lead.demovisited ? 'visited' : isSent ? 'sent' : 'new'}
                            label={lead.demovisited ? 'Visited' : isSent ? 'Pitched' : 'Not sent'}
                          />
                          {sentOn && <div className="nums mt-1 text-[10.5px] text-muted-foreground/70">sent {sentOn}</div>}
                          {failed && <div className="mt-1 text-[10.5px] font-medium text-destructive">send failed</div>}
                        </TableCell>

                        <TableCell className="py-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant={isSent ? 'ghost' : 'outline'}
                              disabled={isSent}
                              onClick={() => openComposer(lead)}
                              className={cn('h-7 gap-1.5 px-2.5 text-[12px]', isSent && 'text-stage-visited disabled:opacity-100')}
                            >
                              {isSent ? <><CheckCircle2 size={12} /> Sent</> : <><Send size={12} /> Pitch</>}
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" aria-label="More actions" />
                                }
                              >
                                <MoreHorizontal size={14} />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => setEditingLead(lead)}>
                                  <Edit3 size={13} /> Edit details
                                </DropdownMenuItem>
                                {lead.email && (
                                  <DropdownMenuItem onClick={() => copyEmail(lead.email)}>
                                    <Copy size={13} /> Copy email
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  render={<a href={`/${lead.slug}`} target="_blank" rel="noopener" />}
                                >
                                  <ExternalLink size={13} /> Open demo
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {visible.length > 0 && (
            <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
              <span className="nums">
                Showing {visible.length} of {leads.length}
                {sendable.length > 0 && <> · {sendable.length} pitchable here</>}
              </span>
              <span>Newest first</span>
            </div>
          )}
        </div>

        {/* ---------- Floating selection bar ---------- */}
        {selectedCount > 0 && (
          <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-white/10 bg-primary px-3 py-2 text-primary-foreground shadow-2xl duration-200 animate-in fade-in slide-in-from-bottom-6">
            <span className="nums flex h-6 min-w-6 items-center justify-center rounded-md bg-brand px-1.5 text-[11px] font-semibold text-brand-foreground">
              {selectedCount}
            </span>
            <span className="text-[13px] font-medium">selected</span>

            <span className="h-4 w-px bg-primary-foreground/20" />

            <Select
              value=""
              onValueChange={(v) => v && bulkChangeTemplate(v)}
              disabled={templateBusy === 'bulk'}
            >
              <SelectTrigger
                size="sm"
                className="h-7 w-auto gap-1.5 border-primary-foreground/20 bg-primary-foreground/10 px-2.5 text-[12px] text-primary-foreground hover:bg-primary-foreground/15"
              >
                {templateBusy === 'bulk'
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Layout size={12} />}
                Set template
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_LIST.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="sm" variant="secondary" onClick={openBulkComposer} className="h-7 gap-1.5 px-3 text-[12px] font-semibold">
              <Send size={13} /> Pitch selected
            </Button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="rounded-md p-1 text-primary-foreground/60 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              aria-label="Clear selection"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ---------- Confirm ---------- */}
        <AlertDialog open={Boolean(ask)} onOpenChange={(open) => { if (!open) answer(false); }}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <div className="flex items-start gap-3">
                <span className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  ask?.tone === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-stage-blocked/10 text-stage-blocked'
                )}>
                  <AlertTriangle size={17} />
                </span>
                <div className="min-w-0">
                  <AlertDialogTitle className="text-[15px]">{ask?.title}</AlertDialogTitle>
                  <AlertDialogDescription className="mt-1.5 text-[13px] leading-relaxed">
                    {ask?.body}
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>

            {ask?.names?.length > 0 && (
              <ul className="max-h-36 space-y-1 overflow-y-auto rounded-lg border bg-muted/40 p-3">
                {ask.names.slice(0, 8).map((n, i) => (
                  <li key={i} className="truncate text-[12px] font-medium">{n || 'Untitled lead'}</li>
                ))}
                {ask.names.length > 8 && (
                  <li className="pt-1 text-[11px] text-muted-foreground">and {ask.names.length - 8} more</li>
                )}
              </ul>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => answer(false)}>{ask?.cancelLabel || 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => answer(true)}
                className={ask?.tone === 'danger' ? 'bg-destructive text-white hover:bg-destructive/90' : undefined}
              >
                {ask?.confirmLabel || 'Continue'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ---------- Composer ---------- */}
        <Dialog open={composerOpen} onOpenChange={(open) => { if (!open && !isSending) closeComposer(); }}>
          <DialogContent className="max-w-2xl gap-0 p-0" showCloseButton={!isSending}>
            <DialogHeader className="border-b px-6 py-4">
              <DialogTitle className="flex items-center gap-2 text-[15px]">
                <Mail size={16} className="text-muted-foreground" />
                {bulkMode ? `Pitch ${selectedCount} leads` : `Pitch ${selectedLead?.clinicname}`}
              </DialogTitle>
              <DialogDescription className="sr-only">Compose the outreach email</DialogDescription>
            </DialogHeader>

            {bulkMode && (() => {
              const willSend = selectedCount - selectedNoEmail - (allowResend ? 0 : selectedPitched);
              const danger = allowResend && selectedPitched > 0;
              return (
                <div className={cn(
                  'border-b px-6 py-3 text-[12px]',
                  danger ? 'bg-destructive/8 text-destructive' : 'bg-stage-blocked/8 text-stage-blocked'
                )}>
                  <div className="font-medium">
                    Sending to <b className="nums">{willSend}</b> of {selectedCount} selected — one at a time with a
                    3 second gap, about {Math.ceil((willSend * 3) / 60)} min. Keep this tab open until it finishes.
                  </div>
                  {selectedPitched > 0 && (
                    <div className="mt-1">
                      {allowResend
                        ? `${selectedPitched} already pitched and WILL BE EMAILED AGAIN.`
                        : `${selectedPitched} already pitched — skipped.`}
                    </div>
                  )}
                  {selectedNoEmail > 0 && <div className="mt-1">{selectedNoEmail} have no email — skipped.</div>}
                </div>
              );
            })()}

            {/* Which demo each recipient actually lands on. Worth stating
                before sending, not after. */}
            {templateSpread.length > 0 && (
              <div className="flex items-center gap-2 border-b bg-muted/40 px-6 py-2.5 text-[12px] text-muted-foreground">
                <Layout size={13} className="shrink-0" />
                <span>
                  {templateSpread.length === 1 ? (
                    <>Everyone gets the <b className="font-semibold text-foreground">{resolveTemplate(templateSpread[0][0]).label}</b> demo.</>
                  ) : (
                    <>Mixed templates: {templateSpread.map(([id, n], i) => (
                      <span key={id}>{i > 0 ? ', ' : ''}<b className="nums font-semibold text-foreground">{n} {resolveTemplate(id).label}</b></span>
                    ))}. Set them all from the selection bar if that is not what you want.</>
                  )}
                </span>
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-5 px-6 py-5">
              <div className="space-y-1.5">
                <Label htmlFor="emailSubject" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Subject line
                </Label>
                <Input
                  id="emailSubject"
                  name="emailSubject"
                  required
                  defaultValue="I built this for {{clinicname}}"
                  className="text-[13px]"
                />
                <p className="flex flex-wrap items-center gap-1 pt-1 text-[10.5px] text-muted-foreground">
                  Tags:
                  {['{{clinicname}}', '{{doctorname}}', '{{area}}', '{{slug}}'].map((t) => (
                    <code key={t} className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-foreground">{t}</code>
                  ))}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emailBody" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Message body
                </Label>
                <Textarea
                  id="emailBody"
                  name="emailBody"
                  required
                  rows={12}
                  defaultValue={`Hi {{doctorname}},\n\nI came across {{clinicname}} while looking at practices in {{area}} and had an idea for how you could be presented online.\n\nRather than sending you a proposal, I actually built a private website concept specifically for your practice.\n\n[VIEW THE WEBSITE I BUILT →]\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/{{slug}}\n\nIt takes about 30 seconds to look through, and it was made specifically for {{clinicname}} — not a generic template.\n\nIf you like the direction, we can talk. If not, no problem at all.\n\nVinit Dharaiya\nIndependent Web Developer\nWhatsApp: +91 6356 182 998`}
                  className="resize-none font-mono text-[12.5px] leading-relaxed"
                />
              </div>

              <DialogFooter className="items-center gap-2 sm:justify-between">
                <span className="nums text-[11px] text-muted-foreground">
                  {sentProgress ? `Sending ${sentProgress.done + 1} of ${sentProgress.total} — ${sentProgress.name}` : ''}
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={closeComposer} disabled={isSending}>Cancel</Button>
                  <Button type="submit" disabled={isSending} className="gap-2">
                    {isSending ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send pitch</>}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ---------- Edit ---------- */}
        <Dialog open={Boolean(editingLead)} onOpenChange={(open) => { if (!open) setEditingLead(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[15px]">Edit lead</DialogTitle>
              <DialogDescription className="text-[13px]">
                Changing the clinic name does not change the demo link — the slug stays as it was sent.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateLead} className="space-y-4">
              <Field label="Clinic name" name="clinicname" required defaultValue={editingLead?.clinicname} />
              <Field label="Doctor name" name="doctorname" defaultValue={editingLead?.doctorname} />
              <Field label="Email address" name="email" type="email" defaultValue={editingLead?.email} mono />
              <Field label="Phone / WhatsApp" name="phone" defaultValue={editingLead?.phone} mono />

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditingLead(null)}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save changes</>}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

/* ---------- presentational pieces ---------- */

/**
 * The funnel, drawn to scale.
 *
 * Four disconnected stat cards make you do the arithmetic yourself. This
 * is the same numbers as one bar, so the shape of the pipeline - how much
 * is still untouched, how much has landed - reads at a glance.
 */
function Pipeline({ counts, total, visitRate }) {
  const stages = [
    { key: 'ready', label: 'Ready to pitch', value: counts.ready, tone: 'ready' },
    { key: 'sent', label: 'Pitched', value: counts.sent, tone: 'sent' },
    { key: 'visited', label: 'Opened demo', value: counts.visited, tone: 'visited', hint: visitRate !== null ? `${visitRate}% of pitched` : null },
    { key: 'noemail', label: 'No email', value: counts.noemail, tone: 'blocked' },
  ];
  const safe = Math.max(total, 1);

  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Pipeline</p>
          <p className="nums mt-1 text-2xl font-semibold tracking-tight">
            {total}
            <span className="ml-1.5 text-[13px] font-normal text-muted-foreground">leads</span>
          </p>
        </div>
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {stages.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', STAGE_BG[s.tone])} />
              <div>
                <dt className="text-[11px] leading-none text-muted-foreground">{s.label}</dt>
                <dd className="nums mt-1 flex items-baseline gap-1.5 text-[15px] font-semibold leading-none">
                  {s.value}
                  {s.hint && <span className="text-[10.5px] font-normal text-muted-foreground">{s.hint}</span>}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
        {stages.map((s) => (
          <div
            key={s.key}
            className={cn('h-full rounded-full transition-all duration-500', STAGE_BG[s.tone])}
            style={{ width: `${(s.value / safe) * 100}%` }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
    </div>
  );
}

function StageDot({ tone, label }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] font-medium">
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', STAGE_BG[tone])} />
      {label}
    </span>
  );
}

function Th({ children, className = '' }) {
  return (
    <TableHead className={cn('h-9 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground', className)}>
      {children}
    </TableHead>
  );
}

function Field({ label, name, type = 'text', defaultValue, required, mono }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue || ''}
        className={cn('text-[13px]', mono && 'font-mono')}
      />
    </div>
  );
}
