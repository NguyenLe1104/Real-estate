import { useEffect, useState } from 'react';
import { Table, message, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { customerApi } from '@/api';
import { formatDateTime } from '@/utils';
import type { Customer } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/constants';

const { Title } = Typography;

const CustomerManagementPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadCustomers();
    }, [page]);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const res = await customerApi.getAll({ page, limit: DEFAULT_PAGE_SIZE });
            const data = res.data;
            setCustomers(data.data || data);
            setTotal(data.meta?.total || 0);
        } catch {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<Customer> = [
        { title: 'Mã KH', dataIndex: 'code', key: 'code' },
        { title: 'Họ tên', key: 'fullName', render: (_, r) => r.user?.fullName || '—' },
        { title: 'Email', key: 'email', render: (_, r) => r.user?.email || '—' },
        { title: 'SĐT', key: 'phone', render: (_, r) => r.user?.phone || '—' },
        { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => formatDateTime(d) },
    ];

    return (
        <div>
            <Title level={3}>Quản lý khách hàng</Title>
            <Table
                columns={columns}
                dataSource={customers}
                rowKey="id"
                loading={loading}
                pagination={{ current: page, total, pageSize: DEFAULT_PAGE_SIZE, onChange: setPage, showTotal: (t) => `Tổng ${t} bản ghi` }}
            />
        </div>
    );
};

export default CustomerManagementPage;
