import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Clock, Calendar, Plus, Trash2, 
  Save, Camera, Target, ChevronDown, Map, Car, Train, Bus, 
  Footprints, Plane, Ship, Info, ExternalLink, Link2, ShoppingBag, PieChart, Heart
} from 'lucide-react';

// 初始化 Supabase 
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('行程');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // 時間連動運算邏輯
  const calculateEndTime = (start: string, duration: string) => {
    if (!start || !duration) return "";
    try {
      const [sH, sM] = start.split(':').map(Number);
      const [dH, dM] = duration.split(':').map(Number);
      let totalM = sM + dM;
      let totalH = sH + dH + Math.floor(totalM / 60);
      return `${String(totalH % 24).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
    } catch { return ""; }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#FFF9E3] flex items-center justify-center">
        {/* 使用妳指定的 splash.jpeg */}
        <img src="/splash.jpeg" className="w-full h-full object-cover" alt="Splash" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9E3] font-maru text-[#8D775F] pb-32">
      {/* Header */}
      <header className="bg-white p-6 rounded-b-[40px] shadow-sm text-center border-b border-[#FFD1DC]/30">
        <h1 className="text-2xl font-bold text-[#FFD1DC]">🌸 Our Travel Diary</h1>
        <p className="text-[10px] mt-1 opacity-50 tracking-[0.2em]">TIFFANY & BENJAMIN</p>
      </header>

      {/* 常駐置頂 Tabs */}
      <div className="sticky top-0 z-40 bg-[#FFF9E3]/90 backdrop-blur-md px-2 py-3 flex justify-around border-b border-[#FFD1DC]/20">
        {['行程', '導航', '憑證', '清單', '記帳'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${activeTab === tab ? 'bg-[#FFD1DC] text-white shadow-md scale-105' : 'opacity-40'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="p-4 max-w-md mx-auto space-y-4">
        {activeTab === '行程' && (
          <>
            {schedules.map((item) => (
              <ScheduleCard 
                key={item.id} 
                item={item} 
                isEditing={editingId === item.id}
                onToggle={() => setEditingId(editingId === item.id ? null : item.id)}
                onUpdate={(data: any) => {
                  setSchedules(schedules.map(s => s.id === item.id ? { ...s, ...data } : s));
                }}
                calculateEndTime={calculateEndTime}
              />
            ))}
            {/* 待編入行程區 (浮動感) */}
            <div className="mt-10 pt-10 border-t-2 border-dashed border-[#FFD1DC]/30">
               <p className="text-center text-xs opacity-40 mb-4 italic">--- 待編入行程區 ---</p>
            </div>
          </>
        )}
      </main>

      {/* 右下角新增按鈕 */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3">
        <button 
          onClick={() => {
            const newItem = { id: Date.now().toString(), type: 'spot', title: '', date: '2026/01/01', startTime: '09:00', duration: '01:00', endTime: '10:00', segments: [] };
            setSchedules([newItem, ...schedules]);
            setEditingId(newItem.id);
          }}
          className="w-14 h-14 bg-[#FFD1DC] text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-all z-50"
        >
          <Plus size={30} />
        </button>
      </div>

      {/* Safety Render 區 */}
      <footer className="text-center py-10 opacity-30 text-[10px]">🌸 Tiffany & Benjamin 🌸</footer>

      {/* 置底導航欄 (像原生 App) */}
      <nav className="fixed bottom-0 w-full bg-white h-20 border-t border-gray-100 flex items-center justify-around px-6 z-40">
        <Navigation size={24} className="opacity-20" />
        <Calendar size={24} className="text-[#FFD1DC]" />
        <ShoppingBag size={24} className="opacity-20" />
        <PieChart size={24} className="opacity-20" />
        <Heart size={24} className="opacity-20" />
      </nav>
    </div>
  );
}

// --- 行程卡片組件 (含向下展開邏輯) ---
function ScheduleCard({ item, isEditing, onToggle, onUpdate, calculateEndTime }: any) {
  const isTransport = item.type === 'transport';

  return (
    <div className={`bg-white rounded-[30px] shadow-sm border transition-all ${isEditing ? 'border-[#FFD1DC]' : 'border-transparent'}`}>
      {/* 點擊展開的預覽頭部 */}
      <div className="p-5 cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#FFD1DC]" />
            <span className="text-xs font-bold">{item.startTime} - {item.endTime}</span>
          </div>
          <ChevronDown className={`transition-transform duration-300 ${isEditing ? 'rotate-180' : ''}`} size={18} />
        </div>
        <h3 className="text-lg font-bold">{item.title || (isTransport ? `${item.startLoc} ➜ ${item.endLoc}` : "新行程")}</h3>
      </div>

      {/* 向下展開的編輯區 */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-50"
          >
            <div className="p-6 bg-[#FFF9E3]/20 space-y-4">
              {/* 類型切換 */}
              <div className="flex bg-white rounded-xl p-1 shadow-inner">
                <button onClick={() => onUpdate({type: 'spot'})} className={`flex-1 py-2 text-xs rounded-lg ${!isTransport ? 'bg-[#FFD1DC] text-white' : ''}`}>景點/活動</button>
                <button onClick={() => onUpdate({type: 'transport'})} className={`flex-1 py-2 text-xs rounded-lg ${isTransport ? 'bg-blue-400 text-white' : ''}`}>交通</button>
              </div>

              {item.type === 'spot' ? (
                <div className="grid grid-cols-1 gap-3">
                  <input placeholder="行程名稱*" className="input-f" value={item.title} onChange={e => onUpdate({title: e.target.value})} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="input-f" value={item.date} onChange={e => onUpdate({date: e.target.value})} />
                    <input type="time" className="input-f" value={item.startTime} onChange={e => {
                      const endTime = calculateEndTime(e.target.value, item.duration);
                      onUpdate({startTime: e.target.value, endTime});
                    }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="時長 (hh:mm)" className="input-f" value={item.duration} onChange={e => {
                      const endTime = calculateEndTime(item.startTime, e.target.value);
                      onUpdate({duration: e.target.value, endTime});
                    }} />
                    <input placeholder="完結時間" className="input-f bg-gray-50" value={item.endTime} readOnly />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="地點" className="input-f" />
                    <input placeholder="區域/商圈" className="input-f" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select className="input-f"><option>吃喝</option><option>購物</option><option>精品</option><option>拍照錄影</option></select>
                    <input placeholder="照片編號" className="input-f" />
                  </div>
                  <input placeholder="Google Map URL" className="input-f" />
                </div>
              ) : (
                /* 交通卡片 - 多段描述 */
                <div className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <input placeholder="起始地" className="input-f flex-1" value={item.startLoc} />
                    <span>➜</span>
                    <input placeholder="終點地" className="input-f flex-1" value={item.endLoc} />
                  </div>
                  <div className="space-y-3 pl-2 border-l-2 border-blue-200">
                    <p className="text-[10px] font-bold text-blue-400">分段轉乘路徑：</p>
                    {item.segments?.map((s: any, idx: number) => (
                       <div key={idx} className="bg-white p-3 rounded-2xl shadow-sm space-y-2">
                          <select className="input-f text-xs"><option>地鐵</option><option>步行</option><option>巴士</option></select>
                          <input placeholder="路線名稱 (往 XX 方向)" className="input-f text-xs" />
                          <div className="flex gap-2">
                            <input placeholder="上車站" className="input-f text-xs" />
                            <input placeholder="下車站" className="input-f text-xs" />
                          </div>
                       </div>
                    ))}
                    <button className="w-full py-2 border-2 border-dashed border-blue-100 rounded-2xl text-blue-300 text-[10px]">+ 增加一段轉乘</button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button className="flex-1 bg-[#8D775F] text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2"><Save size={18}/> 儲存卡片</button>
                <button className="w-14 bg-red-50 text-red-400 rounded-full flex items-center justify-center border border-red-100"><Trash2 size={18}/></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
