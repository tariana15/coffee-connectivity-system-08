
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Loader2, PlusCircle, FileText, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newInvoice, setNewInvoice] = useState({
    number: "",
    date: format(new Date(), "yyyy-MM-dd"),
    amount: ""
  });
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load invoices from localStorage
    const loadInvoices = () => {
      try {
        const savedInvoices = localStorage.getItem("invoices");
        if (savedInvoices) {
          setInvoices(JSON.parse(savedInvoices));
        }
      } catch (error) {
        console.error("Error loading invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const handleAddInvoice = () => {
    if (!newInvoice.number || !newInvoice.date || !newInvoice.amount) {
      return;
    }

    const invoice: Invoice = {
      id: Date.now().toString(),
      number: newInvoice.number,
      date: newInvoice.date,
      amount: parseFloat(newInvoice.amount)
    };

    const updatedInvoices = [...invoices, invoice];
    setInvoices(updatedInvoices);
    
    // Save to localStorage
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    
    // Reset form
    setNewInvoice({
      number: "",
      date: format(new Date(), "yyyy-MM-dd"),
      amount: ""
    });
    
    toast({
      title: "Накладная добавлена",
      description: `Накладная #${invoice.number} успешно добавлена`,
    });
  };
  
  const handleDeleteInvoice = (id: string) => {
    setInvoiceToDelete(id);
  };
  
  const confirmDelete = () => {
    if (!invoiceToDelete) return;
    
    const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceToDelete);
    setInvoices(updatedInvoices);
    
    // Save to localStorage
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    
    // Reset delete state
    setInvoiceToDelete(null);
    
    toast({
      title: "Накладная удалена",
      description: "Накладная была успешно удалена",
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Накладные</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить накладную</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Номер накладной</Label>
                  <Input
                    id="number"
                    value={newInvoice.number}
                    onChange={(e) => setNewInvoice({ ...newInvoice, number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Дата поставки</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newInvoice.date}
                    onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Сумма поставки</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={handleAddInvoice}>
                  Сохранить
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Нет накладных</p>
            </div>
          ) : (
            invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Накладная #{invoice.number}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Дата:</p>
                      <p>{format(new Date(invoice.date), "dd.MM.yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Сумма:</p>
                      <p className="font-medium">{invoice.amount.toLocaleString()} ₽</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Накладная будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Invoices;
