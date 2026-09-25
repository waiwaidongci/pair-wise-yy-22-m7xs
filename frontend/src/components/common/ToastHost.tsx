import { useEffect, useState } from "react";
import { toast } from "../../utils/toast";

interface ToastView {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

export function ToastHost() {
  const [rows, setRows] = useState<ToastView[]>([]);
  useEffect(() => toast.subscribe(setRows), []);
  return (
    <div className="toast-host">
      {rows.map((row) => (
        <div key={row.id} className={`toast ${row.type}`}>
          {row.message}
        </div>
      ))}
    </div>
  );
}
