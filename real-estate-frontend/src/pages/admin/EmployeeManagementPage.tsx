import { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Popconfirm, message, Typography, Modal, Form, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { employeeApi } from '@/api';
import { formatDateTime } from '@/utils';
import type { Employee } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/constants';

const { Title } = Typography;

const EmployeeManagementPage: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadEmployees();
    }, [page, search]);

    const loadEmployees = async () => {
        setLoading(true);
        try {
            const params: Record<string, unknown> = { page, limit: DEFAULT_PAGE_SIZE };
            if (search) params.search = search;
            const res = await employeeApi.getAll(params);
            const data = res.data;
            setEmployees(data.data || data);
            setTotal(data.meta?.total || 0);
        } catch {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await employeeApi.delete(id);
            message.success('Xóa thành công');
            loadEmployees();
        } catch {
            message.error('Xóa thất bại');
        }
    };

    const handleOpenModal = (emp?: Employee) => {
        setEditingEmployee(emp || null);
        form.resetFields();
        if (emp) form.setFieldsValue(emp);
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingEmployee) {
                await employeeApi.update(editingEmployee.id, values);
                message.success('Cập nhật thành công');
            } else {
                await employeeApi.create(values);
                message.success('Tạo mới thành công');
            }
            setModalOpen(false);
            loadEmployees();
        } catch {
            // validation
        }
    };

    const columns: ColumnsType<Employee> = [
        { title: 'Mã NV', dataIndex: 'code', key: 'code' },
        { title: 'Họ tên', key: 'fullName', render: (_, r) => r.user?.fullName || '—' },
        { title: 'Email', key: 'email', render: (_, r) => r.user?.email || '—' },
        { title: 'SĐT', key: 'phone', render: (_, r) => r.user?.phone || '—' },
        { title: 'Ngày vào', dataIndex: 'startDate', key: 'startDate', render: (d: string) => d ? formatDateTime(d) : '—' },
        { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => formatDateTime(d) },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
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
                <Title level={3} style={{ margin: 0 }}>Quản lý nhân viên</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
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
                dataSource={employees}
                rowKey="id"
                loading={loading}
                pagination={{ current: page, total, pageSize: DEFAULT_PAGE_SIZE, onChange: setPage, showTotal: (t) => `Tổng ${t} bản ghi` }}
            />

            <Modal
                title={editingEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                okText={editingEmployee ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="userId" label="User ID" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="startDate" label="Ngày vào làm">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeeManagementPage;
