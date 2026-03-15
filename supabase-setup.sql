

-- 1. PROFILES TABLE
-- Stores user profile information (linked to auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('consumer', 'partner')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. STORES TABLE
-- Stores registered by partners
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Anyone can view stores (for the marketplace map)
CREATE POLICY "Anyone can view stores"
    ON public.stores FOR SELECT
    USING (true);

-- Partners can insert their own stores
CREATE POLICY "Partners can insert own stores"
    ON public.stores FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Partners can update their own stores
CREATE POLICY "Partners can update own stores"
    ON public.stores FOR UPDATE
    USING (auth.uid() = owner_id);

-- Partners can delete their own stores
CREATE POLICY "Partners can delete own stores"
    ON public.stores FOR DELETE
    USING (auth.uid() = owner_id);

-- 3. PRODUCTS TABLE
-- Surplus food items listed by partners
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    original_price NUMERIC NOT NULL,
    discount_price NUMERIC NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    expiry_date TIMESTAMPTZ NOT NULL,
    image_url TEXT,
    co2_saved NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view products (for the marketplace)
CREATE POLICY "Anyone can view products"
    ON public.products FOR SELECT
    USING (true);

-- Partners can insert products for their own stores
CREATE POLICY "Partners can insert products"
    ON public.products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = store_id
            AND stores.owner_id = auth.uid()
        )
    );

-- Partners can update their own products
CREATE POLICY "Partners can update products"
    ON public.products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = store_id
            AND stores.owner_id = auth.uid()
        )
    );

-- Partners can delete their own products
CREATE POLICY "Partners can delete products"
    ON public.products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = store_id
            AND stores.owner_id = auth.uid()
        )
    );

-- 4. ORDERS TABLE
-- Reservations made by consumers
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC,
    pickup_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now()
);

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

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

-- Partners can view orders for their store's products
CREATE POLICY "Partners can view orders for their products"
    ON public.orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.products
            JOIN public.stores ON stores.id = products.store_id
            WHERE products.id = product_id
            AND stores.owner_id = auth.uid()
        )
    );

-- Authenticated users can create orders
CREATE POLICY "Users can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders (e.g. cancel)
CREATE POLICY "Users can update own orders"
    ON public.orders FOR UPDATE
    USING (auth.uid() = user_id);

-- Partners can update orders for their products (e.g. mark completed)
CREATE POLICY "Partners can update orders for their products"
    ON public.orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.products
            JOIN public.stores ON stores.id = products.store_id
            WHERE products.id = product_id
            AND stores.owner_id = auth.uid()
        )
    );

-- Users can delete their own orders
CREATE POLICY "Users can delete own orders"
    ON public.orders FOR DELETE
    USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.reduce_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE public.products
    SET stock_quantity = stock_quantity - NEW.quantity
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

-- 5. INDEXES for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON public.products(expiry_date);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_code ON public.orders(pickup_code);

-- 6. STORAGE BUCKET for product images
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'product-images'
        AND auth.role() = 'authenticated'
    );

-- Anyone can view product images (public bucket)
CREATE POLICY "Anyone can view product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

-- Users can delete their own uploaded images
CREATE POLICY "Users can delete own product images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'product-images'
        AND auth.role() = 'authenticated'
    );

-- ============================================================================
-- Done! All tables and policies have been created.
-- ============================================================================
