'use client';

import { useState } from 'react';
import { Mail, FileText, CheckCircle2, Clock, MapPin, X, Edit3, Save, Trash2, Send, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { updateLead } from './actions';

export default function LeadTable({ leads }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState({});
  const [bulkMode, setBulkMode] = useState(false);

  // Toggle single lead selection
  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // Toggle all visible leads
  // Select-all targets only leads worth sending to: reachable, and not
  // already pitched. Selecting every row re-pitches people who already
  // got the email.
  const toggleAll = () => {
    const sendable = leads.filter(l => l.email && !l.emailsent);
    if (sendable.length > 0 && selectedIds.size >= sendable.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sendable.map(l => l.id)));
    }
  };

  async function handleSendEmail(e) {
    e.preventDefault();
    setIsSending(true);

    const formData = new FormData(e.target);
    const emailBody = formData.get('emailBody');
    const emailSubject = formData.get('emailSubject');

    // Bulk or Single?
    const targets = bulkMode ? Array.from(selectedIds) : [selectedLead.id];
    let successCount = 0;
    const failures = [];
    const skipped = [];

    for (const targetId of targets) {
      const lead = leads.find(l => l.id === targetId);
      if (!lead) continue;
      if (!lead.email) { skipped.push(lead.clinicname || targetId); continue; }

      try {
        const res = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: lead.id,
            subjectTemplate: emailSubject,
            bodyTemplate: emailBody
          })
        });

        if (res.ok) {
          setEmailStatus(prev => ({ ...prev, [lead.id]: 'sent' }));
          successCount++;
        } else {
          const data = await res.json().catch(() => ({}));
          failures.push(`${lead.clinicname}: ${data.error || 'HTTP ' + res.status}`);
          setEmailStatus(prev => ({ ...prev, [lead.id]: 'failed' }));
        }
      } catch (err) {
        failures.push(`${lead.clinicname}: ${err.message || 'network error'}`);
        setEmailStatus(prev => ({ ...prev, [lead.id]: 'failed' }));
      }
      // Gmail throttles bursts from a personal account. 500ms was fast
      // enough to get flagged; 3s keeps a run of 55 clear of it.
      if (targets.length > 1) await new Promise(r => setTimeout(r, 3000));
    }

    setIsSending(false);
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
      toast.error("Error saving lead details.");
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
    // Check if any selected leads are missing emails
    const selectedLeads = leads.filter(l => selectedIds.has(l.id));
    const missingEmails = selectedLeads.filter(l => !l.email);

    if (missingEmails.length > 0) {
      const proceed = confirm(`${missingEmails.length} of your selected leads are missing email addresses. Do you want to send to the remaining ${selectedLeads.length - missingEmails.length} leads?`);
      if (!proceed) return;
    }

    if (selectedLeads.length - missingEmails.length === 0) {
      toast.error("None of the selected leads have an email address.");
      return;
    }

    setBulkMode(true);
    setSelectedLead(null);
  }

  const isAllSelected = leads.length > 0 && selectedIds.size === leads.length;

  return (
    <div className="w-full relative pb-20">

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-slate-700 shadow-xl rounded-lg py-2 px-4 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-200">
          <div className="flex items-center gap-2 text-white">
            <span className="flex items-center justify-center bg-blue-600 font-bold text-[11px] w-5 h-5 rounded-sm">{selectedIds.size}</span>
            <span className="text-sm font-medium">Selected</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-700"></div>
          <button
            onClick={openBulkComposer}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm"
          >
            <Send size={14} /> Bulk Pitch
          </button>
        </div>
      )}

      {/* Email Composer Modal (Single & Bulk) */}
      {(selectedLead || bulkMode) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <Mail className="text-slate-400" size={16} />
                {bulkMode ? `Bulk Pitch (${selectedIds.size} selected)` : `Pitch ${selectedLead.clinicname}`}
              </h3>
              <button onClick={() => { setSelectedLead(null); setBulkMode(false); }} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={16} /></button>
            </div>

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
                  <p className="text-[10px] text-slate-400 mt-2">Available tags: <code className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-mono">{'{{clinicname}}'}</code> <code className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-mono">{'{{doctorname}}'}</code></p>
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

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => { setSelectedLead(null); setBulkMode(false); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
                <button type="submit" disabled={isSending} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-2">
                  {isSending ? 'Sending...' : <><Send size={14} /> Send Pitch</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleAll}
                      className="w-3.5 h-3.5 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-widest">Clinic</th>
                <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-widest">Contact</th>
                <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-widest">Demo</th>
                <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center text-slate-400 bg-white">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 bg-slate-50 border border-slate-100">
                      <FileText className="text-slate-300" size={20} />
                    </div>
                    <p className="font-medium text-slate-900 text-sm">No leads found</p>
                    <p className="text-xs mt-1">Import a list or use the scraper to find targets.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isChecked = selectedIds.has(lead.id);
                  const isSent = emailStatus[lead.id] === 'sent' || lead.emailsent;

                  return (
                    <tr key={lead.id} className={`transition-colors group ${isChecked ? 'bg-slate-50/80' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(lead.id)}
                            className="w-3.5 h-3.5 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 text-[13px]">{lead.clinicname}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 max-w-[280px] truncate">
                          <MapPin size={10} className="shrink-0 text-slate-400" /> {lead.address || 'No address'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-900 text-[13px] font-mono">{lead.email || <span className="text-orange-500 italic font-sans text-xs">Missing</span>}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{lead.phone || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`/${lead.slug}`} target="_blank" className="text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1 text-[13px] w-fit">
                          /{lead.slug} <ExternalLink size={12} className="text-slate-400" />
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {lead.demovisited ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <CheckCircle2 size={10} /> VISITED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide bg-slate-100 text-slate-500 border border-slate-200">
                            <Clock size={10} /> UNSEEN
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => openComposer(lead)}
                            disabled={isSent}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${isSent
                                ? 'bg-slate-50 text-emerald-600 cursor-not-allowed'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-sm'
                              }`}
                          >
                            {isSent ? <><CheckCircle2 size={12} /> Sent</> : <><Send size={12} /> Pitch</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-900">Edit Lead</h3>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={16} /></button>
            </div>

            <form onSubmit={handleUpdateLead} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-widest">Clinic Name</label>
                <input type="text" name="clinicname" required defaultValue={editingLead.clinicname} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-slate-900" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-widest">Doctor Name</label>
                <input type="text" name="doctorname" defaultValue={editingLead.doctorname} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-slate-900" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-widest">Email Address</label>
                <input type="email" name="email" defaultValue={editingLead.email} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-slate-900" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-widest">Phone / WhatsApp</label>
                <input type="text" name="phone" defaultValue={editingLead.phone} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-slate-900 font-mono" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingLead(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-2">
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
