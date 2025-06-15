import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Package, Truck, Sparkles, Heart, Ruler, Headphones, Bot, User } from 'lucide-react';
import { getChatResponse, getContextualSuggestions, ChatMessage } from '@/utils/groqClient';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Help = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey there, I'm bakwAIs—your Bakwas Clothing Co. style & support assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What's trending in streetwear?",
    "How to style oversized hoodies?",
    "Best care tips for prints?"
  ]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateSuggestions = async (chatHistory: ChatMessage[]) => {
    setIsLoadingSuggestions(true);
    try {
      const newSuggestions = await getContextualSuggestions(chatHistory);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error updating suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Check for escalation keywords
    if (inputValue.toLowerCase().includes('human') || inputValue.toLowerCase().includes('agent')) {
      const escalationMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isBot: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, escalationMessage]);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'll connect you with our human support team right away! You can also reach us directly at support@bakwasclothing.com or through our Contact page. Is there anything I can help with while you wait?",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setInputValue('');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Add to chat history for context
    const newChatHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user' as const, content: inputValue }
    ];
    setChatHistory(newChatHistory);
    
    setInputValue('');
    setIsLoading(true);

    try {
      // Get AI response from Groq
      const aiResponse = await getChatResponse(newChatHistory);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Update chat history with bot response
      const finalChatHistory: ChatMessage[] = [
        ...newChatHistory,
        { role: 'assistant' as const, content: aiResponse }
      ];
      setChatHistory(finalChatHistory);
      
      // Update suggestions based on new conversation context
      updateSuggestions(finalChatHistory);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment or contact our support team directly.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCommand = (command: string) => {
    setInputValue(command);
  };

  const quickCommands = [
    { icon: Package, text: "Check Orders", command: "Check my order status" },
    { icon: Truck, text: "Track Order", command: "Track my order" },
    { icon: Sparkles, text: "New Drops", command: "What are the latest drops?" },
    { icon: Heart, text: "Care Tips", command: "How do I care for my clothes?" },
    { icon: Ruler, text: "Size Guide", command: "Show me the size guide" },
    { icon: Headphones, text: "Contact Human", command: "I need to speak with a human agent" }
  ];

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images-videos-logo/colorful-background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="help-page flex flex-col h-screen">
        {/* Top Logo Section */}
        <div className="flex justify-center pt-4 pb-2">
          <img 
            src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
            alt="Bakwas Clothing Co." 
            className="h-20 w-auto mx-auto drop-shadow-lg"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex items-center justify-center gap-6 px-6" style={{ paddingTop: '0.5rem', paddingBottom: '1rem' }}>
          
          {/* Left Sidebar - bakwAIs Introduction */}
          <aside className="hidden lg:flex flex-col w-80 h-[80vh] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50 p-6 overflow-y-auto">
            {/* Intro Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">b</span>
              </div>
              <div>
                <h2 className="text-xl font-anton text-white">Meet bakwAIs</h2>
                <p className="text-sm text-gray-300 font-space">Your AI Style Assistant</p>
              </div>
            </div>

            {/* Introduction Content */}
            <div className="space-y-4 text-gray-300 font-space text-sm leading-relaxed">
              <div className="bg-gradient-to-r from-teal-500/10 to-purple-500/10 border border-teal-400/20 rounded-lg p-4">
                <h3 className="text-teal-400 font-semibold mb-2">🤖 What is bakwAIs?</h3>
                <p>bakwAIs is your personal AI-powered streetwear stylist and support assistant, designed specifically for the Bakwas Clothing Co. community.</p>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/20 rounded-lg p-4">
                <h3 className="text-purple-400 font-semibold mb-2">✨ What can I help with?</h3>
                <ul className="space-y-1 text-xs">
                  <li>• Style advice & outfit recommendations</li>
                  <li>• Latest streetwear trends & drops</li>
                  <li>• Order tracking & support</li>
                  <li>• Size guides & fit advice</li>
                  <li>• Care instructions for your gear</li>
                  <li>• General brand questions</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 border border-blue-400/20 rounded-lg p-4">
                <h3 className="text-blue-400 font-semibold mb-2">🎯 How to get started?</h3>
                <p>Just type your question or use the quick command buttons below the chat. I'm here 24/7 to help you level up your streetwear game!</p>
              </div>

              <div className="bg-gradient-to-r from-gray-700/20 to-gray-600/20 border border-gray-500/20 rounded-lg p-4">
                <h3 className="text-gray-400 font-semibold mb-2">🚀 Beta Features</h3>
                <p className="text-xs">This is a beta version. I'm constantly learning and improving. For complex issues, I can connect you with our human support team.</p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700/50">
                <p className="text-xs text-gray-500 text-center">
                  Powered by advanced AI • Built for streetwear culture
                </p>
              </div>
            </div>
          </aside>

          {/* bakwAIs Chat Window - Adjusted for sidebar layout */}
          <main className="chat-window bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-4xl lg:max-w-3xl h-[80vh] flex flex-col overflow-hidden">
            
            {/* Chat Header with Logo */}
            <div className="chat-header bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-md border-b border-gray-700/50 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                {/* Logo and Title */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gradient-to-r from-teal-400 to-purple-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">b</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg font-anton text-white">bakwAIs beta</h1>
                    <p className="text-xs text-gray-300 font-space">Your Streetwear Stylist & Support Hub</p>
                  </div>
                </div>
                
                {/* Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>
            </div>

            {/* Scrollable Messages Area - Compact */}
            <div className="flex-1 overflow-y-auto p-4 chat-scrollbar">
              <div className="messages space-y-4 mx-auto w-full max-w-3xl">
                {messages.map((message) => (
                  <div key={message.id} className={`message flex space-x-3 ${message.isBot ? 'items-start justify-start' : 'items-end justify-end'}`}>
                    {message.isBot && (
                      <div className="avatar shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 p-0.5">
                          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">b</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className={`bubble ${message.isBot ? 'bot-bubble-bakwais' : 'user-bubble-bakwais'}`}>
                      <p className="font-space text-sm leading-relaxed">{message.text}</p>
                    </div>

                    {!message.isBot && (
                      <div className="avatar shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-0.5">
                          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                            <User className="w-4 h-4 text-emerald-400" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="message flex items-start space-x-3 justify-start">
                    <div className="avatar shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 p-0.5">
                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                          <span className="text-white font-bold text-xs animate-pulse">b</span>
                        </div>
                      </div>
                    </div>
                    <div className="bubble bot-bubble-bakwais">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Commands - Compact */}
            <div className="px-4 pb-3">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {quickCommands.map((cmd, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickCommand(cmd.command)}
                    className="quick-cmd bg-gradient-to-r from-teal-500/20 to-purple-500/20 hover:from-teal-500/30 hover:to-purple-500/30 border border-gray-600/50 rounded-lg p-2 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <cmd.icon className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-300 font-space">{cmd.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Suggestions - Compact */}
            <div className="px-4 pb-2">
              <div key={suggestions.join('-')} className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${index}-${suggestion}`}
                    onClick={() => setInputValue(suggestion)}
                    disabled={isLoadingSuggestions}
                    className={`suggestion-pill bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 rounded-full px-3 py-1 text-xs text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-teal-500/20 hover:to-purple-500/20 hover:border-teal-400/50 hover:shadow-lg transition-all duration-300 ${isLoadingSuggestions ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {suggestion}
                  </button>
                ))}
                {isLoadingSuggestions && (
                  <div className="text-xs text-gray-400 mt-1 text-center w-full">
                    bakwAIs is thinking...
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input - Compact */}
            <div className="chat-input bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-md border-t border-gray-700/50 p-4 rounded-b-2xl">
              <form onSubmit={handleSubmit} className="flex items-center">
                <div className="flex-1 relative bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-full focus-within:border-teal-400 focus-within:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all duration-300">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask bakwAIs anything..."
                    className="w-full bg-transparent rounded-full py-3 px-4 pr-12 text-white placeholder-gray-400 focus:outline-none font-space text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-teal-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-lg"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>

      <style>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.6);
          border-radius: 4px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(75, 85, 99, 0.8);
        }

        /* bakwAIs speech bubble styling */
        .bubble {
          position: relative;
          max-width: 280px;
          padding: 12px 16px;
          border-radius: 16px;
          line-height: 1.5;
          word-wrap: break-word;
          font-size: 14px;
          font-weight: 500;
          margin: 4px 0;
        }

        /* Bot bubble - bakwAIs gradient */
        .bot-bubble-bakwais {
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95));
          color: #f3f4f6;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(20, 184, 166, 0.3);
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.1);
        }
        .bot-bubble-bakwais::before {
          content: '';
          position: absolute;
          top: 12px;
          left: -8px;
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-right: 8px solid rgba(31, 41, 55, 0.95);
        }

        /* User bubble - teal to purple gradient */
        .user-bubble-bakwais {
          background: linear-gradient(135deg, #14b8a6, #8b5cf6);
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
        }
        .user-bubble-bakwais::before {
          content: '';
          position: absolute;
          top: 12px;
          right: -8px;
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-left: 8px solid #14b8a6;
        }

        /* Quick command hover effects */
        .quick-cmd:hover {
          transform: translateY(-2px);
        }

        /* Suggestion pills hover */
        .suggestion-pill:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default Help;
