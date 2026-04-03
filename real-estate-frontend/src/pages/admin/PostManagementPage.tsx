
import { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    Table,
    Button,
    Space,
    Tag,
    Input,
    Popconfirm,
    message,
    Typography,
    Image,
    Form,
    Modal,
    Upload,
    Tabs,
    Tooltip,
    Select
} from 'antd';
import { useVietnamAddress } from '@/hooks/UseAddressVN';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    PlusOutlined,
    AppstoreOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { postApi } from '@/api';
import { formatCurrency, formatDateTime } from '@/utils';
import type { Post } from '@/types';
import { DEFAULT_PAGE_SIZE, POST_STATUS_LABELS } from '@/constants';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;


const EditorWrapper = ({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => {
    return (
        <>
            <style>{`
                .ck-editor__editable[role="textbox"] {
                    height: 200px !important;
                    overflow-y: auto;
                }
                .ck-toolbar {
                    border-top-left-radius: 6px !important;
                    border-top-right-radius: 6px !important;
                }
                .ck-editor__main {
                    border-bottom-left-radius: 6px !important;
                    border-bottom-right-radius: 6px !important;
                }
            `}</style>

            <CKEditor
                editor={ClassicEditor as any}
                data={value || ''}
                config={{
                    licenseKey: 'GPL',
                    placeholder: 'Nhập mô tả chi tiết về bài đăng bất động sản...',
                    toolbar: [
                        'heading', '|', 'bold', 'italic', 'link',
                        'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
                    ]
                }}
                onChange={(_event, editor) => onChange?.(editor.getData())}
            />
        </>
    );
};
// =======================================================

const PostManagementPage: React.FC = () => {
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [fileList, setFileList] = useState<any[]>([]);
    const [form] = Form.useForm();

    // Sử dụng Hook chung
    const { provinces, districts, wards, loadDistricts, loadWards } = useVietnamAddress();

    const loadPosts = async () => {
        setLoading(true);
        try {
            const res = await postApi.getAll();
            setAllPosts(res.data?.data || res.data || []);
        } catch (err) {
            console.error("Load posts error:", err);
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    // Lọc và phân trang
    useEffect(() => {
        let result = [...allPosts];

        if (activeTab === "pending") result = result.filter(p => p.status === 1);
        else if (activeTab === "approved") result = result.filter(p => p.status === 2);
        else if (activeTab === "rejected") result = result.filter(p => p.status === 3);

        if (search.trim()) {
            const keyword = search.toLowerCase().trim();
            result = result.filter(p =>
                p.title?.toLowerCase().includes(keyword) ||
                p.address?.toLowerCase().includes(keyword)
            );
        }

        const start = (page - 1) * DEFAULT_PAGE_SIZE;
        setFilteredPosts(result.slice(start, start + DEFAULT_PAGE_SIZE));
    }, [allPosts, activeTab, search, page]);

    const openModal = (record?: Post) => {
        setEditingPost(record || null);
        form.resetFields();
        setFileList([]);

        if (record) {
            form.setFieldsValue(record);

            // Load quận/huyện và phường/xã nếu đang sửa
            if (record.city) loadDistricts(record.city);
            if (record.district) loadWards(record.district);

            if (record.images?.length) {
                setFileList(
                    record.images.map(img => ({
                        uid: img.id.toString(),
                        name: `image-${img.id}`,
                        status: 'done',
                        url: img.url,
                    }))
                );
            }
        }
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formData = new FormData();

            Object.keys(values).forEach(key => {
                const value = values[key];
                if (key !== 'images' && value !== undefined && value !== null && value !== '') {
                    formData.append(key, String(value));
                }
            });

            fileList
                .filter(file => file.originFileObj)
                .forEach(file => formData.append("images", file.originFileObj!));

            if (editingPost) {
                await postApi.update(editingPost.id, formData);
                message.success("Cập nhật bài đăng thành công");
            } else {
                await postApi.create(formData);
                message.success("Thêm bài đăng thành công");
            }

            loadPosts();
            setModalOpen(false);
            setFileList([]);
        } catch (err: any) {
            if (err.errorFields) return;
            const errorMsg = err.response?.data?.message || "Có lỗi xảy ra";
            message.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await postApi.delete(id);
            message.success('Xóa thành công');
            loadPosts();
        } catch {
            message.error('Xóa thất bại');
        }
    };

    const handleStatusChange = async (id: number, status: number) => {
        try {
            if (status === 2) await postApi.approve(id);
            if (status === 3) await postApi.reject(id);
            message.success('Cập nhật trạng thái thành công');
            loadPosts();
        } catch {
            message.error('Thất bại');
        }
    };

    const columns: ColumnsType<Post> = [
        {
            title: 'Ảnh',
            width: 80,
            render: (_, record) => record.images?.length ? (
                <Image src={record.images[0].url} width={60} height={50} style={{ objectFit: 'cover', borderRadius: '4px' }} />
            ) : '—'
        },
        {
            title: 'Tiêu đề',
            width: 220,
            render: (_, record) => (
                <Space>
                    <span style={{ fontWeight: 500 }}>{record.title}</span>
                    {record.isVip && <Tag color="gold">VIP</Tag>}
                </Space>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            width: 450,
            render: (text: string) => !text ? '—' : (
                <div
                    dangerouslySetInnerHTML={{ __html: text }}
                    style={{
                        lineHeight: '1.6',
                        fontSize: '13px',
                        maxHeight: '100px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                    }}
                />
            )
        },
        { title: 'Địa chỉ', dataIndex: 'address', width: 250 },
        {
            title: 'Giá',
            width: 150,
            render: (_, record) => <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{formatCurrency(record.price)}</span>
        },
        { title: 'Ngày đăng', width: 150, render: (_, record) => formatDateTime(record.postedAt) },
        {
            title: 'Trạng thái',
            width: 120,
            render: (_, record) => (
                <Tag color={record.status === 1 ? 'orange' : record.status === 2 ? 'green' : 'red'}>
                    {POST_STATUS_LABELS[record.status]}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            width: 180,
            align: 'center',
            render: (_, record) => (
                <Space wrap>
                    {record.status === 1 && (
                        <>
                            <Tooltip title="Duyệt">
                                <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleStatusChange(record.id, 2)} />
                            </Tooltip>
                            <Tooltip title="Từ chối">
                                <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleStatusChange(record.id, 3)} />
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title="Sửa">
                        <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa bài đăng này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button size="small" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <style>{`
                .ant-table {
                    background: #fff;
                    border-radius: 8px;
                }
                .ant-table-body {
                    overflow-y: auto !important;
                    min-height: 500px;
                }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý bài đăng</Title>
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openModal()} style={{ borderRadius: '8px' }}>
                    Thêm bài đăng
                </Button>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={(key) => { setActiveTab(key as any); setPage(1); }}
                style={{ marginBottom: 20 }}
            >
                <TabPane tab={<span><AppstoreOutlined /> Tất cả ({allPosts.length})</span>} key="all" />
                <TabPane tab={<span><ClockCircleOutlined style={{ color: '#faad14' }} /> Chờ duyệt ({allPosts.filter(p => p.status === 1).length})</span>} key="pending" />
                <TabPane tab={<span><CheckCircleOutlined style={{ color: '#52c41a' }} /> Đã duyệt ({allPosts.filter(p => p.status === 2).length})</span>} key="approved" />
                <TabPane tab={<span><CloseCircleOutlined style={{ color: '#f5222d' }} /> Đã từ chối ({allPosts.filter(p => p.status === 3).length})</span>} key="rejected" />
            </Tabs>

            <Input
                placeholder="Tìm kiếm theo tiêu đề hoặc địa chỉ..."
                prefix={<SearchOutlined />}
                style={{ marginBottom: 20, maxWidth: 400, borderRadius: '8px' }}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                allowClear
            />

            <Table
                rowKey="id"
                columns={columns}
                dataSource={filteredPosts}
                loading={loading}
                scroll={{ x: 'max-content', y: 500 }}
                sticky
                pagination={{
                    current: page,
                    pageSize: DEFAULT_PAGE_SIZE,
                    total: allPosts.length,
                    onChange: (p: number) => setPage(p),
                    showSizeChanger: false,
                    style: { marginTop: 20 }
                }}
            />

            <Modal
                title={editingPost ? "Sửa bài đăng" : "Thêm bài đăng"}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                width={900}   // Tăng nhẹ để hiển thị 3 cột địa chỉ
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form layout="vertical" form={form}>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
                        <Input placeholder="Nhập tiêu đề bài đăng" />
                    </Form.Item>

                    {/* Phần Địa chỉ sử dụng Select + Hook */}
                    <Space style={{ display: 'flex', width: '100%' }} align="baseline">
                        <Form.Item name="city" label="Tỉnh/Thành phố" rules={[{ required: true }]}>
                            <Select
                                placeholder="Chọn Tỉnh/Thành phố"
                                onChange={loadDistricts}
                                style={{ width: '100%' }}
                                showSearch
                            >
                                {provinces.map(p => (
                                    <Option key={p.code} value={p.name}>{p.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true }]}>
                            <Select
                                placeholder="Chọn Quận/Huyện"
                                onChange={loadWards}
                                disabled={!districts.length}
                                style={{ width: '100%' }}
                                showSearch
                            >
                                {districts.map(d => (
                                    <Option key={d.code} value={d.name}>{d.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}>
                            <Select
                                placeholder="Chọn Phường/Xã"
                                disabled={!wards.length}
                                style={{ width: '100%' }}
                                showSearch
                            >
                                {wards.map(w => (
                                    <Option key={w.code} value={w.name}>{w.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Space>

                    <Form.Item name="address" label="Địa chỉ cụ thể">
                        <Input placeholder="Số nhà, tên đường..." />
                    </Form.Item>

                    <Space style={{ display: 'flex', width: '100%' }} align="baseline">
                        <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true }]}>
                            <Input type="number" style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="area" label="Diện tích (m²)" rules={[{ required: true }]}>
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="direction" label="Hướng">
                            <Input />
                        </Form.Item>
                    </Space>

                    <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                        <EditorWrapper />
                    </Form.Item>

                    <Form.Item label="Ảnh bài đăng">
                        <Upload
                            multiple
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            beforeUpload={() => false}
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Thêm ảnh</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PostManagementPage;


