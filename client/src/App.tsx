import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminLogin from "@/pages/admin-login";
import StudentLogin from "@/pages/student-login";
import TeacherLogin from "@/pages/teacher-login";
import AdminDashboard from "@/pages/admin-dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import TeacherAttendance from "@/pages/teacher-attendance";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={AdminDashboard} requiredRole="admin" />
      <ProtectedRoute path="/admin" component={AdminDashboard} requiredRole="admin" />
      <ProtectedRoute path="/student" component={StudentDashboard} requiredRole="student" />
      <ProtectedRoute path="/teacher" component={TeacherDashboard} requiredRole="teacher" />
      <ProtectedRoute path="/teacher/attendance/:groupId" component={TeacherAttendance} requiredRole="teacher" />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/student/login" component={StudentLogin} />
      <Route path="/teacher/login" component={TeacherLogin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
