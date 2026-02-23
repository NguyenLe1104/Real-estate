import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: {
        username: string;
        password: string;
        fullName?: string;
        email?: string;
        phone?: string;
    }) => {
        setLoading(true);
        try {
            await authApi.register(values);
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 24,
            }}
        >
            <Card style={{ width: 420, borderRadius: 12 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 8 }}>
                        🏠 Real Estate
                    </Title>
                    <Text type="secondary">Tạo tài khoản mới</Text>
                </div>

                <Form layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                    </Form.Item>

                    <Form.Item
                        name="fullName"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item name="phone">
                        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại (không bắt buộc)" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu không khớp'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>

                <Divider>hoặc</Divider>

                <div style={{ textAlign: 'center' }}>
                    <Text>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;
