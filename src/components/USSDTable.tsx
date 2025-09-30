import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

type USSDOperation = {
  id: string;
  ussd_code: string;
  sim_slot: number;
  status: string;
  result: string | null;
  error_message: string | null;
  created_at: string;
  executed_at: string | null;
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { variant: "pending" as const, label: "Pending" },
    executing: { variant: "warning" as const, label: "Executing" },
    completed: { variant: "success" as const, label: "Completed" },
    failed: { variant: "destructive" as const, label: "Failed" },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const USSDTable = () => {
  const [operations, setOperations] = useState<USSDOperation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperations();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('ussd-operations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ussd_operations'
        },
        () => {
          fetchOperations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('ussd_operations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOperations(data || []);
    } catch (error) {
      console.error('Error fetching operations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>USSD Code</TableHead>
            <TableHead>SIM Slot</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Executed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No operations found
              </TableCell>
            </TableRow>
          ) : (
            operations.map((op) => (
              <TableRow key={op.id}>
                <TableCell className="font-mono font-medium">{op.ussd_code}</TableCell>
                <TableCell>
                  <Badge variant="outline">SIM {op.sim_slot}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(op.status)}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {op.error_message ? (
                    <span className="text-destructive text-sm">{op.error_message}</span>
                  ) : op.result ? (
                    <span className="text-sm">{op.result}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(op.created_at), 'MMM dd, HH:mm:ss')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {op.executed_at ? format(new Date(op.executed_at), 'MMM dd, HH:mm:ss') : '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
