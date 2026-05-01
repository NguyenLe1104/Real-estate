import { useNavigate } from "react-router-dom";
import type { Post, PostImage } from "@/types/post";

interface Props {
    post: Post;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

const formatPrice = (v?: number) => {
    if (!v && v !== 0) return "Liên hệ";
    if (v >= 1e9) return (v / 1e9).toFixed(1) + " tỷ";
    if (v >= 1e6) return (v / 1e6).toFixed(0) + " triệu";
    return v.toLocaleString("vi-VN") + " đ";
};

const getThumbnail = (images?: PostImage[]) => {
    if (!images?.length) return "";
    return [...images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0].url;
};

/** Gradient + icon placeholder per post type */
const CARD_TYPE_STYLE: Record<string, { gradient: string; icon: string }> = {
    NEED_BUY:   { gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", icon: "🔍" },
    NEED_RENT:  { gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", icon: "🔑" },
    NEWS:       { gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", icon: "📰" },
    PROMOTION:  { gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", icon: "🎁" },
    SELL_HOUSE: { gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", icon: "🏠" },
    SELL_LAND:  { gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", icon: "🌿" },
    RENT_HOUSE: { gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)", icon: "🏡" },
    RENT_LAND:  { gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", icon: "🌾" },
};
const DEFAULT_CARD_STYLE = { gradient: "linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)", icon: "📋" };

const formatDateTime = (d?: string | null) => {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("vi-VN");
};

const toPlainText = (value?: string) => {
    if (!value) return "";

    return value
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
};

const NewsCard = ({ post }: Props) => {
    const navigate = useNavigate();
    const thumb = getThumbnail(post.images);
    const typeStyle = CARD_TYPE_STYLE[post.postType] ?? DEFAULT_CARD_STYLE;

    return (
        <div
            onClick={() => navigate(`/posts/${post.id}`)}
            className={`relative p-4 rounded-2xl flex gap-4 cursor-pointer transition hover:scale-[1.01]
      ${post.isVip
                    ? (post.vipPriorityLevel && post.vipPriorityLevel >= 3 
                        ? 'bg-white border-[2px] border-[#d97706] shadow-lg' 
                        : post.vipPriorityLevel === 2 
                            ? 'bg-white border-[2px] border-[#7c3aed] shadow-md' 
                            : 'bg-white border-[2px] border-[#2563eb] shadow-md'
                      )
                    : "bg-white border border-transparent shadow hover:shadow-md"
                }`}
        >


            {/* IMAGE */}
            <div className="relative w-[240px] h-[160px]">
                {thumb ? (
                    <img
                        src={thumb}
                        className="w-full h-full object-cover rounded-xl"
                    />
                ) : (
                    <div
                        className="w-full h-full rounded-xl flex flex-col items-center justify-center gap-2 bg-[#f3f4f6]"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b0b8c4" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                            {post.postType?.replace(/_/g, ' ') ?? 'Bài viết'}
                        </span>
                    </div>
                )}

                {post.isVip && (
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                        {post.vipPriorityLevel && post.vipPriorityLevel >= 3 && (
                            <>
                                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                    ⚡ Tin Khẩn
                                </span>
                                <span className="bg-[#d97706] text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                    👑 VIP Pro
                                </span>
                            </>
                        )}
                        {post.vipPriorityLevel === 2 && (
                            <span className="bg-[#7c3aed] text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                ✨ Nổi bật (Standard)
                            </span>
                        )}
                        {(!post.vipPriorityLevel || post.vipPriorityLevel === 1) && (
                            <span className="bg-[#2563eb] text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                💎 VIP (Basic)
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1">
                <h3 className="text-lg font-semibold">{post.title}</h3>

                <p className="text-sm text-gray-500 line-clamp-2">
                    {toPlainText(post.description)}
                </p>

                <div className="flex gap-4 mt-2">
                    <span className="text-red-500 font-bold">
                        {formatPrice(post.price)}
                    </span>
                    <span>{post.area != null ? `${post.area} m²` : '—'}</span>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                    📍 {[post.ward, post.district, post.city].filter(Boolean).join(", ") || "—"}
                </div>

                <div className="text-xs text-gray-400 mt-1">
                    🕒 {formatDateTime(post.postedAt || post.createdAt)}
                </div>
            </div>
        </div>
    );
};

export default NewsCard;