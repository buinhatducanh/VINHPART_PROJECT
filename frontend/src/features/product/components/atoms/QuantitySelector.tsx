import { Minus, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
    value: number;
    onChange: (qty: number) => void;
    max: number;
    disabled?: boolean;
    className?: string;
}

export function QuantitySelector({
    value,
    onChange,
    max,
    disabled = false,
    className
}: QuantitySelectorProps) {

    const handleDecrease = () => {
        if (value > 1) {
            onChange(value - 1);
        }
    };

    const handleIncrease = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    return (
        <div className={cn("flex items-center border border-border rounded-lg p-1 bg-card/50", className)}>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted text-muted-foreground"
                onClick={handleDecrease}
                disabled={disabled || value <= 1}
            >
                <Minus className="h-3.5 w-3.5" />
            </Button>

            <div className="w-10 text-center font-bold text-foreground tabular-nums">
                {value}
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted text-muted-foreground"
                onClick={handleIncrease}
                disabled={disabled || value >= max}
            >
                <Plus className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
