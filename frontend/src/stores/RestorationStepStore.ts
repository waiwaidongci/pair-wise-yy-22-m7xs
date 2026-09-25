import { useShallow } from "zustand/react/shallow";
import { useArchiveStore } from "./ArchiveStore";

export const useRestorationStepStore = () =>
  useArchiveStore(useShallow((state) => ({ rows: state.steps, loading: state.loading, load: state.loadAll })));
