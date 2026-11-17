import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, ImagePlus, LoaderCircle, Save, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAdminMovie, saveMovie, uploadMovieImage, type MovieInput } from "../../../services/movieService";

const emptyForm: MovieInput = { title: "", description: "", language: "", genre: "", duration: 120, certification: "UA", releaseDate: new Date().toISOString().slice(0, 10), posterUrl: "", bannerUrl: null, trailerUrl: "", director: "", cast: "", status: "DRAFT", featured: false };

export default function MovieForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const client = useQueryClient();
  const movieQuery = useQuery({ queryKey: ["admin-movie", id], queryFn: () => getAdminMovie(id!), enabled: editing });
  const [form, setForm] = useState<MovieInput>(emptyForm);
  const [uploading, setUploading] = useState<"poster" | "banner" | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState<"poster" | "banner" | null>(null);
  const posterInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (movieQuery.data) {
      const { id: _id, slug: _slug, createdAt: _created, updatedAt: _updated, ...movie } = movieQuery.data;
      setForm({ ...movie, releaseDate: movie.releaseDate.slice(0, 10), trailerUrl: movie.trailerUrl ?? "", bannerUrl: movie.bannerUrl ?? null });
    }
  }, [movieQuery.data]);

  const saveMutation = useMutation({ mutationFn: () => saveMovie({ ...form, trailerUrl: form.trailerUrl || null }, id), onSuccess: async (movie) => { await Promise.all([client.invalidateQueries({ queryKey: ["admin-movies"] }), client.invalidateQueries({ queryKey: ["admin-dashboard"] }), client.invalidateQueries({ queryKey: ["admin-movie", id] })]); navigate(`/admin/movies/${movie.id}`, { replace: true }); } });

  function change<K extends keyof MovieInput>(key: K, value: MovieInput[K]) { setForm((current) => ({ ...current, [key]: value })); }

  async function handleFile(file: File | undefined, kind: "poster" | "banner") {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) { setError("Choose an image file (JPEG, PNG, or WebP)."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Images must be 5 MB or smaller."); return; }
    setUploading(kind);
    try {
      const result = await uploadMovieImage(file, kind);
      change(kind === "poster" ? "posterUrl" : "bannerUrl", result.url as never);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Image upload failed. Please try again."); }
    finally { setUploading(null); }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>, kind: "poster" | "banner") {
    void handleFile(event.target.files?.[0], kind);
    event.target.value = "";
  }
  function onDrop(event: DragEvent<HTMLDivElement>, kind: "poster" | "banner") {
    event.preventDefault(); setDragging(null); void handleFile(event.dataTransfer.files[0], kind);
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!form.posterUrl) { setError("Upload a movie poster before saving."); return; }
    if (uploading) { setError("Wait for the image upload to finish."); return; }
    try { await saveMutation.mutateAsync(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save the movie."); }
  }

  if (movieQuery.isLoading) return <div className="skeleton h-[500px] rounded-2xl" />;
  if (movieQuery.isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Could not load this movie. <Link to="/admin/movies" className="font-bold underline">Return to movies</Link></div>;

  return <div className="mx-auto max-w-5xl space-y-6">
    <div><Link to={editing ? `/admin/movies/${id}` : "/admin/movies"} className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-eventx"><ArrowLeft size={14}/>{editing ? "Back to movie" : "Back to movies"}</Link><div className="mt-4 flex items-end justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-eventx">Catalog editor</p><h1 className="mt-1 font-display text-4xl font-black uppercase tracking-tight">{editing ? "Edit movie" : "Add a movie"}</h1><p className="mt-1 text-xs text-slate-500">Add the details your audience needs before they book.</p></div><span className={`rounded-full px-3 py-1.5 text-[9px] font-extrabold ${form.status === "PUBLISHED" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{form.status}</span></div></div>
    <form onSubmit={submit} className="space-y-5">
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">{error}</div>}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SectionTitle number="01" title="Basic information" description="The core details of the movie."/><div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Movie title" required><input required maxLength={180} value={form.title} onChange={(e) => change("title", e.target.value)} placeholder="e.g. The Last Show" className={inputClass}/></Field>
        <Field label="Language" required><input required maxLength={80} value={form.language} onChange={(e) => change("language", e.target.value)} placeholder="e.g. Hindi, Tamil" className={inputClass}/></Field>
        <Field label="Genre" required><input required maxLength={100} value={form.genre} onChange={(e) => change("genre", e.target.value)} placeholder="e.g. Drama, Thriller" className={inputClass}/></Field>
        <Field label="Director" required><input required maxLength={180} value={form.director} onChange={(e) => change("director", e.target.value)} placeholder="Director name" className={inputClass}/></Field>
        <Field label="Duration (minutes)" required><input required type="number" min={1} max={1000} value={form.duration} onChange={(e) => change("duration", Number(e.target.value))} className={inputClass}/></Field>
        <Field label="Certification" required><select value={form.certification} onChange={(e) => change("certification", e.target.value as MovieInput["certification"])} className={inputClass}><option>U</option><option>UA</option><option>A</option></select></Field>
        <Field label="Release date" required><input required type="date" value={form.releaseDate} onChange={(e) => change("releaseDate", e.target.value)} className={inputClass}/></Field>
        <Field label="Release status" required><select value={form.status} onChange={(e) => change("status", e.target.value as MovieInput["status"])} className={inputClass}><option value="DRAFT">Draft · hidden from public</option><option value="PUBLISHED">Published · visible to public</option><option value="ARCHIVED">Archived</option></select></Field>
        <div className="md:col-span-2"><Field label="Description" required><textarea required rows={5} maxLength={20000} value={form.description} onChange={(e) => change("description", e.target.value)} placeholder="Tell viewers what makes this movie worth watching…" className={`${inputClass} h-auto py-3`}/></Field></div>
        <div className="md:col-span-2"><Field label="Cast" hint="Separate names with commas"><textarea rows={2} maxLength={5000} value={form.cast} onChange={(e) => change("cast", e.target.value)} placeholder="Lead actor, supporting actor, …" className={`${inputClass} h-auto py-3`}/></Field></div>
      </div></section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SectionTitle number="02" title="Artwork & trailer" description="Images are securely uploaded to Cloudinary."/><div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ImageDrop title="Movie poster" required url={form.posterUrl} busy={uploading === "poster"} dragging={dragging === "poster"} inputRef={posterInput} onPick={(e) => onFileChange(e, "poster")} onRemove={() => change("posterUrl", "")} onDrag={(e) => { e.preventDefault(); setDragging("poster"); }} onLeave={() => setDragging(null)} onDrop={(e) => onDrop(e, "poster")} />
        <ImageDrop title="Movie banner" url={form.bannerUrl ?? ""} busy={uploading === "banner"} dragging={dragging === "banner"} inputRef={bannerInput} onPick={(e) => onFileChange(e, "banner")} onRemove={() => change("bannerUrl", null)} onDrag={(e) => { e.preventDefault(); setDragging("banner"); }} onLeave={() => setDragging(null)} onDrop={(e) => onDrop(e, "banner")} wide />
        <div className="lg:col-span-2"><Field label="Trailer URL" hint="YouTube or another public video link"><input type="url" maxLength={500} value={form.trailerUrl ?? ""} onChange={(e) => change("trailerUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=…" className={inputClass}/></Field></div>
      </div></section>

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:px-7"><div><p className="text-xs font-extrabold">Featured movie</p><p className="mt-1 text-[10px] text-slate-400">Highlight this title in the catalog.</p></div><button type="button" role="switch" aria-checked={form.featured} onClick={() => change("featured", !form.featured)} className={`relative h-7 w-12 rounded-full transition ${form.featured ? "bg-eventx" : "bg-slate-200"}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${form.featured ? "left-6" : "left-1"}`}/><span className="sr-only">Toggle featured</span></button></section>
      <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row"><Link to={editing ? `/admin/movies/${id}` : "/admin/movies"} className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600">Cancel</Link><button disabled={saveMutation.isPending || Boolean(uploading)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-eventx px-6 text-xs font-bold text-white shadow-lg shadow-eventx/15 hover:bg-eventx-dark disabled:opacity-55">{saveMutation.isPending ? <LoaderCircle className="animate-spin" size={15}/> : <Save size={15}/ >}{saveMutation.isPending ? "Saving…" : editing ? "Save changes" : "Create movie"}</button></div>
    </form>
  </div>;
}

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-eventx focus:ring-4 focus:ring-eventx/10";
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 flex items-center justify-between text-[10px] font-extrabold text-slate-700">{label}{required && <span className="text-eventx">Required</span>}{hint && <span className="font-medium text-slate-400">{hint}</span>}</span>{children}</label>; }
function SectionTitle({ number, title, description }: { number: string; title: string; description: string }) { return <div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-50 text-[10px] font-black text-eventx">{number}</span><div><h2 className="text-sm font-extrabold text-slate-900">{title}</h2><p className="mt-1 text-[10px] text-slate-400">{description}</p></div></div>; }

function ImageDrop({ title, required, url, busy, dragging, inputRef, onPick, onRemove, onDrag, onLeave, onDrop, wide }: { title: string; required?: boolean; url: string; busy: boolean; dragging: boolean; inputRef: React.RefObject<HTMLInputElement>; onPick: (event: ChangeEvent<HTMLInputElement>) => void; onRemove: () => void; onDrag: (event: DragEvent<HTMLDivElement>) => void; onLeave: () => void; onDrop: (event: DragEvent<HTMLDivElement>) => void; wide?: boolean }) {
  return <div><div className="mb-2 flex items-center justify-between text-[10px] font-extrabold text-slate-700">{title}{required && <span className="text-eventx">Required</span>}</div><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} className="sr-only"/><div onDragOver={onDrag} onDragLeave={onLeave} onDrop={onDrop} className={`relative flex min-h-[190px] overflow-hidden rounded-2xl border border-dashed transition ${dragging ? "border-eventx bg-red-50" : url ? "border-slate-200 bg-slate-50" : "border-slate-300 bg-slate-50/70 hover:border-eventx/50 hover:bg-red-50/30"}`}>
    {url ? <><img src={url} alt={`${title} preview`} className={`absolute inset-0 size-full ${wide ? "object-cover" : "object-contain"}`}/><div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/80 to-transparent px-4 pb-3 pt-10"><span className="text-[10px] font-bold text-white">Preview ready</span><div className="flex gap-2"><button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg bg-white/20 px-2.5 py-1.5 text-[9px] font-bold text-white backdrop-blur">Replace</button><button type="button" onClick={onRemove} aria-label={`Remove ${title}`} className="grid size-7 place-items-center rounded-lg bg-white/20 text-white backdrop-blur"><X size={13}/></button></div></div></> : <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 px-4 py-8 text-center disabled:opacity-60">{busy ? <LoaderCircle size={24} className="animate-spin text-eventx"/> : <span className="grid size-10 place-items-center rounded-xl bg-white text-eventx shadow-sm"><UploadCloud size={18}/></span>}<span className="text-[11px] font-bold text-slate-700">{busy ? "Uploading securely…" : "Drop image here or browse"}</span><span className="text-[9px] text-slate-400">JPEG, PNG, WebP · up to 5 MB</span></button>}
  </div>{busy && <p className="mt-1.5 flex items-center gap-1 text-[9px] font-semibold text-eventx"><ImagePlus size={11}/>Uploading to Cloudinary</p>}{url && !busy && <p className="mt-1.5 flex items-center gap-1 text-[9px] font-semibold text-green-700"><Check size={11}/>Image stored securely</p>}</div>;
}
