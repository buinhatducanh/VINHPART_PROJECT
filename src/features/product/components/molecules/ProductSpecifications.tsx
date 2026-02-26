import { Product } from '@/shared/types';
import { Table, TableBody, TableCell, TableRow } from "@/shared/components/ui/table";

interface ProductSpecificationsProps {
    product: Product;
}

export function ProductSpecifications({ product }: ProductSpecificationsProps) {
    const specs = [
        { label: "Thương hiệu", value: product.compatible_brand },
        { label: "Model tương thích", value: product.compatible_model },
        { label: "Dung tích", value: product.engine_capacity },
        { label: "Loại xe", value: product.vehicle_type === 'Motorbike' ? 'Xe máy' : 'Ô tô' },
        { label: "Danh mục", value: product.sub_category || product.category },
        { label: "Tình trạng", value: product.stock_status === 'in_stock' ? 'Có sẵn' : 'Liên hệ' },
        { label: "SKU", value: product.sku || 'N/A' },
    ];

    return (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
            <Table>
                <TableBody>
                    {specs.map((spec, index) => (
                        spec.value && (
                            <TableRow key={index} className="hover:bg-gray-900/50 border-gray-800">
                                <TableCell className="font-medium text-gray-400 w-1/3 bg-gray-900/30">
                                    {spec.label}
                                </TableCell>
                                <TableCell className="text-gray-200">
                                    {spec.value}
                                </TableCell>
                            </TableRow>
                        )
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
