// components/ImageUploader.tsx

"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type Props = {
  value: string;
  onChange: (publicId: string) => void;
  folder: "dentists" | "services" | "site" | "gallery";
};

const MAX_MB = 8;

export default function ImageUploader({ value, onChange, folder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Image must be under ${MAX_MB} MB.`);

    setBusy(true);
    try {
      const signRes = await fetch("/api/admin/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      if (!signRes.ok) throw new Error("Could not start upload");
      const s = await signRes.json();

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", s.apiKey);
      fd.append("timestamp", String(s.timestamp));
      fd.append("signature", s.signature);
      fd.append("folder", s.folder);
      fd.append("allowed_formats", s.allowedFormats);

      const up = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await up.json();
      if (!up.ok) throw new Error(data?.error?.message ?? "Upload failed");

      onChange(data.public_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
        {value ? (
          <Image src={value} alt="" fill sizes="96px" className="object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-slate-400">No image</span>
        )}
      </div>

      <div>
        <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
        >
          {busy ? "Uploading..." : value ? "Change image" : "Upload image"}
        </button>
        {value && !busy && (
          <button type="button" onClick={() => onChange("")} className="ml-2 text-sm text-red-600 hover:underline">
            Remove
          </button>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
