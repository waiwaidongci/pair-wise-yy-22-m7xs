export interface AppRoute {
  name: string;
  route: string;
  match?: (path: string) => boolean;
}

export const routes: AppRoute[] = [
  { name: "修复工作台", route: "/dashboard" },
  { name: "文物档案", route: "/relics", match: (path) => path === "/relics" || path.startsWith("/relics/") },
  { name: "病害记录", route: "/damages" },
  { name: "修复方案", route: "/plans" },
  { name: "影像版本", route: "/images" }
];

export const relicDetailRoute = (id: number) => `/relics/${id}`;
