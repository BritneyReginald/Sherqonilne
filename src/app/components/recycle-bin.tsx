import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  RotateCcw,
  FileText,
  Users,
  Search,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { useRecycleBin } from "../contexts/recycle-bin-context";
import {
  ApiArchivedDocument,
  fetchArchivedDocuments,
  restoreDocument,
} from "../../api/documentLibrary";

type Filter = "all" | "documents" | "workforce";

interface BinRow {
  key: string;
  source: "document" | "local";
  id: string | number;
  name: string;
  kind: string;
  subtitle: string;
  deletedAt: string;
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

export function RecycleBin() {
  const { items: localItems, restoreItem } = useRecycleBin();

  const [archivedDocs, setArchivedDocs] = useState<ApiArchivedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [restoringKey, setRestoringKey] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setArchivedDocs(await fetchArchivedDocuments());
      } catch (e: any) {
        setError(e.message || "Failed to load archived documents");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows: BinRow[] = useMemo(() => {
    const docRows: BinRow[] = archivedDocs.map((d) => ({
      key: `doc-${d.id}`,
      source: "document",
      id: d.id,
      name: d.name,
      kind: "Document",
      subtitle: `${d.folder_path ?? "Unknown folder"} · Rev ${d.current_version}`,
      deletedAt: d.archived_at,
    }));

    const localRows: BinRow[] = localItems.map((i) => ({
      key: `local-${i.id}`,
      source: "local",
      id: i.id,
      name: i.name,
      kind: i.type,
      subtitle:
        [i.data?.jobTitle, i.data?.siteLocation].filter(Boolean).join(" · ") ||
        i.type,
      deletedAt: i.deletedAt,
    }));

    return [...docRows, ...localRows].sort(
      (a, b) =>
        new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime(),
    );
  }, [archivedDocs, localItems]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      documents: rows.filter((r) => r.source === "document").length,
      workforce: rows.filter((r) => r.source === "local").length,
    }),
    [rows],
  );

  const visible = rows.filter((r) => {
    if (filter === "documents" && r.source !== "document") return false;
    if (filter === "workforce" && r.source !== "local") return false;
    const q = search.trim().toLowerCase();
    return (
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q)
    );
  });

  const handleRestore = async (row: BinRow) => {
    setNotice("");
    setError("");

    if (row.source === "local") {
      restoreItem(String(row.id));
      setNotice(`“${row.name}” removed from the recycle bin.`);
      return;
    }

    setRestoringKey(row.key);
    try {
      await restoreDocument(Number(row.id));
      setArchivedDocs((prev) => prev.filter((d) => d.id !== row.id));
      setNotice(
        `“${row.name}” was restored to ${row.subtitle.split(" · ")[0]}.`,
      );
    } catch (e: any) {
      setError(e.message || "Failed to restore document");
    } finally {
      setRestoringKey(null);
    }
  };

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "documents", label: "Documents" },
    { id: "workforce", label: "Workforce" },
  ];

  return (
    <div
      className="h-full overflow-y-auto p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="size-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--brand-blue)10" }}
          >
            <Trash2 className="size-6" style={{ color: "var(--brand-blue)" }} />
          </div>
          <div>
            <h1 className="text-3xl" style={{ color: "var(--white)" }}>
              Recycle Bin
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--grey-500)" }}>
              For legal audit purposes, records are never permanently deleted.
              Restore anything you need.
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total items", value: counts.all, icon: Trash2 },
            { label: "Documents", value: counts.documents, icon: FileText },
            { label: "Workforce", value: counts.workforce, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-lg border p-4 flex items-center gap-4"
              style={{
                backgroundColor: "white",
                borderColor: "var(--grey-200)",
              }}
            >
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--grey-100)" }}
              >
                <Icon className="size-5" style={{ color: "var(--grey-600)" }} />
              </div>
              <div>
                <p
                  className="text-2xl font-medium"
                  style={{ color: "var(--grey-900)" }}
                >
                  {value}
                </p>
                <p className="text-xs" style={{ color: "var(--grey-500)" }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div
          className="rounded-lg border p-3 mb-4 flex items-center justify-between gap-3 flex-wrap"
          style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
        >
          <div className="flex items-center gap-1">
            {tabs.map((t) => {
              const active = filter === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: active
                      ? "var(--brand-blue)10"
                      : "transparent",
                    color: active ? "var(--brand-blue)" : "var(--grey-600)",
                  }}
                >
                  {t.label}
                  <span className="ml-1.5 text-xs opacity-70">
                    {counts[t.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search
              className="size-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--grey-400)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deleted items…"
              className="pl-9 pr-3 py-2 rounded-lg border outline-none text-sm w-64"
              style={{
                borderColor: "var(--grey-200)",
                color: "var(--grey-900)",
              }}
            />
          </div>
        </div>

        {/* Feedback */}
        {notice && (
          <div
            className="mb-4 px-4 py-3 rounded-lg border-l-4 flex items-center gap-2 text-sm"
            style={{
              backgroundColor: "var(--compliance-success)10",
              borderColor: "var(--compliance-success)",
              color: "var(--grey-900)",
            }}
          >
            <CheckCircle2
              className="size-4"
              style={{ color: "var(--compliance-success)" }}
            />
            {notice}
          </div>
        )}
        {error && (
          <p
            className="mb-4 text-sm"
            style={{ color: "var(--compliance-danger)" }}
          >
            {error}
          </p>
        )}

        {/* List */}
        {loading ? (
          <div
            className="rounded-lg border p-16 text-center"
            style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
          >
            <Loader2
              className="size-8 mx-auto animate-spin"
              style={{ color: "var(--grey-400)" }}
            />
          </div>
        ) : visible.length === 0 ? (
          <div
            className="rounded-lg border p-16 text-center"
            style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
          >
            <div
              className="size-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: "var(--grey-100)" }}
            >
              <Trash2 className="size-8" style={{ color: "var(--grey-400)" }} />
            </div>
            <p className="text-lg" style={{ color: "var(--grey-700)" }}>
              {rows.length === 0
                ? "Recycle bin is empty"
                : "No items match your filter"}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--grey-500)" }}>
              {rows.length === 0
                ? "Archived documents and deactivated records will show up here."
                : "Try a different tab or search term."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((row) => {
              const isDoc = row.source === "document";
              const restoring = restoringKey === row.key;

              return (
                <div
                  key={row.key}
                  className="rounded-lg border p-4 flex items-center justify-between gap-4 transition-shadow hover:shadow-sm"
                  style={{
                    backgroundColor: "white",
                    borderColor: "var(--grey-200)",
                  }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {isDoc ? (
                      <div
                        className="size-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "var(--brand-blue)10" }}
                      >
                        <FileText
                          className="size-5"
                          style={{ color: "var(--brand-blue)" }}
                        />
                      </div>
                    ) : (
                      <div
                        className="size-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                        style={{ backgroundColor: "var(--grey-400)" }}
                      >
                        {initials(row.name)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p
                        className="font-medium truncate"
                        style={{ color: "var(--grey-900)" }}
                      >
                        {row.name}
                      </p>
                      <p
                        className="text-xs mt-0.5 truncate"
                        style={{ color: "var(--grey-500)" }}
                      >
                        {row.subtitle}
                      </p>
                      <p
                        className="text-xs mt-0.5 flex items-center gap-1"
                        style={{ color: "var(--grey-400)" }}
                      >
                        <Clock className="size-3" />
                        Deleted {formatDateTime(row.deletedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                      style={{
                        backgroundColor: "var(--grey-100)",
                        color: "var(--grey-600)",
                      }}
                    >
                      {row.kind}
                    </span>
                    <button
                      onClick={() => handleRestore(row)}
                      disabled={restoring}
                      className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: "var(--brand-blue)" }}
                    >
                      {restoring ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RotateCcw className="size-4" />
                      )}
                      Restore
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
