-- Debug helper for SurplusHub stock failures.
-- Run each section in Supabase SQL Editor.

-- 1. Inspect the product row used by the failing order.
-- Replace the UUID with the failing product_id.
SELECT
    id,
    title,
    stock_quantity
FROM public.products
WHERE id = 'REPLACE_WITH_PRODUCT_ID';

-- 2. Find any trigger attached to the orders table and print its function body.
SELECT
    t.tgname AS trigger_name,
    p.proname AS function_name,
    pg_get_triggerdef(t.oid) AS trigger_sql,
    pg_get_functiondef(p.oid) AS function_sql
FROM pg_trigger t
JOIN pg_class c
    ON c.oid = t.tgrelid
JOIN pg_proc p
    ON p.oid = t.tgfoid
JOIN pg_namespace n
    ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'orders'
  AND NOT t.tgisinternal;

-- 3. Search all Postgres functions for the exact error text seen by the app.
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_sql
FROM pg_proc p
JOIN pg_namespace n
    ON n.oid = p.pronamespace
WHERE pg_get_functiondef(p.oid) ILIKE '%Not enough stock available%';

-- 4. Search for any legacy stock logic still using products.stock instead of stock_quantity.
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_sql
FROM pg_proc p
JOIN pg_namespace n
    ON n.oid = p.pronamespace
WHERE pg_get_functiondef(p.oid) ILIKE '%products%'
  AND pg_get_functiondef(p.oid) ILIKE '%stock%';

-- 5. Reinstall the expected trigger used by this repo.
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
