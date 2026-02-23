import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { setAuth } = useAuthStore();

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            const res = await authApi.login(values);
            const { user, accessToken, refreshToken } = res.data.data;
            setAuth(user, accessToken, refreshToken);
            message.success('Đăng nhập thành công!');
            navigate(from, { replace: true });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Đăng nhập thất bại');
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
                    <Text type="secondary">Đăng nhập vào tài khoản của bạn</Text>
                </div>

                <Form layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>

                <Divider>hoặc</Divider>

                <div style={{ textAlign: 'center' }}>
                    <Text>
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
