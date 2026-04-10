import React from 'react';
import { PostType, POST_TYPE_LABELS, POST_TYPE_GROUPS } from '@/types/post';

interface PostTypeSelectorProps {
    value: PostType | '';
    onChange: (value: PostType) => void;
    disabled?: boolean;
    showGroups?: boolean;
    mode?: 'select' | 'cards';
}

type TypeMeta = {
    icon: string;
    description: string;
    className: string;
};

const TYPE_META: Record<PostType, TypeMeta> = {
    [PostType.SELL_HOUSE]: {
        icon: 'Bán nhà',
        description: 'Đăng tin bán nhà, căn hộ, nhà phố',
        className: 'border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 text-rose-700',
    },
    [PostType.SELL_LAND]: {
        icon: 'Bán đất',
        description: 'Đăng tin bán đất nền, đất dự án',
        className: 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 text-amber-700',
    },
    [PostType.RENT_HOUSE]: {
        icon: 'Cho thuê',
        description: 'Cho thuê nhà, căn hộ, phòng trọ',
        className: 'border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700',
    },
    [PostType.RENT_LAND]: {
        icon: 'Cho thuê đất',
        description: 'Cho thuê đất, mặt bằng, kho bãi',
        className: 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-sky-50 text-indigo-700',
    },
    [PostType.NEED_BUY]: {
        icon: 'Cần mua',
        description: 'Đăng nhu cầu tìm mua bất động sản',
        className: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-50 text-emerald-700',
    },
    [PostType.NEED_RENT]: {
        icon: 'Cần thuê',
        description: 'Đăng nhu cầu tìm thuê bất động sản',
        className: 'border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-700',
    },
    [PostType.NEWS]: {
        icon: 'Tin tức',
        description: 'Đăng bài viết tin tức thị trường',
        className: 'border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-700',
    },
    [PostType.PROMOTION]: {
        icon: 'Khuyến mãi',
        description: 'Đăng chương trình ưu đãi, khuyến mãi',
        className: 'border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 text-pink-700',
    },
};

const GROUP_META: Record<'property' | 'need' | 'content', { title: string; helper: string }> = {
    property: {
        title: 'Bất động sản',
        helper: 'Tin bán và cho thuê nhà/đất',
    },
    need: {
        title: 'Nhu cầu tìm mua/thuê',
        helper: 'Người dùng đăng nhu cầu cần tìm',
    },
    content: {
        title: 'Nội dung truyền thông',
        helper: 'Tin tức và chương trình ưu đãi',
    },
};

const PostTypeSelector: React.FC<PostTypeSelectorProps> = ({
    value,
    onChange,
    disabled = false,
    showGroups = true,
    mode = 'select',
}) => {
    const postTypes = Object.values(PostType);

    if (mode === 'cards') {
        const renderCard = (type: PostType) => {
            const selected = value === type;
            const meta = TYPE_META[type];

            return (
                <button
                    key={type}
                    type="button"
                    onClick={() => onChange(type)}
                    disabled={disabled}
                    className={`group relative w-full rounded-2xl border p-4 text-left transition-all duration-200 ${meta.className} ${selected
                        ? 'ring-2 ring-offset-2 ring-brand-500 shadow-lg scale-[1.01]'
                        : 'hover:shadow-md hover:-translate-y-0.5'
                        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                    <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="flex min-h-9 items-center justify-center rounded-xl bg-white/80 px-3 text-xs font-bold shadow-sm">
                            {meta.icon}
                        </div>
                        {selected && (
                            <span className="rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-brand-700">
                                Đã chọn
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-gray-600">{meta.description}</div>
                </button>
            );
        };

        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600">
                        Loại bài đăng <span className="text-red-500">*</span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500">Chọn 1 loại để hiện các trường phù hợp</p>
                </div>

                <section className="space-y-2">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{GROUP_META.property.title}</p>
                        <p className="text-xs text-gray-500">{GROUP_META.property.helper}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {POST_TYPE_GROUPS.PROPERTY.map((type) => renderCard(type))}
                    </div>
                </section>

                <section className="space-y-2">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{GROUP_META.need.title}</p>
                        <p className="text-xs text-gray-500">{GROUP_META.need.helper}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {POST_TYPE_GROUPS.NEED.map((type) => renderCard(type))}
                    </div>
                </section>

                <section className="space-y-2">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{GROUP_META.content.title}</p>
                        <p className="text-xs text-gray-500">{GROUP_META.content.helper}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {POST_TYPE_GROUPS.CONTENT.map((type) => renderCard(type))}
                    </div>
                </section>
            </div>
        );
    }

    if (!showGroups) {
        return (
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as PostType)}
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
                <option value="">-- Chọn loại bài đăng --</option>
                {postTypes.map((type) => (
                    <option key={type} value={type}>
                        {POST_TYPE_LABELS[type]}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">
                Loại bài đăng <span className="text-red-500">*</span>
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as PostType)}
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
                <option value="">-- Chọn loại bài đăng --</option>

                <optgroup label="Bất động sản">
                    {POST_TYPE_GROUPS.PROPERTY.map((type) => (
                        <option key={type} value={type}>
                            {POST_TYPE_LABELS[type]}
                        </option>
                    ))}
                </optgroup>

                <optgroup label="Cần mua/thuê">
                    {POST_TYPE_GROUPS.NEED.map((type) => (
                        <option key={type} value={type}>
                            {POST_TYPE_LABELS[type]}
                        </option>
                    ))}
                </optgroup>

                <optgroup label="Nội dung">
                    {POST_TYPE_GROUPS.CONTENT.map((type) => (
                        <option key={type} value={type}>
                            {POST_TYPE_LABELS[type]}
                        </option>
                    ))}
                </optgroup>
            </select>
        </div>
    );
};

export default PostTypeSelector;
