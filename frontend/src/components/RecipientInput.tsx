import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { FileUp, X } from "lucide-react";
import { isValidEmail, parseRecipientText, partitionEmails } from "../utils/email";

interface RecipientInputProps {
  recipients: string[];
  onChange: (recipients: string[]) => void;
  error?: string | null;
}

export function RecipientInput({
  recipients,
  onChange,
  error,
}: RecipientInputProps) {
  const [draft, setDraft] = useState("");
  const [fileMessage, setFileMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function addFromText(text: string) {
    const { valid, invalid } = partitionEmails([
      ...recipients,
      ...parseRecipientText(text),
    ]);
    onChange(valid);
    if (invalid.length > 0) {
      setFileMessage(`Skipped invalid addresses: ${invalid.slice(0, 5).join(", ")}`);
    } else {
      setFileMessage(null);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "," || event.key === " ") {
      event.preventDefault();
      if (draft.trim()) {
        addFromText(draft);
        setDraft("");
      }
    }
    if (event.key === "Backspace" && !draft && recipients.length > 0) {
      onChange(recipients.slice(0, -1));
    }
  }

  function remove(email: string) {
    onChange(recipients.filter((r) => r !== email));
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".txt")) {
      setFileMessage("Please upload a .csv or .txt file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = parseRecipientText(text);
      const { valid, invalid } = partitionEmails([...recipients, ...parsed]);
      onChange(valid);
      setFileMessage(
        `Imported ${valid.length} unique valid ${valid.length === 1 ? "email" : "emails"}${
          invalid.length ? `. Skipped ${invalid.length} invalid.` : "."
        }`,
      );
    };
    reader.readAsText(file);
  }

  const invalidDraft = draft.trim() && !isValidEmail(draft.trim());

  return (
    <div>
      <div
        className={`rounded-xl border bg-white px-3 py-2 shadow-sm ${
          error ? "border-rose-300" : "border-slate-200"
        }`}
      >
        <div className="flex flex-wrap gap-1.5">
          {recipients.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800"
            >
              {email}
              <button
                type="button"
                onClick={() => remove(email)}
                className="rounded-full p-0.5 hover:bg-brand-100"
                aria-label={`Remove ${email}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => {
              if (draft.trim() && isValidEmail(draft.trim())) {
                addFromText(draft);
                setDraft("");
              }
            }}
            placeholder={
              recipients.length === 0
                ? "Type an email and press Enter"
                : "Add another…"
            }
            className="min-w-[180px] flex-1 border-0 bg-transparent py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0"
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{recipients.length}</span>{" "}
          unique recipient{recipients.length === 1 ? "" : "s"}
          {invalidDraft ? (
            <span className="ml-2 text-rose-600">Not a valid email yet</span>
          ) : null}
        </p>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            className="hidden"
            onChange={onFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <FileUp className="h-4 w-4" />
            Upload CSV / TXT
          </button>
        </div>
      </div>
      {fileMessage ? (
        <p className="mt-2 text-xs text-slate-500">{fileMessage}</p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      <p className="mt-2 text-xs text-slate-400">
        Separate with comma, space, or newline. Duplicates are removed automatically.
      </p>
    </div>
  );
}
