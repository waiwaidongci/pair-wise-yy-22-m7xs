interface ToastItem {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

let listeners: ((items: ToastItem[]) => void)[] = [];
let items: ToastItem[] = [];
let seq = 1;

const emit = () => listeners.forEach((listener) => listener([...items]));

const push = (type: ToastItem["type"], message: string) => {
  const id = seq++;
  items = [...items, { id, type, message }];
  emit();
  setTimeout(() => {
    items = items.filter((item) => item.id !== id);
    emit();
  }, 4200);
};

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
  info: (message: string) => push("info", message),
  subscribe: (listener: (items: ToastItem[]) => void) => {
    listeners.push(listener);
    listener([...items]);
    return () => {
      listeners = listeners.filter((item) => item !== listener);
    };
  }
};
