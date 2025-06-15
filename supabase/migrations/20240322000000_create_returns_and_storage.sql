-- Create return_requests table
CREATE TABLE IF NOT EXISTS return_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    refund_amount DECIMAL(10,2) NOT NULL,
    refund_status TEXT NOT NULL DEFAULT 'pending',
    photos TEXT[], -- Array of photo URLs
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add return status to orders table
ALTER TABLE orders 
ADD COLUMN return_status TEXT DEFAULT NULL;

-- Enable RLS
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for return_requests
CREATE POLICY "Users can view their own return requests" ON return_requests
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own return requests" ON return_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS return_requests_order_id_idx ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS return_requests_user_id_idx ON return_requests(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_return_requests_updated_at
    BEFORE UPDATE ON return_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for return photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('return_photos', 'return_photos', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for return photos
CREATE POLICY "Users can upload their own return photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'return_photos' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Users can view their own return photos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'return_photos' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Users can update their own return photos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'return_photos' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Users can delete their own return photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'return_photos' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Create function to handle return status updates
CREATE OR REPLACE FUNCTION handle_return_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update order's return_status when return request status changes
    IF TG_OP = 'INSERT' THEN
        UPDATE orders
        SET return_status = 'return_initiated'
        WHERE id = NEW.order_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status = 'return_received' THEN
            UPDATE orders
            SET return_status = 'return_received'
            WHERE id = NEW.order_id;
        ELSIF NEW.status = 'return_complete' THEN
            UPDATE orders
            SET return_status = 'return_complete'
            WHERE id = NEW.order_id;
            -- Here you can add logic to process the refund to wallet
        ELSIF NEW.status = 'return_rejected' THEN
            UPDATE orders
            SET return_status = 'return_rejected'
            WHERE id = NEW.order_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for return status updates
CREATE TRIGGER return_status_update_trigger
    AFTER INSERT OR UPDATE ON return_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_return_status_update(); 