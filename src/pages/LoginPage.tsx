import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Shield, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type UserRole = "faculty" | "admin";

const DEMO_CREDENTIALS = {
  faculty: { email: "faculty@naac.edu", password: "faculty123" },
  admin: { email: "admin@naac.edu", password: "admin123" },
};

const LoginPage = () => {
  const [role, setRole] = useState<UserRole>("faculty");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo login logic
    setTimeout(() => {
      const creds = DEMO_CREDENTIALS[role];
      if (email === creds.email && password === creds.password) {
        localStorage.setItem("userRole", role);
        localStorage.setItem("userName", role === "faculty" ? "Dr. Priya Sharma" : "Admin");
        toast({ title: "Login successful", description: `Welcome to the ${role === "faculty" ? "Faculty Portal" : "Admin Command Center"}` });
        navigate(role === "faculty" ? "/dashboard" : "/admin");
      } else {
        toast({ title: "Invalid credentials", description: `Try: ${creds.email} / ${creds.password}`, variant: "destructive" });
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="text-sm font-display font-semibold text-primary">NAAC Criteria 6</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Faculty Activity Portal</h1>
          <p className="text-muted-foreground mt-2">Document, validate & track academic contributions</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-card rounded-xl p-1 mb-6 shadow-sm border">
          {(["faculty", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setEmail(""); setPassword(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-display font-semibold transition-all ${
                role === r
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r === "faculty" ? <GraduationCap className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              {r === "faculty" ? "Faculty Portal" : "Admin Center"}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, x: role === "faculty" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: role === "faculty" ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleLogin} className="bg-card rounded-xl p-6 shadow-sm border space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={DEMO_CREDENTIALS[role].email}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-body text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-display font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <span className="animate-pulse-soft">Signing in...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In as {role === "faculty" ? "Faculty" : "Administrator"}
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Demo: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{DEMO_CREDENTIALS[role].email}</code> / <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{DEMO_CREDENTIALS[role].password}</code>
                </p>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginPage;
