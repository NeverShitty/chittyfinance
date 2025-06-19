import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import ConnectAccounts from "@/pages/ConnectAccounts";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { UserProvider } from "@/contexts/UserContext";

function Router() {
  const [location] = useLocation();
  const showSidebar = location !== "/login" && location !== "/register" && location !== "/connect-accounts";

  return (
    <div className="flex h-screen overflow-hidden">
      {showSidebar && <Sidebar />}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {showSidebar && <Header />}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/settings" component={Settings} />
            <Route path="/login" component={Login} />
            <Route path="/connect-accounts" component={ConnectAccounts} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;