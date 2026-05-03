import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowLeft, GripVertical, Layout } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/shared/components/ui/switch';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { homepageSectionsApi, HomepageSection } from '@/lib/api';

interface ManageHomepageSectionsPageProps {
    onBack: () => void;
}

function SortableSectionRow({
    section,
    onToggle,
}: {
    section: HomepageSection;
    onToggle: (enabled: boolean) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const sectionIcons: Record<string, string> = {
        hero: '🎬',
        benefits: '✨',
        body_kit: '🏍️',
        featured_products: '⭐',
        latest_posts: '📝',
        reviews: '💬',
        cta: '📢',
        footer: '📋',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-red-600/20 transition-all"
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded text-muted-foreground"
            >
                <GripVertical className="w-5 h-5" />
            </button>
            <span className="text-xl">{sectionIcons[section.key] || '📋'}</span>
            <div className="flex-1">
                <p className="font-semibold text-foreground">{section.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{section.key}</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                    {section.isEnabled ? 'Hiển thị' : 'Ẩn'}
                </span>
                <Switch checked={section.isEnabled} onCheckedChange={onToggle} />
            </div>
        </div>
    );
}

export function ManageHomepageSectionsPage({ onBack }: ManageHomepageSectionsPageProps) {
    const queryClient = useQueryClient();

    const { data: sections, isLoading } = useQuery({
        queryKey: ['homepage-sections'],
        queryFn: homepageSectionsApi.getAll,
    });

    const reorderMutation = useMutation({
        mutationFn: homepageSectionsApi.reorder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
            toast.success('Đã cập nhật thứ tự');
        },
        onError: () => toast.error('Không thể cập nhật thứ tự'),
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
            homepageSectionsApi.update(id, { isEnabled }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
            toast.success('Đã cập nhật');
        },
        onError: () => toast.error('Không thể cập nhật'),
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = sections?.findIndex(s => s.id === active.id) ?? -1;
        const newIndex = sections?.findIndex(s => s.id === over.id) ?? -1;
        if (oldIndex === -1 || newIndex === -1) return;
        const reordered = arrayMove(sections!, oldIndex, newIndex);
        reorderMutation.mutate(reordered.map(s => s.id));
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Layout className="w-6 h-6 text-red-600" />
                        Quản lý trang chủ
                    </h1>
                </div>

                <p className="text-muted-foreground mb-6 text-sm">
                    Kéo thả để sắp xếp thứ tự hiển thị. Bật/tắt để ẩn/hiện từng section trên trang chủ.
                </p>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sections?.map(s => s.id) || []}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {sections?.map(section => (
                                    <motion.div
                                        key={section.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <SortableSectionRow
                                            section={section}
                                            onToggle={(enabled) =>
                                                toggleMutation.mutate({ id: section.id, isEnabled: enabled })
                                            }
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}