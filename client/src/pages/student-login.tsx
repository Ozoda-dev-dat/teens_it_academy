import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, GraduationCap, Loader2, ArrowLeft } from "lucide-react";

export default function StudentLogin() {
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
    const email = (formData.get("email") as string).toUpperCase().trim();
    const password = formData.get("password") as string;

    try {
      await loginMutation.mutateAsync({ 
        email, 
        password 
      });
    } catch (error: any) {
      toast({
        title: "Kirish xatosi",
        description: error.message || "Login yoki parol noto'g'ri",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400 opacity-60 animate-pulse" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-blue-400 opacity-40 animate-bounce" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-blue-400 opacity-50 animate-pulse" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute top-32 right-32 text-6xl opacity-10 animate-float">🎓</div>
        <div className="absolute bottom-32 left-20 text-6xl opacity-10 animate-float animation-delay-1000">📱</div>
        <div className="absolute top-1/2 right-20 text-6xl opacity-10 animate-float animation-delay-2000">💻</div>
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
            <div className="mx-auto w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-600 rounded-l-lg"></div>
                  <div className="absolute -top-1 -right-1 w-0 h-0 border-l-4 border-l-yellow-500 border-b-4 border-b-transparent border-t-4 border-t-transparent"></div>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">O'quvchi</h1>
            <p className="text-gray-600 font-medium">Shaxsiy hisobingizga kirish</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-blue-100">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">O'quvchi kirishi</h2>
                  <p className="text-gray-500 text-sm">O'z hisobingizga kirib, yutuqlaringizni ko'ring</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Login</Label>
                    <div className="relative">
                      <Input
                        id="student-email"
                        name="email"
                        type="text"
                        placeholder="20685T"
                        className="pl-11"
                        required
                        data-testid="input-student-email"
                      />
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-password">Parol</Label>
                    <div className="relative">
                      <Input
                        id="student-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-11 pr-11"
                        required
                        data-testid="input-student-password"
                      />
                      <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        data-testid="button-toggle-student-password"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300"
                    disabled={loginMutation.isPending}
                    data-testid="button-student-login"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Kirish...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Tizimga kirish
                      </>
                    )}
                  </Button>
                </form>

                {/* Demo Message */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">O'quvchi hisobi:</h3>
                  <div className="space-y-1 text-sm text-blue-600">
                    <div>Administrator tomonidan sizga berilgan login va parolni kiriting</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-500 to-blue-700 items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-4 border-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 border-4 border-white rounded-full animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-16 w-16 h-16 border-4 border-white rounded-full animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 text-center text-white px-8">
          <div className="mb-8">
            <div className="text-8xl mb-6 animate-float">🎓</div>
            <h2 className="text-4xl font-bold mb-4">Sizning Yutuqlaringiz</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-md mx-auto">
              Medallaringizni ko'ring, mahsulotlar sotib oling va o'z rivojlanishingizni kuzating
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-semibold">Medallar</h3>
              <p className="text-sm text-blue-100">Oltin, kumush, bronza</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">🛍️</div>
              <h3 className="font-semibold">Do'kon</h3>
              <p className="text-sm text-blue-100">Sovg'alar va mahsulotlar</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-semibold">Rivojlanish</h3>
              <p className="text-sm text-blue-100">O'sish va yutuqlar</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold">Guruhlar</h3>
              <p className="text-sm text-blue-100">Sinflar va hamkurslar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
