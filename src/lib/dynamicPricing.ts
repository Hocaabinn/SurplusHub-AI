/**
 * Smart Dynamic Pricing Engine (AI-Driven)
 * 
 * Calculates real-time pricing based on remaining time until expiry_date.
 * The closer it gets to expiration, the lower the price for zero waste outcomes.
 * 
 * Uses a sigmoid-like curve to keep price transitions smooth and natural.
 */

export interface DynamicPriceResult {
    /** Current price after dynamic pricing */
    currentPrice: number;
    /** Final seller price after seller discount (originalPrice - discountAmount) */
    sellerFinalPrice: number;
    /** Seller discount percentage from original price (0-100) */
    sellerDiscountPercent: number;
    /** Original price */
    originalPrice: number;
    /** Total discount percentage from original price (0-100) */
    totalDiscountPercent: number;
    /** Additional AI dynamic discount percentage (0-100), above seller discount */
    dynamicDiscountPercent: number;
    /** Label urgency: 'normal' | 'dropping' | 'flash-sale' | 'last-chance' */
    urgencyLabel: 'normal' | 'dropping' | 'flash-sale' | 'last-chance';
    /** UI gradient color */
    urgencyColor: string;
    /** Emoji icon */
    urgencyIcon: string;
    /** Time ratio (1.0 = just started, 0.0 = already expired) */
    timeRatio: number;
    /** Remaining hours */
    hoursLeft: number;
    /** Whether the item is expired */
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
 * @param originalPrice - Product original price
 * @param discountAmount - Seller nominal discount amount (in Rupiah)
 * @param expiryDate - Expiration time
 * @param createdAt - Listing creation time (optional, defaults to 24h before expiry)
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
            return 'Stable Price';
        case 'dropping':
            return 'Price Dropping';
        case 'flash-sale':
            return 'Flash Sale';
        case 'last-chance':
            return 'Last Chance!';
    }
}

/**
 * Get description for the AI pricing explanation
 */
export function getDynamicPriceDescription(result: DynamicPriceResult): string {
    if (result.isExpired) {
        return 'This item has passed its pickup window. Lowest possible price unlocked.';
    }
    switch (result.urgencyLabel) {
        case 'normal':
            return 'AI is keeping the price stable because there is still plenty of time left.';
        case 'dropping':
            return `AI lowered the price by an extra ${result.dynamicDiscountPercent}% to accelerate conversions.`;
        case 'flash-sale':
            return `⚡ Flash Sale! AI applied an aggressive ${result.dynamicDiscountPercent}% boost to maximize rescue potential.`;
        case 'last-chance':
            return `🔥 Lowest price now! AI pushed discounts up to ${result.dynamicDiscountPercent}% to avoid food waste.`;
    }
}
