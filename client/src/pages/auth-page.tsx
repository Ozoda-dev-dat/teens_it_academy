import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Shield, BookOpen, Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "student">("admin");

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
        username: email, 
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

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    try {
      await registerMutation.mutateAsync({
        email,
        password,
        firstName,
        lastName,
        role: selectedRole,
      });
      toast({
        title: "Muvaffaqiyat",
        description: "Hisob yaratildi va tizimga kirildi",
      });
    } catch (error: any) {
      toast({
        title: "Ro'yxatga olish xatosi",
        description: error.message || "Hisob yaratishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-teens-yellow opacity-60 animate-pulse" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-teens-yellow opacity-40 animate-bounce" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-teens-yellow opacity-50 animate-pulse" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute top-32 right-32 text-6xl opacity-10 animate-float">🤖</div>
        <div className="absolute bottom-32 left-20 text-6xl opacity-10 animate-float animation-delay-1000">🚀</div>
        <div className="absolute top-1/2 right-20 text-6xl opacity-10 animate-float animation-delay-2000">🪐</div>
      </div>

      {/* Left Side - Forms */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8">
          {/* Logo Section */}
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-8 h-8 bg-teens-navy rounded-l-lg"></div>
                  <div className="absolute -top-1 -right-1 w-0 h-0 border-l-4 border-l-teens-red border-b-4 border-b-transparent border-t-4 border-t-transparent"></div>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-teens-navy mb-2">Teens IT School</h1>
            <p className="text-gray-600 font-medium">CRM Tizimiga xush kelibsiz</p>
          </div>

          {/* Auth Tabs */}
          <Card className="shadow-xl border-blue-100">
            <CardContent className="p-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" data-testid="tab-login">Kirish</TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register">Ro'yxatga olish</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Tizimga kirish</h2>
                    <p className="text-gray-500 text-sm">Hisobingizga kirish uchun ma'lumotlarni kiriting</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email manzil</Label>
                      <div className="relative">
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          placeholder="example@email.com"
                          className="pl-11"
                          required
                          data-testid="input-login-email"
                        />
                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Parol</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-11 pr-11"
                          required
                          data-testid="input-login-password"
                        />
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teens-blue to-teens-navy hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition-all duration-300"
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
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
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Demo hisoblar:</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div><strong>Administrator:</strong> admin@mail.com / admin2233</div>
                      <div><strong>O'quvchi:</strong> Administrator tomonidan yaratiladi</div>
                    </div>
                  </div>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Yangi hisob</h2>
                    <p className="text-gray-500 text-sm">Administrator uchun yangi hisob yarating</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Role Selection */}
                    <div className="space-y-2">
                      <Label>Rol tanlang</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedRole("admin")}
                          className={`p-3 border-2 rounded-xl font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                            selectedRole === "admin"
                              ? "border-teens-blue bg-teens-blue text-white"
                              : "border-gray-300 text-gray-600 hover:border-teens-blue hover:text-teens-blue"
                          }`}
                          data-testid="button-role-admin"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Shield className="w-5 h-5" />
                            <span>Administrator</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRole("student")}
                          className={`p-3 border-2 rounded-xl font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                            selectedRole === "student"
                              ? "border-teens-green bg-teens-green text-white"
                              : "border-gray-300 text-gray-600 hover:border-teens-green hover:text-teens-green"
                          }`}
                          data-testid="button-role-student"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <BookOpen className="w-5 h-5" />
                            <span>O'quvchi</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Ism</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="Ism"
                          required
                          data-testid="input-first-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Familiya</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Familiya"
                          required
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email manzil</Label>
                      <div className="relative">
                        <Input
                          id="register-email"
                          name="email"
                          type="email"
                          placeholder="example@email.com"
                          className="pl-11"
                          required
                          data-testid="input-register-email"
                        />
                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Parol</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-11 pr-11"
                          required
                          data-testid="input-register-password"
                        />
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teens-green to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300"
                      disabled={registerMutation.isPending}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Yaratilmoqda...
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-5 h-5 mr-2" />
                          Hisob yaratish
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-teens-blue to-teens-navy items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-4 border-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 border-4 border-white rounded-full animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-16 w-16 h-16 border-4 border-white rounded-full animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 text-center text-white px-8">
          <div className="mb-8">
            <div className="text-8xl mb-6 animate-float">🚀</div>
            <h2 className="text-4xl font-bold mb-4">Kelajak Texnologiyalari</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-md mx-auto">
              Yoshlarni dasturlash, robotika va zamonaviy texnologiyalar bilan tanishtiramiz
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">💻</div>
              <h3 className="font-semibold">Dasturlash</h3>
              <p className="text-sm text-blue-100">Web va mobil dasturlar</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="font-semibold">Robotika</h3>
              <p className="text-sm text-blue-100">Arduino va IoT loyihalar</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">🎮</div>
              <h3 className="font-semibold">O'yin yaratish</h3>
              <p className="text-sm text-blue-100">Unity va 2D/3D o'yinlar</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-semibold">Dizayn</h3>
              <p className="text-sm text-blue-100">UI/UX va grafik dizayn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
