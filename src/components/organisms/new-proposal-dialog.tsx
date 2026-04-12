"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { trpc } from "@/lib/trpc/client";

interface NewProposalDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function NewProposalDialog({
  open,
  onOpenChange,
}: NewProposalDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [rfpFile, setRfpFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const createProposal = trpc.proposal.create.useMutation({
    onSuccess: (proposal) => {
      void utils.proposal.list.invalidate();
      onOpenChange(false);
      resetForm();
      router.push(`/proposals/${proposal.id}`);
    },
  });

  function resetForm() {
    setTitle("");
    setClientName("");
    setRfpFile(null);
    setUploadError(null);
  }

  async function handleCreate() {
    if (!title.trim() || createProposal.isPending) return;

    setUploadError(null);

    if (rfpFile) {
      const form = new FormData();
      form.append("file", rfpFile);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const json = (await res.json()) as {
          ok: boolean;
          error?: { message: string };
        };
        if (!json.ok) {
          setUploadError(json.error?.message ?? "File upload failed.");
          return;
        }
      } catch {
        setUploadError("Network error uploading file. Please try again.");
        return;
      }
    }

    createProposal.mutate({
      title: title.trim(),
      clientName: clientName.trim() || undefined,
    });
  }

  const isPending = createProposal.isPending;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background-elevated p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <Dialog.Title className="text-base font-semibold">
            New Proposal
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-foreground-muted">
            Create a new proposal. You can attach an RFP document to extract
            requirements automatically.
          </Dialog.Description>

          {/* Close button */}
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-9 w-9"
              disabled={isPending}
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </Button>
          </Dialog.Close>

          {/* Form */}
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="proposal-title" className="block text-sm font-medium">
                Title <span className="text-danger">*</span>
              </label>
              <Input
                id="proposal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cloud Migration Strategy"
                disabled={isPending}
                onKeyDown={(e) => e.key === "Enter" && void handleCreate()}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="proposal-client" className="block text-sm font-medium">
                Client name
              </label>
              <Input
                id="proposal-client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="proposal-rfp" className="block text-sm font-medium">
                RFP document{" "}
                <span className="text-xs font-normal text-foreground-muted">
                  optional
                </span>
              </label>
              <button
                id="proposal-rfp"
                type="button"
                className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-dashed border-border px-4 py-3 text-sm text-foreground-muted transition-colors hover:border-[hsl(var(--accent-hover))] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
              >
                <Upload className="h-4 w-4 shrink-0" />
                {rfpFile ? (
                  <span className="min-w-0 truncate font-medium text-foreground">
                    {rfpFile.name}
                  </span>
                ) : (
                  <span>Attach PDF or DOCX</span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                className="sr-only"
                onChange={(e) => setRfpFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {(uploadError ?? createProposal.error) && (
              <p className="text-sm text-danger">
                {uploadError ?? createProposal.error?.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="outline" size="sm" disabled={isPending}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              size="sm"
              onClick={() => void handleCreate()}
              disabled={!title.trim() || isPending}
            >
              {isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Create proposal
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
