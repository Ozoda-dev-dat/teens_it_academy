import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeUpdates } from "@/hooks/use-websocket";
import { 
  Award, 
  Medal,
  Star,
  Search,
  Users,
  Trophy,
  Plus,
  Minus
} from "lucide-react";
import type { User } from "@shared/schema";

export default function MedalManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { lastMessage } = useRealtimeUpdates();
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [medalForm, setMedalForm] = useState({ gold: 0, silver: 0, bronze: 0 });
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [isAwardingMedals, setIsAwardingMedals] = useState(false);
  const [celebrationMedals, setCelebrationMedals] = useState<Array<{type: string, count: number}>>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Queries
  const { data: students = [] } = useQuery<User[]>({
    queryKey: ["/api/students"],
    enabled: !!user,
  });

  const { data: stats } = useQuery<{
    totalStudents: number;
    activeGroups: number;
    totalMedals: { gold: number; silver: number; bronze: number };
  }>({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  // Real-time updates effect
  useEffect(() => {
    if (!lastMessage) return;

    const { type } = lastMessage;

    if (type === 'medal_awarded' || type === 'stats_updated') {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    }
  }, [lastMessage]);

  // Medal awarding mutation
  const awardMedalsMutation = useMutation({
    mutationFn: async ({ studentId, medalType, amount }: { studentId: string; medalType: string; amount: number }) => {
      const res = await apiRequest("POST", "/api/medals/award", { studentId, medalType, amount, reason: "Administrator tomonidan" });
      return await res.json();
    },
    onSuccess: (data, variables) => {
      setShowCelebration(true);
      setIsAwardingMedals(true);
      setCelebrationMedals([{ type: variables.medalType, count: variables.amount }]);
      
      // Hide celebration after animation
      setTimeout(() => {
        setShowCelebration(false);
        setIsAwardingMedals(false);
        setCelebrationMedals([]);
      }, 4000);
      
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsAwardModalOpen(false);
      setSelectedStudent(null);
      setMedalForm({ gold: 0, silver: 0, bronze: 0 });
      
      toast({ 
        title: "🎉 Tabriklaymiz!", 
        description: "Medallar muvaffaqiyatli berildi!" 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Xatolik", 
        description: error.message || "Medallarni berishda xatolik yuz berdi", 
        variant: "destructive" 
      });
    },
  });

  // Helper functions
  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAwardMedals = (type: 'gold' | 'silver' | 'bronze', amount: number) => {
    if (!selectedStudent || amount === 0) return;
    awardMedalsMutation.mutate({
      studentId: selectedStudent.id,
      medalType: type,
      amount: amount
    });
  };

  const adjustMedal = (type: 'gold' | 'silver' | 'bronze', increment: boolean) => {
    setMedalForm(prev => ({
      ...prev,
      [type]: Math.max(1, prev[type] + (increment ? 1 : -1))
    }));
  };

  const getMedalIcon = (type: string, size = 16) => {
    const color = type === 'gold' ? 'text-yellow-500' : 
                  type === 'silver' ? 'text-gray-400' : 'text-amber-600';
    return <Medal className={`w-${size/4} h-${size/4} ${color}`} />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-2xl border animate-in zoom-in-95">
            <div className="text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900">Tabriklaymiz!</h3>
              <div className="flex justify-center gap-4">
                {celebrationMedals.map((medal, index) => (
                  <div key={index} className="flex items-center gap-2 animate-bounce">
                    {getMedalIcon(medal.type, 24)}
                    <span className="text-lg font-semibold">+{medal.count}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-600">Yangi medallar berildi!</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medal Boshqaruvi</h1>
            <p className="text-gray-600">O'quvchilarga medallar bering</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        {stats && (
          <div className="flex gap-4">
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-yellow-500" />
                  <div className="text-right">
                    <p className="text-sm text-yellow-600">Oltin</p>
                    <p className="text-2xl font-bold text-yellow-700">{stats.totalMedals.gold}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-gray-400" />
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Kumush</p>
                    <p className="text-2xl font-bold text-gray-700">{stats.totalMedals.silver}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-amber-600" />
                  <div className="text-right">
                    <p className="text-sm text-amber-600">Bronza</p>
                    <p className="text-2xl font-bold text-amber-700">{stats.totalMedals.bronze}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="O'quvchi ismi yoki email orqali qidiring..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.map((student) => {
          const medals = student.medals as any || { gold: 0, silver: 0, bronze: 0 };
          return (
            <Card key={student.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="truncate">{student.firstName} {student.lastName}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAwardModal(student)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Award className="w-3 h-3" />
                  </Button>
                </CardTitle>
                <p className="text-sm text-gray-600 truncate">{student.email}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Medal className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-semibold">{medals.gold}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Medal className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold">{medals.silver}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Medal className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold">{medals.bronze}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Jami: {medals.gold + medals.silver + medals.bronze}
                  </Badge>
                </div>
                
                <Button
                  onClick={() => openAwardModal(student)}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <Award className="w-3 h-3 mr-2" />
                  Medal berish
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">O'quvchilar topilmadi</h3>
            <p className="text-gray-400">Qidiruv shartlaringizni o'zgartiring</p>
          </CardContent>
        </Card>
      )}

      {/* Award Medals Modal */}
      <Dialog open={isAwardModalOpen} onOpenChange={setIsAwardModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Medal berish
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                <p className="text-sm text-gray-600">{selectedStudent.email}</p>
              </div>

              <div className="space-y-4">
                {/* Gold Medals */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Medal className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="font-semibold">Oltin medal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => adjustMedal('gold', false)}><Minus className="w-3 h-3" /></Button>
                    <span className="w-8 text-center font-semibold">{medalForm.gold}</span>
                    <Button size="sm" variant="outline" onClick={() => adjustMedal('gold', true)}><Plus className="w-3 h-3" /></Button>
                    <div className="flex gap-1">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAwardMedals('gold', medalForm.gold)} disabled={awardMedalsMutation.isPending}><Plus className="w-4 h-4" /></Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleAwardMedals('gold', -medalForm.gold)} disabled={awardMedalsMutation.isPending}><Minus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>

                {/* Silver Medals */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Medal className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="font-semibold">Kumush medal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => adjustMedal('silver', false)}><Minus className="w-3 h-3" /></Button>
                    <span className="w-8 text-center font-semibold">{medalForm.silver}</span>
                    <Button size="sm" variant="outline" onClick={() => adjustMedal('silver', true)}><Plus className="w-3 h-3" /></Button>
                    <div className="flex gap-1">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAwardMedals('silver', medalForm.silver)} disabled={awardMedalsMutation.isPending}><Plus className="w-4 h-4" /></Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleAwardMedals('silver', -medalForm.silver)} disabled={awardMedalsMutation.isPending}><Minus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>

                {/* Bronze Medals */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Medal className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-semibold">Bronza medal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => adjustMedal('bronze', false)}><Minus className="w-3 h-3" /></Button>
                    <span className="w-8 text-center font-semibold">{medalForm.bronze}</span>
                    <Button size="sm" variant="outline" onClick={() => adjustMedal('bronze', true)}><Plus className="w-3 h-3" /></Button>
                    <div className="flex gap-1">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAwardMedals('bronze', medalForm.bronze)} disabled={awardMedalsMutation.isPending}><Plus className="w-4 h-4" /></Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleAwardMedals('bronze', -medalForm.bronze)} disabled={awardMedalsMutation.isPending}><Minus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsAwardModalOpen(false)}>Yopish</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}