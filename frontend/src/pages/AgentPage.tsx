/**
 * Agent Page - Main chat interface
 */

import React from 'react';
import TopNav from '../components/TopNav';
import AgentChatTab from '../components/AgentChatTab';

const AgentPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <TopNav />
      <div className="flex-1 overflow-hidden">
        <AgentChatTab />
      </div>
    </div>
  );
};

export default AgentPage;

