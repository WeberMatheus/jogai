import { STATUS_LABEL } from "@/lib/booking";

const STYLE: Record<string, string> = {
  pendente: "bg-warning/20 text-foreground",
  confirmada: "bg-success/15 text-success",
  recusada: "bg-destructive/15 text-destructive",
  cancelada: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STYLE[status] ?? ""}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
