import { motion } from 'framer-motion';
import { Folder, ChevronRight, ChevronDown, Plus, Edit, Trash2 } from 'lucide-react';
import { Category } from '@/shared/types';

interface CategoryItemProps {
    category: Category;
    level: number;
    hasChildren: boolean;
    isExpanded: boolean;
    childCount: number;
    onToggleExpand: (id: string) => void;
    onAddSub: (parentId: string) => void;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
}

export function CategoryItem({
    category,
    level,
    hasChildren,
    isExpanded,
    childCount,
    onToggleExpand,
    onAddSub,
    onEdit,
    onDelete
}: CategoryItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group flex items-center gap-3 p-4 bg-muted/30 hover:bg-muted border border-border rounded-lg transition-all mb-2"
            style={{ marginLeft: level * 32 }}
        >
            {hasChildren ? (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onToggleExpand(category.id)}
                    className="p-1 hover:bg-muted/80 rounded transition-colors"
                >
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                </motion.button>
            ) : (
                <div className="w-7" />
            )}

            <div className={`w-10 h-10 bg-gradient-to-br ${level === 0 ? 'from-orange-600 to-orange-800' :
                    level === 1 ? 'from-blue-600 to-blue-800' :
                        'from-green-600 to-green-800'
                } rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
                {category.image ? (
                    <img src={category.image} alt={category.name} className="w-10 h-10 object-cover rounded-lg" />
                ) : (
                    <Folder className="w-5 h-5 text-foreground" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-foreground font-semibold truncate">{category.name}</h3>
                    {hasChildren && (
                        <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/50 rounded text-orange-400 text-[10px] font-bold">
                            {childCount} CON
                        </span>
                    )}
                </div>
                {category.description && (
                    <p className="text-xs text-muted-foreground truncate italic">{category.description}</p>
                )}
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onAddSub(category.id)}
                    className="p-2 bg-green-600/10 border border-green-600/50 rounded-lg hover:bg-green-600/20 transition-all"
                    title="Thêm danh mục con"
                >
                    <Plus className="w-4 h-4 text-green-400" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(category)}
                    className="p-2 bg-blue-600/10 border border-blue-600/50 rounded-lg hover:bg-blue-600/20 transition-all"
                >
                    <Edit className="w-4 h-4 text-blue-400" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(category.id)}
                    className="p-2 bg-red-600/10 border border-red-600/50 rounded-lg hover:bg-red-600/20 transition-all"
                >
                    <Trash2 className="w-4 h-4 text-red-400" />
                </motion.button>
            </div>
        </motion.div>
    );
}
