import { Card, Tag, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { House } from '@/types';
import { formatCurrency, formatArea, getFullAddress } from '@/utils';

const { Meta } = Card;
const { Text } = Typography;

interface PropertyCardProps {
    property: House;
    type?: 'house' | 'land';
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, type = 'house' }) => {
    const navigate = useNavigate();

    const coverImage = property.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image';

    const handleClick = () => {
        navigate(`/${type === 'house' ? 'houses' : 'lands'}/${property.id}`);
    };

    return (
        <Card
            hoverable
            cover={
                <div style={{ height: 200, overflow: 'hidden' }}>
                    <img
                        alt={property.title}
                        src={coverImage}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            }
            onClick={handleClick}
            style={{ height: '100%' }}
        >
            <Meta
                title={property.title}
                description={
                    <div>
                        <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                            {formatCurrency(property.price)}
                        </Text>
                        <div style={{ marginTop: 8 }}>
                            <Tag color="blue">{formatArea(property.area)}</Tag>
                            {property.direction && <Tag color="green">{property.direction}</Tag>}
                            {property.category && <Tag>{property.category.name}</Tag>}
                        </div>
                        <div style={{ marginTop: 8, color: '#666' }}>
                            <EnvironmentOutlined /> {getFullAddress(property)}
                        </div>
                    </div>
                }
            />
        </Card>
    );
};

export default PropertyCard;
