import { useState, useEffect } from 'react';
import { AddProductPage } from '../components/AddProductPage';
import { StatisticsPage } from '../components/StatisticsPage';
import { ManageOrdersPage } from '../components/ManageOrdersPage';
import { ManageProductsPage } from '../components/ManageProductsPage';
import { ManagePostsPage } from '../components/ManagePostsPage';
import { SettingsPage } from '../components/SettingsPage';
import { ManageSEOPage } from '../components/ManageSEOPage';
import { CategoryPage as ManageCategoriesPage } from '../components/category';
import { ManageReviewsPage } from '../components/ManageReviewsPage';
import { DashboardHome } from '../components/DashboardHome';
import { LogoutModal } from '../components/LogoutModal';
import { AdminPage, DashboardStats } from '../types';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export function AdminDashboard({ onBackToHome }: AdminDashboardProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    products: 0,
    orders: 0,
    categories: 0,
    banners: 0
  });

  useEffect(() => {
    fetch('http://localhost:3001/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setDashboardStats(data);
      })
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onBackToHome();
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

  return (
    <>
      <DashboardHome
        stats={dashboardStats}
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