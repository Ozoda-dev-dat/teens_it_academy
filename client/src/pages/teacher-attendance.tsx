import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Clock, Check, X, AlertTriangle, Save, CalendarX } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { isScheduledClassDay, getUzbekDayName } from "@shared/utils";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface GroupStudent {
  id: string;
  groupId: string;
  studentId: string;
  joinedAt: string;
  student: Student;
}

interface Group {
  id: string;
  name: string;
  description: string;
  schedule?: string[] | null;
  students: GroupStudent[];
}

type AttendanceStatus = "arrived" | "absent" | "late";

interface AttendanceRecord {
  [studentId: string]: AttendanceStatus;
}

export default function TeacherAttendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/teacher/attendance/:groupId");
  const queryClient = useQueryClient();

  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord>({});
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(15 * 60); // 15 minutes in seconds
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isTimeExpired, setIsTimeExpired] = useState<boolean>(false);

  const groupId = params?.groupId;

  // Fetch group details and students
  const { data: group, isLoading } = useQuery({
    queryKey: ["group-students", groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/students`);
      if (!res.ok) throw new Error("Failed to fetch group students");
      const students = await res.json();
      
      const groupRes = await fetch(`/api/groups/${groupId}`);
      if (!groupRes.ok) throw new Error("Failed to fetch group details");
      const groupData = await groupRes.json();
      
      return {
        ...groupData,
        students
      } as Group;
    },
    enabled: !!groupId,
  });

  // Check if attendance has already been marked today for this group
  const { 
    data: existingAttendance, 
    isLoading: isCheckingAttendance, 
    error: attendanceCheckError,
    refetch: refetchAttendanceCheck 
  } = useQuery({
    queryKey: ["today-attendance", groupId],
    queryFn: async () => {
      if (!groupId) return null;
      
      const res = await fetch(`/api/teachers/attendance?groupId=${groupId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to fetch attendance data" }));
        throw new Error(errorData.message || "Failed to fetch attendance data");
      }
      const attendanceList = await res.json();
      
      // Check if there's attendance for today using local date comparison
      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDay = today.getDate();
      
      const todayAttendance = attendanceList.find((attendance: any) => {
        const attendanceDate = new Date(attendance.date);
        const attendanceYear = attendanceDate.getFullYear();
        const attendanceMonth = attendanceDate.getMonth();
        const attendanceDay = attendanceDate.getDate();
        
        return attendanceYear === todayYear && 
               attendanceMonth === todayMonth && 
               attendanceDay === todayDay;
      });
      
      return todayAttendance || null;
    },
    enabled: !!groupId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const hasAttendanceToday = !!existingAttendance;
  const hasAttendanceCheckError = !!attendanceCheckError;

  // Check if today is a scheduled class day
  const today = new Date();
  const isClassDay = group ? isScheduledClassDay(group.schedule, today) : false;
  const todayName = getUzbekDayName(today);

  // Create attendance mutation
  const createAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: { groupId: string; participants: { studentId: string; status: AttendanceStatus }[]; date: Date }) => {
      const res = await fetch("/api/teachers/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to create attendance" }));
        throw new Error(errorData.message || "Failed to create attendance");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Davomat saqlandi",
        description: "O'quvchilar davomati muvaffaqiyatli belgilandi",
        variant: "default",
      });
      setLocation("/teacher");
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Davomat saqlanmadi",
        variant: "destructive",
      });
    },
  });

  // Update attendance mutation
  const updateAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: { attendanceId: string; groupId: string; participants: { studentId: string; status: AttendanceStatus }[]; date: Date }) => {
      const res = await fetch(`/api/teachers/attendance?attendanceId=${attendanceData.attendanceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: attendanceData.groupId,
          participants: attendanceData.participants,
          date: attendanceData.date
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to update attendance" }));
        throw new Error(errorData.message || "Failed to update attendance");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Davomat yangilandi",
        description: "O'quvchilar davomati muvaffaqiyatli yangilandi",
        variant: "default",
      });
      setLocation("/teacher");
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Davomat yangilanmadi",
        variant: "destructive",
      });
    },
  });

  // Timer countdown effect
  useEffect(() => {
    if (!isSessionActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimeExpired(true);
          setIsSessionActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Initialize attendance session (for new or editing existing)
  const startAttendanceSession = () => {
    const now = new Date();
    setSessionStartTime(now);
    setIsSessionActive(true);
    setTimeRemaining(15 * 60); // Reset to 15 minutes
    setIsTimeExpired(false);
    
    // Initialize attendance record
    const initialRecord: AttendanceRecord = {};
    if (existingAttendance && existingAttendance.participants) {
      // Pre-populate with existing attendance data
      const participants = existingAttendance.participants as Array<{studentId: string, status: AttendanceStatus}>;
      participants.forEach((participant) => {
        initialRecord[participant.studentId] = participant.status;
      });
      // For students not in existing attendance, mark as absent
      group?.students.forEach((gs) => {
        if (!(gs.student.id in initialRecord)) {
          initialRecord[gs.student.id] = "absent";
        }
      });
    } else {
      // Initialize all students as absent by default for new attendance
      group?.students.forEach((gs) => {
        initialRecord[gs.student.id] = "absent";
      });
    }
    setAttendanceRecord(initialRecord);

    toast({
      title: hasAttendanceToday ? "Davomat tahrirlash" : "Davomat boshlandi",
      description: "Sizda 15 daqiqa vaqt bor",
      variant: "default",
    });
  };

  // Update student attendance status
  const updateAttendance = (studentId: string, status: AttendanceStatus) => {
    if (!isSessionActive || isTimeExpired) {
      toast({
        title: "Vaqt tugadi",
        description: "Davomat belgilash vaqti tugagan",
        variant: "destructive",
      });
      return;
    }

    setAttendanceRecord(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Save attendance (create new or update existing)
  const saveAttendance = () => {
    if (!group || !sessionStartTime) return;

    // Create participants array with individual student statuses
    const participants = Object.entries(attendanceRecord).map(([studentId, status]) => ({
      studentId,
      status
    }));

    if (hasAttendanceToday && existingAttendance) {
      // Update existing attendance
      updateAttendanceMutation.mutate({
        attendanceId: existingAttendance.id,
        groupId: group.id,
        participants,
        date: sessionStartTime,
      });
    } else {
      // Create new attendance
      createAttendanceMutation.mutate({
        groupId: group.id,
        participants,
        date: sessionStartTime,
      });
    }
  };

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || isCheckingAttendance) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Guruh topilmadi</h2>
          <Button onClick={() => setLocation("/teacher")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/teacher")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Orqaga
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {group.name} - Davomat
                </h1>
                <p className="text-sm text-gray-500">
                  {group.students.length} o'quvchi
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isSessionActive && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  timeRemaining <= 300 ? 'bg-red-100 text-red-700' : 
                  timeRemaining <= 600 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-green-100 text-green-700'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{formatTime(timeRemaining)}</span>
                </div>
              )}
              {isTimeExpired && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Vaqt tugadi
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isSessionActive && !isTimeExpired ? (
          hasAttendanceCheckError ? (
            // Error checking attendance status
            <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span className="text-red-900">Davomat holatini tekshirishda xatolik</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <p className="text-red-800 mb-4">
                    Bugungi davomat holatini tekshirib bo'lmadi. Iltimos, qayta urinib ko'ring.
                  </p>
                  <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 text-red-900">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Xatolik:</span>
                    </div>
                    <p className="text-red-800 mt-1 text-sm">
                      {attendanceCheckError?.message || "Noma'lum xatolik yuz berdi"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={() => refetchAttendanceCheck()}
                    size="lg"
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isCheckingAttendance}
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    {isCheckingAttendance ? "Tekshirilmoqda..." : "Qayta urinish"}
                  </Button>
                  <Button 
                    onClick={() => setLocation("/teacher")}
                    size="lg"
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Orqaga
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : hasAttendanceToday ? (
            // Edit existing attendance for today
            <Card className="max-w-2xl mx-auto border-blue-200 bg-blue-50">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Check className="w-6 h-6 text-blue-600" />
                  <span className="text-blue-900">Bugungi davomat tahrirlash</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <p className="text-blue-800 mb-4">
                    Bu guruh uchun bugungi sana uchun davomat allaqachon belgilangan. Uni o'zgartirishingiz mumkin.
                  </p>
                  {existingAttendance && (
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
                      <div className="text-sm text-blue-700 space-y-1">
                        <p><span className="font-medium">Davomat vaqti:</span> {new Date(existingAttendance.date).toLocaleString('uz-UZ')}</p>
                        <p><span className="font-medium">Ishtirokchilar soni:</span> {Array.isArray(existingAttendance.participants) ? existingAttendance.participants.length : 0}</p>
                        {Array.isArray(existingAttendance.participants) && (
                          <div className="mt-2 text-xs">
                            <span>Keldi: {existingAttendance.participants.filter((p: any) => p.status === 'arrived').length} | </span>
                            <span>Kech keldi: {existingAttendance.participants.filter((p: any) => p.status === 'late').length} | </span>
                            <span>Yo'q: {existingAttendance.participants.filter((p: any) => p.status === 'absent').length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Diqqat!</span>
                    </div>
                    <p className="text-yellow-700 mt-1">
                      Davomat tahrirlashni boshlaganingizdan so'ng 15 daqiqa ichida tugatishingiz kerak.
                    </p>
                  </div>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={startAttendanceSession}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    Davomatni tahrirlash
                  </Button>
                  <Button 
                    onClick={() => setLocation("/teacher")}
                    size="lg"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Orqaga
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : !isClassDay ? (
            // Not a class day - show info message
            <Card className="max-w-2xl mx-auto border-orange-200 bg-orange-50">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <CalendarX className="w-6 h-6 text-orange-600" />
                  <span className="text-orange-900">Bugun dars kuni emas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <p className="text-orange-800 mb-4">
                    Bugun ({todayName}) bu guruh uchun dars kuni emas.
                  </p>
                  {group?.schedule && Array.isArray(group.schedule) && group.schedule.length > 0 && (
                    <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-2 text-orange-900 mb-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">Guruh jadvali:</span>
                      </div>
                      <div className="text-orange-800 space-y-1">
                        {group.schedule.map((scheduleItem, index) => (
                          <p key={index} className="text-sm">{scheduleItem}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Eslatma</span>
                    </div>
                    <p className="text-yellow-700 mt-1 text-sm">
                      Davomat faqat jadvalda belgilangan dars kunlarida belgilanishi mumkin.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setLocation("/teacher")}
                  size="lg"
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Orqaga
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Start attendance session
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Users className="w-6 h-6 text-green-600" />
                  <span>Davomat belgilash</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    Davomat belgilashni boshlash uchun tugmani bosing. Sizda 15 daqiqa vaqt bo'ladi.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Diqqat!</span>
                    </div>
                    <p className="text-yellow-700 mt-1">
                      Davomat belgilashni boshlaganingizdan so'ng 15 daqiqa ichida tugatishingiz kerak.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={startAttendanceSession}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Davomatni boshlash
                </Button>
              </CardContent>
            </Card>
          )
        ) : (
          // Attendance marking interface
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>O'quvchilar ro'yxati</span>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      Keldi: {Object.values(attendanceRecord).filter(s => s === "arrived").length} | 
                      Kech keldi: {Object.values(attendanceRecord).filter(s => s === "late").length} | 
                      Yo'q: {Object.values(attendanceRecord).filter(s => s === "absent").length}
                    </div>
                    {isSessionActive && (
                      <Button 
                        onClick={saveAttendance}
                        disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {hasAttendanceToday ? "Yangilash" : "Saqlash"}
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {group.students.map((groupStudent) => {
                    const student = groupStudent.student;
                    const status = attendanceRecord[student.id] || "absent";
                    
                    return (
                      <div 
                        key={student.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-white"
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
                            disabled={!isSessionActive || isTimeExpired}
                            className={status === "arrived" ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Keldi
                          </Button>
                          <Button
                            size="sm"
                            variant={status === "late" ? "default" : "outline"}
                            onClick={() => updateAttendance(student.id, "late")}
                            disabled={!isSessionActive || isTimeExpired}
                            className={status === "late" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Kech
                          </Button>
                          <Button
                            size="sm"
                            variant={status === "absent" ? "destructive" : "outline"}
                            onClick={() => updateAttendance(student.id, "absent")}
                            disabled={!isSessionActive || isTimeExpired}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Yo'q
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {isTimeExpired && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Davomat belgilash vaqti tugadi
                  </h3>
                  <p className="text-red-700 mb-4">
                    15 daqiqalik vaqt tugagan. Endi davomat belgilab bo'lmaydi.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={saveAttendance}
                      disabled={createAttendanceMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Joriy holatni saqlash
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/teacher")}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Orqaga
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
