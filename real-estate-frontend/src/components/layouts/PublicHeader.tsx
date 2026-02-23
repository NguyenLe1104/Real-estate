import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Space, Avatar, Dropdown } from 'antd';
import { UserOutlined, HeartOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuthStore } from '@/stores/authStore';

const { Header } = Layout;

const PublicHeader: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Hồ sơ',
            onClick: () => navigate('/admin/profile'),
        },
        {
            key: 'favorites',
            icon: <HeartOutlined />,
            label: 'Yêu thích',
            onClick: () => navigate('/admin/favorites'),
        },
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Quản trị',
            onClick: () => navigate('/admin'),
        },
        { type: 'divider' },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
        },
    ];

    const menuItems: MenuProps['items'] = [
        { key: '/', label: <Link to="/">Trang chủ</Link> },
        { key: '/houses', label: <Link to="/houses">Nhà</Link> },
        { key: '/lands', label: <Link to="/lands">Đất</Link> },
        { key: '/posts', label: <Link to="/posts">Tin đăng</Link> },
    ];

    return (
        <Header
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                padding: '0 48px',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                <Link to="/" style={{ fontSize: 22, fontWeight: 'bold', color: '#1677ff' }}>
                    🏠 Real Estate
                </Link>
                <Menu
                    mode="horizontal"
                    items={menuItems}
                    style={{ border: 'none', minWidth: 400 }}
                />
            </div>

            <Space>
                {isAuthenticated ? (
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar icon={<UserOutlined />} />
                            <span>{user?.fullName || user?.username}</span>
                        </div>
                    </Dropdown>
                ) : (
                    <Space>
                        <Button onClick={() => navigate('/login')}>Đăng nhập</Button>
                        <Button type="primary" onClick={() => navigate('/register')}>
                            Đăng ký
                        </Button>
                    </Space>
                )}
            </Space>
        </Header>
    );
};

export default PublicHeader;
