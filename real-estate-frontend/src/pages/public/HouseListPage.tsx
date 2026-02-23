import { useEffect, useState } from 'react';
import { Row, Col, Typography, Input, Select, Pagination, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { houseApi } from '@/api';
import { propertyCategoryApi } from '@/api';
import { PropertyCard, Loading } from '@/components/common';
import { DIRECTIONS, DEFAULT_PAGE_SIZE } from '@/constants';
import type { House, PropertyCategory } from '@/types';

const { Title } = Typography;

const HouseListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [houses, setHouses] = useState<House[]>([]);
    const [categories, setCategories] = useState<PropertyCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        categoryId: searchParams.get('categoryId') || undefined,
        direction: searchParams.get('direction') || undefined,
        page: Number(searchParams.get('page')) || 1,
        limit: DEFAULT_PAGE_SIZE,
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadHouses();
    }, [filters]);

    const loadCategories = async () => {
        try {
            const res = await propertyCategoryApi.getAll();
            setCategories(res.data.data || res.data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadHouses = async () => {
        setLoading(true);
        try {
            const params: Record<string, unknown> = {
                page: filters.page,
                limit: filters.limit,
            };
            if (filters.search) params.search = filters.search;
            if (filters.categoryId) params.categoryId = filters.categoryId;
            if (filters.direction) params.direction = filters.direction;

            const res = await houseApi.getAll(params);
            const data = res.data;
            setHouses(data.data || data);
            setTotal(data.meta?.total || data.length || 0);
        } catch (error) {
            console.error('Error loading houses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: unknown) => {
        const newFilters = { ...filters, [key]: value, page: 1 };
        setFilters(newFilters);
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v !== undefined && v !== '') params.set(k, String(v));
        });
        setSearchParams(params);
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
            <Title level={2}>Danh sách nhà</Title>

            {/* Filters */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Input
                        placeholder="Tìm kiếm..."
                        prefix={<SearchOutlined />}
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        allowClear
                    />
                </Col>
                <Col xs={12} sm={8}>
                    <Select
                        placeholder="Danh mục"
                        style={{ width: '100%' }}
                        allowClear
                        value={filters.categoryId}
                        onChange={(value) => handleFilterChange('categoryId', value)}
                        options={categories.map((c) => ({ label: c.name, value: c.id }))}
                    />
                </Col>
                <Col xs={12} sm={8}>
                    <Select
                        placeholder="Hướng"
                        style={{ width: '100%' }}
                        allowClear
                        value={filters.direction}
                        onChange={(value) => handleFilterChange('direction', value)}
                        options={DIRECTIONS.map((d) => ({ label: d, value: d }))}
                    />
                </Col>
            </Row>

            {loading ? (
                <Loading />
            ) : houses.length === 0 ? (
                <Empty description="Không có kết quả" />
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        {houses.map((house) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={house.id}>
                                <PropertyCard property={house} type="house" />
                            </Col>
                        ))}
                    </Row>
                    <div style={{ textAlign: 'center', marginTop: 32 }}>
                        <Pagination
                            current={filters.page}
                            total={total}
                            pageSize={filters.limit}
                            onChange={(page) => handleFilterChange('page', page)}
                            showSizeChanger={false}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default HouseListPage;
