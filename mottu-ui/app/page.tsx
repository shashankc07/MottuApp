"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { getToken, clearToken } from "@/lib/auth";
import type { Memory, MemoryFormData, MemoryMedia } from "./types";

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE ?? "")
    : process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

const MAX_IMAGE_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= MAX_IMAGE_DIMENSION && height <= MAX_IMAGE_DIMENSION) {
        width = img.width;
        height = img.height;
      } else {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compress failed"))),
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

const LOVE_QUOTES = [
  "Love is not just looking at each other, it’s looking in the same direction.",
  "In you, I’ve found the love of my life and my closest, truest friend.",
  "I love you not only for what you are, but for what I am when I am with you.",
  "The best thing to hold onto in life is each other.",
  "Grow old with me, the best is yet to be.",
  "I choose you. And I’ll choose you over and over. Without pause, without doubt.",
  "You are my today and all of my tomorrows.",
  "Every love story is beautiful, but ours is my favorite.",
  "I saw that you were perfect, and so I loved you. Then I saw that you were not perfect and I loved you even more.",
  "Being with you is like having every single one of my wishes come true.",
  "I never want to stop making memories with you.",
  "You’re the one I want to do nothing with for the rest of my life.",
  "I love you more than I have ever found a way to say to you.",
  "All of me loves all of you.",
  "I’ve fallen in love many times… always with you.",
  "You are my sunshine, my only sunshine.",
  "I want to be the reason you look down at your phone and smile.",
  "Forever is a long time, but I wouldn’t mind spending it by your side.",
  "Love is composed of a single soul inhabiting two bodies.",
  "I love you to the moon and back.",
  "You had me at hello.",
  "We’re like two halves of a whole.",
  "Every moment with you is a memory I treasure.",
  "You make my heart smile.",
  "I love you like crazy.",
  "You’re my person.",
  "I found a forever in your arms.",
  "With you, every day feels like a little adventure.",
  "You’re the best thing that ever happened to me.",
  "I fall in love with you a little more every day."
];

function getQuoteOfTheDay(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / (24 * 60 * 60 * 1000));
  return LOVE_QUOTES[dayOfYear % LOVE_QUOTES.length];
}

