/**
 * Smart Dynamic Pricing Engine (AI-Driven)
 * 
 * Menghitung harga real-time berdasarkan sisa waktu menuju expiry_date.
 * Semakin dekat waktu kadaluarsa, harga semakin turun untuk zero waste.
 * 
 * Menggunakan sigmoid-like curve agar transisi harga terasa natural.
 */

export interface DynamicPriceResult {
    /** Harga saat ini setelah dynamic pricing */
    currentPrice: number;
    /** Harga final setelah diskon seller (originalPrice - discountAmount) */
    sellerFinalPrice: number;
    /** Persentase diskon seller dari harga original (0-100) */
    sellerDiscountPercent: number;
    /** Harga original */
    originalPrice: number;
    /** Persentase diskon total dari harga original (0-100) */
    totalDiscountPercent: number;
    /** Persentase dynamic discount tambahan dari AI (0-100), di atas seller discount */
    dynamicDiscountPercent: number;
    /** Label urgency: 'normal' | 'dropping' | 'flash-sale' | 'last-chance' */
    urgencyLabel: 'normal' | 'dropping' | 'flash-sale' | 'last-chance';
    /** Warna gradient untuk UI */
    urgencyColor: string;
    /** Icon emoji */
    urgencyIcon: string;
    /** Time ratio (1.0 = baru mulai, 0.0 = sudah expired) */
    timeRatio: number;
    /** Sisa jam */
    hoursLeft: number;
    /** Apakah sudah expired */
    isExpired: boolean;
}

/**
 * Sigmoid function for smooth price transition
 * Returns value between 0 and 1
 */
function sigmoid(x: number, steepness: number = 6): number {
    return 1 / (1 + Math.exp(-steepness * (x - 0.5)));
}

/**
 * Ease-in-out function for smoother transitions
 */
