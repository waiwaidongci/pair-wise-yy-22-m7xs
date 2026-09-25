import { useShallow } from "zustand/react/shallow";
import { useArchiveStore } from "./ArchiveStore";

export const useImageVersionStore = () =>
  useArchiveStore(useShallow((state) => ({ rows: state.images, loading: state.loading, load: state.loadAll })));
