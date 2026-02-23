import { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Typography, Modal, Form, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { propertyCategoryApi } from '@/api';
import type { PropertyCategory } from '@/types';

const { Title } = Typography;

const CategoryManagementPage: React.FC = () => {
    const [categories, setCategories] = useState<PropertyCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<PropertyCategory | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await propertyCategoryApi.getAll();
            setCategories(res.data.data || res.data);
        } catch {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await propertyCategoryApi.delete(id);
            message.success('Xóa thành công');
            loadCategories();
        } catch {
            message.error('Xóa thất bại');
        }
    };

    const handleOpenModal = (cat?: PropertyCategory) => {
        setEditingCategory(cat || null);
        form.resetFields();
        if (cat) form.setFieldsValue(cat);
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingCategory) {
                await propertyCategoryApi.update(editingCategory.id, values);
                message.success('Cập nhật thành công');
            } else {
                await propertyCategoryApi.create(values);
                message.success('Tạo mới thành công');
            }
            setModalOpen(false);
            loadCategories();
        } catch {
            // validation
        }
    };

    const columns: ColumnsType<PropertyCategory> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Mã', dataIndex: 'code', key: 'code' },
        { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
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
                <Title level={3} style={{ margin: 0 }}>Danh mục bất động sản</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                    Thêm mới
                </Button>
            </div>

            <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} pagination={false} />

            <Modal
                title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                okText={editingCategory ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="code" label="Mã danh mục" rules={[{ required: true }]}>
                        <Input disabled={!!editingCategory} />
                    </Form.Item>
                    <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryManagementPage;
