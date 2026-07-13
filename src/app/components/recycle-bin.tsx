import { useRecycleBin } from "@/app/contexts/recycle-bin-context";
import { Trash2, RotateCcw, User } from "lucide-react";

export function RecycleBin() {
  const { items, restoreItem } = useRecycleBin();

  return (
    <div className="h-full overflow-y-auto p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Trash2 className="size-6" style={{ color: "var(--grey-400)" }} />
          <div>
            <h1 className="text-3xl" style={{ color: "var(--grey-900)" }}>Recycle Bin</h1>
            <p className="text-sm mt-1" style={{ color: "var(--grey-500)" }}>
              {items.length} deleted item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div
            className="rounded-lg border p-16 text-center"
            style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
          >
            <Trash2 className="size-12 mx-auto mb-4" style={{ color: "var(--grey-300)" }} />
            <p className="text-lg" style={{ color: "var(--grey-500)" }}>Recycle bin is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border p-4 flex items-center justify-between"
                style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="size-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: "var(--grey-400)" }}
                  >
                    {item.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: "var(--grey-900)" }}>{item.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--grey-500)" }}>
                      {item.data?.jobTitle} · {item.data?.siteLocation}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--grey-400)" }}>
                      Deleted {new Date(item.deletedAt).toLocaleDateString("en-ZA", {
                        year: "numeric", month: "long", day: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: "var(--grey-100)", color: "var(--grey-500)" }}
                  >
                    {item.type}
                  </span>
                  <button
                    onClick={() => restoreItem(item.id)}
                    className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                    style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}
                    title="Restore — note: this only removes from the bin. Re-adding to DB requires a separate restore endpoint."
                  >
                    <RotateCcw className="size-3.5" />
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}