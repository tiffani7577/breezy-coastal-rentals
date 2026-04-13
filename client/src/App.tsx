import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppWithSplash from "./components/AppWithSplash";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import BookingStatus from "./pages/BookingStatus";
import Admin from "./pages/Admin";
import { TermsPage, PrivacyPage } from "./pages/Legal";
import Availability from "./pages/Availability";
import About from "./pages/About";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/booking" component={Booking} />
      <Route path="/booking/confirmation" component={BookingConfirmation} />
      <Route path="/booking/status" component={BookingStatus} />
      <Route path="/admin" component={Admin} />
      <Route path="/availability" component={Availability} />
      <Route path="/about" component={About} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppWithSplash>
            <Toaster richColors position="top-center" />
            <Router />
          </AppWithSplash>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
