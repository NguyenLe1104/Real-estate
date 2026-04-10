const CATEGORY_LABELS_VI: Record<string, string> = {
    HOUSE: 'Nhà ở',
    VILLA: 'Biệt thự',
    APARTMENT: 'Chung cư',
    TOWNHOUSE: 'Nhà phố',
    RESLAND: 'Đất ở',
    COMLAND: 'Đất thương mại',
    AGRLAND: 'Đất nông nghiệp',
    INDLAND: 'Đất công nghiệp',
};

const HOUSE_CATEGORY_CODES = new Set(['HOUSE', 'VILLA', 'APARTMENT', 'TOWNHOUSE']);
const LAND_CATEGORY_CODES = new Set(['RESLAND', 'COMLAND', 'AGRLAND', 'INDLAND']);

export const getLocalizedPropertyCategoryName = (code: string | undefined, fallbackName: string) => {
    if (!code) return fallbackName;
    return CATEGORY_LABELS_VI[code] || fallbackName;
};

export const isHouseCategoryCode = (code: string | undefined) => {
    if (!code) return false;
    return HOUSE_CATEGORY_CODES.has(code);
};

export const isLandCategoryCode = (code: string | undefined) => {
    if (!code) return false;
    return LAND_CATEGORY_CODES.has(code);
};
