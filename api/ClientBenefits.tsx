import React from 'react';
import { Shield, FileText, TrendingUp, Clock, Users, Award } from 'lucide-react';

export const ClientBenefits: React.FC = () => {
  const benefits = [
    {
      icon: Shield,
      title: 'Secure Storage',
      description: 'Your collection data is encrypted and securely stored in the cloud',
    },
    {
      icon: FileText,
      title: 'Professional Documentation',
      description: 'Generate fact sheets and reports for insurance and appraisal purposes',
    },
    {
      icon: TrendingUp,
      title: 'Track Value',
      description: 'Monitor the total value of your collection over time',
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Access your collection information anywhere, anytime',
    },
    {
      icon: Users,
      title: 'Easy Sharing',
      description: 'Share collection details with galleries, insurers, or appraisers',
    },
    {
      icon: Award,
      title: 'Provenance Tracking',
      description: 'Maintain detailed provenance and exhibition history for each piece',
    },
  ];

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Welcome to Your Collection</h2>
        <p className="text-blue-100">
          Manage your art collection with professional tools designed for collectors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-20 transition"
          >
            <benefit.icon className="w-8 h-8 mb-2 text-blue-200" />
            <h3 className="font-semibold mb-1">{benefit.title}</h3>
            <p className="text-sm text-blue-100">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
