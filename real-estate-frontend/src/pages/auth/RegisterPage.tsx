import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Steps } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0); // 0: form, 1: OTP
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();
    const [form] = Form.useForm();

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
            setFormData(values as Record<string, string>);
            setStep(1);
            message.success('Mã OTP đã được gửi đến email của bạn!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    const onConfirmOtp = async () => {
        if (!otp || otp.length < 4) {
            message.warning('Vui lòng nhập mã OTP');
            return;
        }
        setLoading(true);
        try {
            await authApi.confirmRegister({ ...formData, otp } as any);
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Xác nhận OTP thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            await authApi.register(formData as any);
            message.success('Đã gửi lại mã OTP!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gửi lại OTP thất bại');
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
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ marginBottom: 8 }}>
                        🏠 Real Estate
                    </Title>
                    <Text type="secondary">Tạo tài khoản mới</Text>
                </div>

                <Steps
                    current={step}
                    size="small"
                    style={{ marginBottom: 24 }}
                    items={[
                        { title: 'Thông tin' },
                        { title: 'Xác nhận OTP' },
                    ]}
                />

                {step === 0 ? (
                    <>
                        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
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
                    </>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <SafetyOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
                            <div>
                                <Text>Mã OTP đã được gửi đến email</Text>
                            </div>
                            <Text strong>{formData.email}</Text>
                        </div>

                        <Input
                            size="large"
                            placeholder="Nhập mã OTP"
                            prefix={<SafetyOutlined />}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            style={{ marginBottom: 16, textAlign: 'center', fontSize: 18, letterSpacing: 8 }}
                        />

                        <Button type="primary" block size="large" loading={loading} onClick={onConfirmOtp}
                            style={{ marginBottom: 12 }}>
                            Xác nhận
                        </Button>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button type="link" size="small" onClick={() => { setStep(0); setOtp(''); }}>
                                ← Quay lại
                            </Button>
                            <Button type="link" size="small" loading={loading} onClick={handleResendOtp}>
                                Gửi lại OTP
                            </Button>
                        </div>
                    </>
                )}

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
