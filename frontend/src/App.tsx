import { useState } from "react";
import { Select, ConfigProvider, App as AntApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import { routes } from "./router/routes";
import { useSessionStore } from "./stores/SessionStore";
import { DIRECTORY_USERS } from "./types/UserRole";
import { UserRoleText } from "./constants/UserRole";
import { DashboardPage } from "./pages/DashboardPage";
import { RelicsPage } from "./pages/RelicsPage";
import { RelicDetailPage } from "./pages/RelicDetailPage";
import { DamagesPage } from "./pages/DamagesPage";
import { PlansPage } from "./pages/PlansPage";
import { ImagesPage } from "./pages/ImagesPage";

type View = { name: (typeof routes)[number]["route"] } | { name: "relic-detail"; relicId: number };

export function App() {
  const [view, setView] = useState<View>({ name: "/dashboard" });
  const { user, switchUser } = useSessionStore();

  const openRelic = (relicId: number) => setView({ name: "relic-detail", relicId });
  const back = () => setView({ name: "/relics" });

  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: "#223126", colorWarning: "#d39b46", borderRadius: 6 } }}>
      <AntApp>
        <div className="shell">
          <aside>
            <div className="brand">
              文物修复档案协作平台
              <small>病害 → 方案 → 审批 → 步骤 → 影像 → 归档</small>
            </div>
            <nav>
              {routes.map((route) => (
                <button
                  key={route.route}
                  className={view.name === route.route ? "active" : ""}
                  onClick={() => setView({ name: route.route })}
                >
                  {route.name}
                </button>
              ))}
            </nav>
            <div className="session-box">
              <label>当前操作人（RBAC 角色切换）</label>
              <Select
                value={user.id}
                onChange={switchUser}
                options={DIRECTORY_USERS.map((item) => ({
                  value: item.id,
                  label: `${item.name} · ${UserRoleText[item.role]}`
                }))}
              />
            </div>
            <div className="side-foot">
              修复师登记病害/编制方案/执行步骤；专家审批；档案员归档；访客只读。
            </div>
          </aside>

          {view.name === "/dashboard" ? <DashboardPage onOpenRelic={openRelic} /> : null}
          {view.name === "/relics" ? <RelicsPage onOpenRelic={openRelic} /> : null}
          {view.name === "relic-detail" ? <RelicDetailPage relicId={view.relicId} onBack={back} /> : null}
          {view.name === "/damages" ? <DamagesPage onOpenRelic={openRelic} /> : null}
          {view.name === "/plans" ? <PlansPage onOpenRelic={openRelic} /> : null}
          {view.name === "/images" ? <ImagesPage onOpenRelic={openRelic} /> : null}
        </div>
      </AntApp>
    </ConfigProvider>
  );
}
