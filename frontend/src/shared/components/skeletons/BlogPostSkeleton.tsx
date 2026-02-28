import { Skeleton } from "@/shared/components/ui/skeleton";

export function BlogPostSkeleton() {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {/* Image */}
            <div className="relative h-48">
                <Skeleton className="h-full w-full bg-gray-800" />
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {/* Title */}
                <Skeleton className="h-6 w-3/4 bg-gray-800" />

                {/* Excerpt */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-gray-800" />
                    <Skeleton className="h-4 w-5/6 bg-gray-800" />
                </div>

                {/* Meta */}
                <div className="flex justify-between pt-2">
                    <Skeleton className="h-3 w-1/4 bg-gray-800" />
                    <Skeleton className="h-3 w-1/4 bg-gray-800" />
                </div>

                {/* Button */}
                <Skeleton className="h-4 w-20 bg-gray-800 mt-2" />
            </div>
        </div>
    );
}
