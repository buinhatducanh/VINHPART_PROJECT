import { Product } from '@/shared/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ProductSpecifications } from '../molecules/ProductSpecifications';

interface ProductDescriptionSectionProps {
    product: Product;
}

export function ProductDescriptionSection({ product }: ProductDescriptionSectionProps) {
    return (
        <div className="mt-16 lg:mt-24">
            <Tabs defaultValue="description" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="bg-gray-900 border border-gray-800 p-1">
                        <TabsTrigger
                            value="description"
                            className="px-6 py-2 rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
                        >
                            Mô tả sản phẩm
                        </TabsTrigger>
                        <TabsTrigger
                            value="specs"
                            className="px-6 py-2 rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
                        >
                            Thông số kỹ thuật
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="description" className="mt-6 animate-fade-in">
                    <div className="bg-gray-900/30 rounded-2xl p-6 lg:p-10 border border-gray-800">
                        <h3 className="text-xl font-bold text-white mb-6">Chi tiết sản phẩm</h3>
                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="specs" className="mt-6 animate-fade-in">
                    <div className="max-w-3xl mx-auto">
                        <ProductSpecifications product={product} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
