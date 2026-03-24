import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import NewsMiniCard from "@/components/common/NewsMiniCard";

// ===== TYPES =====
interface PostImage {
    url: string;
    position: number;
}

interface User {
    id: number;
    fullName: string;
    phone?: string;
}

interface Post {
    id: number;
    title: string;
    city: string;
    district: string;
    ward: string;
    address: string;
    description: string;
    price: number;
    area: number;
    direction?: string;
    postedAt?: string;
    isVip?: boolean;
    user?: User;
    images?: PostImage[];
}

const API = "http://localhost:5000/api";

// ===== HELPERS =====
const getThumbnail = (images?: PostImage[]) => {
    if (!images?.length) return "https://via.placeholder.com/600x400";
    return [...images].sort((a, b) => a.position - b.position)[0].url;
};

const formatPrice = (v: number) => {
    if (v >= 1e9) return (v / 1e9).toFixed(1) + " tỷ";
    if (v >= 1e6) return (v / 1e6).toFixed(0) + " triệu";
    return v.toLocaleString("vi-VN") + " đ";
};

const maskPhone = (phone?: string, show = false) => {
    if (!phone) return "Đang cập nhật";
    if (show) return phone;

    const half = Math.ceil(phone.length / 2);
    return phone.slice(0, half) + "*".repeat(phone.length - half);
};

const NewsDetailPage = () => {
    const { id } = useParams();

    const [post, setPost] = useState<Post | null>(null);
    const [list, setList] = useState<Post[]>([]);
    const [showPhone, setShowPhone] = useState(false);

    // ===== FETCH ALL =====
    const fetchData = async () => {
        try {
            const [detailRes, listRes] = await Promise.all([
                axios.get(`${API}/posts/${id}`),
                axios.get(`${API}/posts/approved?page=1&limit=9`)
            ]);

            setPost(detailRes.data);
            setList(listRes.data.data || []);
            window.scrollTo(0, 0);
        } catch (err: any) {
            let errorMessage = "Có lỗi xảy ra, vui lòng thử lại!";

            if (err.response) {
                errorMessage = err.response.data?.message || `Lỗi server: ${err.response.status}`;
            } else if (err.request) {
                errorMessage = "Không thể kết nối đến server!";
            } else {
                errorMessage = err.message;
            }
            console.error("Chi tiết lỗi:", err);
            alert(errorMessage);
        }
    };

    useEffect(() => {
        setShowPhone(false);
        fetchData();
    }, [id]);

    // ===== RELATED =====
    const related = useMemo(() => {
        return list.filter((p) => p.id !== Number(id));
    }, [list, id]);

    // ===== USER POSTS =====
    const userPosts = useMemo(() => {
        if (!post?.user?.id) return [];
        return list.filter(
            (p) => p.user?.id === post.user?.id && p.id !== post.id
        );
    }, [list, post]);

    if (!post) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="bg-gray-100 min-h-screen py-6">
            <div className="max-w-[1200px] mx-auto px-4">

                {/* IMAGE + TITLE */}
                <div className="bg-white rounded-2xl p-4 shadow mb-6">
                    <img
                        src={getThumbnail(post.images)}
                        className="w-full h-[400px] object-cover rounded-xl"
                    />

                    <h1 className="text-2xl font-bold mt-4">{post.title}</h1>

                    <div className="text-red-500 text-xl font-bold mt-2">
                        {formatPrice(post.price)}
                    </div>

                    <div className="text-gray-500 mt-1">
                        📍 {post.address}
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">

                    {/* LEFT */}
                    <div className="col-span-8 space-y-6">

                        {/* ĐẶC ĐIỂM */}
                        <div className="bg-white rounded-2xl p-4 shadow">
                            <h2 className="font-bold mb-4">Đặc điểm bất động sản</h2>

                            <div className="grid grid-cols-2 gap-y-3 text-sm">
                                <div>Diện tích</div>
                                <div className="font-medium">{post.area} m²</div>

                                <div>Giá</div>
                                <div className="font-medium">{formatPrice(post.price)}</div>

                                <div>Hướng</div>
                                <div className="font-medium">
                                    {post.direction || "Không rõ"}
                                </div>

                                <div>Khu vực</div>
                                <div className="font-medium">
                                    {post.district}, {post.city}
                                </div>
                            </div>
                        </div>

                        {/* MÔ TẢ */}
                        <div className="bg-white rounded-2xl p-4 shadow">
                            <h2 className="font-bold mb-3">Mô tả chi tiết</h2>

                            <p className="text-gray-700 whitespace-pre-line">
                                {post.description}
                            </p>

                            <div className="mt-4 bg-gray-100 p-3 rounded-xl flex justify-between">
                                <span>
                                    📞 {maskPhone(post.user?.phone, showPhone)}
                                </span>

                                {!showPhone ? (
                                    <button
                                        onClick={() => setShowPhone(true)}
                                        className="text-blue-500 text-sm"
                                    >
                                        Hiện số
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(post.user?.phone || "");
                                            alert("Bạn đã sao chép!");
                                        }}
                                        className="text-blue-500 text-sm"
                                    >
                                        Sao chép
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* RELATED */}
                        <div className="bg-white rounded-2xl p-4 shadow">
                            <h2 className="font-bold mb-4">Các bài viết tương tự</h2>

                            <div className="grid grid-cols-3 gap-4">
                                {related.map((p) => (
                                    <NewsMiniCard key={p.id} post={p} />
                                ))}
                            </div>
                        </div>

                        {/* USER POSTS */}
                        {userPosts.length > 0 && (
                            <div className="bg-white rounded-2xl p-4 shadow">
                                <h2 className="font-bold mb-4">
                                    Tin khác của {post.user?.fullName}
                                </h2>

                                <div className="grid grid-cols-3 gap-4">
                                    {userPosts.map((p) => (
                                        <NewsMiniCard key={p.id} post={p} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-2xl p-4 shadow">
                            <h3 className="font-bold mb-3">Người đăng</h3>

                            <div className="text-sm">
                                <div className="font-medium">
                                    {post.user?.fullName || "Người dùng"}
                                </div>

                                <div className="text-gray-500 mt-1">
                                    📞 {maskPhone(post.user?.phone, showPhone)}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default NewsDetailPage;