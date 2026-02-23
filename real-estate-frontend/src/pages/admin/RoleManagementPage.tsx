import { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Typography, Modal, Form, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { roleApi } from '@/api';
import type { Role } from '@/types';

const { Title } = Typography;

const RoleManagementPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const res = await roleApi.getAll();
            setRoles(res.data.data || res.data);
        } catch {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await roleApi.delete(id);
            message.success('Xóa thành công');
            loadRoles();
        } catch {
            message.error('Xóa thất bại');
        }
    };

    const handleOpenModal = (role?: Role) => {
        setEditingRole(role || null);
        form.resetFields();
        if (role) form.setFieldsValue(role);
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingRole) {
                await roleApi.update(editingRole.id, values);
                message.success('Cập nhật thành công');
            } else {
                await roleApi.create(values);
                message.success('Tạo mới thành công');
            }
            setModalOpen(false);
            loadRoles();
        } catch {
            // validation
        }
    };

    const columns: ColumnsType<Role> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Mã', dataIndex: 'code', key: 'code' },
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true },
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
                <Title level={3} style={{ margin: 0 }}>Quản lý vai trò</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                    Thêm mới
                </Button>
            </div>

            <Table columns={columns} dataSource={roles} rowKey="id" loading={loading} pagination={false} />

            <Modal
                title={editingRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                okText={editingRole ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="code" label="Mã vai trò" rules={[{ required: true }]}>
                        <Input disabled={!!editingRole} />
                    </Form.Item>
                    <Form.Item name="name" label="Tên vai trò" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RoleManagementPage;
