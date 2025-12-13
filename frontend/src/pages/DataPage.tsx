/**
 * Data Page
 * User's data management page
 */

import React from 'react';
import Sidebar from '../components/Sidebar';

const DataPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar activePage="data" />
      <div className="flex-1 ml-[64px]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold text-slate-900 mb-6">My Data</h1>
          <div className="bg-white border border-slate-200 rounded-lg p-8">
            <p className="text-slate-600">Your data management interface will be available here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPage;

