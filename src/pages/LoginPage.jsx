import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

import { useLoginMutation } from "../features/auth/authApi";
import { setCredentials } from "../features/auth/authSlice";
import { useAppDispatch } from "../app/hooks";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

const schema = z.object({
  email:    z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export default function LoginPage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname ?? "/";

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
      toast.error("Giriş başarısız. E-posta veya şifre hatalı.");
    }
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Giriş | NEXUS CMS</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center text-xl">NEXUS CMS</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Giriş yapılıyor…" : "Giriş Yap"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
