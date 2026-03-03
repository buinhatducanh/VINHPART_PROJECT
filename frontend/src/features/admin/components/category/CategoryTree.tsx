import { AnimatePresence, motion } from 'framer-motion';
import { Category } from '@/shared/types';
import { CategoryItem } from './CategoryItem';
import { Folder } from 'lucide-react';

interface CategoryTreeProps {
    categories: Category[];
    expandedCategories: Set<string>;
    onToggleExpand: (id: string) => void;
    onAddSub: (parentId: string) => void;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
    searchQuery: string;
}

export function CategoryTree({
    categories,
    expandedCategories,
    onToggleExpand,
    onAddSub,
    onEdit,
    onDelete,
    searchQuery
}: CategoryTreeProps) {
    const getChildren = (parentId: string | null): Category[] => {
        return categories
            .filter(cat => cat.parent_id === parentId)
            .sort((a, b) => a.order - b.order);
    };

    const countChildren = (id: string): number => {
        return categories.filter(cat => cat.parent_id === id).length;
    };

    const renderCategory = (category: Category, level: number = 0) => {
        const children = getChildren(category.id);
        const hasChildren = children.length > 0;
        const isExpanded = expandedCategories.has(category.id);

        return (
            <div key={category.id}>
                <CategoryItem
                    category={category}
                    level={level}
                    hasChildren={hasChildren}
                    isExpanded={isExpanded}
                    childCount={countChildren(category.id)}
                    onToggleExpand={onToggleExpand}
                    onAddSub={onAddSub}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />

                <AnimatePresence>
                    {hasChildren && isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            {children.map(child => renderCategory(child, level + 1))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const rootCategories = getChildren(null);
    const filteredRootCategories = rootCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredRootCategories.length === 0) {
        return (
            <div className="text-center py-20 bg-card/20 border border-dashed border-border rounded-2xl">
                <Folder className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                <p className="text-gray-600 text-sm font-medium">Không có danh mục nào được tìm thấy</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {filteredRootCategories.map(category => renderCategory(category))}
        </div>
    );
}
