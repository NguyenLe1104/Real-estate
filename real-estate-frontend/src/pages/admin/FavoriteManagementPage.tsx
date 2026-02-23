import { useEffect, useState } from 'react';
import { Row, Col, Typography, Empty, message, Popconfirm, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { favoriteApi } from '@/api';
import { PropertyCard } from '@/components/common';
import type { Favorite, House } from '@/types';

const { Title } = Typography;

const FavoriteManagementPage: React.FC = () => {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const res = await favoriteApi.getAll();
            setFavorites(res.data.data || res.data);
        } catch {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (fav: Favorite) => {
        try {
            if (fav.houseId) {
                await favoriteApi.removeHouse(fav.houseId);
            } else if (fav.landId) {
                await favoriteApi.removeLand(fav.landId);
            }
            message.success('Đã bỏ yêu thích');
            loadFavorites();
        } catch {
            message.error('Có lỗi xảy ra');
        }
    };

    return (
        <div>
            <Title level={3}>Danh sách yêu thích</Title>

            {!loading && favorites.length === 0 ? (
                <Empty description="Chưa có mục yêu thích nào" />
            ) : (
                <Row gutter={[16, 16]}>
                    {favorites.map((fav) => {
                        const property = fav.house || fav.land;
                        if (!property) return null;
                        return (
                            <Col xs={24} sm={12} md={8} lg={6} key={fav.id}>
                                <div style={{ position: 'relative' }}>
                                    <PropertyCard
                                        property={property as unknown as House}
                                        type={fav.houseId ? 'house' : 'land'}
                                    />
                                    <Popconfirm
                                        title="Bỏ yêu thích?"
                                        onConfirm={() => handleRemove(fav)}
                                    >
                                        <Button
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                                        />
                                    </Popconfirm>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </div>
    );
};

export default FavoriteManagementPage;
