import { useMemo, useState } from "react";

/** 列表分页 hook，工作台/档案/影像列表共用 */
export function usePagination<T>(rows: T[] = [], pageSize = 8) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize]
  );
  return { page: safePage, setPage, pageSize, pageRows, total: rows.length, totalPages };
}
