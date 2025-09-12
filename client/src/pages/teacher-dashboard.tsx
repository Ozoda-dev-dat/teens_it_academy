import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, Award, BookOpen, LogOut, User, ClipboardCheck, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function TeacherDashboard() {
  const { user, logoutMutation } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [, setLocation] = useLocation();

  // Fetch teacher's assigned groups and data
  const { data: teacherData, isLoading } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/teachers/dashboard");
      if (!res.ok) throw new Error("Failed to fetch teacher data");
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
            <Card>
              <CardHeader>
                <CardTitle>Davomat boshqaruvi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <ClipboardCheck className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Davomat funksiyasi</h3>
                  <p className="text-gray-500 mb-4">
                    Davomat belgilash va kuzatish funksiyasi tez orada qo'shiladi
                  </p>
                </div>
              </CardContent>
            </Card>
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