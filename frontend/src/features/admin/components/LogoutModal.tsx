import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';

interface LogoutModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export function LogoutModal({ onConfirm, onCancel }: LogoutModalProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent rounded-2xl"></div>

                <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogOut className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-white text-center mb-2">Đăng xuất</h3>
                    <p className="text-gray-400 text-center mb-6">
                        Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?
                    </p>

                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Hủy
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onConfirm}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/25"
                        >
                            Đăng xuất
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
