import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';

interface CategoryHeaderProps {
    onBack: () => void;
    onAdd: () => void;
}

export function CategoryHeader({ onBack, onAdd }: CategoryHeaderProps) {
    return (
        <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-gray-800">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <motion.button
                        onClick={onBack}
                        whileHover={{ x: -2 }}
                        className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">DANH MỤC</h1>
                        <p className="text-[10px] text-orange-600 font-bold tracking-widest uppercase">Management System</p>
                    </div>
                </div>
                <motion.button
                    onClick={onAdd}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-red-800 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                    <Plus className="w-4 h-4" />
                    TẠO MỚI
                </motion.button>
            </div>
        </header>
    );
}
