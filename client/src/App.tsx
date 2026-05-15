import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function AnimatedRoute({ component: Component, ...props }: any) {
  return (
    <Route {...props}>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <Component />
      </motion.div>
    </Route>
  );
}

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <AnimatedRoute path="/" component={Home} />
        <Route path="/admin">
          <Redirect to="/admin/login" />
        </Route>
        <AnimatedRoute path="/admin/login" component={AdminLogin} />
        <AnimatedRoute path="/admin/dashboard" component={AdminDashboard} />
        <AnimatedRoute component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScroll>
        <Preloader />
        <TooltipProvider>
          <ScrollProgress />
          <Toaster />
          <Router />
        </TooltipProvider>
      </SmoothScroll>
    </QueryClientProvider>
  );
}

export default App;
