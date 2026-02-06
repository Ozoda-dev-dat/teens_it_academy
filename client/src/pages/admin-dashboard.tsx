import { useState, useEffect } from "react";
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
import { useRealtimeUpdates } from "@/hooks/use-websocket";
import { 
  Users, 
  UserPlus, 
  User as UserIcon,
  BookOpen, 
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
  MoreHorizontal,
  Medal,
  Package,
  UserCheck,
  Check
} from "lucide-react";
import type { User, Group, Product, Purchase } from "@shared/schema";
import MedalManagement from "./medal-management";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { lastMessage } = useRealtimeUpdates();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Student states
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [isViewStudentOpen, setIsViewStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [viewingStudent, setViewingStudent] = useState<User | null>(null);
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    parentPhone: "",
    parentName: ""
  });
  
  // Generated credentials state
  const [generatedCredentials, setGeneratedCredentials] = useState<{login: string, password: string} | null>(null);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  
  // Group states
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: ""
  });
  
  // Product states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    image: "",
    quantity: 0,
    medalCost: { gold: 0, silver: 0, bronze: 0 },
    isActive: true
  });
  
  // Medals states
  const [selectedStudentForMedals, setSelectedStudentForMedals] = useState<User | null>(null);
  
  // Teacher states
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: ""
  });
  
  // Queries
  const { data: stats } = useQuery<{
    totalStudents: number;
    activeGroups: number;
    totalMedals: { gold: number; silver: number; bronze: number };
  }>({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  const { data: students = [] } = useQuery<User[]>({
    queryKey: ["/api/students"],
    enabled: !!user,
  });

  const { data: teachers = [] } = useQuery<User[]>({
    queryKey: ["/api/teachers"],
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

  // Pending purchases query
  const { data: pendingPurchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases/pending"],
    enabled: !!user && activeTab === "marketplace",
  });

  // Real-time updates effect
  useEffect(() => {
    if (!lastMessage) return;
    const { type, data } = lastMessage;
    switch (type) {
      case 'user_created':
        queryClient.invalidateQueries({ queryKey: ["/api/students"] });
        queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        break;
      case 'group_created':
        queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        break;
      case 'medal_awarded':
        queryClient.invalidateQueries({ queryKey: ["/api/students"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        break;
      case 'product_created':
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        break;
      case 'stats_updated':
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        break;
    }
  }, [lastMessage, toast]);

  // Mutations
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const res = await apiRequest("POST", "/api/students", studentData);
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsAddStudentOpen(false);
      if (data.generatedCredentials) {
        setGeneratedCredentials(data.generatedCredentials);
        setShowCredentialsDialog(true);
      }
      toast({ title: "Muvaffaqiyat", description: "O'quvchi yaratildi" });
    }
  });

  const approvePurchaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/purchases/${id}/approve`);
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Muvaffaqiyat", description: "Xarid tasdiqlandi" });
    }
  });

  const rejectPurchaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/purchases/${id}/reject`);
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases/pending"] });
      toast({ title: "Muvaffaqiyat", description: "Xarid rad etildi" });
    }
  });

  const logout = () => logoutMutation.mutate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-teens-navy text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <img src="/teens-it-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: "dashboard", icon: BarChart3, label: "Dashboard" },
              { id: "students", icon: Users, label: "O'quvchilar" },
              { id: "marketplace", icon: ShoppingBag, label: "Do'kon" },
              { id: "medals", icon: Award, label: "Medallar" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id ? "bg-teens-blue text-white" : "text-blue-100 hover:bg-white/10"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teens-blue flex items-center justify-center font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-blue-200 truncate">Administrator</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full text-blue-100 hover:text-white hover:bg-white/10" onClick={() => logoutMutation.mutate()}>
            <LogOut className="w-4 h-4 mr-2" /> Chiqish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jami o'quvchilar</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Faol guruhlar</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeGroups || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jami medallar</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <span className="text-yellow-600">🥇 {stats?.totalMedals.gold || 0}</span>
                    <span className="text-gray-600">🥈 {stats?.totalMedals.silver || 0}</span>
                    <span className="text-orange-600">🥉 {stats?.totalMedals.bronze || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>O'quvchilar</CardTitle>
              <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" /> Qo'shish</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Yangi o'quvchi qo'shish</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="firstName" className="text-right">Ism</Label>
                      <Input
                        id="firstName"
                        value={studentForm.firstName}
                        onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="lastName" className="text-right">Familiya</Label>
                      <Input
                        id="lastName"
                        value={studentForm.lastName}
                        onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Tel</Label>
                      <Input
                        id="phone"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="parentName" className="text-right">Ota-ona ismi</Label>
                      <Input
                        id="parentName"
                        value={studentForm.parentName}
                        onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="parentPhone" className="text-right">Ota-ona tel</Label>
                      <Input
                        id="parentPhone"
                        value={studentForm.parentPhone}
                        onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => createStudentMutation.mutate(studentForm)}
                    disabled={createStudentMutation.isPending}
                  >
                    {createStudentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Saqlash
                  </Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-bold">{s.firstName} {s.lastName}</p>
                      <p className="text-sm text-gray-500">{s.email}</p>
                    </div>
                    <div className="flex space-x-4">
                       <span className="text-yellow-600">🥇 {(s.medals as any).gold}</span>
                       <span className="text-gray-600">🥈 {(s.medals as any).silver}</span>
                       <span className="text-orange-600">🥉 {(s.medals as any).bronze}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "marketplace" && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Kutilayotgan xaridlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingPurchases.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-bold">{p.studentName}</p>
                        <p className="text-sm text-gray-500">Xarid #{p.id.slice(0,8)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" className="text-green-600" onClick={() => approvePurchaseMutation.mutate(p.id)}>Tasdiqlash</Button>
                        <Button variant="outline" className="text-red-600" onClick={() => rejectPurchaseMutation.mutate(p.id)}>Rad etish</Button>
                      </div>
                    </div>
                  ))}
                  {pendingPurchases.length === 0 && <p className="text-center text-gray-500 py-8">Kutilayotgan xaridlar yo'q</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "medals" && <MedalManagement />}
      </div>
      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>O'quvchi ma'lumotlari</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <p className="text-sm font-medium text-blue-800">Tizimga kirish uchun login va parol:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600">Login:</span>
                <span className="font-mono font-bold text-blue-900">{generatedCredentials?.login}</span>
                <span className="text-gray-600">Parol:</span>
                <span className="font-mono font-bold text-blue-900">{generatedCredentials?.password}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">
              * Iltimos, ushbu ma'lumotlarni o'quvchiga yetkazing. Parol xavfsizlik maqsadida qayta ko'rsatilmaydi.
            </p>
          </div>
          <Button onClick={() => setShowCredentialsDialog(false)}>Tushunarli</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}