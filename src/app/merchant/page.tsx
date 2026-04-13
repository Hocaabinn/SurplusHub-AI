'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Store, Product } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import AiImageGenerator from '@/components/AiImageGenerator';
import PremiumUpgradeModal from '@/components/PremiumUpgradeModal';
import {
    Plus,
    Store as StoreIcon,
    CheckCircle,
    AlertTriangle,
    Package,
    DollarSign,
    Calendar,
    Tag,
    Layers,
    MapPin,
    Trash2,
    ChevronDown,
    ChevronUp,
    Loader2,
    ImagePlus,
    X,
    Search,
    Crown,
    Brain,
} from 'lucide-react';

// ── Form types ──────────────────────────────────────────────────────────────────

interface FoodFormData {
    title: string;
    original_price: string;
    discount_amount: string;
    stock_quantity: string;
    expiry_date: string;
    store_id: string;
    co2_saved: string;
}

const initialFoodForm: FoodFormData = {
    title: '',
    original_price: '',
    discount_amount: '',
    stock_quantity: '',
    expiry_date: '',
    store_id: '',
    co2_saved: '0.5',
};

interface StoreFormData {
    name: string;
    address: string;
    latitude: string;
    longitude: string;
}

const initialStoreForm: StoreFormData = {
    name: '',
    address: '',
    latitude: '',
    longitude: '',
};

// ── Shared UI helpers ───────────────────────────────────────────────────────────

const inputClass =
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-800';

const labelClass =
    'mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300';

