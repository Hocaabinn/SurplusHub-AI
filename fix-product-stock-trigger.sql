-- SurplusHub uses products.stock_quantity, not products.stock.
-- Run this in Supabase SQL Editor to reduce stock automatically
-- whenever a new order row is inserted.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'orders'
          AND column_name = 'product_id'
    ) THEN
        RAISE EXCEPTION 'orders.product_id is required before installing the stock trigger';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'orders'
          AND column_name = 'quantity'
    ) THEN
        RAISE EXCEPTION 'orders.quantity is required before installing the stock trigger';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'stock_quantity'
    ) THEN
        RAISE EXCEPTION 'products.stock_quantity is required before installing the stock trigger';
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.reduce_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    updated_rows INTEGER;
BEGIN
    IF NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
        RAISE EXCEPTION 'Order quantity must be greater than zero';
    END IF;

    UPDATE public.products
    SET stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0)
    WHERE id = NEW.product_id
      AND stock_quantity >= NEW.quantity;

    GET DIAGNOSTICS updated_rows = ROW_COUNT;

    IF updated_rows = 0 THEN
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
