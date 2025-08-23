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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Upload,
  Filter,
  MoreHorizontal,
  Medal,
  Package,
  CreditCard,
  UserCheck
} from "lucide-react";
import type { User, Group, Product, Attendance, Payment, Purchase } from "@shared/schema";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Student states
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  
  // Group states
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    schedule: [] as string[]
  });
  
  // Product states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    image: "",
    medalCost: { gold: 0, silver: 0, bronze: 0 },
    isActive: true
  });
  
  // Medals states
  const [selectedStudentForMedals, setSelectedStudentForMedals] = useState<User | null>(null);
  const [medalForm, setMedalForm] = useState({ gold: 0, silver: 0, bronze: 0 });
  
  // Payment states
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    studentId: "",
    amount: 0,
    classesAttended: 0
  });
  
  // Attendance states
  const [selectedGroupForAttendance, setSelectedGroupForAttendance] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [selectedStudentsForAttendance, setSelectedStudentsForAttendance] = useState<string[]>([]);

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
  
  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    enabled: !!user && activeTab === "fees",
  });
  
  const { data: groupStudents = [] } = useQuery<any[]>({
    queryKey: ["/api/groups", selectedGroupForAttendance, "students"],
    enabled: !!user && !!selectedGroupForAttendance,
  });
  
  const { data: attendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/groups", selectedGroupForAttendance, "attendance"],
    enabled: !!user && !!selectedGroupForAttendance,
  });

  // Student Mutations
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
  
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PUT", `/api/students/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setIsEditStudentOpen(false);
      setEditingStudent(null);
      toast({ title: "Muvaffaqiyat", description: "O'quvchi ma'lumotlari yangilandi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.message || "Yangilashda xatolik", variant: "destructive" });
    },
  });
  
  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Muvaffaqiyat", description: "O'quvchi o'chirildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.message || "O'chirishda xatolik", variant: "destructive" });
    },
  });
  
  // Group Mutations
  const createGroupMutation = useMutation({
    mutationFn: async (groupData: any) => {
      const res = await apiRequest("POST", "/api/groups", groupData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsAddGroupOpen(false);
      setGroupForm({ name: "", description: "", schedule: [] });
      toast({ title: "Muvaffaqiyat", description: "Yangi guruh yaratildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.message || "Guruh yaratishda xatolik", variant: "destructive" });
    },
  });
  
  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PUT", `/api/groups/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setIsEditGroupOpen(false);
      setEditingGroup(null);
      toast({ title: "Muvaffaqiyat", description: "Guruh ma'lumotlari yangilandi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.message || "Yangilashda xatolik", variant: "destructive" });
    },
  });
  
  // Product Mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const res = await apiRequest("POST", "/api/products", productData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddProductOpen(false);
      setProductForm({ name: "", description: "", image: "", medalCost: { gold: 0, silver: 0, bronze: 0 }, isActive: true });
      toast({ title: "Muvaffaqiyat", description: "Yangi mahsulot yaratildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.message || "Mahsulot yaratishda xatolik", variant: "destructive" });
    },
  });
  
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PUT", `/api/products/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsEditProductOpen(false);
      setEditingProduct(null);
      toast({ title: "Muvaffaqiyat", description: "Mahsulot ma'lumotlari yangilandi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.message || "Yangilashda xatolik", variant: "destructive" });
    },
  });
  
  // Medals Mutation
  const updateMedalsMutation = useMutation({
    mutationFn: async ({ studentId, medals }: any) => {
      const res = await apiRequest("PUT", `/api/students/${studentId}/medals`, medals);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setSelectedStudentForMedals(null);
      toast({ title: "Muvaffaqiyat", description: "Medallar yangilandi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.message || "Medallarni yangilashda xatolik", variant: "destructive" });
    },
  });
  
  // Payment Mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const res = await apiRequest("POST", "/api/payments", paymentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsAddPaymentOpen(false);
      setPaymentForm({ studentId: "", amount: 0, classesAttended: 0 });
      toast({ title: "Muvaffaqiyat", description: "To'lov qo'shildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.message || "To'lov qo'shishda xatolik", variant: "destructive" });
    },
  });
  
  // Attendance Mutation
  const createAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: any) => {
      const res = await apiRequest("POST", "/api/attendance", attendanceData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroupForAttendance, "attendance"] });
      setSelectedStudentsForAttendance([]);
      setAttendanceDate("");
      toast({ title: "Muvaffaqiyat", description: "Davomat saqlandi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.message || "Davomat saqlashda xatolik", variant: "destructive" });
    },
  });

  // Helper Functions
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
  
  const handleEditStudent = (student: User) => {
    setEditingStudent(student);
    setStudentForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      password: ""
    });
    setIsEditStudentOpen(true);
  };
  
  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      const updateData: any = { ...studentForm };
      if (!updateData.password) {
        const { password, ...dataWithoutPassword } = updateData;
        updateStudentMutation.mutate({ id: editingStudent.id, ...dataWithoutPassword });
      } else {
        updateStudentMutation.mutate({ id: editingStudent.id, ...updateData });
      }
    }
  };
  
  const handleDeleteStudent = (id: string) => {
    if (confirm("O'quvchini o'chirishni tasdiqlaysizmi?")) {
      deleteStudentMutation.mutate(id);
    }
  };
  
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    createGroupMutation.mutate(groupForm);
  };
  
  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || "",
      schedule: Array.isArray(group.schedule) ? group.schedule : []
    });
    setIsEditGroupOpen(true);
  };
  
  const handleUpdateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup.id, ...groupForm });
    }
  };
  
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    createProductMutation.mutate(productForm);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      image: product.image || "",
      medalCost: product.medalCost as any,
      isActive: product.isActive
    });
    setIsEditProductOpen(true);
  };
  
  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...productForm });
    }
  };
  
  const handleMedalUpdate = (student: User) => {
    setSelectedStudentForMedals(student);
    const medals = student.medals as any;
    setMedalForm({
      gold: medals?.gold || 0,
      silver: medals?.silver || 0,
      bronze: medals?.bronze || 0
    });
  };
  
  const handleUpdateMedals = () => {
    if (selectedStudentForMedals) {
      updateMedalsMutation.mutate({
        studentId: selectedStudentForMedals.id,
        medals: medalForm
      });
    }
  };
  
  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    createPaymentMutation.mutate(paymentForm);
  };
  
  const handleCreateAttendance = () => {
    if (selectedGroupForAttendance && attendanceDate && selectedStudentsForAttendance.length > 0) {
      createAttendanceMutation.mutate({
        groupId: selectedGroupForAttendance,
        date: new Date(attendanceDate),
        participants: selectedStudentsForAttendance
      });
    }
  };
  
  const addScheduleTime = () => {
    setGroupForm(prev => ({ ...prev, schedule: [...prev.schedule, ""] }));
  };
  
  const removeScheduleTime = (index: number) => {
    setGroupForm(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };
  
  const updateScheduleTime = (index: number, value: string) => {
    setGroupForm(prev => ({
      ...prev,
      schedule: prev.schedule.map((time, i) => i === index ? value : time)
    }));
  };
  
  const filteredStudents = students.filter(student =>
    searchTerm === "" ||
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredGroups = groups.filter(group =>
    searchTerm === "" ||
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const filteredProducts = products.filter(product =>
    searchTerm === "" ||
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                <div className="flex-1 p-6 ml-64">
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
                      
                      {/* Edit Student Dialog */}
                      <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>O'quvchi ma'lumotlarini tahrirlash</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleUpdateStudent} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-firstName">Ism</Label>
                              <Input
                                id="edit-firstName"
                                value={studentForm.firstName}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, firstName: e.target.value }))}
                                required
                                data-testid="input-edit-student-firstname"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-lastName">Familiya</Label>
                              <Input
                                id="edit-lastName"
                                value={studentForm.lastName}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, lastName: e.target.value }))}
                                required
                                data-testid="input-edit-student-lastname"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-email">Email manzil</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={studentForm.email}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                                required
                                data-testid="input-edit-student-email"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-password">Yangi parol (ixtiyoriy)</Label>
                              <Input
                                id="edit-password"
                                type="password"
                                value={studentForm.password}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Bo'sh qoldiring agar o'zgartirmaysiz"
                                data-testid="input-edit-student-password"
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsEditStudentOpen(false)}
                                data-testid="button-cancel-edit-student"
                              >
                                Bekor qilish
                              </Button>
                              <Button 
                                type="submit" 
                                className="bg-teens-blue hover:bg-blue-600"
                                disabled={updateStudentMutation.isPending}
                                data-testid="button-update-student"
                              >
                                {updateStudentMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Yangilanmoqda...
                                  </>
                                ) : (
                                  "Yangilash"
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
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 w-full sm:w-80"
                              data-testid="input-search-students"
                            />
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {filteredStudents.map((student) => (
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
                                    {student.medals && typeof student.medals === 'object' && student.medals !== null ? (
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
                                    ) : null}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleEditStudent(student)}
                                    data-testid={`button-edit-student-${student.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteStudent(student.id)}
                                    data-testid={`button-delete-student-${student.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {filteredStudents.length === 0 && (
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

                  {/* Groups Tab */}
                  <TabsContent value="groups" className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Guruhlar</h1>
                        <p className="text-gray-600">O'quv guruhlarini boshqarish va jadval tuzish</p>
                      </div>
                      <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-teens-green hover:bg-green-600" data-testid="button-add-group">
                            <Plus className="w-5 h-5 mr-2" />
                            Yangi guruh
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Yangi guruh yaratish</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="group-name">Guruh nomi</Label>
                              <Input
                                id="group-name"
                                value={groupForm.name}
                                onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Web Dasturlash (Boshlang'ich)"
                                required
                                data-testid="input-group-name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="group-description">Tavsif</Label>
                              <Textarea
                                id="group-description"
                                value={groupForm.description}
                                onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="HTML, CSS va JavaScript asoslari"
                                data-testid="input-group-description"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Dars jadvali</Label>
                                <Button type="button" onClick={addScheduleTime} variant="outline" size="sm">
                                  <Plus className="w-4 h-4 mr-1" />
                                  Vaqt qo'shish
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {groupForm.schedule.map((time, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <Input
                                      value={time}
                                      onChange={(e) => updateScheduleTime(index, e.target.value)}
                                      placeholder="Dushanba 14:00"
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      onClick={() => removeScheduleTime(index)}
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button type="button" variant="outline" onClick={() => setIsAddGroupOpen(false)}>
                                Bekor qilish
                              </Button>
                              <Button type="submit" className="bg-teens-green hover:bg-green-600" disabled={createGroupMutation.isPending}>
                                {createGroupMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Yaratilmoqda...
                                  </>
                                ) : (
                                  "Guruh yaratish"
                                )}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                          <div className="relative">
                            <Input
                              placeholder="Guruh qidirish..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 w-full sm:w-80"
                            />
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredGroups.map((group) => (
                            <Card key={group.id} className="hover:shadow-lg transition-shadow">
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-lg">{group.name}</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button size="sm" variant="outline" onClick={() => handleEditGroup(group)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <h4 className="font-medium text-sm text-gray-700">Dars jadvali:</h4>
                                  <div className="space-y-1">
                                    {Array.isArray(group.schedule) && group.schedule.length > 0 ? (
                                      group.schedule.map((time, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {time}
                                        </Badge>
                                      ))
                                    ) : (
                                      <p className="text-sm text-gray-400">Jadval belgilanmagan</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        
                        {filteredGroups.length === 0 && (
                          <div className="text-center py-8">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Hali guruhlar yo'q</p>
                            <p className="text-gray-400 text-sm">Birinchi guruhni yaratish uchun yuqoridagi tugmani bosing</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Attendance Tab */}
                  <TabsContent value="attendance" className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Davomat</h1>
                        <p className="text-gray-600">O'quvchilar davomatini boshqarish va kuzatish</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Attendance Recording */}
                      <div className="lg:col-span-1">
                        <Card>
                          <CardHeader>
                            <CardTitle>Davomat belgilash</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Guruh tanlang</Label>
                              <Select value={selectedGroupForAttendance} onValueChange={setSelectedGroupForAttendance}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Guruhni tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                  {groups.map((group) => (
                                    <SelectItem key={group.id} value={group.id}>
                                      {group.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Sana</Label>
                              <Input
                                type="date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                              />
                            </div>
                            
                            {selectedGroupForAttendance && (
                              <div className="space-y-2">
                                <Label>Qatnashgan o'quvchilar</Label>
                                <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-3">
                                  {groupStudents.map((studentGroup: any) => (
                                    <div key={studentGroup.studentId} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={studentGroup.studentId}
                                        checked={selectedStudentsForAttendance.includes(studentGroup.studentId)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedStudentsForAttendance(prev => [...prev, studentGroup.studentId]);
                                          } else {
                                            setSelectedStudentsForAttendance(prev => prev.filter(id => id !== studentGroup.studentId));
                                          }
                                        }}
                                        className="rounded"
                                      />
                                      <Label htmlFor={studentGroup.studentId} className="text-sm cursor-pointer">
                                        {studentGroup.student?.firstName} {studentGroup.student?.lastName}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                                
                                <Button
                                  onClick={handleCreateAttendance}
                                  disabled={!attendanceDate || selectedStudentsForAttendance.length === 0 || createAttendanceMutation.isPending}
                                  className="w-full bg-teens-blue hover:bg-blue-600"
                                >
                                  {createAttendanceMutation.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Saqlanmoqda...
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-4 h-4 mr-2" />
                                      Davomatni saqlash
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Attendance History */}
                      <div className="lg:col-span-2">
                        <Card>
                          <CardHeader>
                            <CardTitle>Davomat tarixi</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {selectedGroupForAttendance ? (
                              <div className="space-y-4">
                                {attendance.map((record) => (
                                  <div key={record.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                                        <Calendar className="w-5 h-5 text-teens-blue" />
                                        <span className="font-medium">
                                          {new Date(record.date).toLocaleDateString('uz-UZ')}
                                        </span>
                                      </div>
                                      <Badge variant="secondary">
                                        {Array.isArray(record.participants) ? record.participants.length : 0} qatnashdi
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <strong>Qatnashganlar:</strong> {Array.isArray(record.participants) ? record.participants.length : 0} o'quvchi
                                    </div>
                                  </div>
                                ))}
                                
                                {attendance.length === 0 && (
                                  <div className="text-center py-8">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Bu guruh uchun davomat ma'lumotlari yo'q</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Davomat ko'rish uchun guruh tanlang</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Payments Tab */}
                  <TabsContent value="fees" className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">To'lovlar</h1>
                        <p className="text-gray-600">O'quvchilar to'lovlarini boshqarish va kuzatish</p>
                      </div>
                      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-teens-green hover:bg-green-600" data-testid="button-add-payment">
                            <CreditCard className="w-5 h-5 mr-2" />
                            To'lov qo'shish
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Yangi to'lov qo'shish</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreatePayment} className="space-y-4">
                            <div className="space-y-2">
                              <Label>O'quvchi</Label>
                              <Select value={paymentForm.studentId} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, studentId: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="O'quvchini tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                  {students.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                      {student.firstName} {student.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="payment-amount">To'lov miqdori (so'm)</Label>
                              <Input
                                id="payment-amount"
                                type="number"
                                value={paymentForm.amount}
                                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                                placeholder="100000"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="classes-attended">Qatnashgan darslar soni</Label>
                              <Input
                                id="classes-attended"
                                type="number"
                                value={paymentForm.classesAttended}
                                onChange={(e) => setPaymentForm(prev => ({ ...prev, classesAttended: parseInt(e.target.value) || 0 }))}
                                placeholder="8"
                                required
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button type="button" variant="outline" onClick={() => setIsAddPaymentOpen(false)}>
                                Bekor qilish
                              </Button>
                              <Button type="submit" className="bg-teens-green hover:bg-green-600" disabled={createPaymentMutation.isPending}>
                                {createPaymentMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Qo'shilmoqda...
                                  </>
                                ) : (
                                  "To'lov qo'shish"
                                )}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Payment Stats */}
                      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-100 text-sm font-medium">Jami to'lovlar</p>
                              <p className="text-2xl font-bold">${stats?.unpaidAmount ?? 0}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-200" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="lg:col-span-3">
                        <CardHeader>
                          <CardTitle>To'lovlar tarixi</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8">
                            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">To'lovlar tarixi bu yerda ko'rinadi</p>
                            <p className="text-gray-400 text-sm">API endpoint hali to'liq ishlamayapti</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Medals Tab */}
                  <TabsContent value="medals" className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Medallar</h1>
                        <p className="text-gray-600">O'quvchilarga medal berish va yutuqlarni kuzatish</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Medal Stats */}
                      <div className="space-y-4">
                        <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-yellow-100 text-sm font-medium">Oltin medallar</p>
                                <p className="text-2xl font-bold">{stats?.totalMedals?.gold ?? 0}</p>
                              </div>
                              <Medal className="w-8 h-8 text-yellow-200" />
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-r from-gray-400 to-gray-500 text-white">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-gray-100 text-sm font-medium">Kumush medallar</p>
                                <p className="text-2xl font-bold">{stats?.totalMedals?.silver ?? 0}</p>
                              </div>
                              <Medal className="w-8 h-8 text-gray-200" />
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-r from-orange-400 to-orange-500 text-white">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-orange-100 text-sm font-medium">Bronza medallar</p>
                                <p className="text-2xl font-bold">{stats?.totalMedals?.bronze ?? 0}</p>
                              </div>
                              <Medal className="w-8 h-8 text-orange-200" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Students List for Medal Assignment */}
                      <div className="lg:col-span-2">
                        <Card>
                          <CardHeader>
                            <CardTitle>O'quvchilarga medal berish</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {students.map((student) => {
                                const medals = student.medals as any;
                                return (
                                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                      <div className="w-12 h-12 bg-teens-blue rounded-full flex items-center justify-center text-white font-bold">
                                        {student.firstName[0]}{student.lastName[0]}
                                      </div>
                                      <div>
                                        <h3 className="font-medium">{student.firstName} {student.lastName}</h3>
                                        <p className="text-sm text-gray-500">{student.email}</p>
                                        <div className="flex items-center space-x-3 mt-1">
                                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                            🥇 {medals?.gold || 0}
                                          </Badge>
                                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                            🥈 {medals?.silver || 0}
                                          </Badge>
                                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                            🥉 {medals?.bronze || 0}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMedalUpdate(student)}
                                      data-testid={`button-edit-medals-${student.id}`}
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Tahrirlash
                                    </Button>
                                  </div>
                                );
                              })}
                              
                              {students.length === 0 && (
                                <div className="text-center py-8">
                                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                  <p className="text-gray-500">Hali o'quvchilar yo'q</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    {/* Medal Edit Dialog */}
                    <Dialog open={!!selectedStudentForMedals} onOpenChange={() => setSelectedStudentForMedals(null)}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {selectedStudentForMedals?.firstName} {selectedStudentForMedals?.lastName} medallarini tahrirlash
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="gold-medals">🥇 Oltin medallar</Label>
                            <Input
                              id="gold-medals"
                              type="number"
                              min="0"
                              value={medalForm.gold}
                              onChange={(e) => setMedalForm(prev => ({ ...prev, gold: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="silver-medals">🥈 Kumush medallar</Label>
                            <Input
                              id="silver-medals"
                              type="number"
                              min="0"
                              value={medalForm.silver}
                              onChange={(e) => setMedalForm(prev => ({ ...prev, silver: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bronze-medals">🥉 Bronza medallar</Label>
                            <Input
                              id="bronze-medals"
                              type="number"
                              min="0"
                              value={medalForm.bronze}
                              onChange={(e) => setMedalForm(prev => ({ ...prev, bronze: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                          <div className="flex justify-end space-x-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setSelectedStudentForMedals(null)}
                            >
                              Bekor qilish
                            </Button>
                            <Button
                              onClick={handleUpdateMedals}
                              className="bg-teens-blue hover:bg-blue-600"
                              disabled={updateMedalsMutation.isPending}
                            >
                              {updateMedalsMutation.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Yangilanmoqda...
                                </>
                              ) : (
                                "Saqlash"
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TabsContent>

                  {/* Shop Tab */}
                  <TabsContent value="marketplace" className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Do'kon</h1>
                        <p className="text-gray-600">Mahsulotlarni boshqarish va o'quvchilar xaridlarini kuzatish</p>
                      </div>
                      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-teens-green hover:bg-green-600" data-testid="button-add-product">
                            <Package className="w-5 h-5 mr-2" />
                            Yangi mahsulot
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Yangi mahsulot qo'shish</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="product-name">Mahsulot nomi</Label>
                              <Input
                                id="product-name"
                                value={productForm.name}
                                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="T-shirt, Stikerlar, Kitob..."
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="product-description">Tavsif</Label>
                              <Textarea
                                id="product-description"
                                value={productForm.description}
                                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Mahsulot haqida batafsil ma'lumot"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="product-image">Rasm URL</Label>
                              <Input
                                id="product-image"
                                value={productForm.image}
                                onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label>Medal narxi</Label>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-sm">🥇 Oltin</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={productForm.medalCost.gold}
                                    onChange={(e) => setProductForm(prev => ({
                                      ...prev,
                                      medalCost: { ...prev.medalCost, gold: parseInt(e.target.value) || 0 }
                                    }))}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-sm">🥈 Kumush</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={productForm.medalCost.silver}
                                    onChange={(e) => setProductForm(prev => ({
                                      ...prev,
                                      medalCost: { ...prev.medalCost, silver: parseInt(e.target.value) || 0 }
                                    }))}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-sm">🥉 Bronza</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={productForm.medalCost.bronze}
                                    onChange={(e) => setProductForm(prev => ({
                                      ...prev,
                                      medalCost: { ...prev.medalCost, bronze: parseInt(e.target.value) || 0 }
                                    }))}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={productForm.isActive}
                                onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isActive: checked }))}
                              />
                              <Label>Faol mahsulot</Label>
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>
                                Bekor qilish
                              </Button>
                              <Button type="submit" className="bg-teens-green hover:bg-green-600" disabled={createProductMutation.isPending}>
                                {createProductMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Yaratilmoqda...
                                  </>
                                ) : (
                                  "Mahsulot yaratish"
                                )}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                          <CardTitle>Mahsulotlar</CardTitle>
                          <div className="relative">
                            <Input
                              placeholder="Mahsulot qidirish..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 w-full sm:w-80"
                            />
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredProducts.map((product) => (
                            <Card key={product.id} className={`hover:shadow-lg transition-shadow ${!product.isActive ? 'opacity-60' : ''}`}>
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-gray-700">Medal narxi:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {product.medalCost && typeof product.medalCost === 'object' && (() => {
                                          const medals = product.medalCost as { gold: number; silver: number; bronze: number };
                                          return (
                                            <>
                                              {medals.gold > 0 && (
                                                <Badge className="bg-yellow-100 text-yellow-800">
                                                  🥇 {medals.gold}
                                                </Badge>
                                              )}
                                              {medals.silver > 0 && (
                                                <Badge className="bg-gray-100 text-gray-800">
                                                  🥈 {medals.silver}
                                                </Badge>
                                              )}
                                              {medals.bronze > 0 && (
                                                <Badge className="bg-orange-100 text-orange-800">
                                                  🥉 {medals.bronze}
                                                </Badge>
                                              )}
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col space-y-2 ml-4">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditProduct(product)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Badge variant={product.isActive ? "default" : "secondary"}>
                                      {product.isActive ? "Faol" : "Nofaol"}
                                    </Badge>
                                  </div>
                                </div>
                                {product.image && (
                                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                                    <Package className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        
                        {filteredProducts.length === 0 && (
                          <div className="text-center py-8">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Hali mahsulotlar yo'q</p>
                            <p className="text-gray-400 text-sm">Birinchi mahsulotni qo'shish uchun yuqoridagi tugmani bosing</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Edit Group Dialog */}
      <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Guruh ma'lumotlarini tahrirlash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateGroup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-group-name">Guruh nomi</Label>
              <Input
                id="edit-group-name"
                value={groupForm.name}
                onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-group-description">Tavsif</Label>
              <Textarea
                id="edit-group-description"
                value={groupForm.description}
                onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Dars jadvali</Label>
                <Button type="button" onClick={addScheduleTime} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Vaqt qo'shish
                </Button>
              </div>
              <div className="space-y-2">
                {groupForm.schedule.map((time, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={time}
                      onChange={(e) => updateScheduleTime(index, e.target.value)}
                      placeholder="Dushanba 14:00"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeScheduleTime(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setIsEditGroupOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" className="bg-teens-green hover:bg-green-600" disabled={updateGroupMutation.isPending}>
                {updateGroupMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Yangilanmoqda...
                  </>
                ) : (
                  "Yangilash"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mahsulot ma'lumotlarini tahrirlash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-product-name">Mahsulot nomi</Label>
              <Input
                id="edit-product-name"
                value={productForm.name}
                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-description">Tavsif</Label>
              <Textarea
                id="edit-product-description"
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-image">Rasm URL</Label>
              <Input
                id="edit-product-image"
                value={productForm.image}
                onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
              />
            </div>
            <div className="space-y-3">
              <Label>Medal narxi</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm">🥇 Oltin</Label>
                  <Input
                    type="number"
                    min="0"
                    value={productForm.medalCost.gold}
                    onChange={(e) => setProductForm(prev => ({
                      ...prev,
                      medalCost: { ...prev.medalCost, gold: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">🥈 Kumush</Label>
                  <Input
                    type="number"
                    min="0"
                    value={productForm.medalCost.silver}
                    onChange={(e) => setProductForm(prev => ({
                      ...prev,
                      medalCost: { ...prev.medalCost, silver: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">🥉 Bronza</Label>
                  <Input
                    type="number"
                    min="0"
                    value={productForm.medalCost.bronze}
                    onChange={(e) => setProductForm(prev => ({
                      ...prev,
                      medalCost: { ...prev.medalCost, bronze: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={productForm.isActive}
                onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>Faol mahsulot</Label>
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setIsEditProductOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" className="bg-teens-green hover:bg-green-600" disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Yangilanmoqda...
                  </>
                ) : (
                  "Yangilash"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
