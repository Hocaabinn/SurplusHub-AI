ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS status TEXT;

UPDATE public.orders
SET status = 'pending'
WHERE status IS NULL;

ALTER TABLE public.orders
    ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.orders
    ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'orders_status_check'
    ) THEN
        ALTER TABLE public.orders
            ADD CONSTRAINT orders_status_check
            CHECK (status IN ('pending', 'completed', 'cancelled'));
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.reduce_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    IF NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
        RAISE EXCEPTION 'Order quantity must be greater than zero';
    END IF;

    UPDATE public.products
    SET stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0)
    WHERE id = NEW.product_id
      AND stock_quantity >= NEW.quantity;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    IF affected_rows = 0 THEN
        RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reduce_stock ON public.orders;

CREATE TRIGGER trigger_reduce_stock
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.reduce_product_stock();
