import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Row, Col } from 'antd';
import { profileApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

const { Title } = Typography;

const ProfilePage: React.FC = () => {
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const { setUser } = useAuthStore();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await profileApi.getProfile();
            const user: User = res.data.data || res.data;
            form.setFieldsValue(user);
        } catch {
            message.error('Lỗi tải thông tin');
        }
    };

    const handleUpdateProfile = async (values: Record<string, unknown>) => {
        setLoading(true);
        try {
            const res = await profileApi.updateProfile(values);
            const updatedUser = res.data.data || res.data;
            setUser(updatedUser);
            message.success('Cập nhật thành công');
        } catch {
            message.error('Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values: { oldPassword: string; newPassword: string }) => {
        setPwLoading(true);
        try {
            await profileApi.changePassword(values);
            message.success('Đổi mật khẩu thành công');
            passwordForm.resetFields();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setPwLoading(false);
        }
    };

    return (
        <div>
            <Title level={3}>Hồ sơ cá nhân</Title>

            <Row gutter={24}>
                <Col xs={24} md={14}>
                    <Card title="Thông tin cá nhân">
                        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
                            <Form.Item name="fullName" label="Họ tên">
                                <Input />
                            </Form.Item>
                            <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="phone" label="Số điện thoại">
                                <Input />
                            </Form.Item>
                            <Form.Item name="address" label="Địa chỉ">
                                <Input />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Cập nhật
                            </Button>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} md={10}>
                    <Card title="Đổi mật khẩu">
                        <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
                            <Form.Item
                                name="oldPassword"
                                label="Mật khẩu cũ"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                name="newPassword"
                                label="Mật khẩu mới"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                    { min: 6, message: 'Tối thiểu 6 ký tự' },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                                            return Promise.reject(new Error('Mật khẩu không khớp'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={pwLoading}>
                                Đổi mật khẩu
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfilePage;
