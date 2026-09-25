import { useEffect, useState } from "react";

const getPath = () => {
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/dashboard";
};

export function useHashRoute(): [string, (path: string) => void] {
  const [path, setPath] = useState<string>(getPath());

  useEffect(() => {
    const onChange = () => setPath(getPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = (next: string) => {
    window.location.hash = next;
  };

  return [path, navigate];
}
