import {
  Table,
  TableBody,
  TableCell as ShadcnTableCell, // Import TableCell from Shadcn UI
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Column {
  header: string;
  key: string;
  cell?: (props: any) => JSX.Element; // Add cell prop for custom rendering
}

interface DataTableProps<T> {
  data: T[];
  columns: Column[];
  isLoading?: boolean;
  error?: string | null;
}

export const DataTable = <T extends {}>({ data, columns, isLoading = false, error = null }: DataTableProps<T>) => {
  const formatDate = (date: Date): string => {
    if (!date) return 'N/A';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  if (isLoading) {
    return <p>Carregando dados...</p>;
  }

  if (error) {
    return <p>Erro: {error}</p>;
  }

  if (!data.length) {
    return <p>Nenhum dado encontrado.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            {columns.map((column) => (
              <ShadcnTableCell key={column.key}>
                {column.cell ? column.cell({ row: item }) : item[column.key]}
              </ShadcnTableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DataTable;
