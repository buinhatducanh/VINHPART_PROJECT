import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface CategoryDeleteConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
    progress?: number;
}

export function CategoryDeleteConfirm({ isOpen, onClose, onConfirm, isDeleting, progress = 0 }: CategoryDeleteConfirmProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={!isDeleting ? onClose : undefined}
                className="absolute inset-0 bg-black/95"
            />
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative bg-gray-900 border border-red-900/20 rounded-2xl p-8 max-w-sm w-full text-center"
            >
                <div className="w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 className={`w-8 h-8 text-red-600 ${isDeleting ? 'animate-pulse' : ''}`} />
                </div>

                {isDeleting ? (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white mb-2">ĐANG XÓA...</h3>
                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="bg-red-600 h-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: "linear" }}
                            />
                        </div>
                        <p className="text-sm text-gray-500">{progress}% hoàn thành</p>
                    </div>
                ) : (
                    <>
                        <h3 className="text-xl font-bold text-white mb-2">XÁC NHẬN XÓA</h3>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            Hành động này sẽ xóa vĩnh viễn danh mục và tất cả danh mục con liên quan. Bạn chắc chứ?
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gray-800 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition-all"
                            >
                                HUỶ
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-6 py-3 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all"
                            >
                                XÓA NGAY
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
