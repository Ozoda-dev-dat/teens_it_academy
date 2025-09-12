import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, Award, BookOpen, LogOut, User, ClipboardCheck, ArrowRight, UserCheck, UserX, Clock } from "lucide-react";
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
            <p className="text-sm text-gray-500">{group.studentCount || 0} o'quvchi</p>
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

export default function TeacherDashboard() {
  const { user, logoutMutation } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [, setLocation] = useLocation();

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
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">O'qituvchi Dashboard</h1>
                <p className="text-sm text-gray-500">Teens IT Academy</p>
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
                              {group.studentCount || 0} o'quvchi
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
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
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
            <Card>
              <CardHeader>
                <CardTitle>Medal berish</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Award className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Medal berish funksiyasi</h3>
                  <p className="text-gray-500 mb-4">
                    O'quvchilarga medal berish funksiyasi tez orada qo'shiladi
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}