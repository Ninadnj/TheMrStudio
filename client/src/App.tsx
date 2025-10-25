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

const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
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
      <TooltipProvider>
        <ScrollProgress />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
