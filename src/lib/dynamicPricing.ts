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
    /** Harga diskon awal (dari database) */
    baseDiscountPrice: number;
    /** Harga original */
    originalPrice: number;
    /** Persentase diskon total dari harga original (0-100) */
    totalDiscountPercent: number;
    /** Persentase dynamic discount tambahan dari base discount (0-100) */
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
 * @param discountPrice - Harga diskon awal (dari partner)
 * @param expiryDate - Waktu kadaluarsa
 * @param createdAt - Waktu listing dibuat (optional, defaults to 24h before expiry)
 */
export function calculateDynamicPrice(
    originalPrice: number,
    discountPrice: number,
    expiryDate: string,
    createdAt?: string,
): DynamicPriceResult {
    const now = Date.now();
    const expiryTime = new Date(expiryDate).getTime();
    const timeRemaining = expiryTime - now;

    // If expired
    if (timeRemaining <= 0) {
        return {
            currentPrice: Math.round(originalPrice * 0.1), // 90% off - super low
            baseDiscountPrice: discountPrice,
            originalPrice,
            totalDiscountPercent: 90,
            dynamicDiscountPercent: Math.round(((discountPrice - originalPrice * 0.1) / discountPrice) * 100),
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
    const totalTimespan = expiryTime - createdTime;
    const timeRatio = Math.min(1, Math.max(0, timeRemaining / totalTimespan));

    const hoursLeft = timeRemaining / (1000 * 60 * 60);

    // ── Dynamic Pricing Algorithm ──
    // Phase 1: Normal (>6h left) - no extra discount
    // Phase 2: Dropping (2-6h left) - gradual 5-25% extra discount
    // Phase 3: Flash Sale (1-2h left) - 25-45% extra discount
    // Phase 4: Last Chance (<1h left) - 45-65% extra discount

    let dynamicDiscountFactor = 0; // 0 = no extra discount, 1 = max extra discount

    if (hoursLeft > 6) {
        // Normal phase - slight discount for early birds
        dynamicDiscountFactor = 0.05 * easeInOut(1 - (hoursLeft - 6) / 18); // 0-5%
    } else if (hoursLeft > 2) {
        // Dropping phase
        const phaseProgress = 1 - (hoursLeft - 2) / 4; // 0→1 as 6h→2h
        dynamicDiscountFactor = 0.05 + 0.20 * easeInOut(phaseProgress); // 5-25%
    } else if (hoursLeft > 1) {
        // Flash sale phase
        const phaseProgress = 1 - (hoursLeft - 1) / 1; // 0→1 as 2h→1h
        dynamicDiscountFactor = 0.25 + 0.20 * easeInOut(phaseProgress); // 25-45%
    } else {
        // Last chance phase
        const phaseProgress = 1 - hoursLeft; // 0→1 as 1h→0h
        dynamicDiscountFactor = 0.45 + 0.20 * sigmoid(phaseProgress, 4); // 45-65%
    }

    // Calculate final price
    // Apply dynamic discount on top of the base discount price
    const dynamicReduction = discountPrice * dynamicDiscountFactor;
    const rawPrice = discountPrice - dynamicReduction;

    // Floor price: never go below 10% of original
    const floorPrice = originalPrice * 0.10;
    const currentPrice = Math.max(floorPrice, Math.round(rawPrice / 100) * 100); // Round to nearest 100 Rp

    const totalDiscountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    const dynamicDiscountPercent = Math.round(dynamicDiscountFactor * 100);

    // Determine urgency label
    let urgencyLabel: DynamicPriceResult['urgencyLabel'];
    let urgencyColor: string;
    let urgencyIcon: string;

    if (hoursLeft > 6) {
        urgencyLabel = 'normal';
        urgencyColor = 'from-emerald-400 to-green-500';
        urgencyIcon = '🟢';
    } else if (hoursLeft > 2) {
        urgencyLabel = 'dropping';
        urgencyColor = 'from-amber-400 to-orange-500';
        urgencyIcon = '📉';
    } else if (hoursLeft > 1) {
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
        baseDiscountPrice: discountPrice,
        originalPrice,
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
