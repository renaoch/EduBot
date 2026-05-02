import { useState, useEffect, type FormEvent } from 'react';
import { Search, Plus, Book, Tag, ExternalLink, QrCode as QrIcon, CheckCircle, Wifi, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Resource {
  id: string;
  title: string;
  type: string;
  url?: string;
  content?: string;
  subjects: { name: string };
  topics: { name: string };
  tags: string[];
  created_at: string;
}

interface BotStatus {
  status: 'INITIALIZING' | 'READY' | 'AUTHENTICATED' | 'DISCONNECTED';
  qrCode: string | null;
}

export default function App() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchResources = async (query = '') => {
    try {
      const url = query 
        ? `/api/resources/search?q=${encodeURIComponent(query)}`
        : '/api/resources/search?q=';
      const res = await fetch(url);
      const data = await res.json();
      setResources(data);
    } catch (err) {
      console.error('Failed to fetch resources', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/bot/status');
      const data = await res.json();
      setBotStatus(data);
    } catch (err) {
      console.error('Failed to fetch bot status', err);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchResources(searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif italic text-4xl leading-none">EduBot</h1>
          <p className="text-xs uppercase tracking-widest opacity-60 mt-1">Knowledge Management Bot</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#141414] rounded-full text-[10px] font-mono uppercase tracking-tighter">
            <span className={`w-2 h-2 rounded-full ${botStatus?.status === 'READY' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-orange-500'}`}></span>
            Bot: {botStatus?.status || 'UNKNOWN'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Main Content: Resource List */}
        <div className="space-y-6">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              placeholder="SEARCH RESOURCES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#141414] p-4 font-mono text-sm uppercase tracking-tight focus:outline-none focus:ring-0 focus:bg-[#141414] focus:text-white transition-all duration-300"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform">
              <Search size={20} />
            </button>
          </form>

          <div className="bg-white border border-[#141414] overflow-hidden">
            <div className="grid grid-cols-[40px_1.5fr_1fr_1fr] p-3 border-b border-[#141414] bg-[#F5F5F0] font-serif italic text-[11px] uppercase opacity-50 tracking-widest leading-none">
              <span>#</span>
              <span>Title</span>
              <span>Context</span>
              <span>Link</span>
            </div>

            <div className="divide-y divide-[#141414]">
              <AnimatePresence mode="popLayout">
                {resources.length > 0 ? (
                  resources.map((res, i) => (
                    <motion.article
                      key={res.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="grid grid-cols-[40px_1.5fr_1fr_1fr] p-4 items-center hover:bg-[#141414] hover:text-[#E4E3E0] cursor-pointer group transition-colors duration-200"
                    >
                      <span className="font-mono text-xs opacity-50">{(i + 1).toString().padStart(2, '0')}</span>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-medium text-sm leading-tight">{res.title}</h3>
                        <div className="flex flex-wrap gap-1">
                          {res.tags.map(tag => (
                            <span key={tag} className="text-[9px] border border-current px-1 py-0.5 rounded-sm opacity-60">#{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col text-[11px] font-mono tracking-tighter opacity-70">
                        <span>{res.subjects?.name}</span>
                        <span>{res.topics?.name}</span>
                      </div>
                      <div className="flex justify-end pr-4">
                        {res.url ? (
                          <a href={res.url} target="_blank" rel="noreferrer" className="opacity-40 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={16} />
                          </a>
                        ) : (
                          <span className="text-[9px] font-mono opacity-30 uppercase">Note</span>
                        )}
                      </div>
                    </motion.article>
                  ))
                ) : (
                  <div className="p-12 text-center font-mono text-sm opacity-40 uppercase tracking-widest italic">
                    {loading ? 'Initializing Database Reference...' : 'No Resources Archived Yet'}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar: WhatsApp Authentication */}
        <aside className="space-y-6">
          <div className="bg-[#151619] text-white rounded-xl p-6 border border-[#141414] shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">Auth Gateway</h2>
              <QrIcon size={16} className="opacity-40" />
            </div>

            {botStatus?.status === 'READY' ? (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 mb-2">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-medium tracking-tight">Active Connection</h3>
                <p className="text-xs text-[#8E9299] leading-relaxed">
                  The bot is currently linked to WhatsApp and monitoring for commands.
                </p>
                <div className="pt-4 flex flex-col gap-2">
                   <div className="bg-[#24262b] p-3 rounded-lg text-left">
                      <p className="text-[10px] text-green-500 uppercase font-bold mb-1 tracking-wider">Example Command</p>
                      <code className="text-[11px] block font-mono text-[#D1D1D1]">
                        add<br/>
                        Subject: Physics<br/>
                        Topic: Entropy<br/>
                        Title: Second Law
                      </code>
                   </div>
                </div>
              </div>
            ) : botStatus?.qrCode ? (
              <div className="flex flex-col items-center gap-6">
                <div className="bg-white p-3 rounded-lg border-4 border-[#24262b]">
                  <img src={botStatus.qrCode} alt="WhatsApp QR Code" className="w-48 h-48" />
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-sm font-medium animate-pulse">Waiting for scan...</p>
                  <p className="text-[10px] text-[#8E9299] uppercase tracking-widest">Open WhatsApp &gt; Settings &gt; Linked Devices</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <RefreshCw className="animate-spin text-blue-500" size={32} />
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">Booting Bot Service...</p>
              </div>
            )}

            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest opacity-40">System</p>
                  <p className="font-mono text-xs">Node v20.x</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest opacity-40">Protocol</p>
                  <p className="font-mono text-xs">WWebJS v1.26</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#141414] p-6 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Tag size={16} />
                <h2 className="font-serif italic text-lg leading-none">User Guide</h2>
             </div>
             <div className="space-y-3 text-xs leading-relaxed opacity-80">
                <p>Send messages directly to the linked WhatsApp number to interact.</p>
                <ul className="list-disc pl-4 space-y-2">
                  <li><strong>add</strong>: Use structured format to save links or notes.</li>
                  <li><strong>search [query]</strong>: Find resources by title or tags.</li>
                  <li><strong>subject [name]</strong>: List all resources in a subject.</li>
                  <li><strong>topic [name]</strong>: List all resources in a topic.</li>
                  <li><strong>Media</strong>: Send a PDF or Image to get a reference URL.</li>
                </ul>
             </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#141414] mt-12 p-8 text-center bg-white/50">
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-40">
          Build for personal knowledge management &copy; 2026
        </p>
      </footer>
    </div>
  );
}
