/**
 * Premium ChatGPT-Style Chat Input
 * A polished, minimal input interface with subtle animations
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendAgentMessage } from '../services/api';
import { useWorkflowStore } from '../stores/workflowStore';
import WorkflowPreview from './WorkflowPreview';
import DashboardPreview from './DashboardPreview';
import type { DashboardWidget } from './DashboardDesigner';
import type { NodeType } from '../types';

interface Message {
  from: 'user' | 'agent';
  text: string;
  isTyping?: boolean;
  displayedText?: string;
  action?: 'create_workflow' | 'create_dashboard' | null;
  previewData?: {
    nodes?: Array<{
      id: string;
      type: NodeType;
      position: { x: number; y: number };
      data: { label: string; config?: Record<string, unknown> };
    }>;
    edges?: Array<{
      id: string;
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
    }>;
    widgets?: DashboardWidget[];
  };
  progress?: string;
  workflowId?: string;
}

interface AgentChatTabProps {
  workflowId?: string;
}

const AgentChatTab: React.FC<AgentChatTabProps> = ({ workflowId }) => {
  const navigate = useNavigate();
  const { loadWorkflow } = useWorkflowStore();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Get storage key for this workflow
  const getStorageKey = () => `agent-chat-${workflowId || 'default'}`;

  // Load saved messages from localStorage
  const loadSavedMessages = (): Message[] => {
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out typing states and ensure messages are complete
        return parsed.map((msg: Message) => ({
          ...msg,
          isTyping: false,
          displayedText: undefined,
        }));
      }
    } catch (e) {
      console.error('Error loading saved messages:', e);
    }
    return [];
  };

  // Initialize messages from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = loadSavedMessages();
    return saved;
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(() => {
    const saved = loadSavedMessages();
    return saved.length > 0;
  });
  const [isCreating, setIsCreating] = useState(false);
  const [creationType, setCreationType] = useState<'workflow' | 'dashboard' | null>(null);
  const [previewData, setPreviewData] = useState<{
    nodes: Array<{
      id: string;
      type: NodeType;
      position: { x: number; y: number };
      data: { label: string; config?: Record<string, unknown> };
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
    }>;
    widgets: DashboardWidget[];
  }>({ nodes: [], edges: [], widgets: [] });
  const [creationProgress, setCreationProgress] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Save messages without typing states
        const messagesToSave = messages.map(msg => ({
          from: msg.from,
          text: msg.text,
          action: msg.action,
          previewData: msg.previewData,
          progress: msg.progress,
          workflowId: msg.workflowId,
        }));
        const storageKey = `agent-chat-${workflowId || 'default'}`;
        localStorage.setItem(storageKey, JSON.stringify(messagesToSave));
      } catch (e) {
        console.error('Error saving messages:', e);
      }
    }
  }, [messages, workflowId]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
      // Also scroll the container directly to ensure it goes all the way down
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    };
    
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [messages]);

  // Scroll during typing animation - trigger on every displayedText change
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
      // Also scroll the container directly to ensure it goes all the way down
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    };
    
    // Scroll immediately when displayedText changes
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [messages.map(m => m.displayedText || m.text).join('')]);

  // Typing animation effect
  useEffect(() => {
    // Find messages that are still typing
    const typingMessages = messages.filter(msg => msg.from === 'agent' && msg.isTyping && msg.displayedText !== msg.text);
    
    if (typingMessages.length > 0) {
      typingIntervalRef.current = setInterval(() => {
        setMessages(prev => prev.map(msg => {
          if (msg.from === 'agent' && msg.isTyping && msg.displayedText !== msg.text) {
            const currentLength = msg.displayedText?.length || 0;
            const nextLength = Math.min(currentLength + 8, msg.text.length); // Type 8 characters at a time
            const newDisplayedText = msg.text.substring(0, nextLength);
            
            if (nextLength >= msg.text.length) {
              // Finished typing
              return { ...msg, isTyping: false, displayedText: msg.text };
            }
            
            return { ...msg, displayedText: newDisplayedText };
          }
          return msg;
        }));
        
        // Force scroll to bottom after each typing update
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
          }
          // Also scroll the container directly
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 0);
      }, 10); // 10ms per update for faster typing
    } else {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    }

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    
    const userMessage = inputValue.trim();
    
    // IMMEDIATELY move input to bottom - force DOM update
    setHasStartedChat(true);
    if (inputContainerRef.current) {
      inputContainerRef.current.style.bottom = '8px';
    }
    
    setInputValue('');
    setIsSending(true);
    
    // Add user message
    setMessages(prev => [...prev, { from: 'user', text: userMessage }]);
    
    try {
      // Build conversation history
      const conversationHistory = messages.map(msg => ({
        from: msg.from,
        text: msg.text
      }));
      
      // Call the API with current workflowId
      const response = await sendAgentMessage(userMessage, conversationHistory, workflowId);
      
      // Use structured data from API response (already extracted by backend)
      const parsedAction = response.action || null;
      const parsedPreviewData = response.preview;
      const parsedProgress = response.progress || '';
      const createdWorkflowId = response.workflowId;
      
      // Debug logging
      console.log('Agent response:', { parsedAction, parsedPreviewData, parsedProgress });
      
      // Set up preview if action is present
      if (parsedAction === 'create_workflow') {
        setIsCreating(true);
        setCreationType('workflow');
        const previewNodes = parsedPreviewData?.nodes || [];
        const previewEdges = parsedPreviewData?.edges || [];
        console.log('Setting workflow preview:', { nodes: previewNodes, edges: previewEdges });
        setPreviewData({
          nodes: previewNodes,
          edges: previewEdges,
          widgets: [],
        });
      } else if (parsedAction === 'create_dashboard') {
        setIsCreating(true);
        setCreationType('dashboard');
        const previewWidgets = parsedPreviewData?.widgets || [];
        console.log('Setting dashboard preview:', { widgets: previewWidgets });
        setPreviewData({
          nodes: [],
          edges: [],
          widgets: previewWidgets,
        });
      }
      
      // Add message about workflow update if it was updated
      let finalMessage = response.message;
      if (createdWorkflowId && parsedAction && workflowId) {
        const workflowType = parsedAction === 'create_workflow' ? 'workflow' : 'dashboard';
        finalMessage += `\n\n✅ ${workflowType === 'workflow' ? 'Workflow' : 'Dashboard'} has been updated! Check the ${workflowType === 'workflow' ? 'Workflow' : 'Dashboard'} tab to see the changes.`;
        
        // Reload the workflow to show the changes
        if (workflowId && !workflowId.startsWith('new-')) {
          setTimeout(() => {
            loadWorkflow(workflowId);
          }, 1000);
        }
      } else if (createdWorkflowId && parsedAction && !workflowId) {
        const workflowType = parsedAction === 'create_workflow' ? 'workflow' : 'dashboard';
        finalMessage += `\n\n✅ ${workflowType === 'workflow' ? 'Workflow' : 'Dashboard'} has been created! You can view it in the ${workflowType === 'workflow' ? 'Workflow' : 'Dashboard'} tab.`;
      }
      
      // Add agent response with typing animation (message is already clean, no JSON)
      setMessages(prev => [...prev, { 
        from: 'agent', 
        text: finalMessage,
        isTyping: true,
        displayedText: '',
        action: parsedAction,
        previewData: parsedPreviewData,
        progress: parsedProgress,
        workflowId: createdWorkflowId,
      }]);
    } catch (error: any) {
      console.error('Agent chat error:', error);
      setMessages(prev => [...prev, { 
        from: 'agent', 
        text: error.message || 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsSending(false);
      // Keep input at bottom once chat has started
      // Don't reset isAnimating - hasStartedChat will keep it at bottom
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Update preview data when messages with preview data are added or updated
  useEffect(() => {
    // Check all agent messages for creation actions
    const agentMessages = messages.filter(m => m.from === 'agent' && m.action);
    if (agentMessages.length > 0) {
      const latestCreationMessage = agentMessages[agentMessages.length - 1];
      
      if (latestCreationMessage.action === 'create_workflow') {
        setIsCreating(true);
        setCreationType('workflow');
        if (latestCreationMessage.previewData) {
          setPreviewData(prev => ({
            ...prev,
            nodes: latestCreationMessage.previewData?.nodes || prev.nodes,
            edges: latestCreationMessage.previewData?.edges || prev.edges,
          }));
        }
        if (latestCreationMessage.progress) {
          setCreationProgress(latestCreationMessage.progress);
        }
      } else if (latestCreationMessage.action === 'create_dashboard') {
        setIsCreating(true);
        setCreationType('dashboard');
        if (latestCreationMessage.previewData) {
          setPreviewData(prev => ({
            ...prev,
            widgets: latestCreationMessage.previewData?.widgets || prev.widgets,
          }));
        }
        if (latestCreationMessage.progress) {
          setCreationProgress(latestCreationMessage.progress);
        }
      }
    } else if (isCreating && agentMessages.length === 0) {
      // No more creation messages, but keep preview visible
      // setIsCreating(false);
    }
  }, [messages, isCreating]);

  // Update preview data from latest message (no need to parse JSON - backend handles it)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.from === 'agent' && lastMessage.action && lastMessage.previewData) {
      // Update preview data from message (already extracted by backend)
      if (lastMessage.action === 'create_workflow' && lastMessage.previewData.nodes) {
        setPreviewData(prev => ({
          ...prev,
          nodes: lastMessage.previewData?.nodes || prev.nodes,
          edges: lastMessage.previewData?.edges || prev.edges,
        }));
        if (lastMessage.progress) {
          setCreationProgress(lastMessage.progress);
        }
      } else if (lastMessage.action === 'create_dashboard' && lastMessage.previewData.widgets) {
        setPreviewData(prev => ({
          ...prev,
          widgets: lastMessage.previewData?.widgets || prev.widgets,
        }));
        if (lastMessage.progress) {
          setCreationProgress(lastMessage.progress);
        }
      }
    }
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <div className={`h-full w-full bg-white flex ${isCreating ? 'flex-row' : 'flex-col'} relative overflow-hidden`}>
      {/* Left Side - Chat Interface */}
      <div className={`${isCreating ? 'w-1/2' : 'w-full'} flex flex-col relative ${!hasMessages && !isCreating ? 'justify-center' : ''} min-h-0 flex-1`}>
        {/* Header - Only show when no messages */}
        {!hasMessages && !isCreating && (
          <div className="w-full max-w-3xl px-4 mb-12 text-center mx-auto flex-shrink-0 absolute left-1/2 transform -translate-x-1/2 z-10" style={{ top: '45%' }}>
            <div className="mb-3 flex justify-center">
              <img src="/EyelogoBlack.png" alt="SPECTR" className="h-20 w-auto" />
            </div>
            <h1 className="text-4xl font-medium mb-3 shimmer-text">
              What can i do for you
            </h1>
            <p className="text-base text-slate-500">
              information is intelligence
            </p>
          </div>
        )}

        {/* Chat Messages Area */}
        {hasMessages && (
          <div 
            ref={messagesContainerRef} 
            className={`flex-1 overflow-y-auto px-4 py-6 ${isCreating ? 'pb-20' : 'pb-32'}`}
            style={{ 
              maxHeight: '100%',
              minHeight: 0,
            }}
          >
            <div className={`${isCreating ? 'max-w-full' : 'max-w-3xl'} mx-auto space-y-6`}>
            {messages.map((message, index) => (
              <div key={index}>
                {message.from === 'user' ? (
                  // User message with bubble
                  <div className="flex justify-end">
                    <div className="bg-slate-900 text-white rounded-2xl px-5 py-3 max-w-[80%]">
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Agent message - plain text, no bubble with typing effect
                  <div className="text-slate-900">
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {message.displayedText !== undefined ? message.displayedText : message.text}
                      {message.isTyping && (
                        <span className="inline-block w-0.5 h-4 bg-slate-900 ml-1 animate-pulse" />
                      )}
                    </p>
                    {message.workflowId && !message.isTyping && (
                      <button
                        onClick={() => navigate(`/app/${message.workflowId}`)}
                        className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View {message.action === 'create_dashboard' ? 'Dashboard' : 'Workflow'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isSending && (
              <div className="text-slate-900">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  <span className="text-sm text-slate-600">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        )}

        {/* Input Area - Animated - Fixed position so it doesn't disappear */}
        <div 
          ref={inputContainerRef}
          className={`${isCreating ? 'w-full' : 'w-full max-w-3xl'} px-4 flex justify-center mx-auto flex-shrink-0 ${isCreating ? 'relative' : 'fixed'} ${isCreating ? '' : 'left-1/2'} z-50 bg-white`}
          style={!isCreating ? {
            transition: hasStartedChat ? 'bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease-out, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
            bottom: hasStartedChat ? '8px' : 'calc(50vh - 350px)',
            transform: 'translate(-50%, 0)',
          } : {}}
        >
        <div className="relative w-full">
          {/* Subtle breathing glow effect */}
          <div 
            className={`absolute inset-0 rounded-full bg-slate-200/30 blur-xl transition-all duration-1000 ease-out ${
              isFocused 
                ? 'opacity-60 scale-105' 
                : 'opacity-40 scale-100 animate-pulse'
            }`}
            style={{
              animation: isFocused ? 'none' : 'breathing 4s ease-in-out infinite',
            }}
          />
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative"
          >
            <div
              className={`relative bg-white border rounded-full transition-all duration-300 ease-out ${
                isFocused
                  ? 'border-slate-400 shadow-lg shadow-slate-200/50 scale-[1.02]'
                  : 'border-slate-300 shadow-md shadow-slate-100/30'
              }`}
            >
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Message..."
                rows={1}
                className="w-full px-8 py-5 pr-16 text-base bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none resize-none overflow-hidden"
                style={{
                  minHeight: '64px',
                  maxHeight: '200px',
                  lineHeight: '1.5',
                }}
              />
              
              {/* Send button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isSending}
                className={`absolute right-3 bottom-3 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center transition-all duration-200 ${
                  inputValue.trim()
                    ? 'opacity-100 scale-100 hover:bg-slate-800 hover:scale-105 active:scale-95'
                    : 'opacity-0 scale-90 pointer-events-none'
                } ${
                  isSending ? 'animate-pulse' : ''
                }`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>

      {/* Right Side - Preview Panel - Animated */}
      {isCreating && (
        <div 
          className="w-1/2 h-full border-l border-slate-200 bg-slate-50 flex flex-col flex-shrink-0"
          style={{
            animation: 'slideInRight 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <div className="p-4 border-b border-slate-200 flex-shrink-0">
            <h3 className="text-sm font-medium text-slate-900">Live Preview: {creationType === 'workflow' ? 'Workflow' : 'Dashboard'}</h3>
            {creationProgress && <p className="text-xs text-slate-500 mt-1">{creationProgress}</p>}
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            {creationType === 'workflow' && (
              <div className="h-full w-full" style={{ animation: 'fadeIn 0.6s ease-out' }}>
                <WorkflowPreview
                  nodes={previewData.nodes || []}
                  edges={previewData.edges || []}
                  progress={creationProgress}
                />
              </div>
            )}
            {creationType === 'dashboard' && (
              <div className="h-full w-full" style={{ animation: 'fadeIn 0.6s ease-out' }}>
                <DashboardPreview
                  widgets={previewData.widgets || []}
                  progress={creationProgress}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes breathing {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.01);
          }
        }
        
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #0f172a 0%,
            #0f172a 40%,
            #ffffff 50%,
            #0f172a 60%,
            #0f172a 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 6s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AgentChatTab;
