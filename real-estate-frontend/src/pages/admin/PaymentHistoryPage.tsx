import { useEffect, useState } from 'react';
import { Table, Tag, Typography, message, Button, Space } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { paymentApi } from '@/api';
import { formatCurrency, formatDateTime } from '@/utils';
import type { Payment } from '@/types';

const { Title } = Typography;

const PAYMENT_STATUS_MAP: Record<number, { label: string; color: string }> = {
    0: { label: 'Chờ thanh toán', color: 'processing' },
    1: { label: 'Thành công', color: 'success' },
    2: { label: 'Thất bại', color: 'error' },
    3: { label: 'Đã hủy', color: 'default' },
};

const PaymentHistoryPage: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadPayments();
    }, [page]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const res = await paymentApi.getMyPayments({ page, limit: 10 });
            setPayments(res.data.data || []);
            setTotal(res.data.meta?.total || 0);
        } catch {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleSimulate = async (paymentId: number) => {
        try {
            await paymentApi.simulateSuccess(paymentId);
            message.success('Thanh toán mô phỏng thành công!');
            loadPayments();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi mô phỏng thanh toán');
        }
    };

    const columns: ColumnsType<Payment> = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 60,
        },
        {
            title: 'Tin đăng',
            render: (_, record: any) =>
                record.subscription?.post
                    ? `#${record.subscription.post.id} - ${record.subscription.post.title}`
                    : '-',
        },
        {
            title: 'Gói VIP',
            render: (_, record: any) =>
                record.subscription?.package ? (
                    <Tag color="gold">{record.subscription.package.name}</Tag>
                ) : (
                    '-'
                ),
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            render: (val: number) => formatCurrency(val),
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            render: (val: string) => (
                <Tag color={val === 'vnpay' ? 'blue' : 'magenta'}>
                    {val === 'vnpay' ? 'VNPay' : 'MoMo'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (val: number) => {
                const s = PAYMENT_STATUS_MAP[val] || { label: 'Không rõ', color: 'default' };
                return <Tag color={s.color}>{s.label}</Tag>;
            },
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'paidAt',
            render: (val: string) => (val ? formatDateTime(val) : '-'),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            render: (val: string) => formatDateTime(val),
        },
        {
            title: 'Thao tác',
            render: (_, record) => (
                <Space>
                    {record.status === 0 && (
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => handleSimulate(record.id)}
                        >
                            🧪 Test thanh toán
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>
                <HistoryOutlined style={{ marginRight: 8 }} />
                Lịch sử thanh toán
            </Title>

            <Table
                columns={columns}
                dataSource={payments}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page,
                    total,
                    pageSize: 10,
                    onChange: setPage,
                    showTotal: (t) => `Tổng ${t} thanh toán`,
                }}
            />
        </div>
    );
};

export default PaymentHistoryPage;
