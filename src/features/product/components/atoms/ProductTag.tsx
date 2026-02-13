import { ReactNode } from "react";

interface ProductTagProps {
    icon?: ReactNode;
    label: string;
    value: string;
}

export function ProductTag({ icon, label, value }: ProductTagProps) {
    return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 border border-gray-800">
            {icon && (
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-400">
                    {icon}
                </div>
            )}
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{label}</span>
                <span className="text-sm font-medium text-gray-200">{value}</span>
            </div>
        </div>
    );
}
