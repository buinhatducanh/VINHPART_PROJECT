import { useState } from 'react';
import { AddProductPage } from '../components/AddProductPage';
import { StatisticsPage } from '../components/StatisticsPage';
import { ManageOrdersPage } from '../components/ManageOrdersPage';
import { ManageProductsPage } from '../components/ManageProductsPage';
import { ManagePostsPage } from '../components/ManagePostsPage';
import { SettingsPage } from '../components/SettingsPage';
import { ManageSEOPage } from '../components/ManageSEOPage';
import { CategoryPage as ManageCategoriesPage } from '../components/category';
import { ManageReviewsPage } from '../components/ManageReviewsPage';
import { ManageBodyKitPage } from '../components/ManageBodyKitPage';
import { ManageAdminEmailsPage } from '../components/ManageAdminEmailsPage';
import { ManageHomepageSectionsPage } from '../components/ManageHomepageSectionsPage';
import { DashboardHome } from '../components/DashboardHome';
import { LogoutModal } from '../components/LogoutModal';
import { AdminPage } from '../types';
import { useDashboardStats } from '@/hooks/useQueries';

interface AdminDashboardProps {
  onBackToHome: () => void;
  onLogout?: () => void;
}

export function AdminDashboard({ onBackToHome, onLogout }: AdminDashboardProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  const { data: dashboardStats } = useDashboardStats();
  const stats = dashboardStats ?? { products: 0, orders: 0, categories: 0, vehicles: 0 };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    } else {
      onBackToHome();
    }
  };

  // Render the current page
  if (currentPage === 'addProduct') {
    return <AddProductPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'statistics') {
    return <StatisticsPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'manageOrders') {
    return <ManageOrdersPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'manageProducts') {
    return <ManageProductsPage onBack={() => setCurrentPage('dashboard')} onAddProduct={() => setCurrentPage('addProduct')} />;
  }

  if (currentPage === 'settings') {
    return <SettingsPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'manageSEO') {
    return <ManageSEOPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'manageCategories') {
    return <ManageCategoriesPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'manageReviews') {
    return <ManageReviewsPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'managePosts') {
    return <ManagePostsPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'manageBodyKit') {
    return <ManageBodyKitPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'manageAdminEmails') {
    return <ManageAdminEmailsPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'manageHomepageSections') {
    return <ManageHomepageSectionsPage onBack={() => setCurrentPage('dashboard')} />;
  }

  return (
    <>
      <DashboardHome
        stats={stats}
        onNavigate={setCurrentPage}
        onLogoutRequest={() => setShowLogoutConfirm(true)}
        onBackToHome={onBackToHome}
      />

      {showLogoutConfirm && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}
