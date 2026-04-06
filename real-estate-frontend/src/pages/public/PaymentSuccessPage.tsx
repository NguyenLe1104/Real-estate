import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button, Card, Statistic, Spin, message } from 'antd';
import { CheckCircleOutlined, CalendarOutlined, GiftOutlined } from '@ant-design/icons';
import { paymentApi } from '@/api';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      
      // Get the last payment ID from sessionStorage or localStorage
      const lastPaymentId = sessionStorage.getItem('lastPaymentId') || localStorage.getItem('lastPaymentId');
      
      if (!lastPaymentId) {
        // Try to get from user's payment list
        const res = await paymentApi.getMyPayments({ limit: 1 });
        const payments = res.data?.data || [];
        
        if (payments.length === 0) {
          setError(true);
          message.warning('Không tìm thấy thông tin thanh toán');
          return;
        }
        
        setPaymentData(payments[0]);
        localStorage.removeItem('lastPaymentId');
      } else {
        // Fetch specific payment
        const res = await paymentApi.getPaymentById(parseInt(lastPaymentId));
        setPaymentData(res.data?.data);
        sessionStorage.removeItem('lastPaymentId');
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
      setError(true);
      message.error('❌ Không thể tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin description="Đang tải thông tin..." />
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="500"
        title="Lỗi"
        subTitle="Không thể tải thông tin thanh toán. Vui lòng thử lại sau."
        extra={[
          <Button type="primary" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>,
          <Button onClick={() => navigate(-1)}>
            Quay lại
          </Button>,
        ]}
      />
    );
  }

  const endDate = paymentData?.subscription?.endDate
    ? new Date(paymentData.subscription.endDate).toLocaleDateString('vi-VN')
    : 'N/A';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Success Result */}
        <Result
          status="success"
          title="Thanh toán thành công!"
          subTitle="Tài khoản VIP của bạn đã được kích hoạt. Bạn có thể bắt đầu tận hưởng các quyền lợi VIP ngay bây giờ."
          extra={[
            <Button type="primary" size="large" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>,
            <Button size="large" onClick={() => navigate('/account/profile')}>
              Xem hồ sơ
            </Button>,
          ]}
        />

        {/* Payment Details Card */}
        {paymentData && (
          <Card style={{ marginTop: 30, borderRadius: 12 }}>
            <h2 style={{ marginBottom: 24, fontSize: 18, fontWeight: 'bold' }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              Chi tiết thanh toán
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <Statistic
                title="Gói VIP"
                value={paymentData.subscription?.package?.name || 'N/A'}
                prefix={<GiftOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: 16 }}
              />
              <Statistic
                title="Thời hạn"
                value={`${paymentData.subscription?.package?.durationDays || 0} ngày`}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#faad14', fontSize: 16 }}
              />
              <Statistic
                title="Ngày hết hạn"
                value={endDate}
                valueStyle={{ color: '#666', fontSize: 14 }}
              />
              <Statistic
                title="Số tiền"
                value={paymentData.amount || 0}
                suffix="VND"
                valueStyle={{ color: '#52c41a', fontSize: 16 }}
              />
            </div>

            {/* Features */}
            {paymentData.subscription?.package?.features && (
              <>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                  <h3 style={{ marginBottom: 12 }}>Quyền lợi VIP bao gồm:</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(Array.isArray(paymentData.subscription.package.features)
                      ? paymentData.subscription.package.features
                      : typeof paymentData.subscription.package.features === 'string'
                        ? [paymentData.subscription.package.features]
                        : []
                    ).map((feature: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: 8 }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginTop: 2 }} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Payment Info */}
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 16 }}>
              <h3 style={{ marginBottom: 12 }}>Thông tin giao dịch</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
                <div>
                  <p style={{ color: '#999', marginBottom: 4 }}>Mã thanh toán</p>
                  <p style={{ fontWeight: 'bold' }}>{paymentData.id}</p>
                </div>
                <div>
                  <p style={{ color: '#999', marginBottom: 4 }}>Mã giao dịch</p>
                  <p style={{ fontWeight: 'bold' }}>{paymentData.transactionId || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: '#999', marginBottom: 4 }}>Phương thức thanh toán</p>
                  <p style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{paymentData.paymentMethod}</p>
                </div>
                <div>
                  <p style={{ color: '#999', marginBottom: 4 }}>Trạng thái</p>
                  <p style={{ fontWeight: 'bold', color: '#52c41a' }}>Đã thanh toán</p>
                </div>
                <div>
                  <p style={{ color: '#999', marginBottom: 4 }}>Ngày thanh toán</p>
                  <p style={{ fontWeight: 'bold' }}>
                    {paymentData.paidAt
                      ? new Date(paymentData.paidAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Next Steps */}
        <Card style={{ marginTop: 24, backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
          <h3>📋 Bước tiếp theo:</h3>
          <ol style={{ marginLeft: 20, marginBottom: 0 }}>
            <li style={{ marginBottom: 8 }}>
              Kiểm tra email của bạn để nhận thông tin chi tiết về gói VIP
            </li>
            <li style={{ marginBottom: 8 }}>
              Truy cập lại trang đăng bài để tận hưởng các ưu đãi VIP
            </li>
            <li style={{ marginBottom: 8 }}>
              Liên hệ support nếu bạn gặp bất kỳ vấn đề nào
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
