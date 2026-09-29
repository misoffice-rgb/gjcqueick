import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Briefcase,
  BellRing,
  Users,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const adminNavItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Services", path: "/admin/services", icon: Briefcase },
  { label: "User Management", path: "/admin/staff", icon: Users },
  { label: "Settings", path: "/admin/settings", icon: BellRing },
];

interface LinkedNavProps {
  item: NavItem;
  collapsed?: boolean;
  onClick?: () => void;
}

const LinkedNav = ({ item, collapsed = false, onClick }: LinkedNavProps) => {
  const location = useLocation();
  const isActive =
    location.pathname === item.path ||
    (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
  const Icon = item.icon;

  return (
    <NavLink to={item.path} onClick={onClick} className="block">
      <div
        className={`group flex items-center rounded-2xl px-3 py-3 text-[13px] font-medium transition-all duration-200 ${
          collapsed ? "justify-center" : "gap-3"
        } ${
          isActive
            ? "bg-[linear-gradient(90deg,rgba(44,153,15,0.14)_0%,rgba(255,248,220,0.9)_100%)] text-brand-green shadow-sm"
            : "text-muted-foreground hover:bg-[linear-gradient(90deg,rgba(44,153,15,0.06)_0%,rgba(255,255,255,1)_60%,rgba(220,188,52,0.08)_100%)] hover:text-foreground"
        }`}
        title={collapsed ? item.label : undefined}
      >
        <Icon
          className={`shrink-0 ${
            isActive ? "text-[#2c990f]" : "text-foreground/70"
          } h-4.5 w-4.5`}
        />

        {!collapsed && (
          <>
            <span className="truncate">{item.label}</span>
            {isActive && (
              <div className="ml-auto h-2 w-2 rounded-full bg-[#dcbc34]" />
            )}
          </>
        )}
      </div>
    </NavLink>
  );
};

const AppSidebar = () => {
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.is_superuser ? "Admin" : "Staff";
  const navItems = adminNavItems;
  const initials = user?.username?.slice(0, 1)?.toUpperCase() || "U";

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile open button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#2c990f]/15 bg-white/90 text-brand-green shadow-[0_8px_20px_rgba(0,0,0,0.08)] backdrop-blur md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#2c990f]/10 bg-[linear-gradient(180deg,#fcfff8_0%,#ffffff_18%,#fffdf4_100%)] shadow-[0_18px_50px_rgba(0,0,0,0.06)] transition-all duration-300 ease-in-out md:relative md:z-auto md:translate-x-0 ${
          collapsed ? "w-22" : "w-70"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Top glow accents */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(44,153,15,0.14),transparent_55%)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 bg-[radial-gradient(circle,rgba(220,188,52,0.10),transparent_65%)]" />

        {/* Brand */}
        <div
          className={`relative flex h-18 items-center border-b border-[#2c990f]/8 px-4 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
            {!collapsed && (
              <div>
                <a
                  href="/"
                  className="text-2xl font-bold tracking-tight text-brand-green"
                >
                  Queuick
                </a>
                <p className="text-sm text-muted-foreground">Admin Panel</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCollapsed(true)}
                className="hidden h-9 w-9 items-center justify-center rounded-xl text-foreground/70 transition-colors hover:bg-[#f3faea] hover:text-brand-green md:flex"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={closeMobile}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground/70 transition-colors hover:bg-muted hover:text-foreground md:hidden"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="absolute -right-3 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#2c990f]/15 bg-white text-brand-green shadow-sm transition-colors hover:bg-[#f6fff0] md:flex"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/55">
              Menu
            </p>
          )}

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <LinkedNav
                key={item.path}
                item={item}
                collapsed={collapsed}
                onClick={closeMobile}
              />
            ))}
          </nav>
        </div>

        {/* User card */}
        <div className="px-3 pb-3">
          <div
            className={`rounded-3xl border border-[#2c990f]/10 bg-[linear-gradient(135deg,rgba(44,153,15,0.06)_0%,rgba(255,255,255,1)_58%,rgba(220,188,52,0.08)_100%)] p-3 ${
              collapsed ? "flex justify-center" : ""
            }`}
          >
            {collapsed ? (
              <div
                className="flex size-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2c990f_0%,#dcbc34_100%)] text-sm font-bold text-white shadow-sm"
                title={user?.username || "User"}
              >
                {initials}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2c990f_0%,#dcbc34_100%)] text-sm font-bold text-white shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user?.username}
                  </p>
                  <p className="text-[11px] font-medium text-brand-green/75">
                    {role}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-[#2c990f]/8 px-3 py-3">
          <button
            onClick={logout}
            className={`flex w-full items-center rounded-2xl px-3 py-3 text-[13px] font-medium transition-all duration-200 ${
              collapsed ? "justify-center" : "gap-3"
            } text-foreground/75 hover:bg-red-500/10 hover:text-red-600`}
            title={collapsed ? "Log Out" : undefined}
          >
            <LogOut className="h-4.5 w-4.5" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
