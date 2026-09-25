import { useShallow } from "zustand/react/shallow";
import { useArchiveStore } from "./ArchiveStore";

export const useDamageRecordStore = () =>
  useArchiveStore(useShallow((state) => ({ rows: state.damages, loading: state.loading, load: state.loadAll })));
