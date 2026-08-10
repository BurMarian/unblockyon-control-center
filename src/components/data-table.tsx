import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DataToolbar({
  placeholder = "Search…",
  children,
  right,
}: {
  placeholder?: string;
  children?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
      <div className="relative w-full lg:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input className="h-9 pl-8" placeholder={placeholder} aria-label={placeholder} />
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      {right && <div className="flex flex-wrap items-center gap-2 lg:ml-auto">{right}</div>}
    </div>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="w-full overflow-x-auto">{children}</div>;
}

export function Th({
  children,
  className,
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-2.5 text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-sm whitespace-nowrap",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function DataTable({ children }: { children: ReactNode }) {
  return (
    <TableWrap>
      <table className="w-full border-collapse text-left">{children}</table>
    </TableWrap>
  );
}

export function TableFooterBar({
  showing,
  total,
}: {
  showing: number;
  total: number;
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row">
      <p>
        Showing <span className="num font-medium text-foreground">{showing}</span> of{" "}
        <span className="num font-medium text-foreground">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="rounded-md border border-border px-2.5 py-1 text-xs disabled:opacity-50"
          disabled
        >
          Previous
        </button>
        {["1", "2", "3"].map((p) => (
          <button
            key={p}
            type="button"
            aria-current={p === "1" ? "page" : undefined}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs",
              p === "1"
                ? "border-border-strong bg-secondary text-secondary-foreground"
                : "border-border hover:bg-accent",
            )}
          >
            {p}
          </button>
        ))}
        <button type="button" className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-accent">
          Next
        </button>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = true,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
