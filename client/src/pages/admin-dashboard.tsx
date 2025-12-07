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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeUpdates } from "@/hooks/use-websocket";
import { 
  Users, 
  UserPlus, 
  User as UserIcon,
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
  UserCheck,
  Check
} from "lucide-react";
import type { User, Group, Product, Attendance, Payment, Purchase } from "@shared/schema";
import MedalManagement from "./medal-management";
import MonthlyAttendanceView from "@/components/ui/monthly-attendance-view";

// Define AttendanceStatus type
type AttendanceStatus = 'arrived' | 'absent' | 'late';

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { lastMessage, isConnected } = useRealtimeUpdates();
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
    description: "",
    daySchedule: "" as "mon-wed-fri" | "tue-thu-sat" | "",
    timeSlots: [] as string[]
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
  const [medalForm, setMedalForm] = useState({ gold: 0, silver: 0, bronze: 0 });
  const [isAwardingMedals, setIsAwardingMedals] = useState(false);
  const [celebrationMedals, setCelebrationMedals] = useState<Array<{type: string, count: number}>>([]);
  
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
  
  // Admin attendance management states
  const [selectedGroupForAdmin, setSelectedGroupForAdmin] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);
  const [editingAttendanceRecord, setEditingAttendanceRecord] = useState<Attendance | null>(null);
  
  // New attendance management states
  const [isCreateAttendanceOpen, setIsCreateAttendanceOpen] = useState(false);
  const [isEditAttendanceOpen, setIsEditAttendanceOpen] = useState(false);
  const [isDeleteAttendanceOpen, setIsDeleteAttendanceOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [deletingAttendance, setDeletingAttendance] = useState<Attendance | null>(null);
  
  // Group assignment states
  const [selectedGroupForAssignment, setSelectedGroupForAssignment] = useState<string>("");
  const [isAddStudentToGroupOpen, setIsAddStudentToGroupOpen] = useState(false);
  const [studentToAssign, setStudentToAssign] = useState<string>("");

  // Teacher states
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    parentPhone: "",
    parentName: ""
  });
  
  // Teacher-group assignment states
  const [isAssignTeacherToGroupOpen, setIsAssignTeacherToGroupOpen] = useState(false);
  const [selectedTeacherForAssignment, setSelectedTeacherForAssignment] = useState<string>("");
  const [selectedGroupForTeacherAssignment, setSelectedGroupForTeacherAssignment] = useState<string>("");
  
  // Teacher profile states
  const [isTeacherProfileOpen, setIsTeacherProfileOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

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
  
  // Teacher profile query
  const teacherProfile = useQuery({
    queryKey: ["/api/teachers", selectedTeacherId],
    queryFn: async () => {
      if (!selectedTeacherId) return null;
      const res = await apiRequest("GET", `/api/teachers/${selectedTeacherId}`);
      return await res.json();
    },
    enabled: !!selectedTeacherId && isTeacherProfileOpen,
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
  
  const { data: assignmentGroupStudents = [] } = useQuery<any[]>({
    queryKey: ["/api/groups", selectedGroupForAssignment, "students"],
    enabled: !!user && !!selectedGroupForAssignment,
  });

  // Admin attendance data for selected group
  const { data: adminAttendanceData = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/groups", selectedGroupForAdmin, "attendance"],
    enabled: !!user && !!selectedGroupForAdmin && activeTab === "attendance",
  });

  // Pending purchases query
  const { data: pendingPurchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/admin/purchases/pending"],
    enabled: !!user && activeTab === "marketplace",
  });

  // Daily attendance history - shows all attendance records for today
  const [dailyAttendanceDate, setDailyAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  interface DailyAttendanceRecord extends Attendance {
    groupName: string;
    createdByName: string;
  }
  
  const { data: dailyAttendance = [], isLoading: dailyAttendanceLoading, isError: dailyAttendanceError } = useQuery<DailyAttendanceRecord[]>({
    queryKey: ["/api/attendance/daily", dailyAttendanceDate],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/attendance/daily?date=${dailyAttendanceDate}`);
      if (!res.ok) {
        throw new Error("Kunlik davomat ma'lumotlarini yuklashda xatolik");
      }
      return await res.json();
    },
    enabled: !!user && user.role === "admin" && activeTab === "attendance",
  });

  // Filter attendance data to current month
  const currentMonthAttendance = adminAttendanceData.filter((record) => {
    if (!record.date) return false;
    const recordDate = new Date(record.date);
    const now = new Date();
    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
  });

  // Real-time updates effect
  useEffect(() => {
    if (!lastMessage) return;

    const { type, data } = lastMessage;

    // Show toast notification for important updates
    switch (type) {
      case 'user_created':
        if (data.role === 'student') {
          toast({
            title: "Yangi o'quvchi qo'shildi",
            description: `${data.firstName} ${data.lastName} tizimga qo'shildi`,
          });
          queryClient.invalidateQueries({ queryKey: ["/api/students"] });
          queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        } else if (data.role === 'teacher') {
          toast({
            title: "Yangi o'qituvchi qo'shildi", 
            description: `${data.firstName} ${data.lastName} tizimga qo'shildi`,
          });
          queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
        }
        break;

      case 'group_created':
        toast({
          title: "Yangi guruh yaratildi",
          description: `"${data.name}" guruhi yaratildi`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        break;

      case 'attendance_created':
        queryClient.invalidateQueries({ queryKey: ["/api/groups", data.groupId, "attendance"] });
        break;

      case 'medal_awarded':
        // Update student data directly with new totals for immediate display
        if (data.studentId && data.totals) {
          queryClient.setQueryData(["/api/students"], (old: User[]) => {
            if (!old) return old;
            return old.map(student => 
              student.id === data.studentId 
                ? { ...student, medals: data.totals }
                : student
            );
          });
          
          // Also show a toast notification
          const medalTypesAwarded = Object.entries(data.delta as {gold: number, silver: number, bronze: number})
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => `${count} ${type === 'gold' ? 'oltin' : type === 'silver' ? 'kumush' : 'bronza'}`)
            .join(', ');
          
          if (medalTypesAwarded) {
            toast({
              title: "🏆 Medal berildi!",
              description: `${data.awardedByName || 'Administrator'} tomonidan ${medalTypesAwarded} medal berildi`,
            });
          }
        }
        
        // Invalidate stats to refresh totals
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        break;

      case 'payment_created':
        queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        break;

      case 'product_created':
        toast({
          title: "Yangi mahsulot qo'shildi",
          description: `"${data.name}" mahsuloti qo'shildi`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        break;

      case 'stats_updated':
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        break;
    }
  }, [lastMessage, toast]);

  // Student Mutations
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const res = await apiRequest("POST", "/api/students", studentData);
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsAddStudentOpen(false);
      setStudentForm({ firstName: "", lastName: "", email: "", password: "", phone: "", parentPhone: "", parentName: "" });
      
      // Show generated credentials
      if (data.generatedCredentials) {
        setGeneratedCredentials(data.generatedCredentials);
        setShowCredentialsDialog(true);
      }
      
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
  
  // Teacher Mutations
  const createTeacherMutation = useMutation({
    mutationFn: async (teacherData: any) => {
      const res = await apiRequest("POST", "/api/teachers", teacherData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsAddTeacherOpen(false);
      setTeacherForm({ firstName: "", lastName: "", email: "", password: "", phone: "", parentPhone: "", parentName: "" });
      toast({
        title: "Muvaffaqiyat",
        description: "Yangi o'qituvchi muvaffaqiyatli yaratildi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error.message || "O'qituvchi yaratishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const assignTeacherToGroupMutation = useMutation({
    mutationFn: async (assignmentData: { teacherId: string; groupId: string }) => {
      const res = await apiRequest("POST", "/api/teachers/groups", assignmentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      setIsAssignTeacherToGroupOpen(false);
      setSelectedTeacherForAssignment("");
      setSelectedGroupForTeacherAssignment("");
      toast({
        title: "Muvaffaqiyat",
        description: "O'qituvchi guruhga muvaffaqiyatli tayinlandi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error.message || "O'qituvchini guruhga tayinlashda xatolik",
        variant: "destructive",
      });
    },
  });

  // Teacher Group Completion mutation
  const completeGroupMutation = useMutation({
    mutationFn: async ({ teacherGroupId, completed }: { teacherGroupId: string; completed: boolean }) => {
      const res = await apiRequest("PUT", "/api/teachers/groups/complete", { teacherGroupId, completed });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyat",
        description: "Guruh holati muvaffaqiyatli yangilandi",
        variant: "default",
      });
      // Invalidate teacher profile query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/teachers", selectedTeacherId] });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error.message || "Guruh holatini yangilashda xatolik yuz berdi",
        variant: "destructive",
      });
    }
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
      setGroupForm({ name: "", description: "", daySchedule: "", timeSlots: [] });
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
  
  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Muvaffaqiyat", description: "Guruh o'chirildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.message || "Guruhni o'chirishda xatolik", variant: "destructive" });
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
      setProductForm({ name: "", description: "", image: "", quantity: 0, medalCost: { gold: 0, silver: 0, bronze: 0 }, isActive: true });
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
    onSuccess: (data, variables) => {
      // Calculate new medals awarded
      const currentMedals = selectedStudentForMedals?.medals as any || { gold: 0, silver: 0, bronze: 0 };
      const newMedals = variables.medals;
      const awarded = [];
      
      if (newMedals.gold > currentMedals.gold) {
        awarded.push({ type: 'gold', count: newMedals.gold - currentMedals.gold });
      }
      if (newMedals.silver > currentMedals.silver) {
        awarded.push({ type: 'silver', count: newMedals.silver - currentMedals.silver });
      }
      if (newMedals.bronze > currentMedals.bronze) {
        awarded.push({ type: 'bronze', count: newMedals.bronze - currentMedals.bronze });
      }
      
      if (awarded.length > 0) {
        setIsAwardingMedals(true);
        setCelebrationMedals(awarded);
        
        // Hide celebration after animation
        setTimeout(() => {
          setIsAwardingMedals(false);
          setCelebrationMedals([]);
          setSelectedStudentForMedals(null);
        }, 4000);
      } else {
        setSelectedStudentForMedals(null);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ 
        title: "🎉 Tabriklaymiz!", 
        description: awarded.length > 0 ? "Yangi medallar berildi!" : "Medallar yangilandi" 
      });
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

  // Purchase Approval Mutations
  const approvePurchaseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      const res = await apiRequest("POST", `/api/admin/purchases/${purchaseId}/approve`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/purchases/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ 
        title: "✅ Tasdiqlandi", 
        description: "Xarid tasdiqlandi va o'quvchidan medallar yechildi" 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Xatolik", 
        description: error.message || "Xaridni tasdiqlashda xatolik", 
        variant: "destructive" 
      });
    },
  });

  const rejectPurchaseMutation = useMutation({
    mutationFn: async ({ purchaseId, reason }: { purchaseId: string; reason?: string }) => {
      const res = await apiRequest("POST", `/api/admin/purchases/${purchaseId}/reject`, { reason });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/purchases/pending"] });
      toast({ 
        title: "❌ Rad etildi", 
        description: "Xarid so'rovi rad etildi" 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Xatolik", 
        description: error.message || "Xaridni rad etishda xatolik", 
        variant: "destructive" 
      });
    },
  });
  
  // Group Assignment Mutations
  const addStudentToGroupMutation = useMutation({
    mutationFn: async ({ groupId, studentId }: { groupId: string; studentId: string }) => {
      const res = await apiRequest("POST", `/api/groups/${groupId}/students`, { studentId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroupForAssignment, "students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroupForAttendance, "students"] });
      setIsAddStudentToGroupOpen(false);
      setStudentToAssign("");
      toast({ title: "Muvaffaqiyat", description: "O'quvchi guruhga qo'shildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.message || "O'quvchini guruhga qo'shishda xatolik", variant: "destructive" });
    },
  });
  
  const removeStudentFromGroupMutation = useMutation({
    mutationFn: async ({ groupId, studentId }: { groupId: string; studentId: string }) => {
      await apiRequest("DELETE", `/api/groups/${groupId}/students/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroupForAssignment, "students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroupForAttendance, "students"] });
      toast({ title: "Muvaffaqiyat", description: "O'quvchi guruhdan chiqarildi" });
    },
    onError: (error: any) => {
      toast({ title: "Xatolik", description: error.message || "O'quvchini guruhdan chiqarishda xatolik", variant: "destructive" });
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
      password: "",
      phone: student.phone || "",
      parentPhone: student.parentPhone || "",
      parentName: student.parentName || ""
    });
    setIsEditStudentOpen(true);
  };

  const handleViewStudent = (student: User) => {
    setViewingStudent(student);
    setIsViewStudentOpen(true);
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
  
  const handleViewTeacherProfile = (id: string) => {
    setSelectedTeacherId(id);
    setIsTeacherProfileOpen(true);
  };

  const handleCompleteTeacherGroup = (teacherGroupId: string, completed: boolean) => {
    completeGroupMutation.mutate({ teacherGroupId, completed });
  };
  
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transform daySchedule and timeSlots into schedule array
    const schedule: string[] = [];
    if (groupForm.daySchedule && groupForm.timeSlots.length > 0) {
      const days = groupForm.daySchedule === "mon-wed-fri" 
        ? ["Dushanba", "Chorshanba", "Juma"] 
        : ["Seshanba", "Payshanba", "Shanba"];
      
      groupForm.timeSlots.forEach(timeSlot => {
        days.forEach(day => {
          schedule.push(`${day} ${timeSlot}`);
        });
      });
    }
    
    createGroupMutation.mutate({
      name: groupForm.name,
      description: groupForm.description,
      schedule
    });
  };
  
  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    
    // Parse schedule back to daySchedule and timeSlots
    let daySchedule: "mon-wed-fri" | "tue-thu-sat" | "" = "";
    let timeSlots: string[] = [];
    
    if (Array.isArray(group.schedule) && group.schedule.length > 0) {
      const firstSchedule = group.schedule[0];
      if (firstSchedule.includes("Dushanba") || firstSchedule.includes("Chorshanba") || firstSchedule.includes("Juma")) {
        daySchedule = "mon-wed-fri";
      } else if (firstSchedule.includes("Seshanba") || firstSchedule.includes("Payshanba") || firstSchedule.includes("Shanba")) {
        daySchedule = "tue-thu-sat";
      }
      
      // Extract unique time slots
      const times = new Set<string>();
      group.schedule.forEach(scheduleItem => {
        const timePart = scheduleItem.split(' ').slice(1).join(' ');
        if (timePart) times.add(timePart);
      });
      timeSlots = Array.from(times);
    }
    
    setGroupForm({
      name: group.name,
      description: group.description || "",
      daySchedule,
      timeSlots
    });
    setIsEditGroupOpen(true);
  };
  
  const handleUpdateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup) {
      // Transform daySchedule and timeSlots into schedule array
      const schedule: string[] = [];
      if (groupForm.daySchedule && groupForm.timeSlots.length > 0) {
        const days = groupForm.daySchedule === "mon-wed-fri" 
          ? ["Dushanba", "Chorshanba", "Juma"] 
          : ["Seshanba", "Payshanba", "Shanba"];
        
        groupForm.timeSlots.forEach(timeSlot => {
          days.forEach(day => {
            schedule.push(`${day} ${timeSlot}`);
          });
        });
      }
      
      updateGroupMutation.mutate({ 
        id: editingGroup.id, 
        name: groupForm.name,
        description: groupForm.description,
        schedule
      });
    }
  };
  
  const handleDeleteGroup = (id: string) => {
    if (confirm("Guruhni o'chirishni tasdiqlaysizmi? Bu amal qaytarilmaydi.")) {
      deleteGroupMutation.mutate(id);
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
      quantity: (product as any).quantity || 0,
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

  const handleAddStudentToGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroupForAssignment && studentToAssign) {
      addStudentToGroupMutation.mutate({
        groupId: selectedGroupForAssignment,
        studentId: studentToAssign
      });
    }
  };

  const handleRemoveStudentFromGroup = (studentId: string) => {
    if (selectedGroupForAssignment && confirm("O'quvchini guruhdan chiqarishni tasdiqlaysizmi?")) {
      removeStudentFromGroupMutation.mutate({
        groupId: selectedGroupForAssignment,
        studentId: studentId
      });
    }
  };
  
  // Day schedule and time slot options
  const dayScheduleOptions = [
    { value: "mon-wed-fri" as const, label: "Dushanba-Chorshanba-Juma (Monday-Wednesday-Friday)" },
    { value: "tue-thu-sat" as const, label: "Seshanba-Payshanba-Shanba (Tuesday-Thursday-Saturday)" }
  ];
  
  const timeSlotOptions = [
    "09:00-11:00",
    "11:00-13:00",
    "14:00-16:00",
    "16:00-18:00"
  ];
  
  const toggleTimeSlot = (timeSlot: string) => {
    setGroupForm(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(timeSlot)
        ? prev.timeSlots.filter(t => t !== timeSlot)
        : [...prev.timeSlots, timeSlot]
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

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm h-screen sticky top-0 flex-shrink-0">
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
                    value="teachers"
                    className="w-full justify-start data-[state=active]:bg-teens-blue data-[state=active]:text-white"
                    data-testid="tab-teachers"
                  >
                    <UserCheck className="w-5 h-5 mr-3" />
                    O'qituvchilar
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
                    value="medals"
                    className="w-full justify-start data-[state=active]:bg-teens-blue data-[state=active]:text-white"
                    data-testid="tab-medals"
                  >
                    <Medal className="w-5 h-5 mr-3" />
                    Medallar
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
                    value="marketplace"
                    className="w-full justify-start data-[state=active]:bg-teens-blue data-[state=active]:text-white"
                    data-testid="tab-marketplace"
                  >
                    <ShoppingBag className="w-5 h-5 mr-3" />
                    Do'kon
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                              <Label htmlFor="phone">Telefon raqam</Label>
                              <Input
                                id="phone"
                                value={studentForm.phone}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="+998901234567"
                                data-testid="input-student-phone"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="parentPhone">Ota-ona telefon raqami</Label>
                              <Input
                                id="parentPhone"
                                value={studentForm.parentPhone}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                                placeholder="+998901234567"
                                required
                                data-testid="input-student-parent-phone"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="parentName">Ota-ona ismi</Label>
                              <Input
                                id="parentName"
                                value={studentForm.parentName}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, parentName: e.target.value }))}
                                placeholder="Masalan: Aziz Rahimov"
                                required
                                data-testid="input-student-parent-name"
                              />
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
                            <div className="space-y-2">
                              <Label htmlFor="edit-phone">Telefon raqam</Label>
                              <Input
                                id="edit-phone"
                                value={studentForm.phone}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="+998901234567"
                                data-testid="input-edit-student-phone"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-parentPhone">Ota-ona telefon raqami</Label>
                              <Input
                                id="edit-parentPhone"
                                value={studentForm.parentPhone}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                                placeholder="+998901234567"
                                data-testid="input-edit-student-parent-phone"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-parentName">Ota-ona ismi</Label>
                              <Input
                                id="edit-parentName"
                                value={studentForm.parentName}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, parentName: e.target.value }))}
                                placeholder="Masalan: Aziz Rahimov"
                                data-testid="input-edit-student-parent-name"
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
                      
                      {/* View Student Dialog */}
                      <Dialog open={isViewStudentOpen} onOpenChange={setIsViewStudentOpen}>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>O'quvchi ma'lumotlari</DialogTitle>
                          </DialogHeader>
                          {viewingStudent && (
                            <div className="space-y-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-gradient-to-r from-teens-blue to-teens-navy rounded-full flex items-center justify-center text-white font-medium text-xl">
                                  {viewingStudent.firstName.charAt(0)}{viewingStudent.lastName.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-900">
                                    {viewingStudent.firstName} {viewingStudent.lastName}
                                  </h3>
                                  <p className="text-sm text-gray-500">{viewingStudent.email}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                      Yaratilgan: {new Date(viewingStudent.createdAt!).toLocaleDateString('uz-UZ')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Shaxsiy ma'lumotlar</Label>
                                    <div className="mt-2 space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Ism:</span>
                                        <span className="text-sm font-medium">{viewingStudent.firstName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Familiya:</span>
                                        <span className="text-sm font-medium">{viewingStudent.lastName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Email:</span>
                                        <span className="text-sm font-medium">{viewingStudent.email}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Rol:</span>
                                        <span className="text-sm font-medium capitalize">{viewingStudent.role}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Telefon raqamlar</Label>
                                    <div className="mt-2 space-y-2">
                                      {viewingStudent.phone && (
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm text-gray-600">📱 Shaxsiy:</span>
                                          <span className="text-sm font-medium">{viewingStudent.phone}</span>
                                        </div>
                                      )}
                                      {viewingStudent.parentPhone && (
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm text-gray-600">👨‍👩‍👧‍👦 Ota-ona:</span>
                                          <span className="text-sm font-medium">{viewingStudent.parentPhone}</span>
                                        </div>
                                      )}
                                      {viewingStudent.parentName && (
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm text-gray-600">👨‍👩‍👧‍👦 Ota-ona ismi:</span>
                                          <span className="text-sm font-medium">{viewingStudent.parentName}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Medallar</Label>
                                    <div className="mt-2 space-y-2">
                                      {viewingStudent.medals && typeof viewingStudent.medals === 'object' ? (
                                        <>
                                          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                              <span className="text-lg">🥇</span>
                                              <span className="text-sm font-medium">Oltin</span>
                                            </div>
                                            <span className="text-lg font-bold text-yellow-600">
                                              {((viewingStudent.medals as any)?.gold as number) ?? 0}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                              <span className="text-lg">🥈</span>
                                              <span className="text-sm font-medium">Kumush</span>
                                            </div>
                                            <span className="text-lg font-bold text-gray-600">
                                              {((viewingStudent.medals as any)?.silver as number) ?? 0}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                              <span className="text-lg">🥉</span>
                                              <span className="text-sm font-medium">Bronza</span>
                                            </div>
                                            <span className="text-lg font-bold text-orange-600">
                                              {((viewingStudent.medals as any)?.bronze as number) ?? 0}
                                            </span>
                                          </div>
                                        </>
                                      ) : (
                                        <p className="text-sm text-gray-500">Hali medallar yo'q</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end pt-4 border-t">
                                <Button 
                                  onClick={() => setIsViewStudentOpen(false)}
                                  variant="outline"
                                >
                                  Yopish
                                </Button>
                              </div>
                            </div>
                          )}
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
                                  {student.phone && (
                                    <p className="text-xs text-gray-600">📱 {student.phone}</p>
                                  )}
                                  {student.parentPhone && (
                                    <p className="text-xs text-gray-600">👨‍👩‍👧‍👦 Ota-ona: {student.parentPhone}</p>
                                  )}
                                  {student.parentName && (
                                    <p className="text-xs text-gray-600">👤 {student.parentName}</p>
                                  )}
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
                                    onClick={() => handleViewStudent(student)}
                                    data-testid={`button-view-student-${student.id}`}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
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
                            <div className="space-y-4">
                              <div className="space-y-3">
                                <Label>Hafta kunlari</Label>
                                <div className="space-y-2">
                                  {dayScheduleOptions.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`day-${option.value}`}
                                        checked={groupForm.daySchedule === option.value}
                                        onCheckedChange={(checked) => {
                                          setGroupForm(prev => ({
                                            ...prev,
                                            daySchedule: checked ? option.value : ""
                                          }));
                                        }}
                                      />
                                      <Label
                                        htmlFor={`day-${option.value}`}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        {option.label}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <Label>Dars vaqtlari</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  {timeSlotOptions.map((timeSlot) => (
                                    <div key={timeSlot} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`time-${timeSlot}`}
                                        checked={groupForm.timeSlots.includes(timeSlot)}
                                        onCheckedChange={() => toggleTimeSlot(timeSlot)}
                                      />
                                      <Label
                                        htmlFor={`time-${timeSlot}`}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        {timeSlot}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
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
                            <Card 
                              key={group.id} 
                              className="hover:shadow-lg transition-shadow cursor-pointer" 
                              onClick={() => {
                                setActiveTab("attendance");
                                setSelectedGroupForAdmin(group.id);
                              }}
                            >
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-lg">{group.name}</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleEditGroup(group); }} data-testid={`button-edit-group-${group.id}`}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }} className="text-red-600 hover:text-red-700 hover:bg-red-50" data-testid={`button-delete-group-${group.id}`}>
                                      <Trash2 className="w-4 h-4" />
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
                    
                    {/* Student Assignment Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle>O'quvchilarni guruhlarga tayinlash</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Guruh tanlang</Label>
                          <Select value={selectedGroupForAssignment} onValueChange={setSelectedGroupForAssignment}>
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
                        
                        {selectedGroupForAssignment && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Current Students */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium">Guruhdagi o'quvchilar</h3>
                                <Badge variant="secondary">
                                  {assignmentGroupStudents.length} ta
                                </Badge>
                              </div>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {assignmentGroupStudents.length > 0 ? (
                                  assignmentGroupStudents.map((groupStudent: any) => (
                                    <div key={groupStudent.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div>
                                        <p className="font-medium">{groupStudent.student?.firstName} {groupStudent.student?.lastName}</p>
                                        <p className="text-sm text-gray-500">{groupStudent.student?.email}</p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRemoveStudentFromGroup(groupStudent.studentId)}
                                        className="text-red-600 hover:text-red-700"
                                        disabled={removeStudentFromGroupMutation.isPending}
                                        data-testid={`button-remove-student-${groupStudent.studentId}`}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-6">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">Bu guruhda hali o'quvchilar yo'q</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Add Student */}
                            <div>
                              <h3 className="text-lg font-medium mb-4">O'quvchi qo'shish</h3>
                              <Dialog open={isAddStudentToGroupOpen} onOpenChange={setIsAddStudentToGroupOpen}>
                                <DialogTrigger asChild>
                                  <Button className="w-full mb-4" data-testid="button-add-student-to-group">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    O'quvchi qo'shish
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Guruhga o'quvchi qo'shish</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={handleAddStudentToGroup} className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>O'quvchi tanlang</Label>
                                      <Select value={studentToAssign} onValueChange={setStudentToAssign}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="O'quvchini tanlang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {students
                                            .filter(student => !assignmentGroupStudents.some((gs: any) => gs.studentId === student.id))
                                            .map((student) => (
                                              <SelectItem key={student.id} value={student.id}>
                                                {student.firstName} {student.lastName}
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                      <Button type="button" variant="outline" onClick={() => setIsAddStudentToGroupOpen(false)}>
                                        Bekor qilish
                                      </Button>
                                      <Button 
                                        type="submit" 
                                        className="bg-teens-green hover:bg-green-600"
                                        disabled={!studentToAssign || addStudentToGroupMutation.isPending}
                                        data-testid="button-confirm-add-student"
                                      >
                                        {addStudentToGroupMutation.isPending ? (
                                          <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Qo'shilmoqda...
                                          </>
                                        ) : (
                                          "Qo'shish"
                                        )}
                                      </Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              
                              {/* Available Students Preview */}
                              <div className="space-y-2">
                                <Label className="text-sm text-gray-600">Mavjud o'quvchilar:</Label>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                  {students
                                    .filter(student => !assignmentGroupStudents.some((gs: any) => gs.studentId === student.id))
                                    .map((student) => (
                                      <div key={student.id} className="p-2 border rounded text-sm">
                                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                                        <p className="text-gray-500 text-xs">{student.email}</p>
                                      </div>
                                    ))}
                                </div>
                                {students.filter(student => !assignmentGroupStudents.some((gs: any) => gs.studentId === student.id)).length === 0 && (
                                  <p className="text-sm text-gray-500">Barcha o'quvchilar bu guruhga tayinlangan</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Teachers Tab */}
                  <TabsContent value="teachers" className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">O'qituvchilar</h1>
                        <p className="text-gray-600">O'qituvchilarni boshqarish va guruhlarga tayinlash</p>
                      </div>
                      <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-teens-green hover:bg-green-600" data-testid="button-add-teacher">
                            <Plus className="w-5 h-5 mr-2" />
                            Yangi o'qituvchi
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Yangi o'qituvchi yaratish</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            createTeacherMutation.mutate(teacherForm);
                          }} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="teacher-firstName">Ism</Label>
                              <Input
                                id="teacher-firstName"
                                value={teacherForm.firstName}
                                onChange={(e) => setTeacherForm(prev => ({ ...prev, firstName: e.target.value }))}
                                required
                                data-testid="input-teacher-firstname"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="teacher-lastName">Familiya</Label>
                              <Input
                                id="teacher-lastName"
                                value={teacherForm.lastName}
                                onChange={(e) => setTeacherForm(prev => ({ ...prev, lastName: e.target.value }))}
                                required
                                data-testid="input-teacher-lastname"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="teacher-email">Email manzil</Label>
                              <Input
                                id="teacher-email"
                                type="email"
                                value={teacherForm.email}
                                onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                                required
                                data-testid="input-teacher-email"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="teacher-password">Parol</Label>
                              <Input
                                id="teacher-password"
                                type="password"
                                value={teacherForm.password}
                                onChange={(e) => setTeacherForm(prev => ({ ...prev, password: e.target.value }))}
                                required
                                data-testid="input-teacher-password"
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button type="button" variant="outline" onClick={() => setIsAddTeacherOpen(false)}>
                                Bekor qilish
                              </Button>
                              <Button 
                                type="submit" 
                                className="bg-teens-green hover:bg-green-600"
                                disabled={createTeacherMutation.isPending}
                                data-testid="button-create-teacher"
                              >
                                {createTeacherMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Yaratilmoqda...
                                  </>
                                ) : (
                                  "O'qituvchi yaratish"
                                )}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Teachers List */}
                    <Card>
                      <CardHeader>
                        <CardTitle>O'qituvchilar ro'yxati</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {teachers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {teachers.map((teacher) => (
                              <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="font-medium text-lg">{teacher.firstName} {teacher.lastName}</h4>
                                      <p className="text-sm text-gray-500">{teacher.email}</p>
                                      <Badge variant="secondary">O'qituvchi</Badge>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleViewTeacherProfile(teacher.id)}
                                        className="flex-1"
                                      >
                                        <UserIcon className="w-4 h-4 mr-1" />
                                        Profil
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Hali o'qituvchilar yo'q</p>
                            <p className="text-gray-400 text-sm">Birinchi o'qituvchini yaratish uchun yuqoridagi tugmani bosing</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Teacher-Group Assignment */}
                    <Card>
                      <CardHeader>
                        <CardTitle>O'qituvchilarni guruhlarga tayinlash</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Dialog open={isAssignTeacherToGroupOpen} onOpenChange={setIsAssignTeacherToGroupOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <Plus className="w-4 h-4 mr-2" />
                              O'qituvchini guruhga tayinlash
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>O'qituvchini guruhga tayinlash</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              if (selectedTeacherForAssignment && selectedGroupForTeacherAssignment) {
                                assignTeacherToGroupMutation.mutate({
                                  teacherId: selectedTeacherForAssignment,
                                  groupId: selectedGroupForTeacherAssignment
                                });
                              }
                            }} className="space-y-4">
                              <div className="space-y-2">
                                <Label>O'qituvchi tanlang</Label>
                                <Select value={selectedTeacherForAssignment} onValueChange={setSelectedTeacherForAssignment}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="O'qituvchini tanlang" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teachers.map((teacher) => (
                                      <SelectItem key={teacher.id} value={teacher.id}>
                                        {teacher.firstName} {teacher.lastName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Guruh tanlang</Label>
                                <Select value={selectedGroupForTeacherAssignment} onValueChange={setSelectedGroupForTeacherAssignment}>
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
                              <div className="flex justify-end space-x-3">
                                <Button type="button" variant="outline" onClick={() => setIsAssignTeacherToGroupOpen(false)}>
                                  Bekor qilish
                                </Button>
                                <Button 
                                  type="submit" 
                                  className="bg-teens-blue hover:bg-blue-600"
                                  disabled={!selectedTeacherForAssignment || !selectedGroupForTeacherAssignment || assignTeacherToGroupMutation.isPending}
                                >
                                  {assignTeacherToGroupMutation.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Tayinlanmoqda...
                                    </>
                                  ) : (
                                    "Tayinlash"
                                  )}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Attendance Management Tab */}
                  <TabsContent value="attendance" className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Davomat boshqaruvi</h1>
                        <p className="text-gray-600">Barcha guruhlar davomatini yaratish, ko'rish va o'zgartirish</p>
                      </div>
                      {selectedGroupForAdmin && (
                        <Button 
                          onClick={() => setIsCreateAttendanceOpen(true)}
                          className="bg-teens-blue hover:bg-blue-600"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Davomat yaratish
                        </Button>
                      )}
                    </div>

                    {/* Daily Attendance History - All Teacher Attendance */}
                    <Card className="border-2 border-teens-blue">
                      <CardHeader className="bg-gradient-to-r from-teens-blue to-blue-600 text-white rounded-t-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Calendar className="w-5 h-5" />
                              Kunlik davomat tarixi
                            </CardTitle>
                            <p className="text-blue-100 text-sm mt-1">
                              Barcha guruhlardan o'qituvchilar tomonidan yaratilgan davomat yozuvlari
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="date"
                              value={dailyAttendanceDate}
                              onChange={(e) => setDailyAttendanceDate(e.target.value)}
                              className="bg-white text-gray-900 w-40"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        {dailyAttendanceLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-teens-blue" />
                            <span className="ml-2 text-gray-500">Yuklanmoqda...</span>
                          </div>
                        ) : dailyAttendanceError ? (
                          <div className="text-center py-8 text-red-500">
                            <XCircle className="w-12 h-12 mx-auto mb-3" />
                            <p className="font-medium">Xatolik yuz berdi</p>
                            <p className="text-sm mt-1">Ma'lumotlarni yuklashda muammo bor</p>
                          </div>
                        ) : dailyAttendance.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>Jami: <strong>{dailyAttendance.length}</strong> ta davomat yozuvi</span>
                              <span>
                                {new Date(dailyAttendanceDate).toLocaleDateString('uz-UZ', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Vaqt</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Guruh</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Yaratuvchi</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Rol</th>
                                    <th className="border border-gray-300 px-4 py-2 text-center">Kelgan</th>
                                    <th className="border border-gray-300 px-4 py-2 text-center">Kech</th>
                                    <th className="border border-gray-300 px-4 py-2 text-center">Kelmagan</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dailyAttendance.map((record) => {
                                    const participants = Array.isArray(record.participants) ? record.participants as any[] : [];
                                    const arrived = participants.filter(p => p && p.status === 'arrived').length;
                                    const late = participants.filter(p => p && p.status === 'late').length;
                                    const absent = participants.filter(p => p && p.status === 'absent').length;
                                    const createdTime = record.createdAt 
                                      ? new Date(record.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
                                      : '-';
                                    
                                    return (
                                      <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2 text-sm">
                                          {createdTime}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                          <span className="font-medium">{record.groupName}</span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                          {record.createdByName}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                          <Badge 
                                            variant={record.createdByRole === 'teacher' ? 'default' : 'secondary'}
                                            className={record.createdByRole === 'teacher' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                                          >
                                            {record.createdByRole === 'teacher' ? "O'qituvchi" : 'Admin'}
                                          </Badge>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-medium">
                                            {arrived}
                                          </span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                            {late}
                                          </span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-medium">
                                            {absent}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-700 mb-2">Kunlik xulosa</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-blue-600">{dailyAttendance.length}</p>
                                  <p className="text-sm text-gray-600">Jami darslar</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-green-600">
                                    {dailyAttendance.reduce((sum, r) => {
                                      const parts = Array.isArray(r.participants) ? r.participants as any[] : [];
                                      return sum + parts.filter(p => p && p.status === 'arrived').length;
                                    }, 0)}
                                  </p>
                                  <p className="text-sm text-gray-600">Kelganlar</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-yellow-600">
                                    {dailyAttendance.reduce((sum, r) => {
                                      const parts = Array.isArray(r.participants) ? r.participants as any[] : [];
                                      return sum + parts.filter(p => p && p.status === 'late').length;
                                    }, 0)}
                                  </p>
                                  <p className="text-sm text-gray-600">Kech kelganlar</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-red-600">
                                    {dailyAttendance.reduce((sum, r) => {
                                      const parts = Array.isArray(r.participants) ? r.participants as any[] : [];
                                      return sum + parts.filter(p => p && p.status === 'absent').length;
                                    }, 0)}
                                  </p>
                                  <p className="text-sm text-gray-600">Kelmaganlar</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">Bu sana uchun davomat yozuvlari topilmadi</p>
                            <p className="text-sm mt-1">Boshqa sanani tanlang yoki yangi davomat yarating</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Group Selection */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Guruh tanlash</CardTitle>
                        <p className="text-sm text-gray-600">
                          Davomat boshqarish uchun guruhni tanlang
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {groups.map((group) => (
                            <Card 
                              key={group.id} 
                              className={`cursor-pointer border-2 transition-colors ${
                                selectedGroupForAdmin === group.id 
                                  ? 'border-teens-blue bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedGroupForAdmin(group.id)}
                            >
                              <CardContent className="p-4">
                                <h3 className="font-semibold">{group.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                                {selectedGroupForAdmin === group.id && (
                                  <Badge className="mt-2 bg-teens-blue">Tanlangan</Badge>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Enhanced Monthly Attendance View */}
                    {selectedGroupForAdmin && (
                      <MonthlyAttendanceView 
                        groupId={selectedGroupForAdmin}
                        initialDate={new Date()}
                      />
                    )}

                    {/* Attendance Records */}
                    {selectedGroupForAdmin && (
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            {groups.find(g => g.id === selectedGroupForAdmin)?.name} - Davomat yozuvlari
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            Tanlangan guruhning barcha davomat ma'lumotlari. Admin sifatida siz istalgan yozuvni o'zgartira olasiz.
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {currentMonthAttendance.length > 0 ? (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-700">
                                  {new Date().toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })} davomat yozuvlari
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Sana</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Kelgan</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Kech kelgan</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Kelmagan</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Amallar</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {currentMonthAttendance.map((record) => {
                                        const participants = record.participants as any[] || [];
                                        const arrived = participants.filter(p => p.status === 'arrived').length;
                                        const late = participants.filter(p => p.status === 'late').length;
                                        const absent = participants.filter(p => p.status === 'absent').length;
                                        
                                        return (
                                          <tr key={record.id}>
                                            <td className="border border-gray-300 px-4 py-2">
                                              {new Date(record.date).toLocaleDateString('uz-UZ')}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-green-600">
                                              {arrived}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-yellow-600">
                                              {late}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-red-600">
                                              {absent}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">
                                              <div className="flex space-x-2">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => {
                                                    setEditingAttendance(record);
                                                    setIsEditAttendanceOpen(true);
                                                  }}
                                                >
                                                  <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="destructive"
                                                  onClick={() => {
                                                    setDeletingAttendance(record);
                                                    setIsDeleteAttendanceOpen(true);
                                                  }}
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </Button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600">Bu oyda davomat yozuvlari yo'q</p>
                                <p className="text-sm text-gray-500">
                                  Yangi davomat yaratish uchun yuqoridagi "Davomat yaratish" tugmasini bosing
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Attendance Rules */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Davomat qoidalari</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                            <span>O'qituvchilar har kuni faqat bir marta davomat belgilashlari mumkin</span>
                          </div>
                          <div className="flex items-start space-x-3">
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <span>O'qituvchilar o'tmishdagi davomatni o'zgartira olmaydi</span>
                          </div>
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                            <span>Faqat adminlar o'tmishdagi davomatni o'zgartirishi mumkin</span>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                            <span>O'quvchilar holati: Keldi, Kech keldi, Kelmadi</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Fees Tab */}
                  <TabsContent value="medals" className="space-y-6">
                    <MedalManagement />
                  </TabsContent>

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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="product-image">Rasm URL</Label>
                                <Input
                                  id="product-image"
                                  value={productForm.image}
                                  onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="product-quantity">📦 Miqdori</Label>
                                <Input
                                  id="product-quantity"
                                  type="number"
                                  min="0"
                                  value={productForm.quantity}
                                  onChange={(e) => setProductForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                                  placeholder="10"
                                  required
                                />
                              </div>
                            </div>
                            
                            {/* Image Preview */}
                            {productForm.image && (
                              <div className="space-y-2">
                                <Label>Rasm ko'rinishi</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                  <img
                                    src={productForm.image}
                                    alt="Mahsulot rasm ko'rinishi"
                                    className="w-full max-w-xs h-48 object-cover rounded-lg mx-auto"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                    onLoad={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'block';
                                    }}
                                  />
                                  {!productForm.image.match(/\.(jpeg|jpg|gif|png)$/) && (
                                    <p className="text-center text-gray-500 text-sm mt-2">
                                      Rasm yuklanmadi yoki noto'g'ri URL
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
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

                    {/* Pending Purchases Section */}
                    {pendingPurchases.length > 0 && (
                      <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                            Kutilayotgan xaridlar ({pendingPurchases.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {pendingPurchases.map((purchase: any) => {
                              const student = students.find(s => s.id === purchase.studentId);
                              const product = products.find(p => p.id === purchase.productId);
                              const medalsPaid = purchase.medalsPaid as { gold: number; silver: number; bronze: number };
                              
                              return (
                                <div
                                  key={purchase.id}
                                  className="bg-white p-4 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <h4 className="font-semibold text-gray-900">
                                          {student?.firstName} {student?.lastName}
                                        </h4>
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                          Kutilmoqda
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">
                                        Mahsulot: <span className="font-medium">{product?.name || "Noma'lum"}</span>
                                      </p>
                                      <div className="flex items-center space-x-3 text-sm">
                                        {medalsPaid.gold > 0 && (
                                          <div className="flex items-center space-x-1">
                                            <span className="text-yellow-500">🥇</span>
                                            <span className="font-medium">{medalsPaid.gold}</span>
                                          </div>
                                        )}
                                        {medalsPaid.silver > 0 && (
                                          <div className="flex items-center space-x-1">
                                            <span className="text-gray-500">🥈</span>
                                            <span className="font-medium">{medalsPaid.silver}</span>
                                          </div>
                                        )}
                                        {medalsPaid.bronze > 0 && (
                                          <div className="flex items-center space-x-1">
                                            <span className="text-orange-500">🥉</span>
                                            <span className="font-medium">{medalsPaid.bronze}</span>
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(purchase.purchaseDate).toLocaleString('uz-UZ')}
                                      </p>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                      <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => approvePurchaseMutation.mutate(purchase.id)}
                                        disabled={approvePurchaseMutation.isPending || rejectPurchaseMutation.isPending}
                                      >
                                        {approvePurchaseMutation.isPending ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <>
                                            <Check className="w-4 h-4 mr-1" />
                                            Tasdiqlash
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                          const reason = prompt("Rad etish sababi (ixtiyoriy):");
                                          rejectPurchaseMutation.mutate({ purchaseId: purchase.id, reason: reason || undefined });
                                        }}
                                        disabled={approvePurchaseMutation.isPending || rejectPurchaseMutation.isPending}
                                      >
                                        <X className="w-4 h-4 mr-1" />
                                        Rad etish
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
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
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-700">Medal narxi:</p>
                                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                                          <span>📦</span>
                                          <span className="font-medium">{(product as any).quantity || 0} dona</span>
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {product.medalCost && typeof product.medalCost === 'object' && (() => {
                                          const medals = product.medalCost as { gold: number; silver: number; bronze: number };
                                          const badges: JSX.Element[] = [];
                                          
                                          if (medals.gold > 0) {
                                            badges.push(
                                              <Badge key={`${product.id}-gold`} className="bg-yellow-100 text-yellow-800">
                                                🥇 {medals.gold}
                                              </Badge>
                                            );
                                          }
                                          if (medals.silver > 0) {
                                            badges.push(
                                              <Badge key={`${product.id}-silver`} className="bg-gray-100 text-gray-800">
                                                🥈 {medals.silver}
                                              </Badge>
                                            );
                                          }
                                          if (medals.bronze > 0) {
                                            badges.push(
                                              <Badge key={`${product.id}-bronze`} className="bg-orange-100 text-orange-800">
                                                🥉 {medals.bronze}
                                              </Badge>
                                            );
                                          }
                                          
                                          return badges;
                                        })() as JSX.Element[]}
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
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                    <Package className="w-16 h-16 text-gray-400" />
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
          </Tabs>
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
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Hafta kunlari</Label>
                <div className="space-y-2">
                  {dayScheduleOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-day-${option.value}`}
                        checked={groupForm.daySchedule === option.value}
                        onCheckedChange={(checked) => {
                          setGroupForm(prev => ({
                            ...prev,
                            daySchedule: checked ? option.value : ""
                          }));
                        }}
                      />
                      <Label
                        htmlFor={`edit-day-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Dars vaqtlari</Label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlotOptions.map((timeSlot) => (
                    <div key={timeSlot} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-time-${timeSlot}`}
                        checked={groupForm.timeSlots.includes(timeSlot)}
                        onCheckedChange={() => toggleTimeSlot(timeSlot)}
                      />
                      <Label
                        htmlFor={`edit-time-${timeSlot}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {timeSlot}
                      </Label>
                    </div>
                  ))}
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-product-image">Rasm URL</Label>
                <Input
                  id="edit-product-image"
                  value={productForm.image}
                  onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product-quantity">📦 Miqdori</Label>
                <Input
                  id="edit-product-quantity"
                  type="number"
                  min="0"
                  value={productForm.quantity}
                  onChange={(e) => setProductForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>
            
            {/* Image Preview */}
            {productForm.image && (
              <div className="space-y-2">
                <Label>Rasm ko'rinishi</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <img
                    src={productForm.image}
                    alt="Mahsulot rasm ko'rinishi"
                    className="w-full max-w-xs h-48 object-cover rounded-lg mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = 'block';
                    }}
                  />
                  {!productForm.image.match(/\.(jpeg|jpg|gif|png)$/) && (
                    <p className="text-center text-gray-500 text-sm mt-2">
                      Rasm yuklanmadi yoki noto'g'ri URL
                    </p>
                  )}
                </div>
              </div>
            )}
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

      {/* Teacher Profile Dialog */}
      <Dialog open={isTeacherProfileOpen} onOpenChange={setIsTeacherProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>O'qituvchi profili</DialogTitle>
          </DialogHeader>
          
          {teacherProfile.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Yuklanmoqda...</span>
            </div>
          ) : teacherProfile.error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Ma'lumotlarni yuklashda xatolik yuz berdi</p>
            </div>
          ) : teacherProfile.data ? (
            <div className="space-y-6">
              {/* Teacher Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Shaxsiy ma'lumotlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Ism-familiya</p>
                      <p className="font-medium">{teacherProfile.data.teacher.firstName} {teacherProfile.data.teacher.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{teacherProfile.data.teacher.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistika</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{teacherProfile.data.stats.totalGroups}</div>
                      <div className="text-sm text-gray-500">Jami guruhlar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{teacherProfile.data.stats.activeGroups}</div>
                      <div className="text-sm text-gray-500">Faol guruhlar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{teacherProfile.data.stats.completedGroups}</div>
                      <div className="text-sm text-gray-500">Tugatilgan guruhlar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{teacherProfile.data.stats.totalStudents}</div>
                      <div className="text-sm text-gray-500">Jami talabalar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{teacherProfile.data.stats.totalClasses}</div>
                      <div className="text-sm text-gray-500">Jami darslar</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Groups Tabs */}
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Faol guruhlar ({teacherProfile.data.stats.activeGroups})</TabsTrigger>
                  <TabsTrigger value="completed">Tugatilgan guruhlar ({teacherProfile.data.stats.completedGroups})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="space-y-4">
                  {teacherProfile.data.groups.active.length > 0 ? (
                    <div className="grid gap-4">
                      {teacherProfile.data.groups.active.map((group: any) => (
                        <Card key={group.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <h4 className="font-semibold">{group.name}</h4>
                                <p className="text-sm text-gray-600">{group.description}</p>
                                <div className="flex space-x-4 text-sm text-gray-500">
                                  <span>👥 {group.totalStudents} talaba</span>
                                  <span>📚 {group.totalClasses} dars</span>
                                  <span>📅 {new Date(group.assignedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCompleteTeacherGroup(group.teacherGroupId, true)}
                                disabled={completeGroupMutation.isPending}
                              >
                                {completeGroupMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Tugatish"
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Faol guruhlar yo'q</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="space-y-4">
                  {teacherProfile.data.groups.completed.length > 0 ? (
                    <div className="grid gap-4">
                      {teacherProfile.data.groups.completed.map((group: any) => (
                        <Card key={group.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <h4 className="font-semibold">{group.name}</h4>
                                <p className="text-sm text-gray-600">{group.description}</p>
                                <div className="flex space-x-4 text-sm text-gray-500">
                                  <span>👥 {group.totalStudents} talaba</span>
                                  <span>📚 {group.totalClasses} dars</span>
                                  <span>✅ {new Date(group.completedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCompleteTeacherGroup(group.teacherGroupId, false)}
                                disabled={completeGroupMutation.isPending}
                              >
                                {completeGroupMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Qayta faollashtirish"
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Tugatilgan guruhlar yo'q</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Create Attendance Dialog */}
      <Dialog open={isCreateAttendanceOpen} onOpenChange={setIsCreateAttendanceOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yangi davomat yaratish</DialogTitle>
            <p className="text-sm text-gray-600">
              {selectedGroupForAdmin && groups.find(g => g.id === selectedGroupForAdmin)?.name} guruhiga davomat yarating
            </p>
          </DialogHeader>
          <AdminAttendanceCreateForm 
            groupId={selectedGroupForAdmin}
            onClose={() => setIsCreateAttendanceOpen(false)}
            onSuccess={() => {
              setIsCreateAttendanceOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroupForAdmin, "attendance"] });
              toast({
                title: "Muvaffaqiyat",
                description: "Davomat yaratildi",
              });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog open={isEditAttendanceOpen} onOpenChange={setIsEditAttendanceOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Davomatni tahrirlash</DialogTitle>
            <p className="text-sm text-gray-600">
              {editingAttendance && `${new Date(editingAttendance.date).toLocaleDateString('uz-UZ')} sanasidagi davomatni o'zgartiring`}
            </p>
          </DialogHeader>
          {editingAttendance && (
            <AdminAttendanceEditForm 
              attendance={editingAttendance}
              onClose={() => {
                setIsEditAttendanceOpen(false);
                setEditingAttendance(null);
              }}
              onSuccess={() => {
                setIsEditAttendanceOpen(false);
                setEditingAttendance(null);
                queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroupForAdmin, "attendance"] });
                toast({
                  title: "Muvaffaqiyat",
                  description: "Davomat yangilandi",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Attendance Confirmation Dialog */}
      <Dialog open={isDeleteAttendanceOpen} onOpenChange={setIsDeleteAttendanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Davomatni o'chirish</DialogTitle>
            <p className="text-sm text-gray-600">
              Haqiqatan ham bu davomat yozuvini o'chirmoqchimisiz? Bu amal qaytarilmaydi.
            </p>
          </DialogHeader>
          {deletingAttendance && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">
                  Sana: {new Date(deletingAttendance.date).toLocaleDateString('uz-UZ')}
                </p>
                <p className="text-sm text-gray-600">
                  Guruh: {groups.find(g => g.id === selectedGroupForAdmin)?.name}
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteAttendanceOpen(false);
                    setDeletingAttendance(null);
                  }}
                >
                  Bekor qilish
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/attendance/${deletingAttendance.id}`, {
                        method: 'DELETE',
                      });
                      if (!response.ok) {
                        throw new Error('Failed to delete attendance');
                      }
                      toast({
                        title: "Muvaffaqiyat",
                        description: "Davomat yozuvi o'chirildi",
                      });
                      setIsDeleteAttendanceOpen(false);
                      setDeletingAttendance(null);
                      // Refresh attendance data
                      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroupForAdmin, "attendance"] });
                    } catch (error) {
                      toast({
                        title: "Xatolik",
                        description: "Davomatni o'chirishda xatolik yuz berdi",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  O'chirish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Generated Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">O'quvchi yaratildi!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 mb-3 text-center font-medium">
                Login va parol avtomatik yaratildi
              </p>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Login:</p>
                  <p className="text-lg font-mono font-bold text-gray-900">
                    {generatedCredentials?.login}
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Parol:</p>
                  <p className="text-lg font-mono font-bold text-gray-900">
                    {generatedCredentials?.password}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 text-center">
                ⚠️ Bu ma'lumotlarni saqlang! Ular qayta ko'rsatilmaydi.
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <Button 
              onClick={() => setShowCredentialsDialog(false)}
              className="bg-teens-blue hover:bg-blue-600 w-full"
            >
              Yopish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Admin Attendance Create Form Component
interface AdminAttendanceCreateFormProps {
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AdminAttendanceCreateForm({ groupId, onClose, onSuccess }: AdminAttendanceCreateFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceRecord, setAttendanceRecord] = useState<Record<string, AttendanceStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get group details and students
  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}`);
      if (!response.ok) throw new Error('Failed to fetch group');
      return response.json();
    },
    enabled: !!groupId,
  });

  // Initialize attendance record when group data loads
  useEffect(() => {
    if (group?.students) {
      const initialRecord: Record<string, AttendanceStatus> = {};
      group.students.forEach((gs: any) => {
        initialRecord[gs.student.id] = 'absent';
      });
      setAttendanceRecord(initialRecord);
    }
  }, [group]);

  const updateAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecord(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    if (!group) return;
    
    setIsSubmitting(true);
    try {
      const participants = Object.entries(attendanceRecord).map(([studentId, status]) => ({
        studentId,
        status
      }));

      const response = await fetch(`/api/groups/${groupId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          participants
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        // Enhanced error handling for medal limit issues
        if (error.issues && Array.isArray(error.issues)) {
          const issueDetails = error.issues.map((issue: any) => `• ${issue}`).join('\n');
          throw new Error(`${error.message}\n\nTafsilotlar:\n${issueDetails}`);
        }
        throw new Error(error.message || 'Failed to create attendance');
      }

      onSuccess();
    } catch (error) {
      toast({
        title: "Xatolik",
        description: error instanceof Error ? error.message : "Davomat yaratishda xatolik",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!group) {
    return <div className="flex justify-center p-4">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Date Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Sana</label>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {/* Students List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">O'quvchilar</label>
          <div className="text-sm text-gray-500">
            Keldi: {Object.values(attendanceRecord).filter(s => s === "arrived").length} | 
            Kech: {Object.values(attendanceRecord).filter(s => s === "late").length} | 
            Yo'q: {Object.values(attendanceRecord).filter(s => s === "absent").length}
          </div>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {group.students.map((groupStudent: any) => {
            const student = groupStudent.student;
            const status = attendanceRecord[student.id] || "absent";
            
            return (
              <div 
                key={student.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-white"
              >
                <div>
                  <h3 className="font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={status === "arrived" ? "default" : "outline"}
                    onClick={() => updateAttendance(student.id, "arrived")}
                    className={status === "arrived" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Keldi
                  </Button>
                  <Button
                    size="sm"
                    variant={status === "late" ? "default" : "outline"}
                    onClick={() => updateAttendance(student.id, "late")}
                    className={status === "late" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Kech
                  </Button>
                  <Button
                    size="sm"
                    variant={status === "absent" ? "default" : "outline"}
                    onClick={() => updateAttendance(student.id, "absent")}
                    className={status === "absent" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Yo'q
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
}

// Admin Attendance Edit Form Component
interface AdminAttendanceEditFormProps {
  attendance: any;
  onClose: () => void;
  onSuccess: () => void;
}

function AdminAttendanceEditForm({ attendance, onClose, onSuccess }: AdminAttendanceEditFormProps) {
  const [attendanceRecord, setAttendanceRecord] = useState<Record<string, AttendanceStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get group details
  const { data: group } = useQuery({
    queryKey: ['group', attendance.groupId],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${attendance.groupId}`);
      if (!response.ok) throw new Error('Failed to fetch group');
      return response.json();
    },
  });

  // Initialize attendance record with existing data
  useEffect(() => {
    if (attendance.participants) {
      const record: Record<string, AttendanceStatus> = {};
      attendance.participants.forEach((p: any) => {
        record[p.studentId] = p.status;
      });
      setAttendanceRecord(record);
    }
  }, [attendance]);

  const updateAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecord(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    if (!group) return;
    
    setIsSubmitting(true);
    try {
      const participants = Object.entries(attendanceRecord).map(([studentId, status]) => ({
        studentId,
        status
      }));

      const response = await fetch(`/api/attendance/${attendance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: attendance.groupId,
          date: attendance.date,
          participants
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        // Enhanced error handling for medal limit issues
        if (error.issues && Array.isArray(error.issues)) {
          const issueDetails = error.issues.map((issue: any) => `• ${issue}`).join('\n');
          throw new Error(`${error.message}\n\nTafsilotlar:\n${issueDetails}`);
        }
        throw new Error(error.message || 'Failed to update attendance');
      }

      onSuccess();
    } catch (error) {
      toast({
        title: "Xatolik",
        description: error instanceof Error ? error.message : "Davomatni yangilashda xatolik",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!group) {
    return <div className="flex justify-center p-4">Yuklanmoqda...</div>;
  }

  if (!group.students || !Array.isArray(group.students)) {
    return <div className="flex justify-center p-4">Bu guruhda talabalar topilmadi</div>;
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Date Display */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Sana</label>
        <div className="p-2 border rounded-lg bg-gray-50">
          {new Date(attendance.date).toLocaleDateString('uz-UZ')}
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">O'quvchilar</label>
          <div className="text-sm text-gray-500">
            Keldi: {Object.values(attendanceRecord).filter(s => s === "arrived").length} | 
            Kech: {Object.values(attendanceRecord).filter(s => s === "late").length} | 
            Yo'q: {Object.values(attendanceRecord).filter(s => s === "absent").length}
          </div>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {group.students.map((groupStudent: any) => {
            const student = groupStudent.student;
            const status = attendanceRecord[student.id] || "absent";
            
            return (
              <div 
                key={student.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-white"
              >
                <div>
                  <h3 className="font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={status === "arrived" ? "default" : "outline"}
                    onClick={() => updateAttendance(student.id, "arrived")}
                    className={status === "arrived" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Keldi
                  </Button>
                  <Button
                    size="sm"
                    variant={status === "late" ? "default" : "outline"}
                    onClick={() => updateAttendance(student.id, "late")}
                    className={status === "late" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Kech
                  </Button>
                  <Button
                    size="sm"
                    variant={status === "absent" ? "default" : "outline"}
                    onClick={() => updateAttendance(student.id, "absent")}
                    className={status === "absent" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Yo'q
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Yangilanmoqda..." : "Yangilash"}
        </Button>
      </div>
    </div>
  );
}
