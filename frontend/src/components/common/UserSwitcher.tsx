import { useAuthStore } from "../../stores/AuthStore";
import { DEMO_USERS } from "../../constants/demoUsers";
import { UserRoleText } from "../../constants/UserRoleText";

export function UserSwitcher() {
  const user = useAuthStore((state) => state.user);
  const switchUser = useAuthStore((state) => state.switchUser);
  return (
    <label className="user-switcher">
      <span className="muted">当前身份</span>
      <select value={user.id} onChange={(event) => switchUser(Number(event.target.value))}>
        {DEMO_USERS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} · {UserRoleText[item.role]}
          </option>
        ))}
      </select>
    </label>
  );
}
