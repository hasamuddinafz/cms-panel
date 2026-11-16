import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Zap, Moon, Sun } from "lucide-react";

import { useLoginMutation } from "../features/auth/authApi";
import { setCredentials } from "../features/auth/authSlice";
import { toggleTheme, selectTheme } from "../features/theme/themeSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { PasswordInput } from "../components/ui/password-input";
import { Label } from "../components/ui/label";

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export default function LoginPage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname ?? "/";
  const mode      = useAppSelector(selectTheme);

  const [login, { isLoading }] = useLoginMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data) {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials(result));
      navigate(from, { replace: true });
    } catch {
      toast.error("Login failed. Invalid email or password.");
    }
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Sign In | NEXUS CMS</title>
      </Helmet>

      {/* Background */}
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Subtle gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Theme toggle — top right */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors border border-border"
        >
          {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Card */}
        <div className="relative w-full max-w-sm mx-4">
          <div className="bg-card rounded-2xl border shadow-xl p-8 space-y-6">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <Zap size={24} className="text-primary-foreground" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold tracking-tight">NEXUS CMS</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Sign in to the admin panel</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className="h-10"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  className="h-10"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full h-10 font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : "Sign In"}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} Hasamuddin Afzali — All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
