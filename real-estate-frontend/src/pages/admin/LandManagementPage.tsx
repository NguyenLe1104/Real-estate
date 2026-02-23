import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { landApi } from '@/api';
import { formatCurrency, formatArea } from '@/utils';
import type { Land } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/constants';

const { Title } = Typography;

const LandManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [lands, setLands] = useState<Land[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadLands();
    }, [page, search]);

    const loadLands = async () => {
        setLoading(true);
        try {
            const params: Record<string, unknown> = { page, limit: DEFAULT_PAGE_SIZE };
            if (search) params.search = search;
            const res = await landApi.getAll(params);
            const data = res.data;
            setLands(data.data || data);
            setTotal(data.meta?.total || 0);
        } catch {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await landApi.delete(id);
            message.success('Xóa thành công');
            loadLands();
        } catch {
            message.error('Xóa thất bại');
        }
    };

    const columns: ColumnsType<Land> = [
        { title: 'Mã', dataIndex: 'code', key: 'code', width: 100 },
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title', ellipsis: true },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => formatCurrency(price),
        },
        {
            title: 'Diện tích',
            dataIndex: 'area',
            key: 'area',
            render: (area: number) => formatArea(area),
        },
        {
            title: 'Loại đất',
            dataIndex: 'landType',
            key: 'landType',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>
                    {status === 1 ? 'Hoạt động' : 'Ẩn'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/lands/${record.id}`)} />
                    <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => navigate(`/admin/lands/${record.id}/edit`)} />
                    <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý đất</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/lands/create')}>
                    Thêm mới
                </Button>
            </div>

            <Input
                placeholder="Tìm kiếm..."
                prefix={<SearchOutlined />}
                style={{ marginBottom: 16, maxWidth: 400 }}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                allowClear
            />

            <Table
                columns={columns}
                dataSource={lands}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page,
                    total,
                    pageSize: DEFAULT_PAGE_SIZE,
                    onChange: setPage,
                    showTotal: (total) => `Tổng ${total} bản ghi`,
                }}
            />
        </div>
    );
};

export default LandManagementPage;
