import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { message, Modal } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { postApi, authApi, paymentApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';

interface PostFormModel {
  title: string;
  type: string;
  city: string;
  district: string;
  ward: string;
  address: string;
  price: string;
  area: string;
  direction: string;
}

const PostFormPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuthStore();
  const editingId = params.id ? Number(params.id) : undefined;
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [formData, setFormData] = useState<PostFormModel>({
    title: '',
    type: '',
    city: '',
    district: '',
    ward: '',
    address: '',
    price: '',
    area: '',
    direction: '',
  });

  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ref để tránh stale closure trong Modal
  const formDataRef = useRef(formData);
  const descriptionRef = useRef(description);
  const imagesRef = useRef(images);

  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { descriptionRef.current = description; }, [description]);
  useEffect(() => { imagesRef.current = images; }, [images]);

  // Dữ liệu địa lý
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // 1. Fetch danh sách Tỉnh/Thành phố khi component mount
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch(() => message.error('Không thể tải danh sách tỉnh thành'));
  }, []);

  // 2. Fetch danh sách Quận/Huyện khi Tỉnh/Thành phố thay đổi
  useEffect(() => {
    const fetchDistricts = async () => {
      const selectedProvince = provinces.find((p) => p.name === formData.city);
      if (selectedProvince) {
        try {
          const res = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`);
          const data = await res.json();
          setDistricts(data.districts || []);
        } catch (error) {}
      } else {
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [formData.city, provinces]);

  // 3. Fetch danh sách Phường/Xã khi Quận/Huyện thay đổi
  useEffect(() => {
    const fetchWards = async () => {
      const selectedDistrict = districts.find((d) => d.name === formData.district);
      if (selectedDistrict) {
        try {
          const res = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`);
          const data = await res.json();
          setWards(data.wards || []);
        } catch (error) {}
      } else {
        setWards([]);
      }
    };
    fetchWards();
  }, [formData.district, districts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, city: e.target.value, district: '', ward: '' }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, district: e.target.value, ward: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews((prev) => {
      const newPreviews = prev.filter((_, index) => index !== indexToRemove);
      URL.revokeObjectURL(prev[indexToRemove]);
      return newPreviews;
    });
  };

  // Load dữ liệu khi Edit
  useEffect(() => {
    const initForm = async () => {
      if (!editingId) return;
      try {
        setIsLoading(true);
        const res = await postApi.getById(editingId);
        const post = res.data;
        setIsEditMode(true);
        setFormData({
          title: post.title ?? '',
          type: post.type ?? '',
          city: post.city ?? '',
          district: post.district ?? '',
          ward: post.ward ?? '',
          address: post.address ?? '',
          price: post.price?.toString() ?? '',
          area: post.area?.toString() ?? '',
          direction: post.direction ?? '',
        });
        setDescription(post.description ?? '');
        const existingImages = post.images?.map((img: any) => img.url).filter(Boolean) ?? [];
        setImagePreviews(existingImages);
      } catch (error) {
        message.error('Không thể tải dữ liệu bài đăng để chỉnh sửa');
      } finally {
        setIsLoading(false);
      }
    };

    initForm();
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [editingId]);

  const checkVipStatus = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await authApi.getMe();
      const currentUser = res.data?.user;

      if (currentUser) {
        const { setUser } = useAuthStore.getState();
        setUser(currentUser);

        if (!currentUser.isVip) return false;

        try {
          const subsRes = await paymentApi.getMySubscriptions({ limit: 100 });
          const subscriptions = subsRes.data?.data || [];
          const hasActiveVip = subscriptions.some(
            (sub: any) => sub.status === 1 && new Date(sub.endDate) > new Date()
          );
          return hasActiveVip;
        } catch {
          return currentUser.isVip || false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking VIP status:', error);
      return user?.isVip || false;
    }
  };

  // Xử lý gửi form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      message.error('❌ Vui lòng nhập tiêu đề bài viết');
      return;
    }
    if (!formData.type) {
      message.error('❌ Vui lòng chọn loại bất động sản');
      return;
    }
    if (!formData.city || !formData.district || !formData.ward) {
      message.error('❌ Vui lòng chọn tỉnh/thành, quận/huyện và phường/xã');
      return;
    }
    if (!formData.address.trim()) {
      message.error('❌ Vui lòng nhập địa chỉ cụ thể');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      message.error('❌ Vui lòng nhập mức giá hợp lệ');
      return;
    }
    if (!formData.area || Number(formData.area) <= 0) {
      message.error('❌ Vui lòng nhập diện tích hợp lệ');
      return;
    }
    if (!description.trim()) {
      message.error('❌ Vui lòng nhập mô tả bài viết');
      return;
    }
    if (!isEditMode && imagePreviews.length === 0) {
      message.error('❌ Vui lòng upload ít nhất 1 ảnh');
      return;
    }

    // Kiểm tra VIP status khi đăng bài mới
    if (!isEditMode) {
      try {
        setIsLoading(true);
        const isVip = await checkVipStatus();

        if (!isVip) {
          setIsLoading(false);
          Modal.confirm({
            title: '👑 Yêu cầu tài khoản VIP',
            icon: <CrownOutlined style={{ color: '#ff7a45' }} />,
            width: 480,
            content: (
              <div style={{ marginTop: 16 }}>
                <p style={{ color: '#666', marginBottom: 16 }}>
                  Bạn cần nâng cấp tài khoản VIP để đăng bài viết bất động sản.
                </p>
                <div
                  style={{
                    backgroundColor: '#fff7e6',
                    border: '1px solid #ffd591',
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>Lợi ích VIP:</p>
                  <p style={{ margin: '4px 0', color: '#666', fontSize: 13 }}>
                    ✓ Đăng tin không giới hạn trong thời gian VIP
                  </p>
                  <p style={{ margin: '4px 0', color: '#666', fontSize: 13 }}>
                    ✓ Tin được ưu tiên hiển thị
                  </p>
                  <p style={{ margin: '4px 0', color: '#666', fontSize: 13 }}>
                    ✓ Xếp hạng cao hơn, tiếp cận nhiều khách hơn
                  </p>
                </div>
              </div>
            ),
            okText: '👑 Nâng cấp VIP ngay',
            cancelText: 'Để sau',
            okButtonProps: {
              style: { backgroundColor: '#ff7a45', borderColor: '#ff7a45' },
            },
            onOk: () => {
              navigate('/vip-upgrade');
            },
          });
          return;
        }
      } catch (error) {
        console.error('Error checking VIP:', error);
        message.error('❌ Không thể kiểm tra trạng thái VIP. Vui lòng thử lại.');
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // Xác nhận trước khi gửi
    const confirmMsg = isEditMode
      ? 'Bạn có chắc muốn cập nhật bài viết này?'
      : 'Bạn có chắc muốn đăng bài viết này? Thông tin sẽ chờ Admin duyệt.';

    const isConfirmed = window.confirm(confirmMsg);
    if (!isConfirmed) return;

    setIsLoading(true);

    try {
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        const typedKey = key as keyof PostFormModel;
        submitData.append(typedKey, formData[typedKey]);
      });

      submitData.append('description', description);

      images.forEach((image) => {
        submitData.append('images', image);
      });

      if (editingId) {
        await postApi.update(editingId, submitData);
        message.success('✅ Cập nhật bài viết thành công!');
      } else {
        await postApi.create(submitData);
        message.success('🎉 Đăng bài thành công! Thông tin đang chờ Admin duyệt.');
      }

      setFormData({ title: '', type: '', city: '', district: '', ward: '', address: '', price: '', area: '', direction: '' });
      setDescription('');
      setImages([]);
      setImagePreviews([]);
      navigate('/my-posts');
    } catch (error: any) {
      console.error('Lỗi submit:', error);
      const errorMsg = error?.response?.data?.message || 'Không thể kết nối đến server. Vui lòng thử lại.';
      message.error(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10 border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-2 border-b-2 border-blue-100 pb-4">
        {isEditMode ? 'Chỉnh sửa tin Bất Động Sản' : 'Đăng tin cho thuê Bất Động Sản'}
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        {isEditMode
          ? 'Cập nhật thông tin chi tiết về bất động sản của bạn'
          : 'Hãy điền đầy đủ thông tin để bài viết được duyệt nhanh chóng'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Tiêu đề */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tiêu đề bài viết <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            placeholder="VD: Cho thuê căn hộ chung cư cao cấp quận 1..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>

        {/* Loại bất động sản */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Loại bất động sản <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            required
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer transition-colors"
          >
            <option value="" disabled>-- Chọn loại bất động sản --</option>
            <option value="Nhà riêng">Nhà riêng</option>
            <option value="Căn hộ chung cư">Căn hộ chung cư</option>
            <option value="Đất nền">Đất nền</option>
            <option value="Văn phòng">Văn phòng</option>
            <option value="Cửa hàng">Cửa hàng</option>
            <option value="Kho xưởng">Kho xưởng</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        {/* Cụm Tỉnh/Huyện/Xã */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <select
              name="city"
              required
              value={formData.city}
              onChange={handleCityChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer transition-colors"
            >
              <option value="" disabled>-- Chọn Tỉnh/Thành phố --</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <select
              name="district"
              required
              value={formData.district}
              onChange={handleDistrictChange}
              disabled={!formData.city}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer disabled:bg-gray-100 transition-colors"
            >
              <option value="" disabled>-- Chọn Quận/Huyện --</option>
              {districts.map((d) => (
                <option key={d.code} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phường/Xã <span className="text-red-500">*</span>
            </label>
            <select
              name="ward"
              required
              value={formData.ward}
              onChange={handleInputChange}
              disabled={!formData.district}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer disabled:bg-gray-100 transition-colors"
            >
              <option value="" disabled>-- Chọn Phường/Xã --</option>
              {wards.map((w) => (
                <option key={w.code} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Địa chỉ chi tiết */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Địa chỉ cụ thể (Số nhà, đường) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            required
            value={formData.address}
            onChange={handleInputChange}
            placeholder="VD: Số 10, Đường Lê Lợi"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>

        {/* Thông tin BĐS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-50 p-5 rounded-xl border border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mức giá (VNĐ/tháng) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="VD: 5000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Diện tích (m²) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="area"
              required
              min="0"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="VD: 60"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hướng (Tùy chọn)</label>
            <select
              name="direction"
              value={formData.direction}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer transition-colors"
            >
              <option value="">-- Chọn hướng --</option>
              <option value="Đông">Đông</option>
              <option value="Tây">Tây</option>
              <option value="Nam">Nam</option>
              <option value="Bắc">Bắc</option>
              <option value="Đông Nam">Đông Nam</option>
              <option value="Tây Nam">Tây Nam</option>
              <option value="Đông Bắc">Đông Bắc</option>
              <option value="Tây Bắc">Tây Bắc</option>
            </select>
          </div>
        </div>

        {/* Mô tả CKEditor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mô tả bài viết <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <CKEditor
              editor={ClassicEditor as any}
              data={description}
              config={{
                licenseKey: 'GPL',
                placeholder: 'Nhập mô tả chi tiết về bất động sản tại đây...',
              }}
              onChange={(_event, editor) => {
                const data = editor.getData();
                setDescription(data);
              }}
            />
          </div>
          <style>{`
            .ck-editor__editable[role="textbox"] {
              height: 200px !important;
            }
          `}</style>
        </div>

        {/* Upload Ảnh */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hình ảnh (Hỗ trợ nhiều ảnh)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Nhấn để chọn ảnh</span> hoặc kéo thả vào đây
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG (Tối đa 10 ảnh)</p>
              </div>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {imagePreviews.length > 0 && (
            <div className="mt-4 flex gap-3 flex-wrap">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden shadow-sm group">
                  <img src={src} alt={`preview-${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                    title="Xóa ảnh này"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nút Submit */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 font-bold text-lg text-white rounded-xl shadow-lg transition-all ${
              isLoading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl active:scale-[0.99]'
            }`}
          >
            {isLoading
              ? '⏳ Đang xử lý bài viết...'
              : isEditMode
                ? '✏️ Cập nhật bài viết'
                : '📤 Đăng tin ngay'}
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">
            {isEditMode
              ? 'Cập nhật thông tin bất động sản của bạn'
              : 'Bài viết sẽ chờ Admin duyệt trước khi hiển thị công khai'}
          </p>
        </div>
      </form>
    </div>
  );
};

export default PostFormPage;