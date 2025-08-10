import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DataStatsProps {
  data: any[];
}

export const DataStats = ({ data }: DataStatsProps) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const headers = Object.keys(data[0]);
    const numericColumns = headers.filter(header => 
      data.some(row => !isNaN(Number(row[header])) && row[header] !== null && row[header] !== '')
    );

    const columnStats = numericColumns.map(column => {
      const values = data
        .map(row => Number(row[column]))
        .filter(val => !isNaN(val));

      if (values.length === 0) return null;

      const sorted = [...values].sort((a, b) => a - b);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const mean = sum / values.length;
      const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
      
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      return {
        column,
        count: values.length,
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        min: Math.min(...values).toFixed(2),
        max: Math.max(...values).toFixed(2),
        stdDev: stdDev.toFixed(2),
      };
    }).filter(Boolean);

    return {
      totalRows: data.length,
      totalColumns: headers.length,
      numericColumns: numericColumns.length,
      categoricalColumns: headers.length - numericColumns.length,
      columnStats,
    };
  }, [data]);

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No data available for statistics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg">Data Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.totalRows}</div>
            <div className="text-sm text-muted-foreground">Rows</div>
          </div>
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.totalColumns}</div>
            <div className="text-sm text-muted-foreground">Columns</div>
          </div>
          <div className="text-center p-3 bg-chart-2/10 rounded-lg">
            <div className="text-2xl font-bold text-chart-2">{stats.numericColumns}</div>
            <div className="text-sm text-muted-foreground">Numeric</div>
          </div>
          <div className="text-center p-3 bg-chart-3/10 rounded-lg">
            <div className="text-2xl font-bold text-chart-3">{stats.categoricalColumns}</div>
            <div className="text-sm text-muted-foreground">Categorical</div>
          </div>
        </div>

        {/* Column Statistics */}
        {stats.columnStats.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Numeric Column Statistics</h4>
            <div className="space-y-3">
              {stats.columnStats.map((columnStat) => (
                <div key={columnStat?.column} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium">{columnStat?.column}</h5>
                    <Badge variant="outline">{columnStat?.count} values</Badge>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Mean</div>
                      <div className="font-medium">{columnStat?.mean}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Median</div>
                      <div className="font-medium">{columnStat?.median}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Min</div>
                      <div className="font-medium">{columnStat?.min}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Max</div>
                      <div className="font-medium">{columnStat?.max}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Std Dev</div>
                      <div className="font-medium">{columnStat?.stdDev}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Range</div>
                      <div className="font-medium">
                        {(Number(columnStat?.max) - Number(columnStat?.min)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};