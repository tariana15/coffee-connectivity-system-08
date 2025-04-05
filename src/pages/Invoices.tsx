import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import invoiceData from "../../techcard/Nacladnay.json";

interface InvoiceItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface Invoice {
  id: number;
  date: string;
  supplier: string;
  items: InvoiceItem[];
  total: number;
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    items: [],
    total: 0
  });

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        setInvoices(invoiceData);
      } catch (err) {
        setError("Ошибка при загрузке накладных");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const handleAddItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...(prev.items || []), { name: '', quantity: 0, unit: '', price: 0 }]
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setNewInvoice(prev => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const handleSaveInvoice = () => {
    const total = newInvoice.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
    const invoice: Invoice = {
      id: invoices.length + 1,
      date: newInvoice.date || new Date().toISOString().split('T')[0],
      supplier: newInvoice.supplier || '',
      items: newInvoice.items || [],
      total
    };

    setInvoices(prev => [...prev, invoice]);
    setIsDialogOpen(false);
    setNewInvoice({
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      items: [],
      total: 0
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Накладные</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Добавить накладную</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Новая накладная</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Дата</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newInvoice.date}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, date: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier" className="text-right">Поставщик</Label>
                  <Input
                    id="supplier"
                    value={newInvoice.supplier}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, supplier: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Товары</h3>
                    <Button onClick={handleAddItem} variant="outline">Добавить товар</Button>
                  </div>
                  {newInvoice.items?.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4">
                      <Input
                        placeholder="Название"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className="col-span-4"
                      />
                      <Input
                        type="number"
                        placeholder="Количество"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="col-span-2"
                      />
                      <Input
                        placeholder="Ед. изм."
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="col-span-2"
                      />
                      <Input
                        type="number"
                        placeholder="Цена"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                        className="col-span-3"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveInvoice}>Сохранить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Поставщик</TableHead>
                <TableHead>Товары</TableHead>
                <TableHead>Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.supplier}</TableCell>
                  <TableCell>
                    <ul>
                      {invoice.items.map((item, index) => (
                        <li key={index}>
                          {item.name} - {item.quantity} {item.unit} x {item.price} ₽
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>{invoice.total} ₽</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default Invoices; 