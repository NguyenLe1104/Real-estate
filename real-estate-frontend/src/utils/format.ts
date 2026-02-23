import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format = 'DD/MM/YYYY') => {
    return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date) => {
    return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

export const formatArea = (area: number | undefined) => {
    if (area === undefined || area === null) return 'N/A';
    return `${area} m²`;
};

export const getFullAddress = (property: {
    houseNumber?: string;
    plotNumber?: string;
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
}) => {
    const parts = [
        property.houseNumber || property.plotNumber,
        property.street,
        property.ward,
        property.district,
        property.city,
    ].filter(Boolean);
    return parts.join(', ') || 'Chưa cập nhật';
};

export const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
