import { Toaster } from "sonner";

export function ToastNotification() {
  return (
    <Toaster
      position="bottom-right"
      duration={4000}
      toastOptions={{
        style: {
          border: "2px solid var(--ink)",
          boxShadow: "4px 4px 0 var(--ink)",
          borderRadius: "10px",
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "14px",
          color: "var(--ink)",
        },
        classNames: {
          toast: "!bg-[var(--card)]",
          success: "!bg-[var(--mint)]",
          error: "!bg-[var(--coral)]",
          warning: "!bg-[var(--yellow)]",
          info: "!bg-[var(--sky)]",
          icon: "!text-current",
        },
      }}
    />
  );
}
