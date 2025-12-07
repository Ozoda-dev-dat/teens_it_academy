import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Users, Loader2, ArrowLeft } from "lucide-react";

export default function TeacherLogin() {
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  if (user) {
    const redirectPath = user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/student";
    return <Redirect to={redirectPath} />;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).toLowerCase().trim();
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
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-green-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-green-400 opacity-60 animate-pulse" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-green-400 opacity-40 animate-bounce" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-green-400 opacity-50 animate-pulse" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute top-32 right-32 text-6xl opacity-10 animate-float">👩‍🏫</div>
        <div className="absolute bottom-32 left-20 text-6xl opacity-10 animate-float animation-delay-1000">📚</div>
        <div className="absolute top-1/2 right-20 text-6xl opacity-10 animate-float animation-delay-2000">✏️</div>
      </div>

      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8">
          {/* Logo Section */}
          <div className="text-center">
            <div className="mx-auto w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 transform hover:scale-105 transition-transform duration-300 p-4">
              <img 
                src="/teens-it-logo.png" 
                alt="Teens IT School Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              O'qituvchi paneli
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sinf boshqaruvi va davomat tizimiga kirish
            </p>
          </div>

          {/* Login Form */}
          <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="teacher@teensit.uz"
                      className="block w-full pl-10 bg-white/70 border-gray-200 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Parol
                  </Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-10 bg-white/70 border-gray-200 focus:ring-green-500 focus:border-green-500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Tekshirilmoqda...
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-3" />
                        Kirish
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <Link href="/auth">
                  <Button
                    variant="ghost"
                    className="group text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors duration-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Orqaga
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Info Panel */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
          <div className="max-w-md text-center text-white p-8">
            <div className="text-6xl mb-6">👩‍🏫</div>
            <h3 className="text-2xl font-bold mb-4">O'qituvchi Portal</h3>
            <p className="text-green-100 mb-8">
              O'quvchilar davomati, medal berish va sinf faoliyatini boshqaring
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold">Davomat</h3>
                <p className="text-sm text-green-100">O'quvchilar davomatini belgilang</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-semibold">Medalllar</h3>
                <p className="text-sm text-green-100">Yutuqlar uchun medal bering</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-semibold">O'quvchilar</h3>
                <p className="text-sm text-green-100">Sinf a'zolarini boshqaring</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-semibold">Hisobotlar</h3>
                <p className="text-sm text-green-100">Taraqqiyot statistikasini ko'ring</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}