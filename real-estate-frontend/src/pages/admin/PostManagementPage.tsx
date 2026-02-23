import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { postApi } from '@/api';
import { formatCurrency, formatDateTime } from '@/utils';
import type { Post } from '@/types';
import { DEFAULT_PAGE_SIZE, POST_STATUS_LABELS } from '@/constants';

const { Title } = Typography;

const PostManagementPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadPosts();
    }, [page, search]);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const res = await postApi.getAll();
            const data = res.data;
            const allPosts: Post[] = data.data || data;
            const filtered = search
                ? allPosts.filter((p: Post) => p.title?.toLowerCase().includes(search.toLowerCase()))
                : allPosts;
            setTotal(filtered.length);
            const start = (page - 1) * DEFAULT_PAGE_SIZE;
            setPosts(filtered.slice(start, start + DEFAULT_PAGE_SIZE));
        } catch {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await postApi.delete(id);
            message.success('Xóa thành công');
            loadPosts();
        } catch {
            message.error('Xóa thất bại');
        }
    };

    const handleStatusChange = async (id: number, status: number) => {
        try {
            if (status === 2) {
                await postApi.approve(id);
            } else if (status === 3) {
                await postApi.reject(id);
            }
            message.success('Cập nhật trạng thái thành công');
            loadPosts();
        } catch {
            message.error('Cập nhật thất bại');
        }
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 1: return 'orange';
            case 2: return 'green';
            case 3: return 'red';
            default: return 'default';
        }
    };

    const columns: ColumnsType<Post> = [
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title', ellipsis: true },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => formatCurrency(price),
        },
        {
            title: 'Ngày đăng',
            dataIndex: 'postedAt',
            key: 'postedAt',
            render: (date: string) => formatDateTime(date),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => (
                <Tag color={getStatusColor(status)}>{POST_STATUS_LABELS[status]}</Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 250,
            render: (_, record) => (
                <Space>
                    {record.status === 1 && (
                        <>
                            <Button size="small" type="primary" onClick={() => handleStatusChange(record.id, 2)}>
                                Duyệt
                            </Button>
                            <Button size="small" danger onClick={() => handleStatusChange(record.id, 3)}>
                                Từ chối
                            </Button>
                        </>
                    )}
                    <Button size="small" icon={<EditOutlined />} />
                    <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={3}>Quản lý bài đăng</Title>

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
                dataSource={posts}
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

export default PostManagementPage;
