import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { portfolioService } from '../services/supabase';
import PortfolioTemplate from '../components/PortfolioTemplate';
import { Loader, AlertCircle } from 'lucide-react';

const PublicPortfolio = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPortfolio();
    
    // تسجيل الزيارة
    if (portfolio?.id) {
      trackVisit();
    }
  }, [username]);

  const loadPortfolio = async () => {
    try {
      const data = await portfolioService.getPublicPortfolio(username);
      setPortfolio(data);
    } catch (err) {
      setError('البورتفليو غير موجود أو غير منشور');
    } finally {
      setLoading(false);
    }
  };

  const trackVisit = async () => {
    // هنا يمكن إضافة كود تسجيل الزيارات
    console.log('New visit to:', username);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل البورتفليو...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">البورتفليو غير موجود</h1>
          <p className="text-gray-400">{error || 'الصفحة التي تبحث عنها غير متوفرة'}</p>
        </div>
      </div>
    );
  }

  return <PortfolioTemplate data={portfolio} />;
};

export default PublicPortfolio;