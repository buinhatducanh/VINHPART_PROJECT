import { ReactNode } from "react";
interface ProductTagProps {
    icon?: ReactNode;
    label: string;
    value: string;
}

export function ProductTag({ icon, label, value }: ProductTagProps) {
    return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted border border-border">
            {icon && (
                <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-muted-foreground">
                    {icon}
                </div>
            )}
            <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{label}</span>
                <span className="text-sm font-medium text-gray-200">{value}</span>
            </div>
        </div>
    );
}
