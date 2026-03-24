import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NewsCard from "@/components/common/NewsCard";
import type { Post } from "@/types/post";

interface PostImage {
  url: string;
  position: number;
}

const API_URL = "http://localhost:5000/api/posts/approved";

const getThumbnail = (images?: PostImage[]) => {
  if (!images?.length)
    return "https://via.placeholder.com/600x400?text=No+Image";

  return [...images].sort((a, b) => a.position - b.position)[0]?.url;
};

const NewsPage = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [vipPosts, setVipPosts] = useState<Post[]>([]);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [hasMore, setHasMore] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  };

  // ===== FETCH =====
  const fetchPosts = async (pageNumber = 1, append = false) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}?page=${pageNumber}&limit=6`
      );

      const payload = res?.data || {};
      const list: Post[] = payload.data || [];

      setHasMore(pageNumber < (payload.totalPages || 1));

      if (append) {
        setPosts((prev) => [...prev, ...list]);
        setExpanded(true);
      } else {
        setPosts(list);
        setExpanded(false);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVip = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts/vip");
      setVipPosts(res.data || []);
    } catch (e) {
      console.error("VIP fetch error:", e);
    }
  };

  useEffect(() => {
    fetchPosts(1);
    fetchVip();
  }, []);

  // ===== HERO =====
  const heroPost = useMemo(() => {
    return vipPosts[0] || posts[0];
  }, [vipPosts, posts]);

  // ===== LATEST =====
  const latestPosts = useMemo(() => {
    return [...posts]
      .sort(
        (a, b) =>
          new Date(b.postedAt || b.createdAt || 0).getTime() -
          new Date(a.postedAt || a.createdAt || 0).getTime()
      )
      .slice(0, 3);
  }, [posts]);

  // ===== MOST VIEWED =====
  const mostViewed = useMemo(() => {
    return posts.slice(0, 5);
  }, [posts]);

  //  CHIA BÀI THƯỜNG
  const normalPosts = useMemo(() => {
    return posts.filter((p) => !p.isVip);
  }, [posts]);

  // ===== ACTION =====
  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    await fetchPosts(next, true);
  };

  const handleCollapse = async () => {
    setPage(1);
    await fetchPosts(1);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 py-6">

        {/* HERO + RIGHT */}
        {heroPost && (
          <div className="grid grid-cols-12 gap-4 mb-6">

            {/* HERO */}
            <div
              onClick={() => navigate(`/posts/${heroPost.id}`)}
              className="col-span-8 relative rounded-2xl overflow-hidden cursor-pointer"
            >
              <img
                src={getThumbnail(heroPost.images)}
                className="w-full h-[340px] object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />

              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-xl font-bold">{heroPost.title}</h2>
                <div className="text-sm">
                  {heroPost.district}, {heroPost.city}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="col-span-4 flex flex-col gap-4">

              <div className="bg-white rounded-2xl p-4 shadow">
                <h3 className="font-bold mb-3">Bài viết mới đăng</h3>

                {latestPosts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/posts/${p.id}`)}
                    className="text-sm mb-2 cursor-pointer hover:text-orange-500"
                  >
                    {p.title}
                  </div>
                ))}
              </div>

              <div className="bg-white p-4 rounded-2xl shadow">
                <h3 className="font-bold mb-3">Bài viết xem nhiều</h3>

                {mostViewed.map((p, i) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/posts/${p.id}`)}
                    className="flex gap-2 py-2 border-b cursor-pointer hover:text-orange-500"
                  >
                    <span className="text-orange-500 font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm">{p.title}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* VIP */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-orange-500 mb-3">
            🔥 Bài viết VIP nổi bật
          </h2>

          <div className="space-y-4">
            {vipPosts.length === 0 ? (
              <div className="text-gray-400 text-sm">
                Hiện chưa có bài VIP
              </div>
            ) : (
              vipPosts.map((post) => (
                <NewsCard
                  key={post.id}
                  post={post}
                  isFavorite={favorites.includes(post.id)}
                  onToggleFavorite={() => toggleFavorite(post.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ===== BÀI THƯỜNG ===== */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">
            📄 Bài viết mới nhất
          </h2>

          <div className="space-y-4">
            {normalPosts.map((post) => (
              <NewsCard
                key={post.id}
                post={post}
                isFavorite={favorites.includes(post.id)}
                onToggleFavorite={() => toggleFavorite(post.id)}
              />
            ))}
          </div>

          <div className="text-center mt-4">
            {hasMore && (
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 bg-orange-500 text-white rounded"
              >
                {loading ? "Đang tải..." : "Xem thêm"}
              </button>
            )}

            {!hasMore && expanded && (
              <button
                onClick={handleCollapse}
                className="px-4 py-2 border rounded"
              >
                Thu gọn
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewsPage;