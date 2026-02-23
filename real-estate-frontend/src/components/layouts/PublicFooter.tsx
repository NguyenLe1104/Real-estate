import { Layout } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';

const { Footer } = Layout;

const PublicFooter: React.FC = () => {
    return (
        <Footer
            style={{
                background: '#001529',
                color: 'rgba(255,255,255,0.65)',
                padding: '48px 48px 24px',
            }}
        >
            <div
                style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 32,
                }}
            >
                <div>
                    <h3 style={{ color: '#fff', marginBottom: 16 }}>🏠 Real Estate</h3>
                    <p>Nền tảng mua bán bất động sản uy tín hàng đầu Việt Nam.</p>
                </div>

                <div>
                    <h3 style={{ color: '#fff', marginBottom: 16 }}>Liên hệ</h3>
                    <p><EnvironmentOutlined /> 123 Đường ABC, Quận 1, TP.HCM</p>
                    <p><PhoneOutlined /> 0123 456 789</p>
                    <p><MailOutlined /> contact@realestate.vn</p>
                </div>

                <div>
                    <h3 style={{ color: '#fff', marginBottom: 16 }}>Liên kết nhanh</h3>
                    <p><a href="/houses" style={{ color: 'rgba(255,255,255,0.65)' }}>Mua bán nhà</a></p>
                    <p><a href="/lands" style={{ color: 'rgba(255,255,255,0.65)' }}>Mua bán đất</a></p>
                    <p><a href="/posts" style={{ color: 'rgba(255,255,255,0.65)' }}>Tin đăng</a></p>
                </div>
            </div>

            <div
                style={{
                    textAlign: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: 24,
                    marginTop: 32,
                }}
            >
                © 2026 Real Estate. All rights reserved.
            </div>
        </Footer>
    );
};

export default PublicFooter;
