"use client";

import { useActionState, useRef, useState, type DragEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { uploadAvatar, type AvatarFormState } from "./actions";
import { cn } from "@/lib/cn";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function AvatarUploadForm() {
  const [state, action, pending] = useActionState<AvatarFormState, FormData>(
    uploadAvatar,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function submitFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) return;

    const transfer = new DataTransfer();
    transfer.items.add(file);
    if (inputRef.current) inputRef.current.files = transfer.files;

    setFileName(file.name);
    formRef.current?.requestSubmit();
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) submitFile(file);
  }

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <motion.div
        role="button"
        tabIndex={0}
        onClick={() => !pending && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !pending) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{ scale: isDragging ? 1.01 : 1 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-6 py-8 text-center transition-colors",
          isDragging
            ? "border-gold"
            : state?.error
              ? "border-danger"
              : "border-line",
          pending && "pointer-events-none opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          name="avatar"
          accept={ACCEPTED_TYPES.join(",")}
          required
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) submitFile(file);
          }}
        />
        <AnimatePresence mode="wait">
          {pending ? (
            <motion.p
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gold"
            >
              Uploading{fileName ? ` ${fileName}` : ""}…
            </motion.p>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-xs text-paper">
                Drag a photo here, or click to browse
              </p>
              <p className="mt-1 text-xs text-stone">
                PNG, JPEG, or WEBP — up to 2MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {state?.error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-danger"
          >
            {state.error}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
