import { Skeleton } from "@/shared/components/ui/skeleton";

export function ProductCardSkeleton() {
    return (
        <div className="bg-gradient-to-b from-gray-900 to-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            {/* Image Skeleton */}
            <div className="relative aspect-square">
                <Skeleton className="h-full w-full bg-gray-800" />
            </div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <Skeleton className="h-4 w-3/4 bg-gray-800" />
                <Skeleton className="h-4 w-1/2 bg-gray-800" />

                {/* Specs */}
                <div className="space-y-1">
                    <Skeleton className="h-3 w-1/3 bg-gray-800" />
                    <Skeleton className="h-3 w-1/4 bg-gray-800" />
                </div>

                {/* Price */}
                <div className="py-2">
                    <Skeleton className="h-6 w-1/2 bg-gray-800" />
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1 bg-gray-800 rounded-lg" />
                    <Skeleton className="h-10 w-20 bg-gray-800 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
