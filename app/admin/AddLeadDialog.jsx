'use client';

import { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { MapPin, Search, Plus, X, Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2.5 px-4 rounded-md transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
    >
      {pending ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Add Target'}
    </button>
  );
}

export default function AddLeadDialog({ action }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: '',
    doctorName: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: ''
  });

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Debounced OpenStreetMap search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  function handleSelectResult(place) {
    const name = place.address?.clinic || place.address?.hospital || place.address?.doctors || place.name || '';
    
    setFormData(prev => ({
      ...prev,
      clinicName: name || prev.clinicName,
      address: place.display_name
    }));
    
    setSearchQuery('');
    setResults([]);
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(formData) {
    await action(formData);
    setIsOpen(false);
    setFormData({
      clinicName: '',
      doctorName: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: ''
    });
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
      >
        <Plus size={16} /> New Target
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Add New Target</h2>
                <p className="text-xs text-slate-500 mt-0.5">Enter details to generate a custom demo</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1">
              <form action={handleSubmit} className="space-y-5">
                {/* Search Bar */}
                <div className="relative z-20">
                  <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-widest mb-1.5">Auto-Fill from Map</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={14} className="text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search clinics..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  
                  {/* Results Dropdown */}
                  {results.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden z-50 max-h-48 overflow-y-auto">
                      {results.map((r, i) => (
                        <div 
                          key={i}
                          onClick={() => handleSelectResult(r)}
                          className="p-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors flex gap-2.5 items-start"
                        >
                          <div className="text-slate-400 mt-0.5 shrink-0">
                            <MapPin size={14} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-xs">{r.name}</p>
                            <p className="text-slate-500 text-[10px] mt-0.5 leading-snug line-clamp-2">{r.display_name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <hr className="border-slate-100" />

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Clinic Name</label>
                    <input type="text" name="clinicName" required value={formData.clinicName} onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all text-slate-900" 
                      placeholder="e.g. City Health Clinic" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Doctor Name</label>
                    <input type="text" name="doctorName" value={formData.doctorName} onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all text-slate-900" 
                      placeholder="e.g. Dr. Sarah Jones" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Phone</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all text-slate-900" 
                        placeholder="+1 234 567 8900" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">WhatsApp</label>
                      <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all text-slate-900" 
                        placeholder="12345678900" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all text-slate-900" 
                      placeholder="doctor@clinic.com" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Address</label>
                    <textarea name="address" rows="2" value={formData.address} onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all text-slate-900 resize-none" 
                      placeholder="123 Medical Way, New York"></textarea>
                  </div>
                </div>

                <div className="pt-2">
                  <SubmitButton />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
