import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Award, 
  ShoppingBag, 
  LogOut,
  Search,
  Edit,
  Trash2,
  Star,
  BarChart3,
  TrendingUp,
  Loader2
} from "lucide-react";
import type { User, Group, Product } from "@shared/schema";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  // Queries
  const { data: stats } = useQuery<{
    totalStudents: number;
    activeGroups: number;
    totalMedals: { gold: number; silver: number; bronze: number };
    unpaidAmount: number;
  }>({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  const { data: students = [] } = useQuery<User[]>({
    queryKey: ["/api/students"],
    enabled: !!user,
  });

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    enabled: !!user,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!user,
  });

  // Mutations
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const res = await apiRequest("POST", "/api/students", studentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsAddStudentOpen(false);
      setStudentForm({ firstName: "", lastName: "", email: "", password: "" });
      toast({
        title: "Muvaffaqiyat",
        description: "Yangi o'quvchi muvaffaqiyatli yaratildi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error.message || "O'quvchi yaratishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setStudentForm(prev => ({ ...prev, password }));
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    createStudentMutation.mutate(studentForm);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-teens-navy rounded-lg flex items-center justify-center mr-3">
                  <div className="relative">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                    <div className="absolute -top-0.5 -right-0.5 w-0 h-0 border-l-2 border-l-teens-red border-b-2 border-b-transparent border-t-2 border-t-transparent"></div>
                  </div>
                </div>
                <span className="text-xl font-bold text-teens-navy">Teens IT School</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-teens-blue to-teens-navy rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
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

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm h-screen sticky top-0">
          <div className="p-4">
            <nav className="space-y-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                <TabsList className="flex flex-col h-auto bg-transparent space-y-1 w-full">
                  <TabsTrigger
                    value="dashboard"
                    className="w-full justify-start data-[state=active]:bg-teens-blue data-[state=active]:text-white"
                    data-testid="tab-dashboard"
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Boshqaruv paneli
                  </TabsTrigger>
                  <TabsTrigger
                    value="students"
                    className="w-full justify-start data-[state=active]:bg-teens-blue data-[state=active]:text-white"
                    data-testid="tab-students"
                  >
                    <Users className="w-5 h-5 mr-3" />
                    O'quvchilar
                  </TabsTrigger>
                  <TabsTrigger
                    value="groups"
                    className="w-full justify-start data-[state=active]:bg-teens-blue data-[state=active]:text-white"
                    data-testid="tab-groups"
                  >
                    <BookOpen className="w-5 h-5 mr-3" />
                    Guruhlar
                  </TabsTrigger>
                  <TabsTrigger
                    value="attendance"
                    className="w-full justify-start data-[state=active]:bg-teens-blue data-[state=active]:text-white"
                    data-testid="tab-attendance"
                  >
                    <Calendar className="w-5 h-5 mr-3" />
                    Davomat
                  </TabsTrigger>
                  <TabsTrigger
                    value="fees"
                    className="w-full justify-start data-[state=active]:bg-teens-blue data-[state=active]:text-white"
                    data-testid="tab-fees"
                  >
                    <DollarSign className="w-5 h-5 mr-3" />
                    To'lovlar
                  </TabsTrigger>
                  <TabsTrigger
                    value="medals"
                    className="w-full justify-start data-[state=active]:bg-teens-blue data-[state=active]:text-white"
                    data-testid="tab-medals"
                  >
                    <Award className="w-5 h-5 mr-3" />
                    Medallar
                  </TabsTrigger>
                  <TabsTrigger
                    value="marketplace"
                    className="w-full justify-start data-[state=active]:bg-teens-blue data-[state=active]:text-white"
                    data-testid="tab-marketplace"
                  >
                    <ShoppingBag className="w-5 h-5 mr-3" />
                    Do'kon
                  </TabsTrigger>
                </TabsList>

                {/* Main Content */}
                <div className="flex-1 p-6 ml-64 -mt-80">
                  <TabsContent value="dashboard" className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Boshqaruv paneli</h1>
                      <p className="text-gray-600">Tizim statistikasi va umumiy ma'lumotlar</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-transform duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-100 text-sm font-medium">Jami o'quvchilar</p>
                              <p className="text-3xl font-bold">{stats?.totalStudents ?? 0}</p>
                            </div>
                            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
                              <Users className="w-8 h-8" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white transform hover:scale-105 transition-transform duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-100 text-sm font-medium">Aktiv guruhlar</p>
                              <p className="text-3xl font-bold">{stats?.activeGroups ?? 0}</p>
                            </div>
                            <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
                              <BookOpen className="w-8 h-8" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white transform hover:scale-105 transition-transform duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-yellow-100 text-sm font-medium">Jami medallar</p>
                              <p className="text-3xl font-bold">
                                {(stats?.totalMedals?.gold ?? 0) + (stats?.totalMedals?.silver ?? 0) + (stats?.totalMedals?.bronze ?? 0)}
                              </p>
                            </div>
                            <div className="p-3 bg-yellow-400 bg-opacity-30 rounded-full">
                              <Award className="w-8 h-8" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white transform hover:scale-105 transition-transform duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-red-100 text-sm font-medium">To'lanmagan</p>
                              <p className="text-3xl font-bold">${stats?.unpaidAmount ?? 0}</p>
                            </div>
                            <div className="p-3 bg-red-400 bg-opacity-30 rounded-full">
                              <DollarSign className="w-8 h-8" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts Placeholder */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>O'quvchilar faolligi</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <TrendingUp className="w-16 h-16 text-teens-blue mx-auto mb-3" />
                              <p className="text-gray-500">Chart.js grafigi bu yerda ko'rinadi</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Medallar taqsimoti</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Star className="w-16 h-16 text-teens-yellow mx-auto mb-3" />
                              <p className="text-gray-500">Donut chart bu yerda ko'rinadi</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="students" className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">O'quvchilar</h1>
                        <p className="text-gray-600">O'quvchilarni boshqarish va yangi hisoblar yaratish</p>
                      </div>
                      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-teens-blue hover:bg-blue-600" data-testid="button-add-student">
                            <UserPlus className="w-5 h-5 mr-2" />
                            Yangi o'quvchi
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Yangi o'quvchi qo'shish</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreateStudent} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">Ism</Label>
                              <Input
                                id="firstName"
                                value={studentForm.firstName}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, firstName: e.target.value }))}
                                placeholder="Alisher"
                                required
                                data-testid="input-student-firstname"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Familiya</Label>
                              <Input
                                id="lastName"
                                value={studentForm.lastName}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, lastName: e.target.value }))}
                                placeholder="Karimov"
                                required
                                data-testid="input-student-lastname"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email manzil</Label>
                              <Input
                                id="email"
                                type="email"
                                value={studentForm.email}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="alisher.k@email.com"
                                required
                                data-testid="input-student-email"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="password">Parol</Label>
                              <div className="flex">
                                <Input
                                  id="password"
                                  value={studentForm.password}
                                  onChange={(e) => setStudentForm(prev => ({ ...prev, password: e.target.value }))}
                                  placeholder="Avtomatik yaratiladi"
                                  className="rounded-r-none"
                                  required
                                  data-testid="input-student-password"
                                />
                                <Button
                                  type="button"
                                  onClick={generatePassword}
                                  className="rounded-l-none bg-teens-blue hover:bg-blue-600"
                                  data-testid="button-generate-password"
                                >
                                  Yaratish
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsAddStudentOpen(false)}
                                data-testid="button-cancel-student"
                              >
                                Bekor qilish
                              </Button>
                              <Button 
                                type="submit" 
                                className="bg-teens-blue hover:bg-blue-600"
                                disabled={createStudentMutation.isPending}
                                data-testid="button-create-student"
                              >
                                {createStudentMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Yaratilmoqda...
                                  </>
                                ) : (
                                  "O'quvchi yaratish"
                                )}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Students Table */}
                    <Card>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                          <div className="relative">
                            <Input
                              placeholder="O'quvchi qidirish..."
                              className="pl-10 w-full sm:w-80"
                              data-testid="input-search-students"
                            />
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {students.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                              data-testid={`student-row-${student.id}`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-teens-blue to-teens-navy rounded-full flex items-center justify-center text-white font-medium">
                                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900">
                                    {student.firstName} {student.lastName}
                                  </h3>
                                  <p className="text-sm text-gray-500">{student.email}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      Yaratilgan: {new Date(student.createdAt!).toLocaleDateString('uz-UZ')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="flex items-center space-x-1">
                                    {student.medals && typeof student.medals === 'object' && student.medals !== null && (
                                      <>
                                        <span className="text-xs font-medium text-yellow-600">
                                          🥇 {((student.medals as any)?.gold as number) ?? 0}
                                        </span>
                                        <span className="text-xs font-medium text-gray-500">
                                          🥈 {((student.medals as any)?.silver as number) ?? 0}
                                        </span>
                                        <span className="text-xs font-medium text-orange-600">
                                          🥉 {((student.medals as any)?.bronze as number) ?? 0}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" data-testid={`button-edit-student-${student.id}`}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" data-testid={`button-delete-student-${student.id}`}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {students.length === 0 && (
                            <div className="text-center py-8">
                              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500">Hali o'quvchilar yo'q</p>
                              <p className="text-gray-400 text-sm">Birinchi o'quvchini qo'shish uchun yuqoridagi tugmani bosing</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Other tabs content can be added here */}
                  <TabsContent value="groups">
                    <div className="text-center py-16">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Guruhlar bo'limi</h3>
                      <p className="text-gray-500">Bu bo'lim hali ishlab chiqilmoqda</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="attendance">
                    <div className="text-center py-16">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Davomat bo'limi</h3>
                      <p className="text-gray-500">Bu bo'lim hali ishlab chiqilmoqda</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="fees">
                    <div className="text-center py-16">
                      <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">To'lovlar bo'limi</h3>
                      <p className="text-gray-500">Bu bo'lim hali ishlab chiqilmoqda</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="medals">
                    <div className="text-center py-16">
                      <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Medallar bo'limi</h3>
                      <p className="text-gray-500">Bu bo'lim hali ishlab chiqilmoqda</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="marketplace">
                    <div className="text-center py-16">
                      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Do'kon bo'limi</h3>
                      <p className="text-gray-500">Bu bo'lim hali ishlab chiqilmoqda</p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
