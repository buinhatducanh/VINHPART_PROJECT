import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Check, X, FolderTree, ChevronDown } from 'lucide-react';
import { Category } from '@/shared/types';
import { useI18n } from '@/shared/lib/i18n';

interface CategorySelectorProps {
    categories: Category[];
    value: string; // The selected category name
    onChange: (categoryName: string) => void;
    disabled?: boolean;
}

export function CategorySelector({ categories, value, onChange, disabled }: CategorySelectorProps) {
    const { t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);

    // selectedIds maintains the trail of selected category IDs at each level
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const modalRef = useRef<HTMLDivElement>(null);

    // Close modal on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // When opening the modal, try to pre-fill the selectedIds if there's a current value
    useEffect(() => {
        if (isOpen && value) {
            const targetCat = categories.find(c => c.name === value);
            if (targetCat) {
                const trail: string[] = [targetCat.id];
                let currentParent = targetCat.parent_id;
                while (currentParent) {
                    trail.unshift(currentParent);
                    const p = categories.find(c => c.id === currentParent);
                    currentParent = p?.parent_id || null;
                }
                setSelectedIds(trail);
            } else {
                setSelectedIds([]);
            }
        } else if (isOpen && !value) {
            setSelectedIds([]);
        }
    }, [isOpen, value, categories]);

    // Derive columns data based on selectedIds
    // Column 0 is always root categories (parent_id = null)
    const columns: Category[][] = [
        categories.filter(c => !c.parent_id)
    ];

    for (let i = 0; i < selectedIds.length; i++) {
        const parentId = selectedIds[i];
        const children = categories.filter(c => c.parent_id === parentId);
        if (children.length > 0) {
            columns.push(children);
        }
    }

    const handleSelectCategory = (level: number, categoryId: string) => {
        // Truncate the selectedIds Array to the current level and append the new selection
        const newTrail = selectedIds.slice(0, level);
        newTrail.push(categoryId);
        setSelectedIds(newTrail);
    };

    const handleConfirm = () => {
        if (selectedIds.length > 0) {
            const lastSelectedId = selectedIds[selectedIds.length - 1];
            const selectedCat = categories.find(c => c.id === lastSelectedId);
            if (selectedCat) {
                onChange(selectedCat.name);
            }
        } else {
            onChange(""); // Cleared
        }
        setIsOpen(false);
    };

    // Format display string
    const getDisplayPath = () => {
        if (!value) return t('admin.product.categorySelect') || "Chọn danh mục";

        const targetCat = categories.find(c => c.name === value);
        if (!targetCat) return value;

        const trail: string[] = [targetCat.name];
        let currentParent = targetCat.parent_id;
        while (currentParent) {
            const p = categories.find(c => c.id === currentParent);
            if (p) trail.unshift(p.name);
            currentParent = p?.parent_id || null;
        }

        // Truncate logic if too long
        if (trail.length > 3) {
            return `${trail[0]} » ... » ${trail[trail.length - 2]} » ${trail[trail.length - 1]}`;
        }
        return trail.join(' » ');
    };

    const getFullTooltip = () => {
        if (!value) return "";
        const targetCat = categories.find(c => c.name === value);
        if (!targetCat) return value;

        const trail: string[] = [targetCat.name];
        let currentParent = targetCat.parent_id;
        while (currentParent) {
            const p = categories.find(c => c.id === currentParent);
            if (p) trail.unshift(p.name);
            currentParent = p?.parent_id || null;
        }
        return trail.join(' » ');
    };

    const hasUnselectedChildren = () => {
        if (selectedIds.length === 0) return true; // nothing selected
        const lastId = selectedIds[selectedIds.length - 1];
        const hasChildren = categories.some(cat => cat.parent_id === lastId);
        return hasChildren;
    }

    const isFinalSelection = !hasUnselectedChildren() && selectedIds.length > 0;

    return (
        <div className="relative w-full">
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(true)}
                title={getFullTooltip()}
                className={`w-full px-4 py-3 bg-muted border border-border rounded-lg text-left focus:outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/20 transition-all font-medium flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/80'}
          ${!value ? 'text-muted-foreground' : 'text-foreground'}
        `}
            >
                <span className="truncate">{getDisplayPath()}</span>
                <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 ml-2" />
            </button>

            {/* Modal/Popover */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            ref={modalRef}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-card w-full max-w-5xl rounded-2xl border border-border overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <FolderTree className="w-5 h-5 text-blue-500" />
                                    <h3 className="text-lg font-bold text-foreground">Chọn danh mục chi tiết</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Breadcrumb Preview */}
                            <div className="px-6 py-3 bg-muted/10 border-b border-border flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
                                <span className="text-sm font-medium text-muted-foreground">Đã chọn: </span>
                                {selectedIds.length === 0 ? (
                                    <span className="text-sm italic text-muted-foreground ml-2">Chưa chọn</span>
                                ) : (
                                    selectedIds.map((id, index) => {
                                        const cat = categories.find(c => c.id === id);
                                        return (
                                            <React.Fragment key={id}>
                                                {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mx-1" />}
                                                <span className={`text-sm ${index === selectedIds.length - 1 ? 'text-blue-500 font-bold' : 'text-foreground'}`}>
                                                    {cat?.name}
                                                </span>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </div>

                            {/* Columns Container */}
                            <div className="flex-1 overflow-x-auto flex bg-background p-2 custom-scrollbar min-h-[400px]">
                                {columns.map((colCategories, level) => (
                                    <div
                                        key={level}
                                        className="flex-shrink-0 w-64 border-r border-border first:rounded-l-lg last:border-r-0 h-full overflow-y-auto custom-scrollbar px-1"
                                    >
                                        <ul className="py-2">
                                            {colCategories.map((cat) => {
                                                const isSelected = selectedIds[level] === cat.id;
                                                const hasChildren = categories.some(c => c.parent_id === cat.id);

                                                return (
                                                    <li key={cat.id} className="mb-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectCategory(level, cat.id)}
                                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors text-left
                                ${isSelected
                                                                    ? 'bg-blue-600/10 text-blue-500 font-medium'
                                                                    : 'text-foreground hover:bg-muted/50'
                                                                }
                              `}
                                                        >
                                                            <span className="truncate pr-2">{cat.name}</span>
                                                            {hasChildren ? (
                                                                <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-500' : 'text-muted-foreground'}`} />
                                                            ) : (
                                                                isSelected && <Check className="w-4 h-4 text-blue-500 shrink-0" />
                                                            )}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-border bg-muted/30 flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">
                                    {isFinalSelection ? (
                                        <span className="text-green-500 flex items-center gap-1"><Check className="w-4 h-4" /> Đã chọn danh mục cuối cùng</span>
                                    ) : (
                                        "Vui lòng chọn tiếp danh mục nhánh"
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-5 py-2 hover:bg-muted text-foreground border border-border rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!isFinalSelection}
                                        onClick={handleConfirm}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all
                      ${isFinalSelection
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
                                                : 'bg-muted text-muted-foreground cursor-not-allowed border border-border'}
                    `}
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
