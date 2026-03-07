import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2, Car, Search, Package, X, Layers } from 'lucide-react';
import { bodykitApi, productApi } from '@/lib/api';
import { Vehicle, Product } from '@/shared/types';
import { toast } from 'sonner';

interface ManageBodyKitPageProps {
    onBack: () => void;
}

type ViewMode = 'list' | 'create' | 'detail';

export function ManageBodyKitPage({ onBack }: ManageBodyKitPageProps) {
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState({ name: '', brand: '', model: '', year: '', image: '', description: '' });

    const { data: vehicles, isLoading } = useQuery({
        queryKey: ['admin-vehicles'],
        queryFn: () => bodykitApi.getAdminVehicles(),
    });

    const createMutation = useMutation({
        mutationFn: bodykitApi.createVehicle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
            toast.success('Tạo xe thành công');
            setViewMode('list');
            setFormData({ name: '', brand: '', model: '', year: '', image: '', description: '' });
        },
        onError: () => toast.error('Không thể tạo xe'),
    });

    const deleteMutation = useMutation({
        mutationFn: bodykitApi.deleteVehicle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
            toast.success('Đã xóa xe');
        },
        onError: () => toast.error('Không thể xóa xe'),
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            name: formData.name,
            brand: formData.brand,
            model: formData.model,
            year: formData.year ? parseInt(formData.year) : undefined,
            image: formData.image || undefined,
            description: formData.description || undefined,
        });
    };

    const handleOpenDetail = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setViewMode('detail');
    };

    if (viewMode === 'create') {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={() => setViewMode('list')}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại
                    </button>

                    <h1 className="text-2xl font-bold text-foreground mb-6">Thêm xe mới</h1>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Tên xe *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-red-600"
                                placeholder="VD: Honda Wave Alpha 2024"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Hãng xe *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.brand}
                                    onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-red-600"
                                    placeholder="VD: Honda"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Model *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.model}
                                    onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-red-600"
                                    placeholder="VD: Wave Alpha"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Năm sản xuất</label>
                                <input
                                    type="number"
                                    value={formData.year}
                                    onChange={e => setFormData(prev => ({ ...prev, year: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-red-600"
                                    placeholder="VD: 2024"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">URL hình ảnh</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-red-600"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Mô tả</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-red-600 min-h-[100px] resize-y"
                                placeholder="Mô tả ngắn về xe..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {createMutation.isPending ? 'Đang tạo...' : 'Tạo xe'}
                        </button>
                    </form>
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
    const [showProductSearch, setShowProductSearch] = useState(false);

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
            setShowProductSearch(false);
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
                    <button
                        onClick={() => setShowProductSearch(true)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm phụ tùng
                    </button>
                </div>

                {showProductSearch && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-red-600/30 rounded-xl p-4 mb-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-foreground">Tìm phụ tùng để thêm</h3>
                            <button
                                onClick={() => {
                                    setShowProductSearch(false);
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
