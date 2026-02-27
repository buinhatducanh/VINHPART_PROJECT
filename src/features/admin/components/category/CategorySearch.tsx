import { Search } from 'lucide-react';

interface CategorySearchProps {
    value: string;
    onChange: (value: string) => void;
}

export function CategorySearch({ value, onChange }: CategorySearchProps) {
    return (
        <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Tìm kiếm danh mục..."
                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-600/50 focus:ring-1 focus:ring-orange-600/20 transition-all text-sm"
            />
        </div>
    );
}
