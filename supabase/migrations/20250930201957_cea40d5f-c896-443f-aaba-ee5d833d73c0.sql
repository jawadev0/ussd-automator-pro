-- Create USSD operations table
CREATE TABLE public.ussd_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ussd_code TEXT NOT NULL,
  sim_slot INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  result TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ussd_operations ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since this is an automation tool)
CREATE POLICY "Anyone can view USSD operations" 
ON public.ussd_operations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert USSD operations" 
ON public.ussd_operations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update USSD operations" 
ON public.ussd_operations 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete USSD operations" 
ON public.ussd_operations 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ussd_operations_updated_at
BEFORE UPDATE ON public.ussd_operations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries on status and created_at
CREATE INDEX idx_ussd_operations_status ON public.ussd_operations(status);
CREATE INDEX idx_ussd_operations_created_at ON public.ussd_operations(created_at);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.ussd_operations;