// ── Page component ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { user, profile } = useAuth();

    // Stores
    const [stores, setStores] = useState<Store[]>([]);
    const [storesLoaded, setStoresLoaded] = useState(false);
    const [storeOpen, setStoreOpen] = useState(false);
    const [storeForm, setStoreForm] = useState<StoreFormData>(initialStoreForm);
    const [storeSaving, setStoreSaving] = useState(false);
    const [storeSuccess, setStoreSuccess] = useState(false);
    const [storeError, setStoreError] = useState<string | null>(null);

    // Food form
    const [foodForm, setFoodForm] = useState<FoodFormData>(initialFoodForm);
    const [foodLoading, setFoodLoading] = useState(false);
    const [foodSuccess, setFoodSuccess] = useState(false);
    const [foodError, setFoodError] = useState<string | null>(null);

    // Image upload
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Active listings
    const [listings, setListings] = useState<(Product & { stores?: { name: string } })[]>([]);
    const [listingsLoading, setListingsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Pickup verification
    const [pickupInput, setPickupInput] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyResult, setVerifyResult] = useState<{ title: string; customerName: string; quantity: number } | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);

    // Premium & AI image
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [aiImageBlob, setAiImageBlob] = useState<Blob | null>(null);

    // ── Data fetching ─────────────────────────────────────────────────────────

    const fetchStores = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from('stores')
            .select('*')
            .eq('owner_id', user.id);
        const result = data || [];
        setStores(result);
        setStoresLoaded(true);
        // Auto-open the registration form when partner has no stores yet
        if (result.length === 0) {
            setStoreOpen(true);
        }
    }, [user]);

    const fetchListings = useCallback(async () => {
        if (!user || stores.length === 0) {
            setListings([]);
            setListingsLoading(false);
            return;
        }
        setListingsLoading(true);
        const storeIds = stores.map((s) => s.id);
        const { data } = await supabase
            .from('products')
            .select('*, stores(name)')
            .in('store_id', storeIds)
            .order('created_at', { ascending: false });
        setListings(data || []);
        setListingsLoading(false);
    }, [user, stores]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    // Fetch premium status
    useEffect(() => {
        if (profile) {
            setIsPremium(!!profile.is_premium);
        }
    }, [profile]);

    // ── Store handlers ────────────────────────────────────────────────────────

    function handleStoreChange(e: React.ChangeEvent<HTMLInputElement>) {
        setStoreForm({ ...storeForm, [e.target.name]: e.target.value });
    }

    async function handleStoreSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        setStoreSaving(true);
        setStoreError(null);
        setStoreSuccess(false);

        try {
            const { error } = await supabase.from('stores').insert({
                owner_id: user.id,
                name: storeForm.name,
                address: storeForm.address,
                latitude: storeForm.latitude ? Number(storeForm.latitude) : 0,
                longitude: storeForm.longitude ? Number(storeForm.longitude) : 0,
            });
            if (error) throw error;

            setStoreSuccess(true);
            setStoreForm(initialStoreForm);
            await fetchStores();
            setTimeout(() => setStoreSuccess(false), 4000);
        } catch (err: unknown) {
            setStoreError(err instanceof Error ? err.message : 'Failed to register store.');
        } finally {
            setStoreSaving(false);
        }
    }

    // ── Image handlers ────────────────────────────────────────────────────────

    function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setFoodError('Please select a valid image file.');
            return;
        }
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setFoodError('Image must be smaller than 5MB.');
            return;
        }

        setImageFile(file);
        setFoodError(null);

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }

    function clearImage() {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    async function uploadImage(file: File): Promise<{ publicUrl: string; filePath: string }> {
        const fileExt = file.name.split('.').pop();
        const filePath = `private/${user!.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
            const detail = [
                `Path: "${filePath}"`,
                `Reason: ${uploadError.message}`,
                uploadError.message.includes('row-level security')
                    ? 'Hint: The storage RLS policy requires files inside the "private/" folder.'
                    : '',
                uploadError.message.includes('Payload too large') ||
                    uploadError.message.includes('exceeds the maximum')
                    ? 'Hint: The file exceeds the maximum upload size allowed by the bucket.'
                    : '',
            ]
                .filter(Boolean)
                .join(' | ');
            throw new Error(`Image upload failed — ${detail}`);
        }

        const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return { publicUrl: urlData.publicUrl, filePath };
    }

    // ── Food handlers ─────────────────────────────────────────────────────────

    function handleFoodChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setFoodForm({ ...foodForm, [e.target.name]: e.target.value });
    }

    async function handleFoodSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFoodLoading(true);
        setFoodError(null);
        setFoodSuccess(false);

        // Track uploaded file path so we can delete it if DB insert fails
        let uploadedFilePath: string | null = null;

        try {
            if (!user) throw new Error('You must be logged in.');
            if (!foodForm.store_id) throw new Error('Please select a store.');
            const origPrice = Number(foodForm.original_price);
            const discAmt = Number(foodForm.discount_amount);
            if (discAmt <= 0) {
                throw new Error('Discount amount must be greater than 0.');
            }
            if (discAmt >= origPrice) {
                throw new Error('Discount amount must be less than original price.');
            }

            // Upload image if selected
            let image_url: string | null = null;
            if (imageFile) {
                setImageUploading(true);
                const result = await uploadImage(imageFile);
                image_url = result.publicUrl;
                uploadedFilePath = result.filePath;
                setImageUploading(false);
            }

            const { error } = await supabase.from('products').insert({
                store_id: foodForm.store_id,
                partner_id: user.id,
                title: foodForm.title,
                original_price: origPrice,
                discount_price: discAmt,
                stock_quantity: Number(foodForm.stock_quantity),
                expiry_date: foodForm.expiry_date,
                co2_saved: Number(foodForm.co2_saved),
                ...(image_url && { image_url }),
            });

            if (error) {
                // Orphan cleanup: delete the uploaded image if DB insert failed
                if (uploadedFilePath) {
                    await supabase.storage
                        .from('product-images')
                        .remove([uploadedFilePath]);
                }
                throw error;
            }

            setFoodSuccess(true);
            setFoodForm(initialFoodForm);
            clearImage();
            await fetchListings();
            setTimeout(() => setFoodSuccess(false), 5000);
        } catch (err: unknown) {
            setImageUploading(false);
            setFoodError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setFoodLoading(false);
        }
    }

    // ── Delete handler ────────────────────────────────────────────────────────

    async function handleDelete(productId: string) {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        setDeletingId(productId);
        try {
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) throw error;
            setListings((prev) => prev.filter((p) => p.id !== productId));
        } catch {
            alert('Failed to delete listing. Please try again.');
        } finally {
            setDeletingId(null);
        }
    }

    // ── Pickup verification handler ───────────────────────────────────────────

    async function handleVerifyPickup(e: React.FormEvent) {
        e.preventDefault();
        if (!pickupInput.trim()) return;
        setVerifyLoading(true);
        setVerifyResult(null);
        setVerifyError(null);

        try {
            if (!user) throw new Error('Not authenticated.');

            const normalizedCode = pickupInput.trim();
            const storeIds = stores.map((store) => store.id);

            // Step 1: Find the pending order by pickup code
            const { data: order, error: findError } = await supabase
                .from('orders')
                .select('id, product_id, store_id, quantity, status')
                .eq('pickup_code', normalizedCode)
                .eq('status', 'pending')
                .single();

            if (findError) {
                if (findError.code === 'PGRST116') {
                    throw new Error('Invalid pickup code');
                }
                throw findError;
            }

            if (!order) {
                throw new Error('Invalid pickup code');
            }

            if (order.store_id && storeIds.length > 0 && !storeIds.includes(order.store_id)) {
                throw new Error('Invalid pickup code');
            }

            // Step 2: Update by order id
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: 'completed' })
                .eq('id', order.id);

            if (updateError) throw updateError;

            const { data: product } = await supabase
                .from('products')
                .select('title')
                .eq('id', order.product_id)
                .maybeSingle();

            setVerifyResult({
                title: product?.title || 'Order',
                customerName: 'Customer',
                quantity: order.quantity,
            });
            setPickupInput('');
        } catch (err: unknown) {
            setVerifyError(err instanceof Error ? err.message : 'Verification failed.');
        } finally {
            setVerifyLoading(false);
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <ProtectedRoute requiredRole="partner">
            <div className="min-h-screen bg-[var(--background)]">
                {/* Header */}
                <div className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-card-dark">
                    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-md shadow-green-500/20">
                                <StoreIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Merchant Panel
                                </h1>
                                <p className="text-sm text-muted">
                                    Manage your stores and surplus food listings
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 flex flex-col gap-6">

                    {/* ── 1. Register Store Card ──────────────────────────────────── */}
                    <div className="animate-fade-in overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-card-dark">
                        <button
                            type="button"
                            onClick={() => setStoreOpen(!storeOpen)}
                            className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Register My Store
                                </h2>
                                {storesLoaded && (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                        {stores.length} registered
                                    </span>
                                )}
                            </div>
                            {storeOpen ? (
                                <ChevronUp className="h-5 w-5 text-muted" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-muted" />
                            )}
                        </button>

                        {storeOpen && (
                            <form onSubmit={handleStoreSubmit} className="border-t border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col gap-5 p-6">
                                    {/* Store Name */}
                                    <div>
                                        <label className={labelClass}>
                                            <StoreIcon className="h-4 w-4 text-muted" />
                                            Store Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={storeForm.name}
                                            onChange={handleStoreChange}
                                            required
                                            placeholder="e.g. Warung Nasi Padang"
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className={labelClass}>
                                            <MapPin className="h-4 w-4 text-muted" />
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={storeForm.address}
                                            onChange={handleStoreChange}
                                            required
                                            placeholder="e.g. Jl. Sudirman No. 10, Jakarta"
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Lat / Lng row */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                <MapPin className="h-4 w-4 text-muted" />
                                                Latitude (Opsional)
                                            </label>
                                            <input
                                                type="number"
                                                name="latitude"
                                                value={storeForm.latitude}
                                                onChange={handleStoreChange}
                                                step="any"
                                                placeholder="-6.2088"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                <MapPin className="h-4 w-4 text-muted" />
                                                Longitude (Opsional)
                                            </label>
                                            <input
                                                type="number"
                                                name="longitude"
                                                value={storeForm.longitude}
                                                onChange={handleStoreChange}
                                                step="any"
                                                placeholder="106.8456"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>

                                    {/* Feedback */}
                                    {storeSuccess && (
                                        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                            <CheckCircle className="h-4 w-4" />
                                            Store registered successfully! You can now select it in the food form below.
                                        </div>
                                    )}
                                    {storeError && (
                                        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                            <AlertTriangle className="h-4 w-4" />
                                            {storeError}
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={storeSaving}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                                    >
                                        {storeSaving ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4" />
                                                Register Store
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* ── 2. Add New Surplus Food Form ────────────────────────────── */}
                    <form
                        onSubmit={handleFoodSubmit}
                        className="animate-fade-in overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-card-dark"
                    >
                        {/* Form header */}
                        <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Add New Surplus Food
                                </h2>
                            </div>
                            <p className="mt-1 text-sm text-muted">
                                Fill in the details to list surplus food for rescue.
                            </p>
                        </div>

                        <div className="flex flex-col gap-5 p-6">
                            {/* Store selector — only partner's stores */}
                            <div>
                                <label className={labelClass}>
                                    <StoreIcon className="h-4 w-4 text-muted" />
                                    Store
                                </label>
                                <select
                                    name="store_id"
                                    value={foodForm.store_id}
                                    onChange={handleFoodChange}
                                    required
                                    className={inputClass}
                                >
                                    <option value="">Select your store...</option>
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                                {storesLoaded && stores.length === 0 && (
                                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                                        No stores registered yet. Open &quot;Register My Store&quot; above to add one first.
                                    </p>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className={labelClass}>
                                    <Tag className="h-4 w-4 text-muted" />
                                    Food Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={foodForm.title}
                                    onChange={handleFoodChange}
                                    required
                                    placeholder="e.g. Nasi Padang Combo"
                                    className={inputClass}
                                />
                            </div>

                            {/* Prices row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        <DollarSign className="h-4 w-4 text-muted" />
                                        Original Price (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        name="original_price"
                                        value={foodForm.original_price}
                                        onChange={handleFoodChange}
                                        required
                                        min="0"
                                        placeholder="25000"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        Discount Amount (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        name="discount_amount"
                                        value={foodForm.discount_amount}
                                        onChange={handleFoodChange}
                                        required
                                        min="0"
                                        placeholder="5000"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Live computed preview */}
                            {foodForm.original_price && foodForm.discount_amount && Number(foodForm.discount_amount) < Number(foodForm.original_price) && (
                                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm dark:bg-emerald-900/20 dark:border-emerald-800">
                                    <Brain className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-emerald-700 dark:text-emerald-400">
                                        <span>
                                            Final Price: <strong>Rp{(Number(foodForm.original_price) - Number(foodForm.discount_amount)).toLocaleString('id-ID')}</strong>
                                        </span>
                                        <span>
                                            Discount: <strong>{Math.round((Number(foodForm.discount_amount) / Number(foodForm.original_price)) * 100)}%</strong>
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Stock & Expiry row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        <Layers className="h-4 w-4 text-muted" />
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        value={foodForm.stock_quantity}
                                        onChange={handleFoodChange}
                                        required
                                        min="1"
                                        placeholder="10"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        <Calendar className="h-4 w-4 text-muted" />
                                        Expiry Date &amp; Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="expiry_date"
                                        value={foodForm.expiry_date}
                                        onChange={handleFoodChange}
                                        required
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* CO2 saved */}
                            <div>
                                <label className={labelClass}>
                                    <Package className="h-4 w-4 text-muted" />
                                    Estimated CO₂ Saved (kg)
                                </label>
                                <input
                                    type="number"
                                    name="co2_saved"
                                    value={foodForm.co2_saved}
                                    onChange={handleFoodChange}
                                    step="0.1"
                                    min="0"
                                    placeholder="0.5"
                                    className={inputClass}
                                />
                            </div>

                            {/* ── Food Image Upload ──────────────────────────────── */}
                            <div>
                                <label className={labelClass}>
                                    <ImagePlus className="h-4 w-4 text-muted" />
                                    Food Image
                                </label>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />

                                {imagePreview ? (
                                    /* Preview state */
                                    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                                        <img
                                            src={imagePreview}
                                            alt="Food preview"
                                            className="h-48 w-full object-cover"
                                        />
                                        {/* Remove button */}
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                                            title="Remove image"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        {/* File name overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                                            <p className="truncate text-xs font-medium text-white">
                                                {imageFile?.name}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Upload button state */
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-8 text-sm transition-all hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:hover:border-primary dark:hover:bg-primary/5"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                            <ImagePlus className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium text-gray-700 dark:text-gray-300">
                                                Click to upload a photo
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted">
                                                PNG, JPG, or WebP • Max 5MB
                                            </p>
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* ── AI Image Generator (Premium) ─────────────────── */}
                            <div className="relative">
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="h-px flex-1 bg-gray-200" />
                                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        <Brain className="h-3 w-3" />
                                        or
                                    </span>
                                    <div className="h-px flex-1 bg-gray-200" />
                                </div>
                                <AiImageGenerator
                                    isPremium={isPremium}
                                    foodTitle={foodForm.title}
                                    onImageGenerated={(url, blob) => {
                                        setImagePreview(url);
                                        setAiImageBlob(blob);
                                        // Create a File from the blob for the upload pipeline
                                        const file = new File([blob], `ai-${Date.now()}.png`, { type: 'image/png' });
                                        setImageFile(file);
                                    }}
                                    onUpgradeClick={() => setShowPremiumModal(true)}
                                />
                            </div>

                            {/* Success message */}
                            {foodSuccess && (
                                <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    Food item posted successfully! It&apos;s now visible on the marketplace.
                                </div>
                            )}

                            {/* Error message */}
                            {foodError && (
                                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                    <AlertTriangle className="h-4 w-4" />
                                    {foodError}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={foodLoading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                            >
                                {foodLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        {imageUploading ? 'Uploading image…' : 'Posting…'}
                                    </div>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Post Surplus Food
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* ── 3. Active Listings ──────────────────────────────────────── */}
                    <div className="animate-fade-in overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-card-dark">
                        <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Active Listings
                                </h2>
                                <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    {listings.length}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-muted">
                                Your currently posted surplus food items.
                            </p>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {listingsLoading ? (
                                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading listings…
                                </div>
                            ) : listings.length === 0 ? (
                                <div className="py-12 text-center text-sm text-muted">
                                    No active listings yet. Post surplus food above to get started!
                                </div>
                            ) : (
                                listings.map((item) => {
                                    const isExpired = new Date(item.expiry_date) < new Date();
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        >
                                            {/* Thumbnail */}
                                            {item.image_url && (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                                                />
                                            )}

                                            {/* Info */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.title}
                                                    </p>
                                                    {isExpired && (
                                                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                            Expired
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                                                    {item.stores?.name && (
                                                        <span className="flex items-center gap-1">
                                                            <StoreIcon className="h-3 w-3" />
                                                            {item.stores.name}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        Rp{Number(item.discount_price).toLocaleString()} off
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Layers className="h-3 w-3" />
                                                        {item.stock_quantity} left
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(item.expiry_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Delete button */}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={deletingId === item.id}
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-500 transition-all hover:bg-red-50 hover:text-red-700 active:scale-95 disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                                title="Delete listing"
                                            >
                                                {deletingId === item.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── 4. Verify Pickup Code ────────────────────────────────────── */}
                    <div className="animate-fade-in overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-card-dark">
                        <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <Search className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Verify Pickup
                                </h2>
                            </div>
                            <p className="mt-1 text-sm text-muted">
                                Enter the customer&apos;s 6-digit pickup code to complete their order.
                            </p>
                        </div>

                        <form onSubmit={handleVerifyPickup} className="flex flex-col gap-4 p-6">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={pickupInput}
                                    onChange={(e) => {
                                        setPickupInput(e.target.value);
                                        setVerifyResult(null);
                                        setVerifyError(null);
                                    }}
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    className={inputClass + ' font-mono text-center tracking-[0.3em] text-lg'}
                                />
                                <button
                                    type="submit"
                                    disabled={verifyLoading || pickupInput.trim().length < 6}
                                    className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                                >
                                    {verifyLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Verify
                                        </>
                                    )}
                                </button>
                            </div>

                            {verifyResult && (
                                <div className="flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3 dark:bg-green-900/20">
                                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                                    <div className="text-sm">
                                        <p className="font-semibold text-green-700 dark:text-green-400">
                                            Order completed successfully!
                                        </p>
                                        <p className="mt-1 text-green-600 dark:text-green-500">
                                            {verifyResult.title} × {verifyResult.quantity} — handed to customer.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {verifyError && (
                                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    {verifyError}
                                </div>
                            )}
                        </form>
                    </div>

                </div>
            </div>

            {/* Premium Upgrade Modal */}
            <PremiumUpgradeModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                onUpgradeSuccess={() => {
                    setIsPremium(true);
                    setShowPremiumModal(false);
                }}
            />
        </ProtectedRoute>
    );
}
