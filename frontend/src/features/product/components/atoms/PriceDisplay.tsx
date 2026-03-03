import { cn } from "@/lib/utils";

interface PriceDisplayProps {
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function PriceDisplay({
    price,
    originalPrice,
    discountPercentage,
    size = 'md',
    className
}: PriceDisplayProps) {

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const sizeClasses = {
        sm: { current: 'text-lg', original: 'text-xs' },
        md: { current: 'text-xl', original: 'text-sm' },
        lg: { current: 'text-3xl', original: 'text-base' },
        xl: { current: 'text-4xl', original: 'text-lg' },
    };

    return (
        <div className={cn("flex flex-col", className)}>
            {discountPercentage && discountPercentage > 0 ? (
                <>
                    <div className="flex items-center gap-2">
                        <span className={cn("text-muted-foreground line-through font-medium", sizeClasses[size].original)}>
                            {originalPrice && formatPrice(originalPrice)}
                        </span>
                        <span className="text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded text-xs font-bold">
                            -{discountPercentage}%
                        </span>
                    </div>
                    <span className={cn("text-red-500 font-black tracking-tight", sizeClasses[size].current)}>
                        {formatPrice(price)}
                    </span>
                </>
            ) : (
                <span className={cn("text-red-500 font-black tracking-tight", sizeClasses[size].current)}>
                    {formatPrice(price)}
                </span>
            )}
        </div>
    );
}
