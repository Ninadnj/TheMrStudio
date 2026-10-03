import { lazy, Suspense, type ComponentType } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SmoothScroll from "@/components/SmoothScroll";

// Admin is split from the public bundle so clients never download it.
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
// Toasts only come from the booking sheet and admin, so their UI loads after first paint.
// If that download fails (flaky connection), go without toasts rather than crash the page.
const Toaster = lazy<ComponentType>(() =>
  import("@/components/ui/toaster")
    .then((m) => ({ default: m.Toaster }))
    .catch(() => ({ default: () => null }))
);

function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin">
          <Redirect to="/admin/login" />
        </Route>
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Reduced motion: framer keeps the fades and drops movement, matching the CSS rule */}
      <MotionConfig reducedMotion="user">
        <SmoothScroll>
          <Suspense fallback={null}>
            <Toaster />
          </Suspense>
          <Router />
        </SmoothScroll>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
