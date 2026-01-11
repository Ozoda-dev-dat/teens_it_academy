import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Award, LogOut, Trophy, Medal, Star, TrendingUp } from "lucide-react";

export default function TeacherDashboard() {
  const { user, logoutMutation } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedMedalType, setSelectedMedalType] = useState<string>("");
  const [medalAmount, setMedalAmount] = useState<number>(1);
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["/api/students"],
    enabled: !!user,
  });

  const awardMedalMutation = useMutation({
    mutationFn: async ({ studentId, medalType, amount }: { studentId: string; medalType: string; amount: number }) => {
      const res = await fetch('/api/medals/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, medalType, amount, reason: "O'qituvchi tomonidan" })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({ title: "🎉 Medal berildi!" });
      setSelectedStudent("");
      setSelectedMedalType("");
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">O'qituvchi paneli</h1>
          <Button variant="ghost" onClick={() => logoutMutation.mutate()}><LogOut className="w-4 h-4 mr-2" /> Chiqish</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5" /> Medal berish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">O'quvchini tanlang</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'gold', name: 'Oltin', icon: Trophy, color: 'text-yellow-500' },
                { type: 'silver', name: 'Kumush', icon: Medal, color: 'text-gray-400' },
                { type: 'bronze', name: 'Bronza', icon: Star, color: 'text-orange-600' }
              ].map(m => (
                <Button
                  key={m.type}
                  variant={selectedMedalType === m.type ? "default" : "outline"}
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => setSelectedMedalType(m.type)}
                >
                  <m.icon className={`w-6 h-6 mb-1 ${m.color}`} />
                  <span className="text-xs">{m.name}</span>
                </Button>
              ))}
            </div>

            <Button 
              className="w-full h-12" 
              disabled={!selectedStudent || !selectedMedalType}
              onClick={() => awardMedalMutation.mutate({ studentId: selectedStudent, medalType: selectedMedalType, amount: medalAmount })}
            >
              Tasdiqlash
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}