function easeInOut(t: number): number {
    return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Calculate dynamic price based on time remaining
 * 
 * @param originalPrice - Harga asli produk
 * @param discountAmount - Potongan harga nominal dari seller (dalam Rupiah)
 * @param expiryDate - Waktu kadaluarsa
 * @param createdAt - Waktu listing dibuat (optional, defaults to 24h before expiry)
 */
export function calculateDynamicPrice(
    originalPrice: number,
    discountAmount: number,
    expiryDate: string,
    createdAt?: string,
): DynamicPriceResult {
    // ── NaN-safe input sanitization ──
    const safeOriginalPrice = Math.max(0, Number(originalPrice) || 0);
    const safeDiscountAmount = Math.max(0, Math.min(Number(discountAmount) || 0, safeOriginalPrice > 0 ? safeOriginalPrice - 1 : 0));

    const now = Date.now();
    const expiryTime = new Date(expiryDate).getTime();
    const timeRemaining = isNaN(expiryTime) ? 0 : expiryTime - now;

    // Seller's base calculations
    const sellerFinalPrice = Math.max(0, safeOriginalPrice - safeDiscountAmount);
    const sellerDiscountPercent = safeOriginalPrice > 0
        ? Math.round((safeDiscountAmount / safeOriginalPrice) * 100)
        : 0;

    // If expired
    if (timeRemaining <= 0) {
        const expiredDiscountPercent = 90;
        const expiredPrice = Math.round(safeOriginalPrice * 0.1); // 90% off
        return {
            currentPrice: expiredPrice,
            sellerFinalPrice,
            sellerDiscountPercent,
            originalPrice: safeOriginalPrice,
            totalDiscountPercent: expiredDiscountPercent,
            dynamicDiscountPercent: expiredDiscountPercent - sellerDiscountPercent,
            urgencyLabel: 'last-chance',
            urgencyColor: 'from-red-500 to-rose-600',
            urgencyIcon: '🔥',
            timeRatio: 0,
            hoursLeft: 0,
            isExpired: true,
        };
    }

    // Calculate total timespan
    const createdTime = createdAt
        ? new Date(createdAt).getTime()
        : expiryTime - 24 * 60 * 60 * 1000; // Default: assume 24h listing
    const totalTimespan = Math.max(1, expiryTime - createdTime); // Prevent division by zero
    const timeRatio = Math.min(1, Math.max(0, timeRemaining / totalTimespan));

    const hoursLeft = timeRemaining / (1000 * 60 * 60);

    // ── AI Dynamic Pricing Algorithm ──
    // AI starts from seller's base discount % and increases it over time.
    // The discount is always calculated from originalPrice.
    //
    // Phase 1: Normal (>3h left) - seller discount only (no AI boost)
    // Phase 2: Dropping (1-3h left) - AI boosts to ~25% total discount minimum
    // Phase 3: Flash Sale (0.5-1h left) - AI boosts to ~35% total discount minimum
    // Phase 4: Last Chance (<0.5h left) - AI boosts to ~50% total discount minimum

    let aiTargetDiscountPercent = sellerDiscountPercent; // Start from seller's base

    if (hoursLeft > 3) {
        // Normal phase - seller discount only, slight AI nudge near threshold
        const nudge = 2 * easeInOut(Math.max(0, 1 - (hoursLeft - 3) / 21)); // 0-2% nudge
        aiTargetDiscountPercent = sellerDiscountPercent + nudge;
    } else if (hoursLeft > 1) {
        // Dropping phase: ramp toward 25% minimum (or higher if seller already above)
        const phaseProgress = easeInOut(1 - (hoursLeft - 1) / 2); // 0→1 as 3h→1h
        const targetMin = Math.max(sellerDiscountPercent, 25);
        aiTargetDiscountPercent = sellerDiscountPercent + (targetMin - sellerDiscountPercent) * phaseProgress;
    } else if (hoursLeft > 0.5) {
        // Flash sale phase: ramp toward 35% minimum
        const phaseProgress = easeInOut(1 - (hoursLeft - 0.5) / 0.5); // 0→1 as 1h→0.5h
        const targetMin = Math.max(sellerDiscountPercent, 35);
        aiTargetDiscountPercent = Math.max(sellerDiscountPercent, 25) + (targetMin - Math.max(sellerDiscountPercent, 25)) * phaseProgress;
    } else {
        // Last chance phase: ramp toward 50% minimum
        const phaseProgress = sigmoid(1 - hoursLeft / 0.5, 4); // 0→1 as 0.5h→0h
        const targetMin = Math.max(sellerDiscountPercent, 50);
        const baseForPhase = Math.max(sellerDiscountPercent, 35);
        aiTargetDiscountPercent = baseForPhase + (targetMin - baseForPhase) * phaseProgress;
    }

    // Ensure AI discount never goes below seller's base discount
    aiTargetDiscountPercent = Math.max(aiTargetDiscountPercent, sellerDiscountPercent);

    // Calculate final price from originalPrice
    const rawPrice = safeOriginalPrice * (1 - aiTargetDiscountPercent / 100);

    // Floor price: never go below 10% of original
    const floorPrice = safeOriginalPrice * 0.10;
    const currentPrice = Math.max(floorPrice, Math.round(rawPrice / 100) * 100); // Round to nearest 100 Rp

    const totalDiscountPercent = safeOriginalPrice > 0
        ? Math.round(((safeOriginalPrice - currentPrice) / safeOriginalPrice) * 100)
        : 0;
    const dynamicDiscountPercent = Math.max(0, totalDiscountPercent - sellerDiscountPercent);

    // Determine urgency label
    let urgencyLabel: DynamicPriceResult['urgencyLabel'];
    let urgencyColor: string;
    let urgencyIcon: string;

    if (hoursLeft > 3) {
        urgencyLabel = 'normal';
        urgencyColor = 'from-emerald-400 to-green-500';
        urgencyIcon = '🟢';
    } else if (hoursLeft > 1) {
        urgencyLabel = 'dropping';
        urgencyColor = 'from-amber-400 to-orange-500';
        urgencyIcon = '📉';
    } else if (hoursLeft > 0.5) {
        urgencyLabel = 'flash-sale';
        urgencyColor = 'from-orange-500 to-red-500';
        urgencyIcon = '⚡';
    } else {
        urgencyLabel = 'last-chance';
        urgencyColor = 'from-red-500 to-rose-600';
        urgencyIcon = '🔥';
    }

    return {
        currentPrice,
        sellerFinalPrice,
        sellerDiscountPercent,
        originalPrice: safeOriginalPrice,
        totalDiscountPercent,
        dynamicDiscountPercent,
        urgencyLabel,
        urgencyColor,
        urgencyIcon,
        timeRatio,
        hoursLeft,
        isExpired: false,
    };
}

/**
 * Get human-readable label for dynamic pricing status
 */
export function getDynamicPriceLabel(result: DynamicPriceResult): string {
    switch (result.urgencyLabel) {
        case 'normal':
            return 'Harga Stabil';
        case 'dropping':
            return 'Harga Turun';
        case 'flash-sale':
            return 'Flash Sale';
        case 'last-chance':
            return 'Kesempatan Terakhir!';
    }
}

/**
 * Get description for the AI pricing explanation
 */
export function getDynamicPriceDescription(result: DynamicPriceResult): string {
    if (result.isExpired) {
        return 'Produk sudah melewati batas waktu. Harga terendah!';
    }
    switch (result.urgencyLabel) {
        case 'normal':
            return 'AI mempertahankan harga stabil karena masih banyak waktu tersisa.';
        case 'dropping':
            return `AI menurunkan harga ${result.dynamicDiscountPercent}% ekstra untuk mendorong pembelian.`;
        case 'flash-sale':
            return `⚡ Flash Sale! AI memberikan diskon agresif ${result.dynamicDiscountPercent}% untuk zero waste.`;
        case 'last-chance':
            return `🔥 Harga terendah! AI memaksimalkan diskon ${result.dynamicDiscountPercent}% agar tidak terbuang.`;
    }
}
