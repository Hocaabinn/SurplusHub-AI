import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { getOrderStatusMeta } from '@/lib/orderStatus';

type OrderStatusBadgeProps = {
    status: string;
    context?: 'customer' | 'partner';
};

export default function OrderStatusBadge({
    status,
    context = 'customer',
}: OrderStatusBadgeProps) {
    const meta = getOrderStatusMeta(status);
    const label = context === 'partner' ? meta.partnerLabel || meta.label : meta.label;

    if (status === 'completed') {
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.badgeClassName}`}
            >
                <CheckCircle className="h-3.5 w-3.5" />
                {label}
            </span>
        );
    }

    if (status === 'cancelled') {
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.badgeClassName}`}
            >
                <XCircle className="h-3.5 w-3.5" />
                {label}
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.badgeClassName}`}
        >
            <Clock className="h-3.5 w-3.5" />
            {label}
        </span>
    );
}
