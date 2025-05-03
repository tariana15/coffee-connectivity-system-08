
import React, { useState } from "react";
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
import { CalendarX, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { useNotifications } from "@/contexts/NotificationContext";

interface EmployeeShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  onRemoveShift: (date: Date) => void;
  onTransferShift: (oldDate: Date, newDate: Date) => void;
}

export const EmployeeShiftDialog: React.FC<EmployeeShiftDialogProps> = ({
  isOpen,
  onClose,
  currentDate,
  onRemoveShift,
  onTransferShift,
}) => {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [isTransferring, setIsTransferring] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);

  const handleRemoveShift = () => {
    onRemoveShift(currentDate);
    toast({
      title: "Смена удалена",
      description: `Смена на ${format(currentDate, "dd.MM.yyyy")} была успешно удалена.`,
    });
    
    addNotification({
      title: "Изменение графика",
      message: `Смена на ${format(currentDate, "dd.MM.yyyy")} была удалена.`,
      type: "info",
    });
    
    onClose();
  };

  const handleTransferShift = () => {
    if (!newDate) {
      toast({
        title: "Выберите дату",
        description: "Необходимо выбрать новую дату для переноса смены.",
        variant: "destructive",
      });
      return;
    }

    onTransferShift(currentDate, newDate);
    toast({
      title: "Смена перенесена",
      description: `Смена перенесена с ${format(currentDate, "dd.MM.yyyy")} на ${format(newDate, "dd.MM.yyyy")}.`,
    });
    
    addNotification({
      title: "Изменение графика",
      message: `Смена перенесена с ${format(currentDate, "dd.MM.yyyy")} на ${format(newDate, "dd.MM.yyyy")}.`,
      type: "info",
    });
    
    setIsTransferring(false);
    setNewDate(undefined);
    onClose();
  };

  const resetAndClose = () => {
    setIsTransferring(false);
    setNewDate(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Управление сменой</DialogTitle>
          <DialogDescription>
            {format(currentDate, "dd MMMM yyyy", { locale: require('date-fns/locale/ru') })}
          </DialogDescription>
        </DialogHeader>

        {!isTransferring ? (
          <div className="grid gap-4 py-4">
            <Button 
              onClick={() => setIsTransferring(true)} 
              className="flex items-center justify-center gap-2"
            >
              <CalendarClock className="h-4 w-4" />
              Перенести смену
            </Button>
            <Button 
              onClick={handleRemoveShift} 
              variant="destructive"
              className="flex items-center justify-center gap-2"
            >
              <CalendarX className="h-4 w-4" />
              Удалить смену
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Выберите новую дату для смены:
            </p>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                className="rounded-md border"
              />
            </div>
            <DialogFooter className="flex sm:justify-between">
              <Button variant="outline" onClick={() => setIsTransferring(false)}>
                Назад
              </Button>
              <Button onClick={handleTransferShift}>
                Подтвердить перенос
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
