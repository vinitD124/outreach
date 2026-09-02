'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, FileText, CheckCircle2, Clock, MapPin, X, Edit3, Save, Send, ExternalLink, Search, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { updateLead } from './actions';

/* Pipeline stages, in the order a lead actually moves through them.
   `test` is what decides which chip a row belongs to. */
const FILTERS = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'ready', label: 'Ready to pitch', test: (l) => l.email && !l.emailsent },
  { key: 'sent', label: 'Pitched', test: (l) => l.emailsent },
  { key: 'visited', label: 'Visited', test: (l) => l.demovisited },
  { key: 'noemail', label: 'No email', test: (l) => !l.email },
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

export default function LeadTable({ leads }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState({});
  const [bulkMode, setBulkMode] = useState(false);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sentProgress, setSentProgress] = useState(null);
  const selectAllRef = useRef(null);

  /* ---- counts for the filter chips and the stat row ---- */
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

  /* Select-all reflects the sendable rows it actually controls. Comparing it
     against every row is why the box never looked checked. */
  const allSendableSelected = sendable.length > 0 && sendable.every((l) => selectedIds.has(l.id));
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedCount > 0 && !allSendableSelected;
    }
  }, [selectedCount, allSendableSelected]);

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
    const skipped = [];

    for (let i = 0; i < targets.length; i++) {
      const lead = leads.find((l) => l.id === targets[i]);
      if (!lead) continue;
      if (!lead.email) { skipped.push(lead.clinicname || targets[i]); continue; }

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
    setSelectedLead(null);
    setBulkMode(false);
    setSelectedIds(new Set());

    if (failures.length) {
      console.error('Failed sends:\n' + failures.join('\n'));
      toast.error(`${successCount} sent, ${failures.length} failed. First: ${failures[0]}`, { duration: 12000 });
    } else if (targets.length > 1) {
      toast.success(`Successfully sent ${successCount} emails!`);
    } else if (successCount === 1) {
      toast.success('Pitch sent successfully!');
    }
    if (skipped.length) {
      toast.warning(`${skipped.length} skipped, no email address on file.`);
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

  function openBulkComposer() {
    const selectedLeads = leads.filter((l) => selectedIds.has(l.id));
    const missingEmails = selectedLeads.filter((l) => !l.email);

    if (missingEmails.length > 0) {
      const proceed = confirm(`${missingEmails.length} of your selected leads are missing email addresses. Do you want to send to the remaining ${selectedLeads.length - missingEmails.length} leads?`);
      if (!proceed) return;
    }
    if (selectedLeads.length - missingEmails.length === 0) {
      toast.error('None of the selected leads have an email address.');
      return;
    }
    setBulkMode(true);
    setSelectedLead(null);
  }

  return (
    <div className="w-full relative pb-24 space-y-5">

      {/* ---------- Stat row ---------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total leads" value={leads.length} icon={<FileText size={15} />} />
        <Stat label="Ready to pitch" value={counts.ready} icon={<Send size={15} />} tone="blue" />
        <Stat label="Pitched" value={counts.sent} icon={<Mail size={15} />} />
        <Stat
          label="Visited demo"
          value={counts.visited}
          hint={visitRate !== null ? `${visitRate}% of pitched` : null}
          icon={<Eye size={15} />}
          tone="emerald"
        />
      </div>

      {/* ---------- Filters + search ---------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => changeFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {f.label}
                <span className={`ml-1.5 tabular-nums ${active ? 'text-slate-400' : 'text-slate-400'}`}>
                  {counts[f.key]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative lg:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clinic, doctor, email, area..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
          />
        </div>
      </div>

      {/* ---------- Floating bulk bar ---------- */}
      {selectedCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-slate-700 shadow-xl rounded-lg py-2 px-4 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-200">
          <div className="flex items-center gap-2 text-white">
            <span className="flex items-center justify-center bg-blue-600 font-bold text-[11px] w-5 h-5 rounded-sm tabular-nums">{selectedCount}</span>
            <span className="text-sm font-medium">Selected</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <button onClick={() => setSelectedIds(new Set())} className="text-slate-400 hover:text-white text-xs font-medium transition-colors">Clear</button>
          <button
            onClick={openBulkComposer}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm"
          >
            <Send size={14} /> Bulk Pitch
          </button>
        </div>
      )}

      {/* ---------- Composer ---------- */}
      {(selectedLead || bulkMode) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <Mail className="text-slate-400" size={16} />
                {bulkMode ? `Bulk Pitch (${selectedCount} selected)` : `Pitch ${selectedLead.clinicname}`}
              </h3>
              <button onClick={() => { setSelectedLead(null); setBulkMode(false); }} disabled={isSending} className="text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-40"><X size={16} /></button>
            </div>

            {bulkMode && (
              <div className="px-6 py-3 bg-amber-50/60 border-b border-amber-100 text-[12px] text-amber-800 font-medium">
                Sends one at a time with a 3 second gap — about {Math.ceil((selectedCount * 3) / 60)} min for {selectedCount}. Keep this tab open until it finishes.
              </div>
            )}

            <form onSubmit={handleSendEmail} className="p-6 space-y-5 flex-1 bg-white">
              <div className="grid gap-5 bg-slate-50 p-5 rounded-lg border border-slate-100">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-widest">Subject Line</label>
                  <input
                    type="text"
                    name="emailSubject"
                    required
                    defaultValue="I built this for {{clinicname}}"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-2">Available tags: <code className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-mono">{'{{clinicname}}'}</code> <code className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-mono">{'{{doctorname}}'}</code> <code className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-mono">{'{{area}}'}</code> <code className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-mono">{'{{slug}}'}</code></p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-widest">Message Body</label>
                <textarea
                  name="emailBody"
                  required
                  rows="12"
                  defaultValue={`Hi {{doctorname}},\n\nI came across {{clinicname}} while looking at practices in {{area}} and had an idea for how you could be presented online.\n\nRather than sending you a proposal, I actually built a private website concept specifically for your practice.\n\n[VIEW THE WEBSITE I BUILT →]\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/{{slug}}\n\nIt takes about 30 seconds to look through, and it was made specifically for {{clinicname}} — not a generic template.\n\nIf you like the direction, we can talk. If not, no problem at all.\n\nVinit Dharaiya\nIndependent Web Developer\nWhatsApp: +91 6356 182 998`}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-800 text-[13px] outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-mono resize-none transition-all leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-between items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium tabular-nums">
                  {sentProgress ? `Sending ${sentProgress.done + 1} of ${sentProgress.total} — ${sentProgress.name}` : ''}
                </span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setSelectedLead(null); setBulkMode(false); }} disabled={isSending} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40">Cancel</button>
                  <button type="submit" disabled={isSending} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-2 disabled:opacity-60">
                    {isSending ? 'Sending...' : <><Send size={14} /> Send Pitch</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Table ---------- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <div className="flex items-center justify-center">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allSendableSelected}
                      onChange={toggleAll}
                      disabled={sendable.length === 0}
                      title={sendable.length ? `Select ${sendable.length} pitchable leads` : 'Nothing pitchable in this view'}
                      className="w-3.5 h-3.5 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </div>
                </th>
                <Th>Clinic</Th>
                <Th>Contact</Th>
                <Th>Demo</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center text-slate-400 bg-white">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 bg-slate-50 border border-slate-100">
                      <FileText className="text-slate-300" size={20} />
                    </div>
                    {leads.length === 0 ? (
                      <>
                        <p className="font-medium text-slate-900 text-sm">No leads found</p>
                        <p className="text-xs mt-1">Import a list or use the scraper to find targets.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-slate-900 text-sm">Nothing matches this view</p>
                        <p className="text-xs mt-1">
                          {query ? <>No result for &ldquo;{query}&rdquo;. </> : null}
                          <button onClick={() => { changeFilter('all'); setQuery(''); }} className="text-blue-600 hover:underline font-medium">Reset filters</button>
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                visible.map((lead) => {
                  const isChecked = selectedIds.has(lead.id);
                  const isSent = emailStatus[lead.id] === 'sent' || lead.emailsent;
                  const failed = emailStatus[lead.id] === 'failed';
                  const sentOn = shortDate(lead.emailsentat);

                  return (
                    <tr key={lead.id} className={`transition-colors ${isChecked ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'}`}>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-center pt-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(lead.id)}
                            className="w-3.5 h-3.5 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top max-w-[320px]">
                        <div className="font-medium text-slate-900 text-[13px] leading-snug">{lead.clinicname}</div>
                        {lead.doctorname && <div className="text-[11px] text-slate-500 mt-0.5">{lead.doctorname}</div>}
                        <div className="text-[11px] text-slate-400 flex items-start gap-1 mt-1">
                          <MapPin size={10} className="shrink-0 mt-[3px]" />
                          <span className="line-clamp-2">{lead.address || 'No address'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        {lead.email ? (
                          <button
                            onClick={() => copyEmail(lead.email)}
                            title="Copy email"
                            className="group/c flex items-center gap-1.5 text-slate-900 text-[12px] font-mono hover:text-blue-600 transition-colors max-w-[220px]"
                          >
                            <span className="truncate">{lead.email}</span>
                            <Copy size={11} className="shrink-0 text-slate-300 group-hover/c:text-blue-600 transition-colors" />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-orange-50 text-orange-700 border border-orange-200/60">
                            NO EMAIL
                          </span>
                        )}
                        <div className="text-[11px] text-slate-500 font-mono mt-1">{lead.phone || '—'}</div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <a href={`/${lead.slug}`} target="_blank" rel="noopener" className="text-slate-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1 text-[12px] font-mono max-w-[180px]">
                          <span className="truncate">/{lead.slug}</span>
                          <ExternalLink size={11} className="shrink-0 text-slate-400" />
                        </a>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col items-start gap-1">
                          {lead.demovisited ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <CheckCircle2 size={10} /> VISITED
                            </span>
                          ) : isSent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-blue-50 text-blue-700 border border-blue-200/60">
                              <Mail size={10} /> PITCHED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-slate-100 text-slate-500 border border-slate-200">
                              <Clock size={10} /> NOT SENT
                            </span>
                          )}
                          {sentOn && <span className="text-[10px] text-slate-400 tabular-nums">sent {sentOn}</span>}
                          {failed && <span className="text-[10px] text-red-500 font-medium">send failed</span>}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200"
                            title="Edit lead"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => openComposer(lead)}
                            disabled={isSent}
                            title={isSent ? 'Already pitched' : 'Send pitch'}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                              isSent
                                ? 'bg-slate-50 text-emerald-600 cursor-not-allowed border border-slate-100'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-900 shadow-sm'
                            }`}
                          >
                            {isSent ? <><CheckCircle2 size={12} /> Sent</> : <><Send size={12} /> Pitch</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {visible.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span className="tabular-nums">
              Showing {visible.length} of {leads.length}
              {sendable.length > 0 && <> · {sendable.length} pitchable here</>}
            </span>
            <span>Newest first</span>
          </div>
        )}
      </div>

      {/* ---------- Edit modal ---------- */}
      {editingLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-900">Edit Lead</h3>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={16} /></button>
            </div>

            <form onSubmit={handleUpdateLead} className="p-6 space-y-4">
              <Field label="Clinic Name" name="clinicname" required defaultValue={editingLead.clinicname} />
              <Field label="Doctor Name" name="doctorname" defaultValue={editingLead.doctorname} />
              <Field label="Email Address" name="email" type="email" defaultValue={editingLead.email} />
              <Field label="Phone / WhatsApp" name="phone" defaultValue={editingLead.phone} mono />

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingLead(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-2 disabled:opacity-60">
                  {isSaving ? 'Saving...' : <><Save size={14} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- small presentational helpers ---------- */

function Stat({ label, value, hint, icon, tone }) {
  const accent = tone === 'emerald' ? 'text-emerald-600' : tone === 'blue' ? 'text-blue-600' : 'text-slate-400';
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span className={accent}>{icon}</span>{label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{value}</span>
        {hint && <span className="text-[11px] font-medium text-slate-400">{hint}</span>}
      </div>
    </div>
  );
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-widest ${className}`}>
      {children}
    </th>
  );
}

function Field({ label, name, type = 'text', defaultValue, required, mono }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue || ''}
        className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-slate-900 ${mono ? 'font-mono' : ''}`}
      />
    </div>
  );
}
