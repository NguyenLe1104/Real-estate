import { useEffect, useState } from 'react';
import { Row, Col, Typography, Carousel, Input, Button, Card, Space } from 'antd';
import { SearchOutlined, BankOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { houseApi, landApi } from '@/api';
import { PropertyCard } from '@/components/common';
import type { House, Land } from '@/types';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [houses, setHouses] = useState<House[]>([]);
    const [lands, setLands] = useState<Land[]>([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [housesRes, landsRes] = await Promise.all([
                houseApi.getAll({ limit: 8 }),
                landApi.getAll({ limit: 8 }),
            ]);
            setHouses(housesRes.data.data || housesRes.data);
            setLands(landsRes.data.data || landsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleSearch = () => {
        navigate(`/houses?search=${searchText}`);
    };

    return (
        <div>
            {/* Hero Section */}
            <Carousel autoplay>
                <div>
                    <div
                        style={{
                            height: 500,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            color: '#fff',
                        }}
                    >
                        <Title style={{ color: '#fff', fontSize: 42, marginBottom: 8 }}>
                            Tìm kiếm bất động sản
                        </Title>
                        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 32 }}>
                            Hàng ngàn bất động sản chờ bạn khám phá
                        </Paragraph>
                        <Space.Compact style={{ width: '60%', maxWidth: 600 }}>
                            <Input
                                size="large"
                                placeholder="Tìm kiếm theo tiêu đề, địa chỉ..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onPressEnter={handleSearch}
                            />
                            <Button type="primary" size="large" icon={<SearchOutlined />} onClick={handleSearch}>
                                Tìm kiếm
                            </Button>
                        </Space.Compact>
                    </div>
                </div>
            </Carousel>

            {/* Categories */}
            <div style={{ maxWidth: 1200, margin: '48px auto', padding: '0 24px' }}>
                <Row gutter={24} justify="center">
                    <Col xs={12} sm={8} md={6}>
                        <Card
                            hoverable
                            onClick={() => navigate('/houses')}
                            style={{ textAlign: 'center' }}
                        >
                            <BankOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
                            <Title level={4}>Mua bán nhà</Title>
                        </Card>
                    </Col>
                    <Col xs={12} sm={8} md={6}>
                        <Card
                            hoverable
                            onClick={() => navigate('/lands')}
                            style={{ textAlign: 'center' }}
                        >
                            <EnvironmentOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                            <Title level={4}>Mua bán đất</Title>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Featured Houses */}
            <div style={{ maxWidth: 1200, margin: '0 auto 48px', padding: '0 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2}>Nhà nổi bật</Title>
                    <Button type="link" onClick={() => navigate('/houses')}>
                        Xem tất cả →
                    </Button>
                </div>
                <Row gutter={[16, 16]}>
                    {houses.map((house) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={house.id}>
                            <PropertyCard property={house} type="house" />
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Featured Lands */}
            <div style={{ maxWidth: 1200, margin: '0 auto 48px', padding: '0 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2}>Đất nổi bật</Title>
                    <Button type="link" onClick={() => navigate('/lands')}>
                        Xem tất cả →
                    </Button>
                </div>
                <Row gutter={[16, 16]}>
                    {lands.map((land) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={land.id}>
                            <PropertyCard property={land as unknown as House} type="land" />
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default HomePage;
