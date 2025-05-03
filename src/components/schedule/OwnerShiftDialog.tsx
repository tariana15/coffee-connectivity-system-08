
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Check, Users } from "lucide-react";
import { format } from "date-fns";
import { useNotifications } from "@/contexts/NotificationContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Employee } from "@/types/schedule";

interface OwnerShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onAssignShifts: (employeeId: number, dates: Date[], shiftType: 'full' | 'half') => void;
}

export const OwnerShiftDialog: React.FC<OwnerShiftDialogProps> = ({
  isOpen,
  onClose,
  employees,
  onAssignShifts,
}) => {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [shiftType, setShiftType] = useState<'full' | 'half'>('full');

  // Get the current shift days for the selected employee
  const getEmployeeShiftDays = (employeeId: number): number[] => {
    if (!employeeId) return [];
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return [];
    
    return employee.shifts.map(shift => shift.date);
  };

  // Effect to highlight existing shifts when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      // Clear any previously selected dates
      setSelectedDates([]);
    }
  }, [selectedEmployee]);

  const handleAssignShifts = () => {
    if (!selectedEmployee) {
      toast({
        title: "Выберите сотрудника",
        description: "Необходимо выбрать сотрудника для назначения смен.",
        variant: "destructive",
      });
      return;
    }

    if (selectedDates.length === 0) {
      toast({
        title: "Выберите даты",
        description: "Необходимо выбрать хотя бы одну дату для назначения смены.",
        variant: "destructive",
      });
      return;
    }

    onAssignShifts(selectedEmployee, selectedDates, shiftType);
    
    const employeeName = employees.find(e => e.id === selectedEmployee)?.name || '';
    toast({
      title: "Смены назначены",
      description: `${selectedDates.length} смен назначено для ${employeeName}.`,
    });
    
    addNotification({
      title: "Назначение смен",
      message: `${selectedDates.length} смен назначено для ${employeeName}.`,
      type: "info",
    });
    
    resetAndClose();
  };

  const resetAndClose = () => {
    setSelectedEmployee(null);
    setSelectedDates([]);
    setShiftType('full');
    onClose();
  };

  // Helper to determine if a date should be highlighted
  const isEmployeeShiftDate = (date: Date): boolean => {
    if (!selectedEmployee) return false;
    
    const employeeShiftDays = getEmployeeShiftDays(selectedEmployee);
    return employeeShiftDays.includes(date.getDate());
  };

  // Custom day renderer for the calendar
  const renderDay = (day: Date) => {
    const isEmployeeShift = isEmployeeShiftDate(day);
    
    return (
      <div 
        className={`relative h-9 w-9 p-0 font-normal flex items-center justify-center rounded-md
          ${isEmployeeShift ? 'bg-coffee-purple bg-opacity-20 border border-coffee-purple' : ''}`}
      >
        {day.getDate()}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Назначение смен</DialogTitle>
          <DialogDescription>
            Выберите сотрудника и даты для назначения смен
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Выберите сотрудника:</h3>
            <div className="grid gap-2">
              {employees.map((employee) => (
                <div 
                  key={employee.id}
                  className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${
                    selectedEmployee === employee.id ? "border-primary bg-primary/10" : ""
                  }`}
                  onClick={() => setSelectedEmployee(employee.id)}
                >
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                    <span>{employee.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({employee.shifts.length} смен)
                    </span>
                  </div>
                  {selectedEmployee === employee.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Тип смены:</h3>
            <RadioGroup 
              value={shiftType} 
              onValueChange={(value) => setShiftType(value as 'full' | 'half')}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full">Полный день</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="half" id="half" />
                <Label htmlFor="half">Пол дня</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Выберите даты смен:</h3>
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => dates && setSelectedDates(dates)}
              className="rounded-md border"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={resetAndClose} className="w-full sm:w-auto">
            Отмена
          </Button>
          <Button onClick={handleAssignShifts} className="w-full sm:w-auto">
            Подтвердить смены
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
