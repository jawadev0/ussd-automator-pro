import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

export const USSDExecutor = () => {
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    // Start monitoring for pending operations
    const interval = setInterval(() => {
      checkAndExecutePendingOperations();
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const checkAndExecutePendingOperations = async () => {
    if (isExecuting) return;

    try {
      // Fetch oldest pending operation
      const { data: pendingOps, error } = await supabase
        .from('ussd_operations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (pendingOps && pendingOps.length > 0) {
        await executeUSSD(pendingOps[0]);
      }
    } catch (error) {
      console.error('Error checking pending operations:', error);
    }
  };

  const executeUSSD = async (operation: any) => {
    setIsExecuting(true);

    try {
      // Update status to executing
      await supabase
        .from('ussd_operations')
        .update({ 
          status: 'executing',
          executed_at: new Date().toISOString()
        })
        .eq('id', operation.id);

      toast.info(`Executing USSD: ${operation.ussd_code} on SIM ${operation.sim_slot}`);

      // Check if running on native Android
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        try {
          // Call native USSD execution
          // Note: You'll need to implement a Capacitor plugin for actual USSD execution
          // For now, we'll simulate it
          const result = await simulateUSSDExecution(operation.ussd_code, operation.sim_slot);
          
          // Update with result
          await supabase
            .from('ussd_operations')
            .update({ 
              status: 'completed',
              result: result
            })
            .eq('id', operation.id);

          toast.success(`USSD completed: ${operation.ussd_code}`);
        } catch (nativeError: any) {
          throw new Error(`Native execution failed: ${nativeError.message}`);
        }
      } else {
        // Simulate execution for web preview
        const result = await simulateUSSDExecution(operation.ussd_code, operation.sim_slot);
        
        await supabase
          .from('ussd_operations')
          .update({ 
            status: 'completed',
            result: result
          })
          .eq('id', operation.id);

        toast.success(`USSD completed: ${operation.ussd_code}`);
      }
    } catch (error: any) {
      console.error('Error executing USSD:', error);
      
      // Update with error
      await supabase
        .from('ussd_operations')
        .update({ 
          status: 'failed',
          error_message: error.message
        })
        .eq('id', operation.id);

      toast.error(`USSD failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const simulateUSSDExecution = (code: string, simSlot: number): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Response from ${code} via SIM ${simSlot}: Balance: $25.50`);
      }, 1500);
    });
  };

  return null; // This component doesn't render anything
};
