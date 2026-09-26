"use client";

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2, ArrowRight, X, Layout, Download } from 'lucide-react';
import { bulkImportLeads } from '../actions';
import { DEFAULT_TEMPLATE, resolveTemplate } from '@/lib/templates';
import {
  CATEGORY_LIST, DEFAULT_CATEGORY, resolveCategory, normaliseCategory,
  templateForCategory, templateFor, templatesFor, isTemplateMismatch,
} from '@/lib/categories';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from '@/components/ui/select';

const cell = (row, ...keys) => {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && String(v).trim()) return String(v).trim();
  }
  return '';
};

/* The columns bulkImportLeads actually reads, in the order the sample
   writes them. Kept here so the hint below and the downloadable file
   cannot describe different things. */
const COLUMNS = ['Clinic Name', 'Doctor Name', 'Phone', 'Email', 'Address', 'Category', 'Template'];

const SAMPLE_ROWS = {
  clinic: ['Shreeji Dental Care', 'Dr. Nishit Shah', '+91 98250 11223', 'hello@example.com', 'Satellite, Ahmedabad, Gujarat 380015'],
  interior: ['Aarav Interiors', 'Aarav Shah', '+91 98250 44556', 'studio@example.com', 'Bopal, Ahmedabad, Gujarat 380058'],
};

/* Built from the registry rather than written out, so adding a vertical
   updates the sample instead of leaving it quietly wrong. One correctly
   filled row per category, each showing a template that category can
   actually use. */
function sampleCsv() {
  const quote = (v) => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
  const rows = CATEGORY_LIST.map((c) => {
    const base = SAMPLE_ROWS[c.id] || ['Example Business', 'Owner Name', '+91 98250 00000', 'name@example.com', 'Area, Ahmedabad, Gujarat'];
    return [...base, c.code, templateForCategory(c.id)].map(quote).join(',');
  });
  return [COLUMNS.join(','), ...rows].join('\n') + '\n';
}

