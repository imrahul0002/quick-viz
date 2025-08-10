import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { DataTable } from "@/components/data-table";
import { ChartSelector, ChartConfig } from "@/components/chart-selector";
import { ChartDisplay } from "@/components/chart-display";
import { DataStats } from "@/components/data-stats";
import { Button } from "@/components/ui/button";
import { parseFile, ParsedData } from "@/utils/data-parser";
import { exportChartAsPNG, exportDataAsCSV, exportDataAsJSON } from "@/utils/chart-export";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'bar',
    xAxis: '',
    yAxis: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await parseFile(file);
      
      if (result.errors.length > 0) {
        toast({
          title: "Parse Errors",
          description: result.errors.join(', '),
          variant: "destructive",
        });
      }
      
      if (result.data.length > 0) {
        setParsedData(result);
        // Set default chart config
        const numericColumns = result.headers.filter(header => 
          result.data.some(row => !isNaN(Number(row[header])) && row[header] !== null && row[header] !== '')
        );
        const categoricalColumns = result.headers.filter(header => 
          !numericColumns.includes(header)
        );
        
        setChartConfig({
          type: 'bar',
          xAxis: categoricalColumns[0] || result.headers[0],
          yAxis: numericColumns[0] || result.headers[1],
        });
        
        toast({
          title: "File uploaded successfully!",
          description: `Loaded ${result.data.length} rows and ${result.headers.length} columns.`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error processing your file.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!parsedData) return;
    
    // Create a simple menu for export options
    const exportMenu = document.createElement('div');
    exportMenu.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 1000;
    `;
    
    exportMenu.innerHTML = `
      <h3 style="margin-bottom: 12px;">Export Options</h3>
      <button id="export-csv" style="display: block; margin-bottom: 8px; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">Export as CSV</button>
      <button id="export-json" style="display: block; margin-bottom: 8px; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">Export as JSON</button>
      <button id="close-menu" style="display: block; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: #f5f5f5; cursor: pointer;">Cancel</button>
    `;
    
    document.body.appendChild(exportMenu);
    
    // Add event listeners
    document.getElementById('export-csv')?.addEventListener('click', () => {
      exportDataAsCSV(parsedData.data, 'exported_data');
      document.body.removeChild(exportMenu);
      toast({
        title: "Data exported",
        description: "CSV file has been downloaded.",
      });
    });
    
    document.getElementById('export-json')?.addEventListener('click', () => {
      exportDataAsJSON(parsedData.data, 'exported_data');
      document.body.removeChild(exportMenu);
      toast({
        title: "Data exported", 
        description: "JSON file has been downloaded.",
      });
    });
    
    document.getElementById('close-menu')?.addEventListener('click', () => {
      document.body.removeChild(exportMenu);
    });
  };

  if (!parsedData) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="gradient-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 text-sm">
                <Database className="w-4 h-4" />
                <span>Data Visualization Platform</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">
                Transform Your Data Into 
                <span className="block">Beautiful Insights</span>
              </h1>
              <p className="text-xl md:text-2xl max-w-2xl mx-auto opacity-90">
                Upload CSV or JSON files and instantly create stunning charts and visualizations
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Get Started</h2>
              <p className="text-muted-foreground">
                Upload your dataset to begin creating visualizations
              </p>
            </div>
            
            <FileUpload onFileSelect={handleFileSelect} />
            
            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <Card className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Multiple Chart Types</h3>
                  <p className="text-sm text-muted-foreground">
                    Bar, line, pie, and scatter charts with customization options
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Smart Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic statistics and data analysis with export options
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Interactive Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time chart updates and professional dashboard layout
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold">Data Visualizer</h1>
                <p className="text-sm text-muted-foreground">
                  {parsedData.data.length} rows • {parsedData.headers.length} columns
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExport}>
                Export Data
              </Button>
              <Button onClick={() => setParsedData(null)}>
                New Dataset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <ChartSelector 
              data={parsedData.data} 
              onChartConfigChange={setChartConfig}
            />
            <DataStats data={parsedData.data} />
          </div>

          {/* Main Content - Chart and Data */}
          <div className="lg:col-span-3 space-y-6">
            <ChartDisplay 
              data={parsedData.data} 
              config={chartConfig}
              onExport={() => {
                toast({
                  title: "Export feature",
                  description: "Chart export functionality would be implemented here.",
                });
              }}
            />
            <DataTable data={parsedData.data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
