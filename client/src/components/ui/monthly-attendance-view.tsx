import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Edit, Trash2, Calendar, Users, CheckCircle, XCircle, Clock, Minus } from "lucide-react";

type AttendanceStatus = 'arrived' | 'late' | 'absent' | 'no-record';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  attendance: Array<{
    day: number;
    status: AttendanceStatus;
    attendanceId: string | null;
    createdByRole?: string;
    updatedAt?: string;
    updatedByRole?: string;
  }>;
  statistics: {
    totalDays: number;
    present: number;
    late: number;
    absent: number;
    attendanceRate: number;
  };
}

interface MonthlyAttendanceData {
  year: number;
  month: number;
  groupId: string;
  students: Student[];
  totalDaysInMonth: number;
}

interface MonthlyAttendanceViewProps {
  groupId: string;
  initialDate?: Date;
}

export default function MonthlyAttendanceView({ groupId, initialDate = new Date() }: MonthlyAttendanceViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<any>(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Fetch monthly attendance data
  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ["monthly-attendance", groupId, year, month],
    queryFn: async (): Promise<MonthlyAttendanceData> => {
      const res = await fetch(`/api/attendance/monthly?groupId=${groupId}&year=${year}&month=${month}`);
      if (!res.ok) throw new Error("Failed to fetch monthly attendance");
      return res.json();
    },
    enabled: !!groupId,
  });

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Bulk edit mutation
  const bulkEditMutation = useMutation({
    mutationFn: async (updates: any[]) => {
      const res = await fetch('/api/attendance/bulk-edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error('Failed to bulk edit attendance');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-attendance", groupId, year, month] });
      setSelectedEntries([]);
      setBulkEditMode(false);
      toast({ title: "Bulk edit successful", description: "Attendance records updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Bulk edit failed", 
        description: error instanceof Error ? error.message : "Failed to update attendance records",
        variant: "destructive" 
      });
    },
  });

  // Single edit mutation
  const editMutation = useMutation({
    mutationFn: async (data: { attendanceId: string; participants: any[] }) => {
      const res = await fetch(`/api/attendance/${data.attendanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: data.participants }),
      });
      if (!res.ok) throw new Error('Failed to edit attendance');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-attendance", groupId, year, month] });
      setEditDialogOpen(false);
      setEditingAttendance(null);
      toast({ title: "Attendance updated", description: "Attendance record updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Update failed", 
        description: error instanceof Error ? error.message : "Failed to update attendance",
        variant: "destructive" 
      });
    },
  });

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'arrived': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'late': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-300" />;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'arrived': return 'bg-green-100 hover:bg-green-200 text-green-800';
      case 'late': return 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800';
      case 'absent': return 'bg-red-100 hover:bg-red-200 text-red-800';
      default: return 'bg-gray-100 hover:bg-gray-200 text-gray-500';
    }
  };

  const handleCellClick = (student: Student, day: number) => {
    const dayData = student.attendance[day - 1];
    if (dayData.attendanceId) {
      // Fetch full attendance record for editing
      setEditingAttendance({
        id: dayData.attendanceId,
        date: new Date(year, month - 1, day),
        students: monthlyData?.students || [],
        targetStudentId: student.id,
      });
      setEditDialogOpen(true);
    }
  };

  const handleBulkEdit = () => {
    // Implement bulk edit logic
    if (selectedEntries.length === 0) {
      toast({ title: "No entries selected", description: "Please select attendance entries to edit", variant: "destructive" });
      return;
    }
    // For demo purposes - in real implementation, you'd show a bulk edit dialog
    setBulkEditMode(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading monthly attendance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!monthlyData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No attendance data</h3>
            <p className="text-muted-foreground mb-4">No attendance records found for this month</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigateMonth('prev')}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Month
        </Button>
        
        <h2 className="text-2xl font-bold">
          {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        
        <Button 
          variant="outline" 
          onClick={() => navigateMonth('next')}
          className="flex items-center gap-2"
        >
          Next Month
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{monthlyData.students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                <p className="text-2xl font-bold">
                  {monthlyData.students.length > 0 
                    ? Math.round(monthlyData.students.reduce((sum, s) => sum + s.statistics.attendanceRate, 0) / monthlyData.students.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Days in Month</p>
                <p className="text-2xl font-bold">{monthlyData.totalDaysInMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Records</p>
                <p className="text-2xl font-bold">
                  {monthlyData.students.reduce((sum, s) => sum + s.statistics.totalDays, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedEntries.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{selectedEntries.length} entries selected</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleBulkEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedEntries([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Calendar header with days */}
              <div className="grid grid-cols-32 gap-1 mb-4">
                <div className="font-semibold text-center py-2 sticky left-0 bg-background">Student</div>
                {Array.from({length: monthlyData.totalDaysInMonth}, (_, i) => (
                  <div key={i} className="font-semibold text-center text-sm py-2 min-w-[40px]">
                    {i + 1}
                  </div>
                ))}
              </div>
              
              {/* Student rows */}
              <div className="space-y-2">
                {monthlyData.students.map(student => (
                  <div key={student.id} className="grid grid-cols-32 gap-1 items-center">
                    {/* Student name column */}
                    <div className="sticky left-0 bg-background pr-4">
                      <div className="text-sm font-medium truncate">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">{student.statistics.attendanceRate}%</Badge>
                        <Badge variant="outline" className="text-xs">{student.statistics.present}P</Badge>
                        <Badge variant="outline" className="text-xs">{student.statistics.late}L</Badge>
                        <Badge variant="outline" className="text-xs">{student.statistics.absent}A</Badge>
                      </div>
                    </div>
                    
                    {/* Attendance cells */}
                    {student.attendance.map((dayData, dayIndex) => (
                      <button
                        key={dayIndex}
                        onClick={() => handleCellClick(student, dayData.day)}
                        className={`
                          min-w-[40px] h-10 rounded flex items-center justify-center transition-colors
                          ${getStatusColor(dayData.status)}
                          ${dayData.attendanceId ? 'cursor-pointer' : 'cursor-default'}
                          ${selectedEntries.includes(dayData.attendanceId || '') ? 'ring-2 ring-blue-500' : ''}
                        `}
                        disabled={!dayData.attendanceId}
                      >
                        {getStatusIcon(dayData.status)}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance Entry</DialogTitle>
          </DialogHeader>
          
          {editingAttendance && (
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={editingAttendance.date.toISOString().split('T')[0]}
                  disabled
                />
              </div>
              
              <div>
                <Label>Student Status</Label>
                <Select defaultValue="arrived">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arrived">Present</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => {}}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
