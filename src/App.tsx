import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Clock, Calendar, Plus, Trash2, 
  Save, Camera, Target, ChevronDown, Map, Car, Train, Bus, 
  Footprints, Plane, Ship, ShoppingBag, PieChart, Heart, Ticket, CheckSquare, ChevronRight
} from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('行程');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // --- <1> 新增行程邏輯：基於上一項完結時間 ---
  const handleAddNewItem = () => {
    const id = Date.now().toString();
    let nextStartTime = "09:00";
    let nextDate = "2026/01/01";

    if (schedules.length > 0) {
      const lastItem = schedules[0]; // 假設最新的在最上
      const lastEndTimeFull = lastItem.endTime; // "2026/01/01 10:30"
      if (lastEndTimeFull.includes(' ')) {
        const parts = lastEndTimeFull.split(' ');
        nextDate = parts[0];
        nextStartTime = parts[1];
      }
    }

    const newItem = {
      id,
      type: 'spot',
      title: '',
      date: nextDate,
      startTime: nextStartTime,
      duration: '01:00',
      endTime: calculateEndTime(nextDate, nextStartTime, '01:00'),
      category: '吃喝',
      segments: []
    };
    
    setSchedules([newItem, ...schedules]);
    setEditingId(id);
  };

  function calculateEndTime(dateStr: string, startTime: string, duration: string) {
    if (!startTime || !duration) return "";
    const [h, m] = startTime.split(':').map(Number);
    const [dH, dM] = duration.split(':').map(Number);
    let totalM = m + dM;
    let totalH = h + dH + Math.floor(totalM / 60);
    const finalH = totalH % 24;
    const finalM = totalM % 60;
    return `${dateStr} ${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
  }

  return (
    <div className="min-h-screen bg-[#FFF9E3] font-maru text-[#8D775F] pb-32">
      {/* Header */}
      <header className="bg-white p-6 rounded-b-[40px] shadow-sm text-center">
        <h1 className="text-2xl font-bold text-[#FFD1DC]">🌸 Our Travel Diary</h1>
      </header>

      {/* 置頂 Tabs */}
      <div className="sticky top-0 z-40 bg-[#FFF9E3]/90 backdrop-blur-md px-2 py-3 flex justify-around">
        {['行程', '憑證', '清單', '記帳'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 text-xs font-bold rounded-full transition-all ${activeTab === tab ? 'bg-[#FFD1DC] text-white' : 'opacity-40'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="p-4 max-w-md mx-auto space-y-4">
        {/* --- <3> 各分頁實體化 --- */}
        {activeTab === '行程' && schedules.map(item => (
          <ScheduleCard 
            key={item.id} 
            item={item} 
            isEditing={editingId === item.id}
            onToggle={() => setEditingId(editingId === item.id ? null : item.id)}
            onUpdate={(updates: any) => {
              const updatedItem = { ...item, ...updates };
              if (updates.startTime || updates.duration) {
                updatedItem.endTime = calculateEndTime(updatedItem.date, updatedItem.startTime, updatedItem.duration);
              }
              setSchedules(schedules.map(s => s.id === item.id ? updatedItem : s));
            }}
          />
        ))}

        {activeTab === '憑證' && <TicketTab />}
        {activeTab === '清單' && <ListTab />}
        {activeTab === '記帳' && <BudgetTab />}
      </main>

      <button onClick={handleAddNewItem} className="fixed bottom-28 right-6 w-14 h-14 bg-[#FFD1DC] text-white rounded-full shadow-2xl flex items-center justify-center z-50 border-4 border-white">
        <Plus size={32} />
      </button>
    </div>
  );
}

// --- <2> 修正後的卡片元件 (解決溢出與辨識度) ---
function ScheduleCard({ item, isEditing, onToggle, onUpdate }: any) {
  return (
    <div className={`bg-white rounded-[35px] shadow-sm border-2 overflow-hidden transition-all ${isEditing ? 'border-[#FFD1DC]' : 'border-transparent'}`}>
      <div className="p-6 cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFD1DC]/20 px-3 py-1 rounded-full text-[#FFD1DC] text-[10px] font-bold">{item.startTime}</div>
            <h3 className="text-lg font-bold">{item.title || "未命名行程"}</h3>
          </div>
          <ChevronDown size={20} className={isEditing ? 'rotate-180' : ''} />
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
            <div className="p-6 pt-0 space-y-4">
              <input placeholder="行程名稱*" className="w-full bg-[#FFF9E3]/50 p-4 rounded-2xl outline-none" value={item.title} onChange={e => onUpdate({title: e.target.value})} />
              
              {/* 改進後的時長區：垂直排列避免溢出 */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-white border border-[#FFD1DC]/30 p-3 rounded-2xl">
                  <div className="flex-1">
                    <label className="text-[10px] block opacity-40 mb-1 font-bold">預計時長 (HH:mm)</label>
                    <input type="text" className="w-full font-bold text-[#8D775F] outline-none" value={item.duration} onChange={e => onUpdate({duration: e.target.value})} />
                  </div>
                  <div className="w-[2px] h-8 bg-[#FFD1DC]/20"></div>
                  <div className="flex-1">
                    <label className="text-[10px] block text-[#FFD1DC] mb-1 font-bold">🏁 完結時間</label>
                    <div className="font-bold text-[#FFD1DC]">{item.endTime.split(' ')[1]}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#FFF9E3]/50 p-3 rounded-2xl text-xs"><label className="block opacity-40 mb-1">日期</label><input type="date" value={item.date} className="bg-transparent" onChange={e => onUpdate({date: e.target.value})}/></div>
                <div className="bg-[#FFF9E3]/50 p-3 rounded-2xl text-xs"><label className="block opacity-40 mb-1">開始</label><input type="time" value={item.startTime} className="bg-transparent" onChange={e => onUpdate({startTime: e.target.value})}/></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- <3> 其他功能分頁元件 ---

function TicketTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-[35px] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500"><Ticket /></div>
          <div><h4 className="font-bold text-sm">機票訂位憑證</h4><p className="text-[10px] opacity-40">BR192 / TPE ➔ NRT</p></div>
        </div>
        <ChevronRight size={18} />
      </div>
      <button className="w-full py-4 border-2 border-dashed border-[#FFD1DC] rounded-[30px] text-[#FFD1DC] font-bold text-xs">+ 上傳 PDF/截圖</button>
    </div>
  );
}

function ListTab() {
  return (
    <div className="bg-white rounded-[35px] p-6 shadow-sm">
      <h4 className="font-bold mb-4 flex items-center gap-2"><CheckSquare size={18} /> 準備清單</h4>
      {['護照','行動電源','日圓現金','保養品樣品'].map((i, idx) => (
        <div key={idx} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
          <div className="w-5 h-5 border-2 border-[#FFD1DC] rounded-md"></div>
          <span className="text-sm">{i}</span>
        </div>
      ))}
    </div>
  );
}

function BudgetTab() {
  return (
    <div className="bg-white rounded-[35px] p-6 shadow-sm">
      <div className="text-center mb-6">
        <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Total Spent</p>
        <h2 className="text-3xl font-bold text-[#FFD1DC]">¥ 124,500</h2>
      </div>
      <div className="space-y-3">
        {[{t:'敘敘苑燒肉', a:'¥ 12,000', c:'美食'}, {t:'Uniqlo Ginza', a:'¥ 8,500', c:'購物'}].map((b, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="opacity-70">{b.t}</span>
            <span className="font-bold">{b.a}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
