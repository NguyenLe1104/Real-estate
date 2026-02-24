import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Button, Typography, Space, Modal, Select, message, Empty, Spin, Badge } from 'antd';
import {
    CrownOutlined, ThunderboltOutlined, StarOutlined,
    ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';
import { postApi, paymentApi } from '@/api';
import { formatCurrency, formatDateTime } from '@/utils';
import type { Post, VipPackage } from '@/types';

const { Title, Text, Paragraph } = Typography;

const PACKAGE_COLORS: Record<number, string> = {
    1: '#faad14',
    2: '#fa8c16',
    3: '#f5222d',
};

const STATUS_CONFIG: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
    1: { label: 'Chờ duyệt', color: 'orange', icon: <ClockCircleOutlined /> },
    2: { label: 'Đã duyệt', color: 'green', icon: <CheckCircleOutlined /> },
    3: { label: 'Từ chối', color: 'red', icon: <CloseCircleOutlined /> },
};

const MyPostsPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);

    // VIP modal state
    const [vipModalOpen, setVipModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [packages, setPackages] = useState<VipPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<VipPackage | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'momo'>('vnpay');
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        loadMyPosts();
    }, []);

    const loadMyPosts = async () => {
        setLoading(true);
        try {
            const res = await postApi.getMyPosts();
            setPosts(res.data.data || res.data || []);
        } catch {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // ==================== VIP FUNCTIONS ====================

    const openVipModal = async (post: Post) => {
        setSelectedPost(post);
        setSelectedPackage(null);
        setVipModalOpen(true);

        try {
            const res = await paymentApi.getPackages({ limit: 20 });
            setPackages(res.data.data || []);
        } catch {
            message.error('Lỗi tải danh sách gói VIP');
        }
    };

    const handleCreatePayment = async () => {
        if (!selectedPost || !selectedPackage) return;

        setPaymentLoading(true);
        try {
            const returnUrl = `${window.location.origin}/payment/result`;
            const res = await paymentApi.createPayment({
                postId: selectedPost.id,
                packageId: selectedPackage.id,
                paymentMethod,
                returnUrl,
            });

            const { paymentUrl } = res.data.data;
            if (paymentUrl) {
                window.location.href = paymentUrl;
            }
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi tạo thanh toán');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleSimulatePayment = async () => {
        if (!selectedPost || !selectedPackage) return;

        setPaymentLoading(true);
        try {
            const createRes = await paymentApi.createPayment({
                postId: selectedPost.id,
                packageId: selectedPackage.id,
                paymentMethod: 'vnpay',
                returnUrl: `${window.location.origin}/payment/result`,
            });
            const { paymentId } = createRes.data.data;
            await paymentApi.simulateSuccess(paymentId);
            message.success('Đẩy VIP thành công! Tin đăng của bạn sẽ được ưu tiên hiển thị.');
            setVipModalOpen(false);
            loadMyPosts();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi thanh toán');
        } finally {
            setPaymentLoading(false);
        }
    };

    const parseFeatures = (features?: string) => {
        try { return features ? JSON.parse(features) : {}; } catch { return {}; }
    };

    // ==================== RENDER ====================

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 80 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
            <Title level={2}>Tin đăng của tôi</Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
                Quản lý các tin đăng bất động sản của bạn. Tin đã duyệt có thể mua gói VIP để được ưu tiên hiển thị.
            </Paragraph>

            {posts.length === 0 ? (
                <Empty description="Bạn chưa có tin đăng nào" />
            ) : (
                <Row gutter={[16, 16]}>
                    {posts.map((post) => {
                        const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG[1];
                        const isApproved = post.status === 2;
                        const isVip = post.isVip && post.vipExpiry && new Date(post.vipExpiry) > new Date();

                        return (
                            <Col xs={24} key={post.id}>
                                <Badge.Ribbon
                                    text={isVip ? '👑 VIP' : undefined}
                                    color={isVip ? 'gold' : undefined}
                                    style={isVip ? {} : { display: 'none' }}
                                >
                                    <Card
                                        hoverable
                                        style={{
                                            border: isVip ? '2px solid #faad14' : undefined,
                                        }}
                                    >
                                        <Row gutter={16} align="middle">
                                            {/* Ảnh thumbnail */}
                                            <Col xs={24} sm={6}>
                                                <div style={{
                                                    width: '100%',
                                                    height: 120,
                                                    borderRadius: 8,
                                                    overflow: 'hidden',
                                                    background: '#f5f5f5',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    {post.images && post.images.length > 0 ? (
                                                        <img
                                                            src={post.images[0].url}
                                                            alt={post.title}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <Text type="secondary">Chưa có ảnh</Text>
                                                    )}
                                                </div>
                                            </Col>

                                            {/* Thông tin bài đăng */}
                                            <Col xs={24} sm={12}>
                                                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                    <Text strong style={{ fontSize: 16 }}>{post.title}</Text>
                                                    <Text type="secondary">
                                                        <EnvironmentOutlined /> {post.address}, {post.ward}, {post.district}, {post.city}
                                                    </Text>
                                                    <Space>
                                                        <Text strong style={{ color: '#f5222d', fontSize: 15 }}>
                                                            {formatCurrency(post.price)}
                                                        </Text>
                                                        <Text type="secondary">• {post.area} m²</Text>
                                                    </Space>
                                                    <Space size={8}>
                                                        <Tag color={statusCfg.color} icon={statusCfg.icon}>
                                                            {statusCfg.label}
                                                        </Tag>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            Đăng: {formatDateTime(post.postedAt)}
                                                        </Text>
                                                    </Space>
                                                    {isVip && post.vipExpiry && (
                                                        <Text style={{ color: '#faad14', fontSize: 12 }}>
                                                            ⏰ VIP đến: {formatDateTime(post.vipExpiry)}
                                                        </Text>
                                                    )}
                                                </Space>
                                            </Col>

                                            {/* Actions */}
                                            <Col xs={24} sm={6} style={{ textAlign: 'right' }}>
                                                <Space direction="vertical" size={8}>
                                                    {isApproved && !isVip && (
                                                        <Button
                                                            type="primary"
                                                            icon={<CrownOutlined />}
                                                            style={{
                                                                backgroundColor: '#faad14',
                                                                borderColor: '#faad14',
                                                                width: '100%',
                                                            }}
                                                            onClick={() => openVipModal(post)}
                                                        >
                                                            Đẩy VIP
                                                        </Button>
                                                    )}
                                                    {isVip && (
                                                        <Tag color="gold" icon={<CrownOutlined />} style={{ margin: 0 }}>
                                                            Đang VIP
                                                        </Tag>
                                                    )}
                                                    {!isApproved && post.status === 1 && (
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            Đang chờ admin duyệt
                                                        </Text>
                                                    )}
                                                    {post.status === 3 && (
                                                        <Text type="danger" style={{ fontSize: 12 }}>
                                                            Bài bị từ chối
                                                        </Text>
                                                    )}
                                                </Space>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Badge.Ribbon>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* ==================== MODAL ĐẨY VIP ==================== */}
            <Modal
                title={
                    <Space>
                        <CrownOutlined style={{ color: '#faad14' }} />
                        <span>Mua gói VIP cho tin: {selectedPost?.title}</span>
                    </Space>
                }
                open={vipModalOpen}
                onCancel={() => setVipModalOpen(false)}
                footer={null}
                width={700}
            >
                <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                    Chọn gói VIP phù hợp để tin đăng của bạn được ưu tiên hiển thị lên đầu danh sách, thu hút nhiều khách hàng hơn.
                </Paragraph>

                {/* Chọn gói VIP */}
                <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
                    {packages.map((pkg) => {
                        const features = parseFeatures(pkg.features);
                        const color = PACKAGE_COLORS[pkg.priorityLevel] || '#1890ff';
                        const isSelected = selectedPackage?.id === pkg.id;

                        return (
                            <Col xs={24} sm={8} key={pkg.id}>
                                <Card
                                    hoverable
                                    size="small"
                                    onClick={() => setSelectedPackage(pkg)}
                                    style={{
                                        borderColor: isSelected ? color : undefined,
                                        borderWidth: isSelected ? 2 : 1,
                                        background: isSelected ? `${color}08` : undefined,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {pkg.priorityLevel === 3 ? (
                                        <CrownOutlined style={{ fontSize: 24, color }} />
                                    ) : pkg.priorityLevel === 2 ? (
                                        <ThunderboltOutlined style={{ fontSize: 24, color }} />
                                    ) : (
                                        <StarOutlined style={{ fontSize: 24, color }} />
                                    )}
                                    <div style={{ fontWeight: 'bold', margin: '8px 0 4px', color }}>
                                        {pkg.name}
                                    </div>
                                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                                        {formatCurrency(pkg.price)}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#888' }}>
                                        {pkg.durationDays} ngày
                                    </div>
                                    <div style={{ fontSize: 11, marginTop: 8, textAlign: 'left' }}>
                                        {features.topPost && <div>✅ Đưa tin lên đầu</div>}
                                        {features.highlight && <div>✅ Nổi bật</div>}
                                        {features.featured && <div>✅ Trang chủ</div>}
                                        {features.urgent && <div>✅ Đánh dấu gấp</div>}
                                    </div>
                                    {isSelected && (
                                        <Tag color={color} style={{ marginTop: 8 }}>✓ Đã chọn</Tag>
                                    )}
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

                {/* Thanh toán */}
                {selectedPackage && (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                Phương thức thanh toán:
                            </Text>
                            <Select
                                style={{ width: '100%' }}
                                value={paymentMethod}
                                onChange={setPaymentMethod}
                                options={[
                                    { label: '💳 VNPay (Thẻ ngân hàng / QR)', value: 'vnpay' },
                                    { label: '📱 MoMo (Ví điện tử)', value: 'momo' },
                                ]}
                            />
                        </div>

                        <Card size="small" style={{ background: '#fffbe6', marginBottom: 16 }}>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <span>
                                    Gói: <strong>{selectedPackage.name}</strong> ({selectedPackage.durationDays} ngày)
                                </span>
                                <span style={{ fontSize: 18, fontWeight: 'bold', color: '#f5222d' }}>
                                    {formatCurrency(selectedPackage.price)}
                                </span>
                            </Space>
                        </Card>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button
                                type="primary"
                                size="large"
                                block
                                loading={paymentLoading}
                                onClick={handleCreatePayment}
                            >
                                Thanh toán qua {paymentMethod === 'vnpay' ? 'VNPay' : 'MoMo'}
                            </Button>
                            <Button
                                size="large"
                                block
                                loading={paymentLoading}
                                onClick={handleSimulatePayment}
                                style={{ backgroundColor: '#52c41a', color: '#fff', borderColor: '#52c41a' }}
                            >
                                🧪 Test thanh toán
                            </Button>
                        </div>

                        <div style={{ marginTop: 12, padding: 10, background: '#f0f5ff', borderRadius: 6, fontSize: 12 }}>
                            <Text type="secondary">
                                💡 <strong>"Test thanh toán"</strong> mô phỏng thanh toán thành công ngay lập tức (dùng để test).
                                Chọn VNPay/MoMo để thanh toán qua cổng thanh toán thật.
                            </Text>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default MyPostsPage;
