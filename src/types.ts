export interface Store {
    id: string;
    owner_id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    image_url?: string;
}

export interface Product {
    id: string;
    store_id: string;
    partner_id?: string;
    title: string;
    description?: string;
    original_price: number;
    /** Discount amount in Rupiah (stored as discount_price in DB) */
    discount_price: number;
    stock_quantity: number;
    expiry_date: string;
    image_url?: string;
    co2_saved: number;
    created_at?: string;
    stores?: Store;
}

export interface Order {
    id?: string;
    user_id: string;
    product_id: string;
    quantity: number;
    total_price?: number;
    pickup_code: string;
    status: 'pending' | 'completed' | 'cancelled';
    created_at?: string;
    products?: {
        title: string;
        image_url?: string;
        store_id: string;
        stores?: {
            name: string;
        };
    };
}

export interface Profile {
    id: string;
    full_name: string;
    role: 'consumer' | 'partner';
    avatar_url?: string;
    is_premium?: boolean;
    created_at?: string;
}