function downloadSample() {
  const url = URL.createObjectURL(new Blob([sampleCsv()], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lead-import-sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkImportPage() {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  // Template for the whole batch. A "Template" column in the sheet
  // overrides this per row.
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  /* Picking a category also moves the template picker, because that is
     what you almost always want: an interior batch on the classic clinic
     layout is a mistake, not a choice. The template picker stays live so
     it can still be overridden afterwards. */
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const chooseCategory = (id) => {
    setCategory(id);
    setTemplate(templateForCategory(id));
  };
  const router = useRouter();

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.xlsx') && !uploadedFile.name.endsWith('.xls') && !uploadedFile.name.endsWith('.csv')) {
      setError("Please upload a valid Excel (.xlsx, .xls) or CSV file.");
      return;
    }

    setFile(uploadedFile);
    setError(null);
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setPreviewData(json);
      } catch (err) {
        setError("Could not parse the file. Ensure it's a valid Excel or CSV.");
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const confirmImport = async () => {
    if (previewData.length === 0) return;
    setIsImporting(true);
    setError(null);

    try {
      // Ensure data is completely stripped of any XLSX prototype methods before sending to Server Action
      const plainData = JSON.parse(JSON.stringify(previewData));
      await bulkImportLeads(plainData, template, category);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to import leads. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  /* Exactly what a row becomes, resolved the same way the server will.
     Worth doing here rather than only on the server: a sheet that names a
     template its category cannot use is corrected either way, and you
     should find that out before the import, not after. */
  const resolveRow = (row) => {
    const rowCategory = normaliseCategory(cell(row, 'Category', 'Type') || category);
    const wanted = cell(row, 'Template', 'Theme').toLowerCase();
    return {
      category: rowCategory,
      template: templateFor(rowCategory, wanted || template),
      own: Boolean(wanted),
      corrected: isTemplateMismatch(rowCategory, wanted),
    };
  };

  /* What the import will actually do, worked out before you commit to it.
     The old screen only said how many rows were in the file, which is not
     the same number as the leads you end up with. */
  const audit = useMemo(() => {
    let named = 0, withEmail = 0, overridden = 0, corrected = 0;
    const cats = {};
    previewData.forEach((r) => {
      if (!cell(r, 'Clinic Name')) return;
      named++;
      if (cell(r, 'Email', 'Public Email', 'Email Address')) withEmail++;
      const res = resolveRow(r);
      if (res.own) overridden++;
      if (res.corrected) corrected++;
      cats[res.category] = (cats[res.category] || 0) + 1;
    });
    return {
      rows: previewData.length,
      named,
      skipped: previewData.length - named,
      withEmail,
      overridden,
      corrected,
      categories: Object.entries(cats),
    };
  }, [previewData, category, template]);

  // Every importable row sets its own template, so the batch picker has
  // nothing left to apply to.
  const allRowsCarryTemplate = audit.named > 0 && audit.overridden >= audit.named;

  const reset = () => { setFile(null); setPreviewData([]); setError(null); };

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight">Import leads</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Upload the spreadsheet your research produced. A demo page is generated for every row that has a clinic name.
        </p>
      </header>

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3 text-[13px] font-medium text-destructive">
          <AlertCircle size={17} className="shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto opacity-60 hover:opacity-100" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-stage-visited/25 bg-stage-visited/10 px-4 py-3.5 duration-300 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={20} className="shrink-0 text-stage-visited" />
          <div>
            <p className="text-[13px] font-semibold">Imported</p>
            <p className="text-[12px] text-muted-foreground">Taking you back to the leads table…</p>
          </div>
        </div>
      )}

      {!file && (
        <div
          className={cn(
            'rounded-xl border-2 border-dashed bg-card p-12 text-center transition-colors sm:p-16',
            isDragging ? 'border-brand bg-brand-muted/40' : 'hover:border-muted-foreground/30'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e); }}
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground">
            <UploadCloud size={22} />
          </div>
          <h2 className="text-[15px] font-semibold">Drop your spreadsheet here</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted-foreground">
            .xlsx, .xls or .csv — or browse for it.
          </p>

          <Button render={<label className="mt-6 cursor-pointer" />}>
            Browse files
            <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
          </Button>

          <div className="mt-10 border-t pt-6 text-[11px] text-muted-foreground">
            <p className="flex items-center justify-center gap-2 font-medium">
              <FileSpreadsheet size={14} /> Columns read from the sheet
            </p>
            <p className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              {COLUMNS.map((c) => (
                <code key={c} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10.5px] text-foreground">{c}</code>
              ))}
            </p>
            <p className="mt-2">
              Only <b className="text-foreground">Clinic Name</b> is required. Rows without one are skipped.
            </p>
            <p className="mt-1">
              <b className="text-foreground">Category</b> takes {CATEGORY_LIST.map((c) => c.code).join(' or ')}, and decides
              which templates the row may use. Leave <b className="text-foreground">Template</b> blank to get the
              category&rsquo;s own.
            </p>

            <button
              type="button"
              onClick={downloadSample}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Download size={13} /> Download a sample sheet
            </button>
          </div>
        </div>
      )}

      {file && previewData.length > 0 && !success && (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
                <FileSpreadsheet size={17} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{file.name}</p>
                <p className="nums mt-0.5 text-[11.5px] text-muted-foreground">
                  {audit.named} lead{audit.named === 1 ? '' : 's'} will be created
                  {audit.skipped > 0 && <> · <span className="text-stage-blocked">{audit.skipped} skipped, no clinic name</span></>}
                  {' '}· {audit.withEmail} with an email
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Select value={category} onValueChange={chooseCategory} disabled={isImporting}>
                <SelectTrigger
                  className="gap-1.5 text-[13px]"
                  title="What kind of business this batch is. Rows with their own Category column override it."
                >
                  {CATEGORY_LIST.find((c) => c.id === category)?.label}
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_LIST.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex flex-col">
                        <span>{c.label}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {c.code} · defaults to the {c.template} template
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* When every row carries its own Template, this picker does
                  nothing. Leaving it live showed a value that was about to
                  be ignored, which reads as a bug. */}
              <Select
                value={template}
                onValueChange={setTemplate}
                disabled={isImporting || allRowsCarryTemplate}
              >
                <SelectTrigger
                  className="gap-1.5 text-[13px]"
                  title={allRowsCarryTemplate
                    ? 'Every row in this sheet sets its own template, so there is nothing for this to do'
                    : 'Applies to rows with no Template column of their own'}
                >
                  <Layout size={13} className="text-muted-foreground" />
                  {allRowsCarryTemplate
                    ? 'Set per row'
                    : resolveTemplate(template).label}
                </SelectTrigger>
                <SelectContent>
                  {templatesFor(category).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium">{t.label}</span>
                        <span className="text-[11px] text-muted-foreground">{t.blurb}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="ghost" onClick={reset} disabled={isImporting}>Cancel</Button>
              <Button onClick={confirmImport} disabled={isImporting || audit.named === 0} className="gap-2">
                {isImporting
                  ? <><Loader2 size={15} className="animate-spin" /> Importing…</>
                  : <>Import {audit.named} <ArrowRight size={15} /></>}
              </Button>
            </div>
          </div>

          {audit.overridden > 0 && (
            <div className="flex items-center gap-2 border-b bg-brand-muted/50 px-5 py-2.5 text-[12px]">
              <Layout size={13} className="shrink-0 text-brand" />
              <span className="nums">
                {allRowsCarryTemplate
                  ? <>Every row sets its own template in the sheet, so the picker is off.</>
                  : <><b>{audit.overridden}</b> of {audit.named} row{audit.named === 1 ? '' : 's'} set
                      their own template in the sheet. The rest use the picker.</>}
              </span>
            </div>
          )}

          {/* A corrected row still imports, so the only way this is not a
              silent change is to say it before the button is pressed. */}
          {audit.corrected > 0 && (
            <div className="flex items-start gap-2 border-b border-stage-blocked/25 bg-stage-blocked/10 px-5 py-2.5 text-[12px]">
              <AlertCircle size={13} className="mt-0.5 shrink-0 text-stage-blocked" />
              <span className="nums">
                <b>{audit.corrected}</b> row{audit.corrected === 1 ? '' : 's'} name a template their category
                cannot use. Those rows import with their category&rsquo;s own template instead — marked below.
              </span>
            </div>
          )}

          <div className="max-h-[460px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 pl-5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Clinic</TableHead>
                  <TableHead className="h-9 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Doctor</TableHead>
                  <TableHead className="h-9 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Email</TableHead>
                  <TableHead className="h-9 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Phone</TableHead>
                  <TableHead className="h-9 pr-5 text-right text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Template</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.slice(0, 25).map((row, i) => {
                  const name = cell(row, 'Clinic Name');
                  const res = resolveRow(row);
                  return (
                    <TableRow key={i} className={cn(!name && 'opacity-45')}>
                      <TableCell className="max-w-[260px] pl-5 text-[12.5px] font-medium">
                        {name || <span className="italic text-muted-foreground">skipped — no clinic name</span>}
                      </TableCell>
                      <TableCell className="text-[12.5px] text-muted-foreground">{cell(row, 'Doctor Name') || '—'}</TableCell>
                      <TableCell className="font-mono text-[11.5px]">
                        {cell(row, 'Email', 'Public Email', 'Email Address') || <span className="text-stage-blocked">no email</span>}
                      </TableCell>
                      <TableCell className="font-mono text-[11.5px] text-muted-foreground">
                        {cell(row, 'Phone', 'Phone Number', 'Contact') || '—'}
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <span className="inline-flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10.5px] font-medium text-muted-foreground">
                            {resolveCategory(res.category).code}
                          </Badge>
                          <Badge
                            variant={res.own && !res.corrected ? 'default' : 'outline'}
                            className={cn(
                              'text-[10.5px] font-medium',
                              res.corrected && 'border-stage-blocked/40 text-stage-blocked'
                            )}
                          >
                            {res.corrected && <AlertCircle size={10} className="mr-1" />}
                            {resolveTemplate(res.template).label}
                          </Badge>
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {previewData.length > 25 && (
            <div className="nums border-t bg-muted/30 px-5 py-2.5 text-center text-[11px] text-muted-foreground">
              Showing the first 25 of {previewData.length} rows
            </div>
          )}
        </div>
      )}
    </div>
  );
}
