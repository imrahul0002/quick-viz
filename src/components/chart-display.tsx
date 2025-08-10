import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartConfig } from "./chart-selector";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ChartDisplayProps {
  data: any[];
  config: ChartConfig;
  onExport?: () => void;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const ChartDisplay = ({ data, config, onExport }: ChartDisplayProps) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Process data based on chart type
    if (config.type === 'pie') {
      // For pie charts, aggregate data by categories
      const aggregated = data.reduce((acc, row) => {
        const category = row[config.xAxis];
        const value = Number(row[config.yAxis]) || 0;
        
        if (acc[category]) {
          acc[category] += value;
        } else {
          acc[category] = value;
        }
        
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(aggregated).map(([name, value]) => ({ name, value }));
    }
    
    // For other chart types, use data as is but ensure numeric values
    return data.map(row => ({
      ...row,
      [config.xAxis]: row[config.xAxis],
      [config.yAxis]: Number(row[config.yAxis]) || 0,
    }));
  }, [data, config]);

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          No data available for this configuration
        </div>
      );
    }

    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey={config.xAxis} 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)'
                }} 
              />
              <Legend />
              <Bar 
                dataKey={config.yAxis} 
                fill={CHART_COLORS[0]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey={config.xAxis} 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={config.yAxis} 
                stroke={CHART_COLORS[0]}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS[0], strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey={config.xAxis} 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                dataKey={config.yAxis}
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)'
                }} 
              />
              <Scatter 
                dataKey={config.yAxis} 
                fill={CHART_COLORS[0]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {config.title || `${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Chart`}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};