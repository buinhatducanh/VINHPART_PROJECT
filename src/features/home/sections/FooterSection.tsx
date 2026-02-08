import { motion } from 'motion/react';
import { FOOTER_LINKS, CONTACT_INFO } from '../constants';
import { ModalContentType } from '@/shared/data/modalContent';

interface FooterSectionProps {
    onAdminClick?: () => void;
    onModalOpen: (modalType: ModalContentType) => (e: React.MouseEvent) => void;
}

export function FooterSection({ onAdminClick, onModalOpen }: FooterSectionProps) {
    return (
        <footer className="bg-black border-t border-gray-800 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-white font-bold mb-4">Về chúng tôi</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            {FOOTER_LINKS.about.map((link) => (
                                <li key={link.key}>
                                    <a
                                        href="#"
                                        onClick={onModalOpen(link.key as ModalContentType)}
                                        className="hover:text-red-600 transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">Chính sách</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            {FOOTER_LINKS.policy.map((link) => (
                                <li key={link.key}>
                                    <a
                                        href="#"
                                        onClick={onModalOpen(link.key as ModalContentType)}
                                        className="hover:text-red-600 transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">Hỗ trợ</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            {FOOTER_LINKS.support.map((link) => (
                                <li key={link.key}>
                                    <a
                                        href="#"
                                        onClick={onModalOpen(link.key as ModalContentType)}
                                        className="hover:text-red-600 transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">Liên hệ</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>Hotline: {CONTACT_INFO.hotline}</li>
                            <li>Email: {CONTACT_INFO.email}</li>
                            <li>Giờ làm việc: {CONTACT_INFO.workingHours}</li>
                        </ul>
                    </div>
                </div>

                {/* Admin Access Button */}
                <div className="border-t border-gray-800 pt-8 mb-8 flex justify-center">
                    <motion.button
                        onClick={onAdminClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:border-red-600/50"
                    >
                        {/* Neon glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Icon with glow */}
                        <div className="relative">
                            <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <div className="absolute inset-0 blur-md bg-red-600/0 group-hover:bg-red-600/50 transition-all duration-300"></div>
                        </div>

                        {/* Text */}
                        <span className="relative text-sm font-medium text-gray-400 group-hover:text-red-600 transition-colors duration-300">
                            Quản trị viên
                        </span>

                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-600/0 group-hover:border-red-600/50 transition-all duration-300"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-600/0 group-hover:border-red-600/50 transition-all duration-300"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-600/0 group-hover:border-red-600/50 transition-all duration-300"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-600/0 group-hover:border-red-600/50 transition-all duration-300"></div>
                    </motion.button>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; 2026 AutoParts. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
