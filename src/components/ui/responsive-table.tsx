import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type Column<T> = {
  header: React.ReactNode;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
};

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  renderMobileCard: (item: T) => React.ReactNode;
  rowKey: keyof T;
  isLoading?: boolean;
  isError?: boolean;
  noResultsMessage?: string;
  loadingItems?: number;
}

export function ResponsiveTable<T extends { [key: string]: any }>({
  data,
  columns,
  renderMobileCard,
  rowKey,
  isLoading = false,
  isError = false,
  noResultsMessage = "Nenhum resultado encontrado.",
  loadingItems = 5,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  const renderCell = (item: T, column: Column<T>) => {
    if (typeof column.accessor === "function") {
      return column.accessor(item);
    }
    return item[column.accessor as keyof T] as React.ReactNode;
  };

  if (isLoading) {
    if (isMobile) {
      return (
        <div className="space-y-3">
          {Array.from({ length: loadingItems }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      );
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: loadingItems }).map((_, i) => (
            <TableRow key={i}>
              {columns.map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive">
        Erro ao carregar dados.
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {noResultsMessage}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <Card key={item[rowKey]} className="card-institutional">
            <CardContent className="p-4">
              {renderMobileCard(item)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card className="card-institutional">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-hover border-border">
                {columns.map((col, i) => (
                  <TableHead key={i} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item[rowKey]} className="hover:bg-surface-hover transition-colors">
                  {columns.map((col, j) => (
                    <TableCell key={j} className={col.className}>
                      {renderCell(item, col)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}