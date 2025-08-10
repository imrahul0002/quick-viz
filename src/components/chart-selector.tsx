import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart, LineChart, PieChart, ScatterChart } from "lucide-react";

interface ChartSelectorProps {
  data: any[];
  onChartConfigChange: (config: ChartConfig) => void;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  xAxis: string;
  yAxis: string;
  title?: string;
}

export const ChartSelector = ({ data, onChartConfigChange }: ChartSelectorProps) => {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);
  const numericColumns = headers.filter(header => 
    data.some(row => !isNaN(Number(row[header])) && row[header] !== null && row[header] !== '')
  );
  const categoricalColumns = headers.filter(header => 
    !numericColumns.includes(header)
  );

  const handleConfigChange = (field: keyof ChartConfig, value: string) => {
    // Get current config from parent or create default
    const currentConfig: ChartConfig = {
      type: 'bar',
      xAxis: categoricalColumns[0] || headers[0],
      yAxis: numericColumns[0] || headers[1],
    };

    const newConfig = { ...currentConfig, [field]: value };
    onChartConfigChange(newConfig);
  };

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart, description: 'Compare categories' },
    { value: 'line', label: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
    { value: 'pie', label: 'Pie Chart', icon: PieChart, description: 'Show proportions' },
    { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart, description: 'Correlation between variables' },
  ];

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg">Chart Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Chart Type</Label>
          <Select onValueChange={(value) => handleConfigChange('type', value as ChartConfig['type'])}>
            <SelectTrigger>
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              {chartTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <type.icon className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>X-Axis</Label>
            <Select onValueChange={(value) => handleConfigChange('xAxis', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select X-axis" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Y-Axis</Label>
            <Select onValueChange={(value) => handleConfigChange('yAxis', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Y-axis" />
              </SelectTrigger>
              <SelectContent>
                {numericColumns.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Data Insights</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• {numericColumns.length} numeric columns detected</p>
            <p>• {categoricalColumns.length} categorical columns detected</p>
            <p>• {data.length} total rows</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};