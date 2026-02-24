import { useEffect, useState } from 'react';
import { Result, Button, Card, Spin, Typography } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';

const { Text } = Typography;

const PaymentResultPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Check URL params from VNPay/MoMo callback redirect
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        const momoResultCode = searchParams.get('resultCode');

        if (vnpResponseCode !== null) {
            setSuccess(vnpResponseCode === '00');
        } else if (momoResultCode !== null) {
            setSuccess(momoResultCode === '0');
        } else {
            // Default: check if redirected from success/failed
            const path = window.location.pathname;
            setSuccess(path.includes('success'));
        }

        setLoading(false);
    }, [searchParams]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 80 }}>
                <Spin size="large" />
                <p>Đang xử lý kết quả thanh toán...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 600, margin: '60px auto', padding: 24 }}>
            <Card>
                {success ? (
                    <Result
                        status="success"
                        title="Thanh toán thành công!"
                        subTitle="Gói VIP đã được kích hoạt. Tin đăng của bạn sẽ được ưu tiên hiển thị."
                        extra={[
                            <Button type="primary" key="posts" onClick={() => navigate('/admin/posts')}>
                                Xem tin đăng
                            </Button>,
                            <Button key="vip" onClick={() => navigate('/admin/vip-packages')}>
                                Mua thêm gói VIP
                            </Button>,
                            <Button key="history" onClick={() => navigate('/admin/payment-history')}>
                                Lịch sử thanh toán
                            </Button>,
                        ]}
                    />
                ) : (
                    <Result
                        status="error"
                        title="Thanh toán thất bại"
                        subTitle="Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."
                        extra={[
                            <Button type="primary" key="retry" onClick={() => navigate('/admin/vip-packages')}>
                                Thử lại
                            </Button>,
                            <Button key="home" onClick={() => navigate('/admin')}>
                                Về trang chủ
                            </Button>,
                        ]}
                    />
                )}

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Nếu bạn gặp vấn đề, vui lòng liên hệ hỗ trợ.
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default PaymentResultPage;
