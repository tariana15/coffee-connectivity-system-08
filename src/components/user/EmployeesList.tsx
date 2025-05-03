
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/auth";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const EmployeesList: React.FC = () => {
  const { getShopEmployees } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const shopEmployees = await getShopEmployees();
        setEmployees(shopEmployees);
      } catch (error) {
        console.error("Failed to load employees:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [getShopEmployees]);

  if (loading) {
    return <div className="text-center py-4">Загрузка списка сотрудников...</div>;
  }

  if (employees.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">Сотрудники не найдены</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Имя</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Роль</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>
                <Badge className={employee.role === "manager" ? "bg-purple-100 text-purple-800" : ""}>
                  {employee.role === "manager" ? "Менеджер" : "Сотрудник"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeesList;
