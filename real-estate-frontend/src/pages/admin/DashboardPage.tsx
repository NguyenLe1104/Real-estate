import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import {
    BankOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    CalendarOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { houseApi, landApi, appointmentApi } from '@/api';
import { userApi, postApi } from '@/api';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState({
        houses: 0,
        lands: 0,
        users: 0,
        appointments: 0,
        posts: 0,
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [housesRes, landsRes, usersRes, appointmentsRes, postsRes] = await Promise.allSettled([
                houseApi.getAll({ limit: 1 }),
                landApi.getAll({ limit: 1 }),
                userApi.getAll({ limit: 1 }),
                appointmentApi.getAll(),
                postApi.getAll(),
            ]);

            setStats({
                houses: housesRes.status === 'fulfilled' ? (housesRes.value.data.meta?.total || 0) : 0,
                lands: landsRes.status === 'fulfilled' ? (landsRes.value.data.meta?.total || 0) : 0,
                users: usersRes.status === 'fulfilled' ? (usersRes.value.data.meta?.total || 0) : 0,
                appointments: appointmentsRes.status === 'fulfilled' ? ((appointmentsRes.value.data.data || appointmentsRes.value.data)?.length || 0) : 0,
                posts: postsRes.status === 'fulfilled' ? ((postsRes.value.data.data || postsRes.value.data)?.length || 0) : 0,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    return (
        <div>
            <Title level={3}>Dashboard</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={4.8} xl={4.8}>
                    <Card>
                        <Statistic
                            title="Nhà"
                            value={stats.houses}
                            prefix={<BankOutlined />}
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4.8} xl={4.8}>
                    <Card>
                        <Statistic
                            title="Đất"
                            value={stats.lands}
                            prefix={<EnvironmentOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4.8} xl={4.8}>
                    <Card>
                        <Statistic
                            title="Người dùng"
                            value={stats.users}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4.8} xl={4.8}>
                    <Card>
                        <Statistic
                            title="Lịch hẹn"
                            value={stats.appointments}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4.8} xl={4.8}>
                    <Card>
                        <Statistic
                            title="Bài đăng"
                            value={stats.posts}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#eb2f96' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
