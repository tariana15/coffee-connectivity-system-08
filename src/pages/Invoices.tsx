
import React, { useState, useEffect, useRef } from "react";
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2, PlusCircle, FileText, Trash2, Camera, Upload, FilePlus2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { recognizeInvoiceFromImage } from "@/services/ocrService";

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  items?: InvoiceItem[];
  verified: boolean;
}

interface InvoiceItem {
  name: string;
  category: string;
  quantity: number;
  price: number;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    number?: string;
    date?: string;
    amount?: string;
    items?: InvoiceItem[];
  } | null>(null);
  const [showOcrDialog, setShowOcrDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
      amount: parseFloat(newInvoice.amount),
      verified: false,
      items: ocrResult?.items || []
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
    setOcrResult(null);
    
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите файл",
        variant: "destructive"
      });
      return;
    }

    setIsRecognizing(true);
    try {
      const result = await recognizeInvoiceFromImage(selectedFile);
      setOcrResult(result);
      
      // Автоматически заполняем форму распознанными данными
      if (result) {
        setNewInvoice({
          number: result.number || "",
          date: result.date || format(new Date(), "yyyy-MM-dd"),
          amount: result.amount || ""
        });
      }
      
      setShowOcrDialog(true);
    } catch (error) {
      console.error("OCR error:", error);
      toast({
        title: "Ошибка распознавания",
        description: "Не удалось распознать данные из изображения",
        variant: "destructive"
      });
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const exportToCsv = () => {
    if (invoices.length === 0) {
      toast({
        title: "Нет данных",
        description: "Нет накладных для экспорта",
      });
      return;
    }

    // Создаем заголовок CSV
    let csvContent = "Номер,Дата,Сумма\n";
    
    // Добавляем данные
    invoices.forEach(invoice => {
      const formattedDate = format(new Date(invoice.date), "dd.MM.yyyy");
      csvContent += `${invoice.number},${formattedDate},${invoice.amount.toFixed(2)}\n`;
    });
    
    // Создаем ссылку для скачивания
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Экспорт выполнен",
      description: "Данные накладных успешно экспортированы в CSV",
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
      <div className="container mx-auto py-2">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h1 className="text-xl md:text-2xl font-bold">Накладные</h1>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={exportToCsv}>
              <FilePlus2 className="mr-2 h-4 w-4" />
              Экспорт CSV
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Добавить
                </Button>
              </DialogTrigger>
              <DialogContent className={isMobile ? "w-[95%] max-w-md" : ""}>
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
                  
                  <div className="flex flex-col space-y-2">
                    <Label>Распознать из изображения</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="button" 
                        onClick={handleCameraCapture}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Камера
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Загрузить фото
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        capture={isMobile ? "environment" : undefined}
                      />
                    </div>
                    {selectedFile && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {selectedFile.name}
                        </span>
                        <Button 
                          size="sm" 
                          disabled={isRecognizing} 
                          onClick={handleFileUpload}
                        >
                          {isRecognizing ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Распознать
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <Button className="w-full" onClick={handleAddInvoice}>
                    Сохранить
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Нет накладных</p>
            </div>
          ) : (
            <div className={isMobile ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                    
                    {invoice.items && invoice.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Позиции ({invoice.items.length}):</p>
                        <div className="max-h-32 overflow-y-auto">
                          <Table className="text-xs">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="p-1">Название</TableHead>
                                <TableHead className="p-1 text-right">Кол-во</TableHead>
                                <TableHead className="p-1 text-right">Сумма</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invoice.items.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="p-1 truncate max-w-[120px]">{item.name}</TableCell>
                                  <TableCell className="p-1 text-right">{item.quantity}</TableCell>
                                  <TableCell className="p-1 text-right">{item.price.toLocaleString()} ₽</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* OCR Results Dialog */}
      <Dialog open={showOcrDialog} onOpenChange={setShowOcrDialog}>
        <DialogContent className={isMobile ? "w-[95%] max-w-md" : ""}>
          <DialogHeader>
            <DialogTitle>Результаты распознавания</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {ocrResult && (
              <>
                <div className="space-y-2">
                  <Label>Номер накладной</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={newInvoice.number} 
                      onChange={(e) => setNewInvoice({ ...newInvoice, number: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Дата поставки</Label>
                  <Input 
                    type="date"
                    value={newInvoice.date} 
                    onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Сумма</Label>
                  <Input 
                    type="number"
                    value={newInvoice.amount} 
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  />
                </div>
                
                {ocrResult.items && ocrResult.items.length > 0 && (
                  <div className="space-y-2">
                    <Label>Распознанные позиции</Label>
                    <div className="max-h-48 overflow-y-auto border rounded-md">
                      <Table className="text-sm">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="p-2">Название</TableHead>
                            <TableHead className="p-2 text-right">Кол-во</TableHead>
                            <TableHead className="p-2 text-right">Сумма</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ocrResult.items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="p-2">{item.name}</TableCell>
                              <TableCell className="p-2 text-right">{item.quantity}</TableCell>
                              <TableCell className="p-2 text-right">{item.price.toLocaleString()} ₽</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                
                <Button className="w-full" onClick={() => setShowOcrDialog(false)}>
                  Подтвердить
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
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
