'use client';

import { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { MapPin, Search, Plus, Loader2, Layout } from 'lucide-react';
import { resolveTemplate } from '@/lib/templates';
import {
  CATEGORY_LIST, DEFAULT_CATEGORY, resolveCategory, templatesFor, templateForCategory,
} from '@/lib/categories';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from '@/components/ui/select';

/* Example values per category. The form is the same shape for every
   vertical, so only the words that describe the business change. */
const PLACEHOLDERS = {
  clinic: {
    name: 'e.g. Aashu Dental Clinic',
    person: 'e.g. Dr. K. K. Shah',
    email: 'reception@clinic.com',
  },
  interior: {
    name: 'e.g. Aarav Interiors',
    person: 'e.g. Aarav Shah',
    email: 'studio@example.in',
  },
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full gap-2">
      {pending ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : 'Add lead'}
    </Button>
  );
}

function FieldRow({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function AddLeadDialog({ action }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  /* The form had no category field at all, so every lead added here was
     saved as a clinic - and once the template is resolved through the
     category, picking Interior here would silently store Classic. The
     category is the first thing chosen now, and it drives the rest. */
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [template, setTemplate] = useState(templateForCategory(DEFAULT_CATEGORY));

  const chooseCategory = (id) => {
    setCategory(id);
    setTemplate(templateForCategory(id));
  };

  const cat = resolveCategory(category);
  const hints = PLACEHOLDERS[cat.id] || PLACEHOLDERS.clinic;
  const [formData, setFormData] = useState({
    clinicName: '',
    doctorName: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
  });

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

    setFormData((prev) => ({
      ...prev,
      clinicName: name || prev.clinicName,
      address: place.display_name,
    }));

    setSearchQuery('');
    setResults([]);
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(fd) {
    await action(fd);
    setIsOpen(false);
    chooseCategory(DEFAULT_CATEGORY);
    setFormData({
      clinicName: '', doctorName: '', phone: '', whatsapp: '', email: '', address: '',
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus size={15} /> New lead
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Add a lead</DialogTitle>
          <DialogDescription className="text-[13px]">
            A demo page is generated the moment this is saved.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-5">
          {/* Both answered before anything else: the category decides the
              labels below and which demos are on offer, so the template
              list is a consequence of it rather than a free choice.
              Dropdowns rather than tabs because a row of tabs stops
              working the moment there are more than about three. */}
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Category">
              {/* Base UI Select does not post a form value, so both choices
                  are mirrored into hidden inputs the action can read. */}
              <input type="hidden" name="category" value={category} />
              <Select value={category} onValueChange={chooseCategory}>
                <SelectTrigger className="w-full text-[13px]">
                  <span className="font-mono text-[11px] text-muted-foreground">{cat.code}</span>
                  {cat.label}
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_LIST.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="font-mono text-[11px] text-muted-foreground">{c.code}</span>{' '}
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>

            <FieldRow label="Demo template">
              <input type="hidden" name="template" value={template} />
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger className="w-full text-[13px]">
                  <Layout size={13} className="text-muted-foreground" />
                  {resolveTemplate(template).label}
                </SelectTrigger>
                <SelectContent>
                  {templatesFor(category).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
          </div>

          <p className="-mt-3 text-[11px] text-muted-foreground">
            {resolveTemplate(template).blurb}
          </p>

          {/* Auto-fill from OpenStreetMap */}
          <div className="relative z-20">
            <FieldRow label="Auto-fill from map">
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={`Search ${cat.label.toLowerCase()} businesses…`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-muted/50 pl-9 text-[13px]"
                />
                {isSearching && (
                  <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </FieldRow>

            {results.length > 0 && (
              <div className="absolute inset-x-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                {results.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectResult(r)}
                    className="flex w-full items-start gap-2.5 border-b p-2.5 text-left transition-colors last:border-0 hover:bg-accent"
                  >
                    <MapPin size={13} className="mt-0.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0">
                      <span className="block text-[12px] font-medium">{r.name}</span>
                      <span className="mt-0.5 line-clamp-2 block text-[10.5px] leading-snug text-muted-foreground">
                        {r.display_name}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          <FieldRow label={cat.nameLabel}>
            <Input name="clinicName" required value={formData.clinicName} onChange={handleChange}
              placeholder={hints.name} className="text-[13px]" />
          </FieldRow>

          <FieldRow label={cat.personLabel}>
            <Input name="doctorName" value={formData.doctorName} onChange={handleChange}
              placeholder={hints.person} className="text-[13px]" />
          </FieldRow>

          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Phone">
              <Input name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+91 98251 47293" className="font-mono text-[13px]" />
            </FieldRow>
            <FieldRow label="WhatsApp">
              <Input name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                placeholder="919825147293" className="font-mono text-[13px]" />
            </FieldRow>
          </div>

          <FieldRow label="Email">
            <Input type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder={hints.email} className="font-mono text-[13px]" />
          </FieldRow>

          <FieldRow label="Address">
            <Textarea name="address" rows={2} value={formData.address} onChange={handleChange}
              placeholder="Naranpura, Ahmedabad, Gujarat" className="resize-none text-[13px]" />
          </FieldRow>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
