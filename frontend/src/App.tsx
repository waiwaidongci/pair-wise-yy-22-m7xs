import { routes } from "./router/routes";
import { useHashRoute } from "./router/useHashRoute";
import { UserSwitcher } from "./components/common/UserSwitcher";
import { ToastHost } from "./components/common/ToastHost";
import { AuditLogPanel } from "./components/common/AuditLogPanel";
import { DashboardPage } from "./pages/DashboardPage";
import { RelicsPage } from "./pages/RelicsPage";
import { RelicDetailPage } from "./pages/RelicDetailPage";
import { DamagesPage } from "./pages/DamagesPage";
import { PlansPage } from "./pages/PlansPage";
import { ImagesPage } from "./pages/ImagesPage";

function App() {
  const [path, navigate] = useHashRoute();

  const activeRoute =
    routes.find((route) => (route.match ? route.match(path) : route.route === path)) ?? routes[0];

  const relicMatch = path.match(/^\/relics\/(\d+)$/);

  return (
    <div className="shell">
      <aside>
        <div className="brand">文物修复档案<br />协作平台</div>
        <nav>
          {routes.map((route) => (
            <button
              key={route.route}
              className={activeRoute.route === route.route ? "active" : ""}
              onClick={() => navigate(route.route)}
            >
              {route.name}
            </button>
          ))}
        </nav>
        <div className="aside-foot">
          <UserSwitcher />
        </div>
      </aside>
      <div className="content">
        {path === "/dashboard" && <DashboardPage navigate={navigate} />}
        {path === "/relics" && <RelicsPage navigate={navigate} />}
        {relicMatch && <RelicDetailPage relicId={Number(relicMatch[1])} onBack={() => navigate("/relics")} />}
        {path === "/damages" && <DamagesPage navigate={navigate} />}
        {path === "/plans" && <PlansPage navigate={navigate} />}
        {path === "/images" && <ImagesPage navigate={navigate} />}
        {!["/dashboard", "/relics", "/damages", "/plans", "/images"].includes(path) && !relicMatch && (
          <DashboardPage navigate={navigate} />
        )}
        {path === "/dashboard" && (
          <div className="page dashboard-audit">
            <AuditLogPanel limit={8} />
          </div>
        )}
      </div>
      <ToastHost />
    </div>
  );
}

export default App;
