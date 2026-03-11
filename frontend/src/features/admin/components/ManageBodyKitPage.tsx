import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2, Car, Search, Package, X, Layers, Upload, Save, Edit } from 'lucide-react';
import { bodykitApi, productApi } from '@/lib/api';
import { Vehicle, Product } from '@/shared/types';
import { toast } from 'sonner';
import { AddProductPage } from './AddProductPage';

interface ManageBodyKitPageProps {
    onBack: () => void;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export function ManageBodyKitPage({ onBack }: ManageBodyKitPageProps) {
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState({ name: '', brand: '', model: '', year: '', image: '', description: '' });

    const widgetRef = useRef<any>(null);

    useEffect(() => {
        if ((window as any).cloudinary) {
            widgetRef.current = (window as any).cloudinary.createUploadWidget(
                {
                    cloudName: (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || 'dmz66rbbk',
                    uploadPreset: 'vinhpart_products_preset',
                    sources: ['local', 'url', 'camera'],
                    multiple: false,
                    folder: 'vinhpart_vehicles',
                    resourceType: 'image',
                    clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
                    maxFileSize: 10000000,
                    maxImageWidth: 2000,
                    maxImageHeight: 2000,
                    cropping: true,
                    croppingAspectRatio: 1,
                    showSkipCropButton: true,
                    styles: {
                        palette: {
                            window: "#1f2937",
                            windowBorder: "#374151",
                            tabIcon: "#ef4444",
                            menuIcons: "#9ca3af",
                            textDark: "#111827",
                            textLight: "#f3f4f6",
                            link: "#ef4444",
                            action: "#ef4444",
                            inactiveTabIcon: "#6b7280",
                            error: "#dc2626",
                            inProgress: "#f59e0b",
                            complete: "#10b981",
                            sourceBg: "#111827"
                        }
                    }
                },
                (error: any, result: any) => {
                    if (!error && result && result.event === "success") {
                        const url = result.info.secure_url;
                        setFormData(prev => ({ ...prev, image: url }));
                        toast.success('Ngàm ảnh tải lên thành công');
                    } else if (error) {
                        toast.error('Lỗi khi tải ảnh lên: ' + error.message);
                    }
                }
            );
        }
    }, []);

    const { data: vehicles, isLoading } = useQuery({
        queryKey: ['admin-vehicles'],
        queryFn: () => bodykitApi.getAdminVehicles(),
    });

    const createMutation = useMutation({
        mutationFn: bodykitApi.createVehicle,
        onSuccess: (newVehicle: any) => {
            queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
            toast.success('Tạo xe thành công');
            setSelectedVehicle(newVehicle as Vehicle);
            setViewMode('detail');
            setFormData({ name: '', brand: '', model: '', year: '', image: '', description: '' });
        },
        onError: () => toast.error('Không thể tạo xe'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => bodykitApi.updateVehicle(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
            toast.success('Cập nhật xe thành công');
            setViewMode('list');
            setFormData({ name: '', brand: '', model: '', year: '', image: '', description: '' });
            setSelectedVehicle(null);
        },
        onError: () => toast.error('Không thể cập nhật xe'),
    });

    const deleteMutation = useMutation({
        mutationFn: bodykitApi.deleteVehicle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
            toast.success('Đã xóa xe');
        },
        onError: () => toast.error('Không thể xóa xe'),
    });

    const handleCreateOrUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            brand: formData.brand,
            model: formData.model,
            year: formData.year ? parseInt(formData.year) : undefined,
            image: formData.image || undefined,
            description: formData.description || undefined,
        };

        if (viewMode === 'edit' && selectedVehicle) {
            updateMutation.mutate({ id: selectedVehicle.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleOpenEdit = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setFormData({
            name: vehicle.name || '',
            brand: vehicle.brand || '',
            model: vehicle.model || '',
            year: vehicle.year ? vehicle.year.toString() : '',
            image: vehicle.image || '',
            description: vehicle.description || ''
        });
        setViewMode('edit');
    };

    const handleOpenDetail = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setViewMode('detail');
    };

    if (viewMode === 'create' || viewMode === 'edit') {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => setViewMode('list')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại danh sách
                    </button>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-card border border-border rounded-2xl p-8 mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent rounded-2xl pointer-events-none"></div>

                        <div className="relative">
                            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-red-500 bg-clip-text mb-8 flex items-center gap-3">
                                <Car className="w-8 h-8 text-red-500" /> {viewMode === 'edit' ? 'Cập nhật xe' : 'Thêm xe mới'}
                            </h1>

                            <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left column: Image Upload */}
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="aspect-square bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center relative group">
                                        {formData.image ? (
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo192.png'; }} />
                                        ) : (
                                            <div className="text-center text-muted-foreground p-4">
                                                <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <span className="text-sm font-medium">Chưa có ảnh</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">URL Hình ảnh</label>
                                        <input
                                            type="url"
                                            value={formData.image}
                                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-red-600/50 transition-all text-sm"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (widgetRef.current) { widgetRef.current.open(); }
                                            else { toast.error("Widget Upload chưa được tải xong."); }
                                        }}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-foreground font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                                    >
                                        <Upload className="w-5 h-5" /> Tải ảnh lên
                                    </button>
                                </div>

                                {/* Right column: Form Fields */}
                                <div className="lg:col-span-2 space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-muted-foreground mb-2">Tên xe <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all"
                                            placeholder="VD: Honda Wave Alpha 2024"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-muted-foreground mb-2">Hãng xe <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.brand}
                                                onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                                                className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all"
                                                placeholder="VD: Honda"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-muted-foreground mb-2">Model <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.model}
                                                onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
                                                className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all"
                                                placeholder="VD: Wave Alpha"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-muted-foreground mb-2">Năm sản xuất</label>
                                        <input
                                            type="number"
                                            value={formData.year}
                                            onChange={e => setFormData(prev => ({ ...prev, year: e.target.value }))}
                                            className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 transition-all"
                                            placeholder="VD: 2024"
                                            min="1900"
                                            max="2100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-muted-foreground mb-2">Mô tả chi tiết</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20 min-h-[140px] resize-y"
                                            placeholder="Thêm các thông tin mô tả tổng quan về xe, thiết kế, động cơ (nếu có)..."
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t border-border mt-8">
                                        <button type="button" onClick={() => setViewMode('list')} className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg transition-colors">
                                            Hủy bỏ
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending || updateMutation.isPending}
                                            className="flex-[2] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-red-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : <><Save className="w-5 h-5" /> {viewMode === 'edit' ? 'Lưu cập nhật' : 'Lưu xe mới'}</>}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (viewMode === 'detail' && selectedVehicle) {
        return (
            <VehicleDetailAdmin
                vehicle={selectedVehicle}
                onBack={() => {
                    setViewMode('list');
                    setSelectedVehicle(null);
                    queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Layers className="w-6 h-6 text-red-600" />
                            Quản lý Dàn áo
                        </h1>
                    </div>
                    <button
                        onClick={() => setViewMode('create')}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm xe mới
                    </button>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-20 bg-card border border-border rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : !vehicles || vehicles.length === 0 ? (
                    <div className="text-center py-16">
                        <Car className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có xe nào</h3>
                        <p className="text-muted-foreground mb-4">Bắt đầu bằng cách thêm xe mới</p>
                        <button
                            onClick={() => setViewMode('create')}
                            className="text-red-600 hover:underline font-medium"
                        >
                            Thêm xe mới
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {vehicles.map(vehicle => (
                            <motion.div
                                key={vehicle.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:border-red-600/30 transition-all cursor-pointer"
                                onClick={() => handleOpenDetail(vehicle)}
                            >
                                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                    {vehicle.image ? (
                                        <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Car className="w-8 h-8 text-muted-foreground/30" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground">{vehicle.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {vehicle.brand} - {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">{vehicle.partsCount}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleOpenEdit(vehicle);
                                        }}
                                        className="p-2 hover:bg-muted rounded-lg transition-colors group"
                                    >
                                        <Edit className="w-4 h-4 text-muted-foreground group-hover:text-blue-600" />
                                    </button>
                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            if (confirm('Bạn có chắc muốn xóa xe này?')) {
                                                deleteMutation.mutate(vehicle.id);
                                            }
                                        }}
                                        className="p-2 hover:bg-muted rounded-lg transition-colors group"
                                    >
                                        <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-600" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface VehicleDetailAdminProps {
    vehicle: Vehicle;
    onBack: () => void;
}

function VehicleDetailAdmin({ vehicle, onBack }: VehicleDetailAdminProps) {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [addPartMode, setAddPartMode] = useState<'none' | 'search' | 'create'>('none');

    const { data: detail, isLoading } = useQuery({
        queryKey: ['admin-vehicle-detail', vehicle.id],
        queryFn: () => bodykitApi.getVehicleDetail(vehicle.id),
    });

    const { data: searchResults } = useQuery({
        queryKey: ['product-search', searchQuery],
        queryFn: () => productApi.getProducts({ search: searchQuery, limit: 10 }),
        enabled: searchQuery.length > 1,
    });

    const addPartsMutation = useMutation({
        mutationFn: (productIds: string[]) => bodykitApi.addParts(vehicle.id, productIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-vehicle-detail', vehicle.id] });
            toast.success('Đã thêm phụ tùng');
            setSearchQuery('');
            setAddPartMode('none');
        },
        onError: () => toast.error('Không thể thêm phụ tùng'),
    });

    const removePartMutation = useMutation({
        mutationFn: (productId: string) => bodykitApi.removePart(vehicle.id, productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-vehicle-detail', vehicle.id] });
            toast.success('Đã gỡ phụ tùng');
        },
        onError: () => toast.error('Không thể gỡ phụ tùng'),
    });

    const existingProductIds = new Set(detail?.parts.map(p => p.product.product_id) || []);
    const filteredResults = searchResults?.data.filter(p => !existingProductIds.has(p.product_id)) || [];

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </button>

                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            {vehicle.image ? (
                                <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Car className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{vehicle.name}</h1>
                            <p className="text-muted-foreground">
                                {vehicle.brand} - {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">
                        Phụ tùng dàn áo ({detail?.parts.length || 0})
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setAddPartMode('search')}
                            className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border"
                        >
                            <Search className="w-4 h-4" />
                            Tìm phụ tùng
                        </button>
                        <button
                            onClick={() => setAddPartMode('create')}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Tạo phụ tùng mới
                        </button>
                    </div>
                </div>

                {addPartMode === 'search' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-red-600/30 rounded-xl p-4 mb-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-foreground">Tìm phụ tùng để thêm</h3>
                            <button
                                onClick={() => {
                                    setAddPartMode('none');
                                    setSearchQuery('');
                                }}
                                className="p-1 hover:bg-muted rounded"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Nhập tên phụ tùng..."
                                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-600"
                                autoFocus
                            />
                        </div>
                        {filteredResults.length > 0 && (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {filteredResults.map((product: Product) => (
                                    <div
                                        key={product.product_id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                                            {product.product_image ? (
                                                <img src={product.product_image} alt={product.product_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-4 h-4 text-muted-foreground/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground line-clamp-1">{product.product_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => addPartsMutation.mutate([product.product_id])}
                                            disabled={addPartsMutation.isPending}
                                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchQuery.length > 1 && filteredResults.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Không tìm thấy phụ tùng phù hợp
                            </p>
                        )}
                    </motion.div>
                )}

                {addPartMode === 'create' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-red-600/30 rounded-xl p-4 mb-4"
                    >
                        <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
                            <h3 className="font-semibold text-foreground">Tạo Phụ tùng mới & Thêm vào Dàn áo</h3>
                            <button
                                onClick={() => setAddPartMode('none')}
                                className="p-1 hover:bg-muted rounded text-muted-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="w-full mt-4">
                            <AddProductPage
                                isModal={true}
                                initialData={{
                                    brand: vehicle.brand,
                                    model: vehicle.model
                                }}
                                lockedFields={['brand', 'model']}
                                onBack={() => setAddPartMode('none')}
                                onSuccess={(newProduct: any) => {
                                    const productId = newProduct.product_id || newProduct.id;
                                    if (productId) {
                                        addPartsMutation.mutate([productId]);
                                    }
                                }}
                            />
                        </div>
                    </motion.div>
                )}

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-16 bg-card border border-border rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : detail?.parts.length === 0 ? (
                    <div className="text-center py-12 bg-card border border-border rounded-xl">
                        <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">Chưa có phụ tùng nào trong dàn áo</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {detail?.parts.map((part, index) => (
                            <motion.div
                                key={part.bodyKitPartId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-red-600/20 transition-all"
                            >
                                <span className="text-xs text-muted-foreground w-6 text-center">{index + 1}</span>
                                <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                                    {part.product.product_image ? (
                                        <img src={part.product.product_image} alt={part.product.product_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-5 h-5 text-muted-foreground/30" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground line-clamp-1">{part.product.product_name}</p>
                                    {part.position && (
                                        <span className="text-xs text-muted-foreground">{part.position}</span>
                                    )}
                                </div>
                                <span className="text-sm text-red-600 font-bold flex-shrink-0">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(part.product.price)}
                                </span>
                                <button
                                    onClick={() => {
                                        if (confirm('Gỡ phụ tùng này khỏi dàn áo?')) {
                                            removePartMutation.mutate(part.product.product_id);
                                        }
                                    }}
                                    className="p-1.5 hover:bg-muted rounded-lg transition-colors group flex-shrink-0"
                                >
                                    <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-600" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
