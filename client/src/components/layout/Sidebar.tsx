import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  BarChart, 
  DollarSign, 
  FileText, 
  Settings, 
  Menu
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Query user data
  const { data: user } = useQuery({
    queryKey: ["/api/session"],
  });

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile menu button - shows outside the sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="p-2 rounded-md text-gray-500 bg-white shadow-sm"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:relative z-40 md:flex md:flex-col md:flex-shrink-0 transition-transform duration-200 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col w-64 h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-primary dark:text-blue-400">AI CFO Platform</h2>
          </div>
          
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
              {/* Navigation Items */}
              <NavItem href="/" icon={<Home />} active={location === "/"}>
                Dashboard
              </NavItem>
              
              <NavItem href="/reports" icon={<BarChart />} active={location === "/reports"}>
                Financial Reports
              </NavItem>
              
              <NavItem href="/cash-flow" icon={<DollarSign />} active={location === "/cash-flow"}>
                Cash Flow
              </NavItem>
              
              <NavItem href="/invoices" icon={<FileText />} active={location === "/invoices"}>
                Invoices
              </NavItem>
              
              <NavItem href="/settings" icon={<Settings />} active={location === "/settings"}>
                Settings
              </NavItem>
            </nav>
          </div>
          
          {user && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img 
                    className="w-10 h-10 rounded-full" 
                    src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                    alt="User avatar"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
};

function NavItem({ href, icon, active, children }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-md group",
          active
            ? "text-white bg-primary"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        )}
      >
        <span className={cn("w-5 h-5 mr-3", active ? "text-white" : "text-gray-500 dark:text-gray-400")}>
          {icon}
        </span>
        {children}
      </a>
    </Link>
  );
}
