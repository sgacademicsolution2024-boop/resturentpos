CREATE TABLE IF NOT EXISTS public.global_settings (
  id integer primary key,
  tax_rate numeric(6, 3) not null default 5,
  currency_symbol text not null default 'Rs',
  receipt_header text not null default 'Ledgriq POS'
);

ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" 
ON public.global_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable update access for admins" 
ON public.global_settings FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

INSERT INTO public.global_settings (id, tax_rate, currency_symbol, receipt_header)
VALUES (1, 5, 'Rs', 'Ledgriq POS')
ON CONFLICT (id) DO UPDATE SET 
  tax_rate = EXCLUDED.tax_rate, 
  currency_symbol = EXCLUDED.currency_symbol, 
  receipt_header = EXCLUDED.receipt_header;
