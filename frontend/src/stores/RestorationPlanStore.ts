import { useShallow } from "zustand/react/shallow";
import { useArchiveStore } from "./ArchiveStore";

export const useRestorationPlanStore = () =>
  useArchiveStore(useShallow((state) => ({ rows: state.plans, loading: state.loading, load: state.loadAll })));
