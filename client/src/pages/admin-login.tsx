import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Shield, Loader2, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  if (user) {
    const redirectPath = user.role === "admin" ? "/admin" : "/student";
    return <Redirect to={redirectPath} />;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await loginMutation.mutateAsync({ 
        email, 
        password 
      });
    } catch (error: any) {
      toast({
        title: "Kirish xatosi",
        description: error.message || "Email yoki parol noto'g'ri",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-red-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-red-400 opacity-60 animate-pulse" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-red-400 opacity-40 animate-bounce" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-red-400 opacity-50 animate-pulse" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute top-32 right-32 text-6xl opacity-10 animate-float">⚙️</div>
        <div className="absolute bottom-32 left-20 text-6xl opacity-10 animate-float animation-delay-1000">📊</div>
        <div className="absolute top-1/2 right-20 text-6xl opacity-10 animate-float animation-delay-2000">👨‍💼</div>
      </div>

      {/* Left Side - Forms */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8">
          {/* Back Link */}
          <div className="text-center">
            <Link href="/auth">
              <Button variant="ghost" className="mb-4" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Orqaga
              </Button>
            </Link>
          </div>

          {/* Logo Section */}
          <div className="text-center">
            <div className="mx-auto w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 transform hover:scale-105 transition-transform duration-300 p-4">
              <img 
                src="/teens-it-logo.png" 
                alt="Teens IT School Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-2">Administrator</h1>
            <p className="text-gray-600 font-medium">Boshqaruv paneliga kirish</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-red-100">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Administrator kirishi</h2>
                  <p className="text-gray-500 text-sm">Tizimni boshqarish uchun admin hisobingizga kiring</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email manzil</Label>
                    <div className="relative">
                      <Input
                        id="admin-email"
                        name="email"
                        type="email"
                        placeholder="admin@mail.com"
                        className="pl-11"
                        required
                        data-testid="input-admin-email"
                      />
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Parol</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-11 pr-11"
                        required
                        data-testid="input-admin-password"
                      />
                      <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        data-testid="button-toggle-admin-password"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300"
                    disabled={loginMutation.isPending}
                    data-testid="button-admin-login"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Kirish...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Tizimga kirish
                      </>
                    )}
                  </Button>
                </form>

                {/* Demo Credentials */}
{/*                 <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
                  <h3 className="text-sm font-medium text-red-700 mb-2">Demo hisob:</h3>
                  <div className="space-y-1 text-sm text-red-600">
                    <div><strong>Email:</strong> admin@mail.com</div>
                    <div><strong>Parol:</strong> admin2233</div>
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-red-500 to-red-700 items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-4 border-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 border-4 border-white rounded-full animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-16 w-16 h-16 border-4 border-white rounded-full animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 text-center text-white px-8">
          <div className="mb-8">
            <div className="text-8xl mb-6 animate-float">⚙️</div>
            <h2 className="text-4xl font-bold mb-4">Tizim Boshqaruvi</h2>
            <p className="text-xl text-red-100 mb-8 max-w-md mx-auto">
              O'quvchilar, guruhlar, to'lovlar va boshqa barcha ma'lumotlarni boshqaring
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold">O'quvchilar</h3>
              <p className="text-sm text-red-100">Talabalar boshqaruvi</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-semibold">Guruhlar</h3>
              <p className="text-sm text-red-100">Sinflar va darslar</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold">To'lovlar</h3>
              <p className="text-sm text-red-100">Moliyaviy boshqaruv</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-semibold">Yutuqlar</h3>
              <p className="text-sm text-red-100">Medallar va mukofotlar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
