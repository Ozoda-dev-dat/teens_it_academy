import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, GraduationCap, Users } from "lucide-react";

export default function AuthPage() {
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    const redirectPath = user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/student";
    return <Redirect to={redirectPath} />;
  }


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
            <div className="mx-auto w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 transform hover:scale-105 transition-transform duration-300 p-4">
              <img 
                src="/teens-it-logo.png" 
                alt="Teens IT School Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-teens-navy mb-2">Teens IT School</h1>
            <p className="text-gray-600 font-medium">CRM Tizimiga xush kelibsiz</p>
          </div>

          {/* Selection Cards */}
          <div className="space-y-4">
            <Card className="shadow-xl border-red-100 hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white">
                    <Shield className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Administrator</h2>
                    <p className="text-gray-600 mb-6">
                      Tizimni boshqarish, o'quvchilar va guruhlarni nazorat qilish
                    </p>
                  </div>

                  <Link href="/admin/login">
                    <Button 
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 text-lg py-6"
                      data-testid="button-admin-access"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      Administrator sifatida kirish
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-green-100 hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white">
                    <Users className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">O'qituvchi</h2>
                    <p className="text-gray-600 mb-6">
                      Sinf boshqaruvi, davomat va medal berish tizimi
                    </p>
                  </div>

                  <Link href="/teacher/login">
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 text-lg py-6"
                      data-testid="button-teacher-access"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      O'qituvchi sifatida kirish
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-blue-100 hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white">
                    <GraduationCap className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-blue-600 mb-2">O'quvchi</h2>
                    <p className="text-gray-600 mb-6">
                      Shaxsiy hisobingizga kirib, yutuqlar va medallaringizni ko'ring
                    </p>
                  </div>

                  <Link href="/student/login">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 text-lg py-6"
                      data-testid="button-student-access"
                    >
                      <GraduationCap className="w-5 h-5 mr-2" />
                      O'quvchi sifatida kirish
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
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
