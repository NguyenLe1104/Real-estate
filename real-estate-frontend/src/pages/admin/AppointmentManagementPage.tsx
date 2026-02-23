import { useEffect, useState } from 'react';
import { Table, Tag, Input, message, Typography, Select, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { appointmentApi } from '@/api';
import { formatDateTime } from '@/utils';
import type { Appointment } from '@/types';
import { DEFAULT_PAGE_SIZE, APPOINTMENT_STATUS_LABELS } from '@/constants';

const { Title } = Typography;

const AppointmentManagementPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadAppointments();
    }, [page, search]);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const res = await appointmentApi.getAll();
            const data = res.data;
            const allAppointments: Appointment[] = data.data || data;
            const filtered = search
                ? allAppointments.filter((a: Appointment) =>
                    a.customer?.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                    a.customer?.user?.email?.toLowerCase().includes(search.toLowerCase())
                )
                : allAppointments;
            setTotal(filtered.length);
            const start = (page - 1) * DEFAULT_PAGE_SIZE;
            setAppointments(filtered.slice(start, start + DEFAULT_PAGE_SIZE));
        } catch {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: number, status: number) => {
        try {
            if (status === 1) {
                await appointmentApi.approve(id, {});
            } else if (status === 2) {
                await appointmentApi.cancel(id);
            }
            message.success('Cập nhật thành công');
            loadAppointments();
        } catch {
            message.error('Cập nhật thất bại');
        }
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 0: return 'orange';
            case 1: return 'green';
            case 2: return 'red';
            default: return 'default';
        }
    };

    const columns: ColumnsType<Appointment> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        {
            title: 'BĐS',
            key: 'property',
            render: (_, record) => record.house?.title || record.land?.title || 'N/A',
            ellipsis: true,
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => record.customer?.user?.fullName || record.customer?.code || 'N/A',
        },
        {
            title: 'Nhân viên',
            key: 'employee',
            render: (_, record) => record.employee?.user?.fullName || 'Chưa phân công',
        },
        {
            title: 'Ngày hẹn',
            dataIndex: 'appointmentDate',
            key: 'appointmentDate',
            render: (date: string) => formatDateTime(date),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => (
                <Tag color={getStatusColor(status)}>{APPOINTMENT_STATUS_LABELS[status]}</Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space>
                    {record.status === 0 && (
                        <Select
                            size="small"
                            placeholder="Cập nhật"
                            style={{ width: 120 }}
                            onChange={(value) => handleStatusChange(record.id, value)}
                            options={[
                                { label: 'Duyệt', value: 1 },
                                { label: 'Từ chối', value: 2 },
                            ]}
                        />
                    )}
                    {record.status !== 0 && (
                        <Button size="small" disabled>
                            Đã xử lý
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={3}>Quản lý lịch hẹn</Title>

            <Input
                placeholder="Tìm kiếm..."
                prefix={<SearchOutlined />}
                style={{ marginBottom: 16, maxWidth: 400 }}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                allowClear
            />

            <Table
                columns={columns}
                dataSource={appointments}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page,
                    total,
                    pageSize: DEFAULT_PAGE_SIZE,
                    onChange: setPage,
                    showTotal: (total) => `Tổng ${total} bản ghi`,
                }}
            />
        </div>
    );
};

export default AppointmentManagementPage;