function QuoteOfTheDay() {
  const [quote] = useState(() => getQuoteOfTheDay());
  return (
    <div className="rounded-2xl bg-gradient-to-r from-floralPink/20 via-floralPeach/20 to-floralLilac/20 border border-floralLilac/40 p-4 text-center">
      <p className="text-sm italic text-floralText/90">&ldquo;{quote}&rdquo;</p>
      <p className="mt-2 text-[10px] text-floralText/60">Quote of the day</p>
    </div>
  );
}

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDateSearchOpen, setIsDateSearchOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [form, setForm] = useState<MemoryFormData>({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    caption: "",
    feelingNote: "",
    locationName: "",
    latitude: "",
    longitude: "",
    media: []
  });

  const fetchMemories = async (overrides?: { from?: string; to?: string }) => {
    setLoading(true);
    setError(null);
    const from = overrides?.from ?? fromDate;
    const to = overrides?.to ?? toDate;
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const url = params.toString()
      ? `${API_BASE}/api/memories?${params.toString()}`
      : `${API_BASE}/api/memories`;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const maxAttempts = 3;
    const delays = [0, 2000, 4000]; // first try immediately, then retry after 2s and 4s (cold start)
    let lastError: string | null = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (delays[attempt] > 0) await new Promise((r) => setTimeout(r, delays[attempt]));
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error("Failed to load memories");
        const data = await res.json();
        setMemories(data);
        setLoading(false);
        return;
      } catch (e: unknown) {
        lastError = e instanceof Error ? e.message : "Something went wrong";
      }
    }
    setError(lastError ?? "Something went wrong");
    setLoading(false);
  };

  // Require auth: redirect to /auth if no token
  useEffect(() => {
    const t = getToken();
    if (!t) {
      window.location.href = "/auth";
      return;
    }
    setToken(t);
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (authChecked && token) {
      fetchMemories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, token]);

  const openCreateForm = () => {
    setEditingMemory(null);
    setForm({
      title: "",
      date: new Date().toISOString().slice(0, 10),
      caption: "",
      feelingNote: "",
      locationName: "",
      latitude: "",
      longitude: "",
      media: []
    });
    setIsFormOpen(true);
  };

  const openEditForm = (memory: Memory) => {
    setEditingMemory(memory);
    setForm({
      title: memory.title,
      date: memory.date.slice(0, 10),
      caption: memory.caption ?? "",
      feelingNote: memory.feelingNote ?? "",
      locationName: memory.locationName ?? "",
      latitude: memory.latitude != null ? String(memory.latitude) : "",
      longitude: memory.longitude != null ? String(memory.longitude) : "",
      media: memory.media ?? []
    });
    setIsFormOpen(true);
  };

  const handleFormChange = (field: keyof MemoryFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const payload = {
        title: form.title,
        date: form.date,
        caption: form.caption || null,
        feelingNote: form.feelingNote || null,
        locationName: form.locationName || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        media: form.media.map((m) => ({
          id: m.id,
          type: m.type,
          url: m.url,
          thumbnailUrl: m.thumbnailUrl ?? null
        }))
      };

      const method = editingMemory ? "PUT" : "POST";
      const url = editingMemory
        ? `${API_BASE}/api/memories/${editingMemory.id}`
        : `${API_BASE}/api/memories`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save memory");
      setIsFormOpen(false);
      await fetchMemories();
    } catch (e: any) {
      setError(e.message ?? "Failed to save memory");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Delete this memory?");
    if (!confirmDelete) return;
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/memories/${id}`, {
        method: "DELETE",
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchMemories();
    } catch (e: any) {
      setError(e.message ?? "Failed to delete memory");
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      setUploadError(null);
      setUploading(true);
      const blob = await compressImage(file);
      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      const res = await fetch(`${API_BASE}/api/memories/media/upload`, {
        method: "POST",
        body: formData,
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined
      });
      if (!res.ok) {
        throw new Error("Failed to upload photo");
      }
      const media: MemoryMedia = await res.json();
      setForm((prev) => ({
        ...prev,
        media: [...prev.media, media]
      }));
    } catch (e: any) {
      setUploadError(e.message ?? "Failed to upload photo");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleLogout = () => {
    clearToken();
    setToken(null);
    window.location.href = "/auth";
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-floralPink/20 via-floralPeach/20 to-floralLilac/20">
        <div className="h-8 w-8 rounded-full border-2 border-floralPink border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-floralPink via-floralPeach to-floralLilac shadow-soft">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Mottu Memories
            </h1>
            <p className="text-xs opacity-80">
              A little floral garden for your favorite days.
            </p>
          </div>
          {token ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDateSearchOpen(true)}
                className="rounded-full border border-floralLilac px-3 py-2 text-xs font-medium bg-white/80 hover:bg-floralLilac/20 transition"
              >
                Search by date
              </button>
              <button
                onClick={openCreateForm}
                className="rounded-full bg-floralGreen px-4 py-2 text-sm font-medium shadow-soft hover:bg-floralGreen/80 active:scale-95 transition"
              >
                + New
              </button>
              <button
                onClick={handleLogout}
                className="text-[11px] px-2 py-1 rounded-full border border-floralLilac bg-white/60"
              >
                Logout
              </button>
            </div>
          ) : (
            <span className="text-[11px] opacity-80">
              Please log in to save memories
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl w-full px-4 pt-4 pb-24 flex-1">
        {error && (
          <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="h-8 w-8 rounded-full border-2 border-floralPink border-t-transparent animate-spin" />
          </div>
        ) : memories.length === 0 ? (
          <div className="mt-8 text-center px-4">
            <p className="text-sm text-floralText/80 leading-relaxed">
              No memories yet. Tap the{" "}
              <span className="font-semibold text-floralPink">+ New</span>{" "}
              button to post memories with your cutiiee patootiee husband.
            </p>
          </div>
        ) : (
          <>
            <QuoteOfTheDay />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {memories.map((m) => (
              <article
                key={m.id}
                className="group rounded-2xl bg-white/90 backdrop-blur shadow-soft border border-floralLilac/40 overflow-hidden flex flex-col"
              >
                {m.media && m.media.length > 0 && (
                  <div className="relative">
                    <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
                      {m.media.map((media) => {
                        const url = media.url.startsWith("http")
                          ? media.url
                          : `${API_BASE}${media.url}`;
                        const lower = media.url.toLowerCase();
                        const isHeic =
                          lower.endsWith(".heic") || lower.endsWith(".heif");

                        if (isHeic) {
                          return (
                            <div
                              key={media.url}
                              className="snap-center flex-shrink-0 w-full aspect-[4/5] flex items-center justify-center bg-floralLilac/20"
                            >
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-center px-3 py-2 rounded-xl border border-floralLilac/60 bg-white/80"
                              >
                                HEIC photo
                                <br />
                                (tap to open/download)
                              </a>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={media.url}
                            className="snap-center flex-shrink-0 w-full"
                          >
                            <div className="relative w-full aspect-[4/5]">
                              <img
                                src={url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <a
                                href={url}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="absolute bottom-2 right-2 rounded-full bg-black/60 text-white text-[10px] px-2 py-1"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {m.media.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {m.media.map((media) => (
                          <span
                            key={media.url}
                            className="h-1.5 w-1.5 rounded-full bg-white/70"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-floralPink via-floralPeach to-floralGreen flex items-center justify-center text-[10px] font-semibold text-floralText shadow-soft">
                        {new Date(m.date).toLocaleDateString(undefined, {
                          day: "2-digit",
                          month: "short"
                        })}
                      </div>
                      <h2 className="font-semibold text-sm truncate">
                        {m.title}
                      </h2>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditForm(m)}
                        className="text-xs px-2 py-1 rounded-full bg-floralLilac/40 hover:bg-floralLilac/70"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {(m.createdByEmail || m.locationName) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {m.createdByEmail && (
                        <span className="text-[10px] text-floralText/70">
                          Added by {m.createdByEmail}
                        </span>
                      )}
                      {m.locationName && (
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-floralGreen/40">
                          {m.locationName}
                        </span>
                      )}
                    </div>
                  )}
                  {m.caption && (
                    <p className="mt-1 text-xs leading-relaxed break-words line-clamp-3">
                      {m.caption}
                    </p>
                  )}
                  {m.feelingNote && (
                    <p className="mt-1 text-[11px] italic opacity-80 break-words line-clamp-2">
                      {m.feelingNote}
                    </p>
                  )}
                </div>
              </article>
            ))}
            </div>
          </>
        )}
      </main>

      {isDateSearchOpen && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/30">
          <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-white shadow-soft p-4 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Search by date</h2>
              <button
                onClick={() => setIsDateSearchOpen(false)}
                className="text-xs px-2 py-1 rounded-full border border-floralLilac hover:bg-floralLilac/40"
              >
                Close
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchMemories();
                setIsDateSearchOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-medium block mb-1">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-xl border border-floralLilac/60 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-floralPink/60"
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-xl border border-floralLilac/60 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-floralPink/60"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-floralPink px-4 py-2 text-sm font-medium shadow-soft hover:bg-floralPink/80 transition"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                    fetchMemories({ from: "", to: "" });
                    setIsDateSearchOpen(false);
                  }}
                  className="flex-1 rounded-full border border-floralLilac px-3 py-2 text-xs hover:bg-floralLilac/20 transition"
                >
                  Clear & show all
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/30">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-soft p-4 pb-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">
                {editingMemory ? "Edit memory" : "New memory"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-xs px-2 py-1 rounded-full border border-floralLilac hover:bg-floralLilac/40"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    handleFormChange("title", e.target.value)
                  }
                  className="w-full rounded-xl border border-floralLilac/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-floralPink/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    handleFormChange("date", e.target.value)
                  }
                  className="w-full rounded-xl border border-floralLilac/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-floralPink/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={form.locationName}
                  placeholder="Where were you?"
                  onChange={(e) =>
                    handleFormChange("locationName", e.target.value)
                  }
                  className="w-full rounded-xl border border-floralLilac/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-floralPink/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">
                  Memory
                </label>
                <textarea
                  rows={4}
                  value={form.caption}
                  onChange={(e) =>
                    handleFormChange("caption", e.target.value)
                  }
                  className="w-full rounded-2xl border border-floralLilac/60 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-floralPink/50"
                  placeholder="Write about your day, what made it special..."
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">
                  Feelings (optional)
                </label>
                <textarea
                  rows={2}
                  value={form.feelingNote}
                  onChange={(e) =>
                    handleFormChange("feelingNote", e.target.value)
                  }
                  className="w-full rounded-2xl border border-floralLilac/60 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-floralPink/50"
                  placeholder="How did this memory make you feel?"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium block mb-1">
                    Latitude (optional)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.latitude}
                    onChange={(e) =>
                      handleFormChange("latitude", e.target.value)
                    }
                    className="w-full rounded-xl border border-floralLilac/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-floralPink/50"
                    placeholder="e.g. 12.9716"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium block mb-1">
                    Longitude (optional)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.longitude}
                    onChange={(e) =>
                      handleFormChange("longitude", e.target.value)
                    }
                    className="w-full rounded-xl border border-floralLilac/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-floralPink/50"
                    placeholder="e.g. 77.5946"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">
                  Photos
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center justify-center px-3 py-2 rounded-full border border-floralLilac bg-floralLilac/20 text-xs font-medium cursor-pointer hover:bg-floralLilac/40">
                    {uploading ? "Uploading..." : "Add photo"}
                    <input
                      type="file"
                      accept="image/jpeg,.jpg,.JPG,.jpeg,.JPEG"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                  {uploadError && (
                    <span className="text-[11px] text-red-600">
                      {uploadError}
                    </span>
                  )}
                </div>
                {form.media.length > 0 && (
                  <div className="mt-2 flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
                    {form.media.map((media) => {
                      const url = media.url.startsWith("http")
                        ? media.url
                        : `${API_BASE}${media.url}`;
                      const lower = media.url.toLowerCase();
                      const isHeic =
                        lower.endsWith(".heic") || lower.endsWith(".heif");

                      if (isHeic) {
                        return (
                          <div
                            key={media.url}
                            className="snap-center flex-shrink-0 w-24 h-24 flex items-center justify-center bg-floralLilac/20 rounded-xl border border-floralLilac/60"
                          >
                            <span className="text-[10px] text-center px-2">
                              HEIC photo
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={media.url}
                          className="snap-center flex-shrink-0 w-24 h-24 rounded-xl border border-floralLilac/60 overflow-hidden"
                        >
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="mt-4 w-full rounded-full bg-gradient-to-r from-floralPink via-floralPeach to-floralGreen py-2.5 text-sm font-semibold shadow-soft hover:brightness-105 active:scale-95 transition"
            >
              {editingMemory ? "Save changes" : "Save memory"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

