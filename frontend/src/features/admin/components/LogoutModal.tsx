import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';
import { useI18n } from '@/shared/lib/i18n';

interface LogoutModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export function LogoutModal({ onConfirm, onCancel }: LogoutModalProps) {
    const { t } = useI18n();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-card border border-border rounded-2xl p-8 max-w-md w-full"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent rounded-2xl"></div>

                <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogOut className="w-8 h-8 text-foreground" />
                    </div>

                    <h3 className="text-2xl font-bold text-foreground text-center mb-2">{t('admin.logoutConfirmTitle')}</h3>
                    <p className="text-muted-foreground text-center mb-6">
                        {t('admin.logoutConfirmMsg')}
                    </p>

                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-muted border border-border text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                        >
                            {t('common.cancel')}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onConfirm}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-foreground rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/25"
                        >
                            {t('common.logout')}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
