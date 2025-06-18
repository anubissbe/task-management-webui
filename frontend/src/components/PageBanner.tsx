import React from 'react';

interface PageBannerProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const PageBanner: React.FC<PageBannerProps> = ({ icon, title, subtitle, actionButton }) => {
  return (
    <div className="bg-gradient-to-r from-black via-gray-900 to-black rounded-2xl p-8 mb-10 border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-5xl">
            {icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-gray-300">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actionButton && (
          <div>
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};