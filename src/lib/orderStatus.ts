import type { Order } from '@/types';

export type OrderStatus = Order['status'];

type OrderStatusMeta = {
    label: string;
    partnerLabel?: string;
    badgeClassName: string;
};

const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
    pending: {
        label: 'Menunggu Pengambilan',
        badgeClassName:
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    completed: {
        label: 'Selesai',
        partnerLabel: 'Successfully Rescued',
        badgeClassName:
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    cancelled: {
        label: 'Dibatalkan',
        badgeClassName:
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
};

function isOrderStatus(value: string): value is OrderStatus {
    return value === 'pending' || value === 'completed' || value === 'cancelled';
}

export function getOrderStatusMeta(status: string) {
    if (isOrderStatus(status)) {
        return ORDER_STATUS_META[status];
    }

    return {
        label: 'Status Tidak Valid',
        partnerLabel: 'Invalid Status',
        badgeClassName: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
}
