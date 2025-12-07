import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Edit, Star, ShoppingBag, Loader2 } from "lucide-react";
import type { Product, Purchase } from "@shared/schema";
import AvatarBuilder from "@/components/ui/avata-builder.tsx";
import AvatarRenderer from "@/components/ui/avatar-renderer.tsx";

export default function StudentDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isAvatarBuilderOpen, setIsAvatarBuilderOpen] = useState(false);

  // Queries
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!user,
  });

  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/students", user?.id, "purchases"],
    enabled: !!user,
  });

  // Mutations
  const purchaseMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest("POST", "/api/purchases", { productId });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", user?.id, "purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "So'rov yuborildi! ⏳",
        description: data.message || "Xarid so'rovingiz administratorga yuborildi. Tasdiqlashni kuting.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error.message || "Xarid qilishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });
  
  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarData: { profilePic?: string; avatarConfig?: any }) => {
      const res = await apiRequest("PUT", `/api/students/${user?.id}`, avatarData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsAvatarBuilderOpen(false);
      toast({
        title: "🎨 Avatar yangilandi!",
        description: "Yangi avataringiz juda chiroyli ko'rinmoqda!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error.message || "Avatarni yangilashda xatolik",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handlePurchase = (productId: string) => {
    purchaseMutation.mutate(productId);
  };
  
  const handleAvatarSave = (avatarConfig: any) => {
    if (avatarConfig.style && avatarConfig.style.startsWith('/')) {
      // Pre-built avatar
      updateAvatarMutation.mutate({ 
        profilePic: avatarConfig.style,
        avatarConfig: avatarConfig 
      });
    } else {
      // Custom avatar configuration
      updateAvatarMutation.mutate({ 
        profilePic: `custom:${JSON.stringify(avatarConfig)}`,
        avatarConfig: avatarConfig 
      });
    }
  };

  const userMedals = user?.medals as { gold: number; silver: number; bronze: number } || { gold: 0, silver: 0, bronze: 0 };
  const totalMedals = userMedals.gold + userMedals.silver + userMedals.bronze;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 mr-3">
                  <img 
                    src="/teens-it-logo.png" 
                    alt="Teens IT School Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-teens-navy">Teens IT School</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-teens-green to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
                data-testid="button-logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Promotional Banner */}
        <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-1 shadow-2xl animate-pulse">
          <div className="relative overflow-hidden rounded-3xl bg-white p-6">
            <div className="absolute -top-10 -right-10 text-9xl opacity-10 animate-spin-slow">🎁</div>
            <div className="absolute -bottom-8 -left-8 text-7xl opacity-10 animate-bounce">⭐</div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="text-6xl animate-bounce">🎉</div>
                  <div className="absolute -top-2 -right-2 text-2xl animate-ping">✨</div>
                </div>
                
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 animate-pulse">
                    Do'stlaringizni taklif qiling! 🚀
                  </h2>
                  <p className="text-lg font-bold text-gray-700">
                    Har bir do'stingiz uchun 
                    <span className="inline-flex items-center mx-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white shadow-lg transform hover:scale-110 transition-transform">
                      🥇 10 ta medal
                    </span>
                    yutib oling!
                  </p>
                  <p className="text-md font-semibold text-purple-600 mt-1">
                    Medallaringizni 
                    <span className="inline-flex items-center mx-1 text-pink-600">
                      🛍️ Do'kon
                    </span>
                    bo'limida yoqtirgan mahsulotlarga almashtiring!
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-2">
                  <div className="text-4xl animate-bounce" style={{ animationDelay: '0ms' }}>🥇</div>
                  <div className="text-4xl animate-bounce" style={{ animationDelay: '100ms' }}>🥈</div>
                  <div className="text-4xl animate-bounce" style={{ animationDelay: '200ms' }}>🥉</div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className="text-2xl animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      ⭐
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute top-4 right-1/4 text-3xl animate-float">🎈</div>
            <div className="absolute bottom-4 left-1/4 text-2xl animate-float" style={{ animationDelay: '1s' }}>🌟</div>
            <div className="absolute top-1/2 right-10 text-xl animate-float" style={{ animationDelay: '0.5s' }}>💫</div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-teens-blue to-teens-navy rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-6xl opacity-20">🚀</div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Salom, <span data-testid="text-student-name">{user?.firstName}!</span>
            </h1>
            <p className="text-blue-100 text-lg">Bugun yangi texnologiyalarni o'rganishga tayyormisiz?</p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-teens-yellow text-2xl">🥇</span>
                <span data-testid="text-gold-medals">{userMedals.gold}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-2xl">🥈</span>
                <span data-testid="text-silver-medals">{userMedals.silver}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-300 text-2xl">🥉</span>
                <span data-testid="text-bronze-medals">{userMedals.bronze}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Mening profilim</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4 group">
                    {user?.profilePic ? (
                      user.profilePic.startsWith('/attached_assets') ? (
                        <img 
                          src={user.profilePic} 
                          alt="Avatar" 
                          className="w-24 h-24 rounded-full object-cover border-4 border-teens-blue group-hover:border-teens-green transition-colors"
                        />
                      ) : user?.avatarConfig ? (
                        <AvatarRenderer 
                          avatarConfig={user.avatarConfig as any}
                          size="md"
                          className="group-hover:scale-110 transition-transform"
                        />
                      ) : user.profilePic.length > 3 ? (
                        <div className="w-24 h-24 bg-gradient-to-r from-teens-blue to-teens-navy rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                          {user.profilePic}
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-r from-teens-blue to-teens-navy rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </div>
                      )
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-r from-teens-blue to-teens-navy rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-teens-green rounded-full flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      🎨
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900" data-testid="text-student-fullname">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-gray-500 mb-4" data-testid="text-student-email">{user?.email}</p>
                  <Button 
                    className="bg-teens-blue hover:bg-blue-600 w-full" 
                    data-testid="button-edit-profile"
                    onClick={() => setIsAvatarBuilderOpen(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    🎨 Avatarni o'zgartirish
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Medal Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Medallar statistikasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-teens-blue" data-testid="text-total-medals">{totalMedals}</div>
                  <p className="text-gray-500 text-sm">Jami medal</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <span className="text-xl">🥇</span>
                      <span className="text-sm font-medium">Oltin</span>
                    </span>
                    <span className="font-bold text-yellow-600">{userMedals.gold}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <span className="text-xl">🥈</span>
                      <span className="text-sm font-medium">Kumush</span>
                    </span>
                    <span className="font-bold text-gray-600">{userMedals.silver}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <span className="text-xl">🥉</span>
                      <span className="text-sm font-medium">Bronza</span>
                    </span>
                    <span className="font-bold text-orange-600">{userMedals.bronze}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Medals Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>🏆 Mening medallarim</CardTitle>
                  <div className="text-sm text-gray-500">
                    Jami: <span className="font-medium text-teens-blue">{totalMedals}</span> ta medal
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {totalMedals === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-8xl mb-4">🌟</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Hali medallaringiz yo'q</h3>
                    <p className="text-gray-500 mb-6">Darslarni yaxshi o'qing va medallar yutib oling!</p>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-dashed border-purple-200">
                      <div className="text-4xl mb-3">🎯</div>
                      <p className="text-sm font-medium text-purple-700">
                        Birinchi medalingizni yutib, do'kon bo'limida ajoyib sovg'alar oling!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center group cursor-pointer relative" data-testid="medal-gold">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-3xl transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-yellow-200">
                          🥇
                        </div>
                        <h3 className="font-semibold text-gray-900 mt-3">Oltin medal</h3>
                        <p className="text-2xl font-bold text-yellow-600 animate-pulse">{userMedals.gold}</p>
                        <p className="text-xs text-gray-500">Mukammal natijalar</p>
                        {userMedals.gold > 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
                            ⚡
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center group cursor-pointer relative" data-testid="medal-silver">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-3xl transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-gray-200">
                          🥈
                        </div>
                        <h3 className="font-semibold text-gray-900 mt-3">Kumush medal</h3>
                        <p className="text-2xl font-bold text-gray-600 animate-pulse">{userMedals.silver}</p>
                        <p className="text-xs text-gray-500">Yaxshi natijalar</p>
                        {userMedals.silver > 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce delay-100">
                            ⚡
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center group cursor-pointer relative" data-testid="medal-bronze">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-3xl transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-orange-200">
                          🥉
                        </div>
                        <h3 className="font-semibold text-gray-900 mt-3">Bronza medal</h3>
                        <p className="text-2xl font-bold text-orange-600 animate-pulse">{userMedals.bronze}</p>
                        <p className="text-xs text-gray-500">Qoniqarli natijalar</p>
                        {userMedals.bronze > 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce delay-200">
                            ⚡
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Marketplace Call-to-Action */}
                    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-4xl opacity-30 animate-spin">🌟</div>
                      <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="text-3xl animate-bounce">🛍️</div>
                          <h3 className="text-xl font-bold">Medal do'koniga xush kelibsiz!</h3>
                        </div>
                        <p className="text-purple-100 mb-4 text-sm">
                          Medallaringiz bilan quyidagi bo'limda ajoyib sovg'alarni sotib olishingiz mumkin:
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-sm">
                          <span className="bg-white/20 rounded-full px-3 py-1">🎁 Sovg'alar</span>
                          <span className="bg-white/20 rounded-full px-3 py-1">📚 Kitoblar</span>
                          <span className="bg-white/20 rounded-full px-3 py-1">🎮 O'yinlar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Marketplace Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Medal do'koni</CardTitle>
                  <ShoppingBag className="w-6 h-6 text-teens-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const medalCost = product.medalCost as { gold: number; silver: number; bronze: number };
                    const canAfford = userMedals.gold >= medalCost.gold && 
                                     userMedals.silver >= medalCost.silver && 
                                     userMedals.bronze >= medalCost.bronze;
                    
                    return (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
                        data-testid={`product-${product.id}`}
                      >
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 flex-1" data-testid={`product-name-${product.id}`}>
                            {product.name}
                          </h3>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <span>📦</span>
                            <span>{(product as any).quantity || 0}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3" data-testid={`product-description-${product.id}`}>
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {medalCost.gold > 0 && (
                              <div className="flex items-center space-x-1">
                                <span className="text-yellow-500">🥇</span>
                                <span className="font-medium">{medalCost.gold}</span>
                              </div>
                            )}
                            {medalCost.silver > 0 && (
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-500">🥈</span>
                                <span className="font-medium">{medalCost.silver}</span>
                              </div>
                            )}
                            {medalCost.bronze > 0 && (
                              <div className="flex items-center space-x-1">
                                <span className="text-orange-500">🥉</span>
                                <span className="font-medium">{medalCost.bronze}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => handlePurchase(product.id)}
                            disabled={!canAfford || purchaseMutation.isPending}
                            className={`text-sm font-medium ${
                              canAfford 
                                ? "bg-teens-green hover:bg-green-600 text-white" 
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            data-testid={`button-purchase-${product.id}`}
                          >
                            {purchaseMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : canAfford ? (
                              "Sotib olish"
                            ) : (
                              "Yetarli emas"
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {products.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Hali mahsulotlar yo'q</p>
                      <p className="text-gray-400 text-sm">Tez orada yangi mahsulotlar qo'shiladi</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Purchase History */}
            <Card>
              <CardHeader>
                <CardTitle>Xaridlar tarixi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchases.map((purchase) => {
                    const status = (purchase as any).status || "approved";
                    const medalsPaid = purchase.medalsPaid as { gold: number; silver: number; bronze: number };
                    
                    return (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`purchase-${purchase.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">Mahsulot xaridi</h4>
                            {status === "pending" && (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                ⏳ Kutilmoqda
                              </span>
                            )}
                            {status === "approved" && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                ✅ Tasdiqlandi
                              </span>
                            )}
                            {status === "rejected" && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                ❌ Rad etildi
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(purchase.purchaseDate!).toLocaleDateString('uz-UZ')}
                          </p>
                          {status === "rejected" && (purchase as any).rejectionReason && (
                            <p className="text-xs text-red-600 mt-1">
                              Sabab: {(purchase as any).rejectionReason}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {medalsPaid.gold > 0 && (
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-500">🥇</span>
                              <span className="text-sm font-medium">{medalsPaid.gold}</span>
                            </div>
                          )}
                          {medalsPaid.silver > 0 && (
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500">🥈</span>
                              <span className="text-sm font-medium">{medalsPaid.silver}</span>
                            </div>
                          )}
                          {medalsPaid.bronze > 0 && (
                            <div className="flex items-center space-x-1">
                              <span className="text-orange-500">🥉</span>
                              <span className="text-sm font-medium">{medalsPaid.bronze}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {purchases.length === 0 && (
                    <div className="text-center py-8">
                      <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Hali xaridlar yo'q</p>
                      <p className="text-gray-400 text-sm">Birinchi xaridingizni qiling!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Avatar Builder Component */}
      <AvatarBuilder
        isOpen={isAvatarBuilderOpen}
        onClose={() => setIsAvatarBuilderOpen(false)}
        onSave={handleAvatarSave}
        currentAvatar={user?.profilePic || undefined}
      />
    </div>
  );
}
