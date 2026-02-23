import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Upload, message, Typography, Row, Col, Space } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { UploadFile } from 'antd';
import { houseApi, propertyCategoryApi, employeeApi } from '@/api';
import { DIRECTIONS } from '@/constants';
import type { PropertyCategory, Employee } from '@/types';

const { Title } = Typography;
const { TextArea } = Input;

const HouseFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<PropertyCategory[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const isEdit = !!id;

    useEffect(() => {
        loadFormData();
        if (isEdit) loadHouse(Number(id));
    }, [id]);

    const loadFormData = async () => {
        try {
            const [catRes, empRes] = await Promise.all([
                propertyCategoryApi.getAll(),
                employeeApi.getAll(),
            ]);
            setCategories(catRes.data.data || catRes.data);
            setEmployees(empRes.data.data || empRes.data);
        } catch {
            console.error('Error loading form data');
        }
    };

    const loadHouse = async (houseId: number) => {
        try {
            const res = await houseApi.getById(houseId);
            const house = res.data.data || res.data;
            form.setFieldsValue(house);
            if (house.images) {
                setFileList(
                    house.images.map((img: { id: number; url: string }) => ({
                        uid: String(img.id),
                        name: `image-${img.id}`,
                        status: 'done' as const,
                        url: img.url,
                    })),
                );
            }
        } catch {
            message.error('Không tìm thấy nhà');
            navigate('/admin/houses');
        }
    };

    const onFinish = async (values: Record<string, unknown>) => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            fileList.forEach((file) => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                }
            });

            if (isEdit) {
                await houseApi.update(Number(id), formData);
                message.success('Cập nhật thành công');
            } else {
                await houseApi.create(formData);
                message.success('Tạo mới thành công');
            }
            navigate('/admin/houses');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/houses')}
                style={{ marginBottom: 16, padding: 0 }}
            >
                Quay lại
            </Button>

            <Title level={3}>{isEdit ? 'Chỉnh sửa nhà' : 'Thêm nhà mới'}</Title>

            <Card>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={16}>
                        <Col xs={24} md={16}>
                            <Form.Item
                                name="title"
                                label="Tiêu đề"
                                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                            >
                                <Input placeholder="Nhập tiêu đề" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="categoryId" label="Danh mục">
                                <Select
                                    placeholder="Chọn danh mục"
                                    allowClear
                                    options={categories.map((c) => ({ label: c.name, value: c.id }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={12} md={6}>
                            <Form.Item name="city" label="Tỉnh/Thành phố">
                                <Input placeholder="Nhập tỉnh/thành phố" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Item name="district" label="Quận/Huyện">
                                <Input placeholder="Nhập quận/huyện" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Item name="ward" label="Phường/Xã">
                                <Input placeholder="Nhập phường/xã" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Item name="street" label="Đường">
                                <Input placeholder="Nhập đường" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={12} md={6}>
                            <Form.Item name="houseNumber" label="Số nhà">
                                <Input placeholder="Số nhà" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Item name="price" label="Giá (VNĐ)">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Nhập giá"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Item name="area" label="Diện tích (m²)">
                                <InputNumber style={{ width: '100%' }} placeholder="Nhập diện tích" min={0} />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Item name="direction" label="Hướng">
                                <Select
                                    placeholder="Chọn hướng"
                                    allowClear
                                    options={DIRECTIONS.map((d) => ({ label: d, value: d }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={8} md={4}>
                            <Form.Item name="floors" label="Số tầng">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col xs={8} md={4}>
                            <Form.Item name="bedrooms" label="Phòng ngủ">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col xs={8} md={4}>
                            <Form.Item name="bathrooms" label="Phòng tắm">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="employeeId" label="Nhân viên phụ trách">
                                <Select
                                    placeholder="Chọn nhân viên"
                                    allowClear
                                    options={employees.map((e) => ({
                                        label: `${e.code} - ${e.user?.fullName || ''}`,
                                        value: e.id,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={4} placeholder="Nhập mô tả chi tiết" />
                    </Form.Item>

                    <Form.Item label="Hình ảnh">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            beforeUpload={() => false}
                            multiple
                        >
                            {fileList.length >= 10 ? null : (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {isEdit ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                            <Button onClick={() => navigate('/admin/houses')}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default HouseFormPage;
