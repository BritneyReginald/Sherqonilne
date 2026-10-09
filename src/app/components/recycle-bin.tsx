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
  Heart,
  ShieldCheck,
} from "lucide-react";

import { useRecycleBin } from "../contexts/recycle-bin-context";
import {
  ApiArchivedDocument,
  fetchArchivedDocuments,
  restoreDocument,
} from "../../api/documentLibrary";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const RETENTION_DAYS = 30;

type Filter = "all" | "documents" | "medicals" | "ppe" | "workforce";
type Source = "document" | "local" | "medical" | "ppe";

interface BinRow {
  key: string;
  source: Source;
  id: string | number;
  name: string;
  kind: string;
  subtitle: string;
  deletedAt: string;
  /** Days left before permanent deletion (medical + PPE only). */
  daysLeft?: number;
}

const EXAM_TYPE_LABELS: Record<string, string> = {
  "pre-placement": "Pre-Placement",
  periodic: "Periodic (Annual)",
  exit: "Exit",
  "return-to-work": "Return to Work",
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

const daysLeftFrom = (deletedAt: string) => {
  const elapsed = (Date.now() - new Date(deletedAt).getTime()) / 86_400_000;
  return Math.max(0, Math.ceil(RETENTION_DAYS - elapsed));
};

function authHeaders(): Record<string, string> {
  try {
    const stored = localStorage.getItem("sherq_auth");
    const token = stored ? JSON.parse(stored).token : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export function RecycleBin() {
  const { items: localItems, restoreItem } = useRecycleBin();

  const [archivedDocs, setArchivedDocs] = useState<ApiArchivedDocument[]>([]);
  const [archivedMedicals, setArchivedMedicals] = useState<any[]>([]);
  const [archivedPPE, setArchivedPPE] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [restoringKey, setRestoringKey] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const [docs, medicals, ppe] = await Promise.allSettled([
        fetchArchivedDocuments(),
        fetch(`${API_URL}/medicals/archived`, { headers: authHeaders() }).then(
          (r) => {
            if (!r.ok)
              throw new Error("Failed to load deleted medical records");
            return r.json();
          },
        ),
        fetch(`${API_URL}/ppe/transactions/archived`, {
          headers: authHeaders(),
        }).then((r) => {
          if (!r.ok) throw new Error("Failed to load deleted PPE records");
          return r.json();
        }),
      ]);

      const problems: string[] = [];

      if (docs.status === "fulfilled") setArchivedDocs(docs.value);
      else
        problems.push(
          docs.reason?.message || "Failed to load archived documents",
        );

      if (medicals.status === "fulfilled") setArchivedMedicals(medicals.value);
      else
        problems.push(
          medicals.reason?.message || "Failed to load deleted medical records",
        );

      if (ppe.status === "fulfilled") setArchivedPPE(ppe.value);
      else
        problems.push(
          ppe.reason?.message || "Failed to load deleted PPE records",
        );

      if (problems.length) setError(problems.join(" · "));
      setLoading(false);
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

    const medicalRows: BinRow[] = archivedMedicals.map((m) => ({
      key: `medical-${m.id}`,
      source: "medical",
      id: m.id,
      name: m.employee_name,
      kind: "Medical",
      subtitle: `${EXAM_TYPE_LABELS[m.exam_type] ?? m.exam_type} exam · ${formatDate(m.exam_date)}`,
      deletedAt: m.deleted_at,
    }));

    const ppeRows: BinRow[] = archivedPPE.map((p) => ({
      key: `ppe-${p.id}`,
      source: "ppe",
      id: p.id,
      name: p.employee_name,
      kind: "PPE",
      subtitle: `${p.ppe_item_name} · issued ${formatDate(p.issue_date)}`,
      deletedAt: p.deleted_at,
      daysLeft: daysLeftFrom(p.deleted_at),
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

    return [...docRows, ...medicalRows, ...ppeRows, ...localRows].sort(
      (a, b) =>
        new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime(),
    );
  }, [archivedDocs, archivedMedicals, archivedPPE, localItems]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      documents: rows.filter((r) => r.source === "document").length,
      medicals: rows.filter((r) => r.source === "medical").length,
      ppe: rows.filter((r) => r.source === "ppe").length,
      workforce: rows.filter((r) => r.source === "local").length,
    }),
    [rows],
  );

  const filterToSource: Record<Exclude<Filter, "all">, Source> = {
    documents: "document",
    medicals: "medical",
    ppe: "ppe",
    workforce: "local",
  };

  const visible = rows.filter((r) => {
    if (filter !== "all" && r.source !== filterToSource[filter]) return false;
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
      if (row.source === "document") {
        await restoreDocument(Number(row.id));
        setArchivedDocs((prev) => prev.filter((d) => d.id !== row.id));
        setNotice(
          `“${row.name}” was restored to ${row.subtitle.split(" · ")[0]}.`,
        );
      } else if (row.source === "medical") {
        const res = await fetch(`${API_URL}/medicals/${row.id}/restore`, {
          method: "POST",
          headers: authHeaders(),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to restore medical record");
        }
        setArchivedMedicals((prev) => prev.filter((m) => m.id !== row.id));
        setNotice(`Medical record for “${row.name}” was restored.`);
      } else if (row.source === "ppe") {
        const res = await fetch(
          `${API_URL}/ppe/transactions/${row.id}/restore`,
          { method: "POST", headers: authHeaders() },
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to restore PPE record");
        }
        setArchivedPPE((prev) => prev.filter((p) => p.id !== row.id));
        setNotice(`PPE record for “${row.name}” was restored.`);
      }
    } catch (e: any) {
      setError(e.message || "Failed to restore item");
    } finally {
      setRestoringKey(null);
    }
  };

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "documents", label: "Documents" },
    { id: "medicals", label: "Medicals" },
    { id: "ppe", label: "PPE" },
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
              Deleted PPE records are permanently removed after {RETENTION_DAYS}{" "}
              days. Medical records and documents are kept indefinitely. Restore
              anything you need.
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total items", value: counts.all, icon: Trash2 },
            { label: "Documents", value: counts.documents, icon: FileText },
            { label: "Medicals", value: counts.medicals, icon: Heart },
            { label: "PPE", value: counts.ppe, icon: ShieldCheck },
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
          <div className="flex items-center gap-1 flex-wrap">
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
                ? "Deleted documents, medical records, PPE records and deactivated employees will show up here."
                : "Try a different tab or search term."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((row) => {
              const restoring = restoringKey === row.key;
              const expiringSoon =
                row.daysLeft !== undefined && row.daysLeft <= 7;

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
                    {row.source === "document" ? (
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
                        {row.daysLeft !== undefined && (
                          <span
                            className="ml-2 font-medium"
                            style={{
                              color: expiringSoon
                                ? "var(--compliance-danger)"
                                : "var(--grey-500)",
                            }}
                          >
                            · Permanently deleted in {row.daysLeft}{" "}
                            {row.daysLeft === 1 ? "day" : "days"}
                          </span>
                        )}
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
