"use client";

import { useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { API_URL } from "@/lib/api";

export default function PhotosPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSelect() {
    fileInputRef.current?.click();
  }

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files;
    if (!selected) return;

    const arr = Array.from(selected);
    setFiles(arr);

    const urls = arr.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  }

  async function uploadPhotos() {
    if (files.length === 0) return;

    const token = localStorage.getItem("token");
    const form = new FormData();
    files.forEach((file) => form.append("photos", file));

    try {
      // forward directly to backend; adjust host via env variable
      const res = await fetch(`${API_URL}/api/providers/photos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
      const data = await res.json();
      console.log("upload response", data);
      // reset state once uploaded
      setFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("photo upload failed", err);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Gallery Photos</h1>

        <div className="max-w-3xl rounded-xl border bg-white p-6">
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            ref={fileInputRef}
            onChange={handleFilesChange}
          />

          <div className="mb-6 flex gap-4">
            <button
              onClick={handleSelect}
              className="rounded-lg bg-emerald-600 px-4 py-3 text-white"
            >
              Select Photos
            </button>
            {files.length > 0 && (
              <button
                onClick={uploadPhotos}
                className="rounded-lg bg-blue-600 px-4 py-3 text-white"
              >
                Upload {files.length} file{files.length > 1 ? "s" : ""}
              </button>
            )}
          </div>

          {previews.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {previews.map((src, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="relative h-32 w-full">
                    <img
                      src={src}
                      alt={`preview-${idx}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </div>
                  <p className="truncate text-xs text-gray-600">
                    {files[idx]?.name} ({((files[idx]?.size ?? 0) / 1024).toFixed(0)} KB)
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="h-32 rounded-lg bg-gray-100" />
              <div className="h-32 rounded-lg bg-gray-100" />
              <div className="h-32 rounded-lg bg-gray-100" />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
