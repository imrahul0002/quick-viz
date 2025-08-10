import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DataTableProps {
  data: any[];
  maxRows?: number;
}

export const DataTable = ({ data, maxRows = 100 }: DataTableProps) => {
  const { headers, displayData } = useMemo(() => {
    if (!data || data.length === 0) return { headers: [], displayData: [] };
    
    const headers = Object.keys(data[0]);
    const displayData = data.slice(0, maxRows);
    
    return { headers, displayData };
  }, [data, maxRows]);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg">Data Preview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Showing {displayData.length} of {data.length} rows
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index} className="font-semibold">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <TableCell key={colIndex}>
                      {row[header] !== null && row[header] !== undefined
                        ? String(row[header])
                        : '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};