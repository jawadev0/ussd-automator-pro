import { USSDTable } from "@/components/USSDTable";
import { USSDExecutor } from "@/components/USSDExecutor";
import { Smartphone, Database, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <USSDExecutor />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">USSD Automation</h1>
          </div>
          <p className="text-muted-foreground">
            Automated USSD code execution with real-time monitoring
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">Database Driven</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Operations fetched from cloud database
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-card-foreground">Auto Execution</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Processes oldest operations first
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="h-5 w-5 text-success" />
              <h3 className="font-semibold text-card-foreground">Multi-SIM Support</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Execute on specific SIM cards
            </p>
          </div>
        </div>

        {/* Operations Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Operations Queue</h2>
          <USSDTable />
        </div>
      </div>
    </div>
  );
};

export default Index;
