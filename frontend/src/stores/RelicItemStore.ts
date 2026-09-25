import { useShallow } from "zustand/react/shallow";
import { useArchiveStore } from "./ArchiveStore";

/** 实体 store 只读聚合档案库，写操作完成后由页面调用 loadAll 刷新全链路。 */
export const useRelicItemStore = () =>
  useArchiveStore(useShallow((state) => ({ rows: state.relics, loading: state.loading, load: state.loadAll })));
