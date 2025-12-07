import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealtimeUpdates } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Users, Calendar, Award, BookOpen, LogOut, User, ClipboardCheck, ArrowRight, UserCheck, UserX, Clock, Medal, Trophy, Star, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

interface AttendanceRecord {
  id: string;
  date: string;
  participants: Array<{
    studentId: string;
    status: 'arrived' | 'late' | 'absent';
  }>;
}

function AttendanceGroupCard({ group, onMarkAttendance }: { group: any; onMarkAttendance: () => void }) {
  const { data: attendanceHistory, isLoading: attendanceLoading, error: attendanceError } = useQuery<AttendanceRecord[]>({
    queryKey: ["group-attendance", group.id],
    queryFn: async () => {
      const res = await fetch(`/api/teachers/attendance?groupId=${group.id}`, {
        credentials: "include"
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error("Bu guruhni ko'rish huquqingiz yo'q");
        if (res.status === 404) throw new Error("Guruh topilmadi");
        throw new Error("Davomat ma'lumotlarini yuklashda xatolik");
      }
      const data = await res.json();
      // Ensure data is sorted by date descending (most recent first)
      return data.sort((a: AttendanceRecord, b: AttendanceRecord) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const getAttendanceStats = (participants: AttendanceRecord['participants']) => {
    const arrived = participants.filter(p => p.status === 'arrived').length;
    const late = participants.filter(p => p.status === 'late').length;
    const absent = participants.filter(p => p.status === 'absent').length;
    return { arrived, late, absent };
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <p className="text-sm text-gray-500">{group.totalStudents || 0} o'quvchi</p>
          </div>
          <Button onClick={onMarkAttendance} size="sm" className="bg-green-600 hover:bg-green-700">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Davomat belgilash
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">So'nggi davomatlar</h4>
          {attendanceLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            </div>
          ) : attendanceError ? (
            <div className="text-center py-4">
              <div className="text-red-500 text-sm mb-2">
                {attendanceError.message || "Ma'lumotlarni yuklashda xatolik"}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                Qayta urinish
              </Button>
            </div>
          ) : attendanceHistory && attendanceHistory.length > 0 ? (
            <div className="space-y-2">
              {attendanceHistory.slice(0, 3).map((record) => {
                const stats = getAttendanceStats(record.participants);
                return (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{formatDate(record.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <UserCheck className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">{stats.arrived}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs text-yellow-600">{stats.late}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserX className="w-3 h-3 text-red-600" />
                        <span className="text-xs text-red-600">{stats.absent}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {attendanceHistory.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  +{attendanceHistory.length - 3} ta yana davomat
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <ClipboardCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Hali davomat belgilanmagan</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Medal giving component with animations
function MedalGivingSection({ teacherData }: { teacherData: any }) {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedMedalType, setSelectedMedalType] = useState<string>("");
  const [medalAmount, setMedalAmount] = useState<number>(1);
  const [isAwarding, setIsAwarding] = useState(false);
  const [animatingMedal, setAnimatingMedal] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get all students from teacher's groups
  const { data: allStudents, isLoading: studentsLoading } = useQuery({
    queryKey: ["teacher-students", teacherData?.groups],
    queryFn: async () => {
      if (!teacherData?.groups || teacherData.groups.length === 0) return [];
      
      const students: any[] = [];
      for (const group of teacherData.groups) {
        const res = await fetch(`/api/groups/${group.id}/students`, {
          credentials: "include"
        });
        if (res.ok) {
          const groupStudents = await res.json();
          if (groupStudents && Array.isArray(groupStudents)) {
            groupStudents.forEach((gs: any) => {
              if (!students.find(s => s.id === gs.student.id)) {
                students.push({
                  ...gs.student,
                  groupName: group.name
                });
              }
            });
          }
        }
      }
      return students;
    },
    enabled: !!teacherData?.groups
  });

  const awardMedalMutation = useMutation({
    mutationFn: async ({ studentId, medalType, amount }: { studentId: string; medalType: string; amount: number }) => {
      const res = await fetch('/api/teachers/medals/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId,
          medalType,
          amount
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to award medal');
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      // Start animation
      setAnimatingMedal(variables.medalType);
      
      // Show success toast
      const medalNames = { gold: "Oltin", silver: "Kumush", bronze: "Bronza" };
      const studentName = allStudents?.find(s => s.id === variables.studentId)?.firstName;
      
      toast({
        title: "🎉 Medal berildi!",
        description: `${studentName}ga ${variables.amount} ta ${medalNames[variables.medalType as keyof typeof medalNames]} medal berildi`,
      });

      // Clear animation after delay
      setTimeout(() => {
        setAnimatingMedal(null);
      }, 2000);

      // Add optimistic update to instantly reflect the change
      const studentData = allStudents?.find(s => s.id === variables.studentId);
      if (studentData && teacherData?.groups) {
        queryClient.setQueryData(["teacher-students", teacherData?.groups], (old: any[]) => {
          if (!old) return old;
          return old.map(student => {
            if (student.id === variables.studentId) {
              const currentMedals = student.medals || { gold: 0, silver: 0, bronze: 0 };
              return {
                ...student,
                medals: {
                  ...currentMedals,
                  [variables.medalType]: currentMedals[variables.medalType] + variables.amount
                }
              };
            }
            return student;
          });
        });
      }
      
      // Reset form
      setSelectedStudent("");
      setSelectedMedalType("");
      setMedalAmount(1);
      setIsAwarding(false);
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error.message || "Medal berishda xatolik yuz berdi",
        variant: "destructive"
      });
      setIsAwarding(false);
    }
  });

  const handleAwardMedal = () => {
    if (!selectedStudent || !selectedMedalType) {
      toast({
        title: "Ma'lumot yetishmayapti",
        description: "O'quvchi va medal turini tanlang",
        variant: "destructive"
      });
      return;
    }

    setIsAwarding(true);
    awardMedalMutation.mutate({
      studentId: selectedStudent,
      medalType: selectedMedalType,
      amount: medalAmount
    });
  };

  const getMedalColor = (type: string) => {
    switch (type) {
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'bronze': return 'from-orange-400 to-orange-600';
      default: return '';
    }
  };

  if (studentsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medal berish</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Medal berish
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">O'quvchini tanlang</label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="O'quvchini tanlang" />
              </SelectTrigger>
              <SelectContent>
                {allStudents?.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{student.firstName} {student.lastName}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs font-medium text-yellow-600">
                          🥇 {student.medals?.gold || 0}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          🥈 {student.medals?.silver || 0}
                        </span>
                        <span className="text-xs font-medium text-orange-600">
                          🥉 {student.medals?.bronze || 0}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Medal Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Medal turini tanlang</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'gold', name: 'Oltin', icon: Trophy, color: 'yellow' },
                { type: 'silver', name: 'Kumush', icon: Medal, color: 'gray' },
                { type: 'bronze', name: 'Bronza', icon: Star, color: 'orange' }
              ].map(({ type, name, icon: Icon, color }) => (
                <Button
                  key={type}
                  variant={selectedMedalType === type ? "default" : "outline"}
                  className={`relative h-16 ${
                    selectedMedalType === type 
                      ? `bg-gradient-to-br ${getMedalColor(type)} text-white border-0` 
                      : 'hover:bg-gray-50'
                  } ${
                    animatingMedal === type 
                      ? 'animate-bounce transform scale-110' 
                      : ''
                  } transition-all duration-300`}
                  onClick={() => setSelectedMedalType(type)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon className={`w-6 h-6 ${
                      selectedMedalType === type 
                        ? 'text-white' 
                        : color === 'yellow' ? 'text-yellow-500' 
                        : color === 'gray' ? 'text-gray-400'
                        : 'text-orange-600'
                    }`} />
                    <span className="text-xs font-medium">{name}</span>
                  </div>
                  {animatingMedal === type && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center animate-ping">
                        <Icon className="w-4 h-4 text-yellow-500" />
                      </div>
                    </div>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Medal Amount Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Medal soni</label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMedalAmount(Math.max(1, medalAmount - 1))}
                disabled={medalAmount <= 1}
                className="h-10 w-10 p-0"
              >
                -
              </Button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={medalAmount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= 5) {
                      setMedalAmount(value);
                    }
                  }}
                  min="1"
                  max="5"
                  className="w-full text-center text-lg font-semibold border rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMedalAmount(Math.min(5, medalAmount + 1))}
                disabled={medalAmount >= 5}
                className="h-10 w-10 p-0"
              >
                +
              </Button>
            </div>
            <p className="text-xs text-gray-500">1 dan 5 gacha medal berish mumkin</p>
          </div>

          {/* Award Button */}
          <Button
            onClick={handleAwardMedal}
            disabled={!selectedStudent || !selectedMedalType || isAwarding}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
          >
            {isAwarding ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Medal berilmoqda...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                {medalAmount > 1 ? `${medalAmount} ta medal berish` : "Medal berish"}
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Students List with Current Medals */}
      {allStudents && allStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>O'quvchilar ro'yxati</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="font-medium">{student.firstName} {student.lastName}</div>
                    <div className="text-sm text-gray-500">{student.groupName}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-yellow-600">
                      🥇 {student.medals?.gold || 0}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      🥈 {student.medals?.silver || 0}
                    </span>
                    <span className="text-xs font-medium text-orange-600">
                      🥉 {student.medals?.bronze || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!allStudents || allStudents.length === 0) && !studentsLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">O'quvchilar topilmadi</h3>
            <p className="text-gray-500">
              Medal berish uchun sizga o'quvchilari bor guruhlar tayinlanishi kerak
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Student Rankings Component
function StudentRankings() {
  const { data: rankings, isLoading, error } = useQuery({
    queryKey: ["teacher-rankings"],
    queryFn: async () => {
      const res = await fetch("/api/teachers/rankings", {
        credentials: "include"
      });
      if (!res.ok) {
        throw new Error("Failed to fetch rankings");
      }
      return res.json();
    },
  });

  const getMedalScore = (medals: { gold?: number; silver?: number; bronze?: number }) => {
    return (medals?.gold || 0) * 3 + (medals?.silver || 0) * 2 + (medals?.bronze || 0);
  };

  const RankingCard = ({ title, students, periodKey }: { 
    title: string; 
    students: any[]; 
    periodKey: 'weeklyMedals' | 'monthlyMedals' | 'medals';
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students && students.length > 0 ? (
          <div className="space-y-3">
            {students.map((student, index) => {
              const medals = student[periodKey] || student.medals || { gold: 0, silver: 0, bronze: 0 };
              const totalScore = getMedalScore(medals);
              
              return (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    index === 0 
                      ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      index === 0 
                        ? 'bg-yellow-500 text-white'
                        : index === 1
                        ? 'bg-gray-400 text-white'
                        : index === 2
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Jami ball: {totalScore}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {medals.gold > 0 && (
                      <span className="text-xs font-medium text-yellow-600 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {medals.gold}
                      </span>
                    )}
                    {medals.silver > 0 && (
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        <Medal className="w-3 h-3" />
                        {medals.silver}
                      </span>
                    )}
                    {medals.bronze > 0 && (
                      <span className="text-xs font-medium text-orange-600 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {medals.bronze}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">Hali ma'lumot yo'q</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-red-500">Reytingni yuklashda xatolik</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <RankingCard 
        title="Bu hafta eng yaxshi o'quvchilar" 
        students={rankings?.weeklyTop || []}
        periodKey="weeklyMedals"
      />
      <RankingCard 
        title="Bu oy eng yaxshi o'quvchilar" 
        students={rankings?.monthlyTop || []}
        periodKey="monthlyMedals"
      />
      <RankingCard 
        title="Barcha vaqt bo'yicha eng yaxshilar" 
        students={rankings?.allTimeTop || []}
        periodKey="medals"
      />
    </div>
  );
}

export default function TeacherDashboard() {
  const { user, logoutMutation } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [, setLocation] = useLocation();
  const { lastMessage, isConnected } = useRealtimeUpdates();
  const queryClient = useQueryClient();

  // Real-time updates effect
  useEffect(() => {
    if (!lastMessage) return;

    const { type, data } = lastMessage;

    // Handle real-time updates for teacher dashboard
    switch (type) {
      case 'attendance_created':
        // Refresh attendance data for the affected group
        queryClient.invalidateQueries({ queryKey: ["group-attendance", data.groupId] });
        queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
        toast({
          title: "Davomat yangilandi",
          description: "Yangi davomat yozuvi qo'shildi",
        });
        break;

      case 'attendance_updated':
        queryClient.invalidateQueries({ queryKey: ["group-attendance", data.groupId] });
        queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
        break;

      case 'medal_awarded':
        // Update teacher's student data directly with new totals for immediate display
        if (data.studentId && data.totals && teacherData?.groups) {
          queryClient.setQueryData(["teacher-students", teacherData?.groups], (old: any[]) => {
            if (!old) return old;
            return old.map(student => 
              student.id === data.studentId 
                ? { ...student, medals: data.totals }
                : student
            );
          });
          
          // Show a toast notification
          const medalTypesAwarded = Object.entries(data.delta as {gold: number, silver: number, bronze: number})
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => `${count} ${type === 'gold' ? 'oltin' : type === 'silver' ? 'kumush' : 'bronza'}`)
            .join(', ');
          
          if (medalTypesAwarded) {
            toast({
              title: "🎉 Medal berildi!",
              description: `${data.awardedByName || 'O\'qituvchi'} tomonidan ${medalTypesAwarded} medal berildi`,
            });
          }
        }
        
        // Also refresh dashboard data
        queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
        break;

      case 'user_created':
        if (data.role === 'student') {
          queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
          queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
        }
        break;

      case 'group_created':
      case 'group_updated':
        queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
        break;

      case 'stats_updated':
        queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
        break;
    }
  }, [lastMessage, queryClient]);

  // Fetch teacher's assigned groups and data
  const { data: teacherData, isLoading, error } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/teachers/dashboard", {
        credentials: "include"
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Authentication required");
        }
        throw new Error("Failed to fetch teacher data");
      }
      return res.json();
    },
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleGroupClick = (groupId: string) => {
    setLocation(`/teacher/attendance/${groupId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (error?.message === "Authentication required") {
    setLocation("/teacher/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10">
                <img 
                  src="/teens-it-logo.png" 
                  alt="Teens IT School Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">O'qituvchi Dashboard</h1>
                <p className="text-sm text-gray-500">Teens IT School</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Chiqish
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Umumiy</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Guruhlar</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <ClipboardCheck className="w-4 h-4" />
              <span>Davomat</span>
            </TabsTrigger>
            <TabsTrigger value="medals" className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Medalllar</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Guruhlarim</p>
                      <p className="text-2xl font-bold">{teacherData?.groups?.length || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Jami o'quvchilar</p>
                      <p className="text-2xl font-bold">{teacherData?.totalStudents || 0}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Bugungi davomat</p>
                      <p className="text-2xl font-bold">{teacherData?.todayAttendance || 0}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Berilgan medallar</p>
                      <p className="text-2xl font-bold">{teacherData?.medalsGiven || 0}</p>
                    </div>
                    <Award className="w-8 h-8 text-yellow-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mening guruhlarim</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teacherData?.groups?.length ? (
                      teacherData.groups.map((group: any) => (
                        <div 
                          key={group.id} 
                          onClick={() => handleGroupClick(group.id)}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div>
                            <h4 className="font-medium">{group.name}</h4>
                            <p className="text-sm text-gray-500">{group.description || "Tavsif yo'q"}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                              {group.totalStudents || 0} o'quvchi
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Sizga hali guruhlar tayinlanmagan</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>So'nggi faoliyat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teacherData?.recentActivity?.length ? (
                      teacherData.recentActivity.map((activity: any, index: number) => (
                        <div key={activity.id || `activity-${index}`} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Hech qanday faoliyat mavjud emas</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student Rankings Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">O'quvchilar reytingi</h2>
              <StudentRankings />
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mening guruhlarim</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teacherData?.groups?.length ? (
                    teacherData.groups.map((group: any) => (
                      <Card 
                        key={group.id} 
                        className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleGroupClick(group.id)}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold text-lg">{group.name}</h3>
                              <p className="text-sm text-gray-600">{group.description || "Tavsif yo'q"}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">
                                {group.studentCount || 0} o'quvchi
                              </Badge>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" className="pointer-events-none">
                                  Davomat
                                </Button>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Users className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Guruhlar topilmadi</h3>
                      <p className="text-gray-500">Sizga hali guruhlar tayinlanmagan</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teacherData?.groups?.map((group: any) => (
                <AttendanceGroupCard 
                  key={group.id} 
                  group={group} 
                  onMarkAttendance={() => handleGroupClick(group.id)} 
                />
              ))}
              {(!teacherData?.groups || teacherData.groups.length === 0) && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="text-center py-12">
                      <ClipboardCheck className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Guruhlar topilmadi</h3>
                      <p className="text-gray-500">
                        Davomat belgilash uchun sizga guruhlar tayinlanishi kerak
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Medals Tab */}
          <TabsContent value="medals" className="space-y-6">
            <MedalGivingSection teacherData={teacherData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
