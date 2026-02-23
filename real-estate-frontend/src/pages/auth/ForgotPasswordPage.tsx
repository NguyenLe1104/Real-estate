import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Steps } from 'antd';
import { MailOutlined, LockOutlined, NumberOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api';

const { Title } = Typography;

const ForgotPasswordPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = async (values: { email: string }) => {
        setLoading(true);
        try {
            await authApi.forgotPassword(values);
            setEmail(values.email);
            message.success('Mã OTP đã được gửi đến email của bạn');
            setStep(1);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (values: { otp: string; newPassword: string }) => {
        setLoading(true);
        try {
            await authApi.resetPassword({ email, ...values });
            message.success('Đặt lại mật khẩu thành công!');
            navigate('/login');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Có lỗi xảy ra');
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
                    <Title level={3}>Quên mật khẩu</Title>
                </div>

                <Steps current={step} style={{ marginBottom: 32 }} items={[
                    { title: 'Nhập email' },
                    { title: 'Đặt lại mật khẩu' },
                ]} />

                {step === 0 ? (
                    <Form layout="vertical" onFinish={handleSendOtp} size="large">
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' },
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Email" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading}>
                                Gửi mã OTP
                            </Button>
                        </Form.Item>
                    </Form>
                ) : (
                    <Form layout="vertical" onFinish={handleResetPassword} size="large">
                        <Form.Item
                            name="otp"
                            rules={[{ required: true, message: 'Vui lòng nhập mã OTP' }]}
                        >
                            <Input prefix={<NumberOutlined />} placeholder="Mã OTP" />
                        </Form.Item>
                        <Form.Item
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading}>
                                Đặt lại mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link to="/login">← Quay lại đăng nhập</Link>
                </div>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
