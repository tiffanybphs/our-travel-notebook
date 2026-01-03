import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Clock, Calendar, Plus, Trash2, 
  ChevronDown, Save, Camera, Target, Footprints, Train, 
  Bus, Car, Share2, Download 
} from 'lucide-react';

// --- 1. 初始化 Supabase (環境變數) ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function TravelPlanner() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');
  const [showEditor, setShowEditor] = useState<'spot' | 'transport' | null>(null);
  const [scheduleList, setScheduleList] = useState<any[]>([]);

  // 2. 啟動畫面邏輯 (2.5秒後進入主程式)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // 3. 渲染啟動畫面
  if (loading) {
    return (
      <motion.div className="fixed inset-0 z-[9999] bg-[#FFF9E3] flex items-center justify-center">
        <motion.img 
          src="/splash.png" 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="w-full h-full object-cover" 
        />
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9E3] font-maru text-[#8D775F] pb-32">
      {/* Header */}
      <header className="bg-white p-6 rounded-b-[30px] shadow-sm text-center border-b border-[#FFD1DC]/30">
        <h1 className="text-2xl font-bold text-[#FFD1DC]">🌸 旅遊手帳 🌸</h1>
        <p className="text-[10px] mt-1 opacity-50">Tiffany & Benjamin 專屬</p>
      </header>

      {/* 主內容區 */}
      <main className="p-4 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold italic">我們的行程</h2>
          <div className="flex gap-2">
            <button className="p-2 bg-white rounded-full shadow-sm text-[#FFD1DC]"><Share2 size={18}/></button>
            <button className="p-2 bg-white rounded-full shadow-sm text-[#FFD1DC]"><Download size={18}/></button>
          </div>
        </div>

        {/* 行程列表卡片展示 */}
        <div className="space-y-4">
          {scheduleList.length === 0 ? (
            <div className="text-center py-20 opacity-30 italic text-sm">
              還沒有行程呢，點擊下方新增吧 🌸
            </div>
          ) : (
            scheduleList.map((item, idx) => (
              <ScheduleCard key={idx} data={item} />
            ))
          )}
        </div>
      </main>

      {/* 底部功能列 */}
      <div className="fixed bottom-8 left-0 w-full flex justify-center gap-4 px-10 z-50">
        <button 
          onClick={() => setShowEditor('spot')}
          className="flex-1 bg-white border-2 border-[#FFD1DC] text-[#FFD1DC] h-14 rounded-full shadow-lg flex items-center justify-center gap-2 font-bold active:scale-95 transition-all"
        >
          <MapPin size={20} /> 景點
        </button>
        <button 
          onClick={() => setShowEditor('transport')}
          className="flex-1 bg-[#FFD1DC] text-white h-14 rounded-full shadow-lg flex items-center justify-center gap-2 font-bold active:scale-95 transition-all"
        >
          <Navigation size={20} /> 交通
        </button>
      </div>

      {/* 編輯器抽屜 */}
      <AnimatePresence>
        {showEditor && (
          <EditorDrawer 
            type={showEditor} 
            onClose={() => setShowEditor(null)} 
            onSave={(data) => {
              setScheduleList([...scheduleList, data]);
              setShowEditor(null);
            }} 
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-2 w-full text-center text-[10px] opacity-20 pointer-events-none">
        🌸 Tiffany & Benjamin 🌸
      </div>
    </div>
  );
}

// --- 子組件：行程卡片渲染 ---
function ScheduleCard({ data }: { data: any }) {
  const isTransport = data.category === '交通';
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      className={`p-5 rounded-[25px] shadow-sm border ${isTransport ? 'bg-[#E0F2FE] border-[#bae6fd]' : 'bg-white border-[#FFD1DC]/20'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5">
          {data.date} | {data.startTime} - {data.endTime}
        </span>
        <span className="text-[10px] opacity-40 italic">{data.duration}</span>
      </div>
      <h3 className="font-bold text-lg mb-2">{data.title}</h3>
      
      {isTransport ? (
        <div className="text-xs space-y-1 opacity-70">
          <p>📍 {data.startLocation} ➜ {data.endLocation}</p>
          <p>🚌 工具：{data.transportMode}</p>
          {data.segments?.length > 0 && <p className="text-[10px] mt-2 text-blue-500 font-bold">已包含 {data.segments.length} 段轉乘</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-[10px] opacity-70">
          <p>📍 {data.location} ({data.area})</p>
          <p>🎯 目標：{data.goal}</p>
          <p>📷 照片編號：{data.photoRef}</p>
          <p>🕒 營業：{data.openingHours}</p>
        </div>
      )}
    </motion.div>
  );
}

// --- 子組件：萬能編輯器抽屜 ---
function EditorDrawer({ type, onClose, onSave }: { type: 'spot' | 'transport', onClose: () => void, onSave: (data: any) => void }) {
  const [form, setForm] = useState<any>({
    title: '', date: '2026/01/01', startTime: '09:00', duration: '01:00', endTime: '10:00',
    location: '', category: type === 'spot' ? '景點活動' : '交通',
    area: '', photoRef: '', goal: '', note: '', openingHours: '', mapUrl: '',
    transportMode: '地鐵', startLocation: '', endLocation: '', segments: []
  });

  // 時間連動計算 (24小時制)
  useEffect(() => {
    const [h, m] = form.startTime.split(':').map(Number);
    const [dh, dm] = form.duration.split(':').map(Number);
    let eh = h + dh; let em = m + dm;
    if (em >= 60) { eh += 1; em -= 60; }
    setForm(f => ({ ...f, endTime: `${String(eh % 24).padStart(2, '0')}:${String(em).padStart(2, '0')}` }));
  }, [form.startTime, form.duration]);

  return (
    <motion.div 
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      className="fixed inset-0 z-[100] bg-white rounded-t-[40px] shadow-2xl p-8 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{type === 'spot' ? '新增景點行程' : '新增交通行程'}</h2>
        <button onClick={onClose} className="text-2xl">✕</button>
      </div>

      <div className="space-y-4 pb-20">
        {/* 通用欄位 */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold opacity-40">行程名稱</label>
          <input className="w-full border-b-2 border-[#FFD1DC] p-1 outline-none text-lg font-bold" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold opacity-40">日期 (yyyy/mm/dd)</label>
            <input className="w-full bg-[#FFF9E3] p-2 rounded-xl text-sm" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-bold opacity-40">時間 (24h)</label>
            <input type="time" className="w-full bg-[#FFF9E3] p-2 rounded-xl text-sm" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold opacity-40">時長 (hh:mm)</label>
            <input className="w-full bg-[#FFF9E3] p-2 rounded-xl text-sm" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />
          </div>
          <div className="flex flex-col justify-end">
            <span className="text-[10px] font-bold text-[#FFD1DC]">完結時間：{form.endTime}</span>
          </div>
        </div>

        {/* 景點專屬欄位 */}
        {type === 'spot' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="地點" className="bg-[#FFF9E3] p-2 rounded-xl text-sm" onChange={e => setForm({...form, location: e.target.value})} />
              <input placeholder="區域/商圈" className="bg-[#FFF9E3] p-2 rounded-xl text-sm" onChange={e => setForm({...form, area: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="照片參考編號" className="bg-[#FFF9E3] p-2 rounded-xl text-sm" onChange={e => setForm({...form, photoRef: e.target.value})} />
              <input placeholder="目標" className="bg-[#FFF9E3] p-2 rounded-xl text-sm" onChange={e => setForm({...form, goal: e.target.value})} />
            </div>
            <input placeholder="營業時間" className="w-full bg-[#FFF9E3] p-2 rounded-xl text-sm" onChange={e => setForm({...form, openingHours: e.target.value})} />
            <input placeholder="Google Map 網址" className="w-full bg-[#FFF9E3] p-2 rounded-xl text-xs" onChange={e => setForm({...form, mapUrl: e.target.value})} />
          </>
        )}

        {/* 交通專屬欄位 (含多段轉乘提示) */}
        {type === 'transport' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="起始出發地" className="bg-[#E0F2FE] p-2 rounded-xl text-sm border border-[#bae6fd]" onChange={e => setForm({...form, startLocation: e.target.value})} />
              <input placeholder="最終目的地" className="bg-[#E0F2FE] p-2 rounded-xl text-sm border border-[#bae6fd]" onChange={e => setForm({...form, endLocation: e.target.value})} />
            </div>
            <select className="w-full bg-[#E0F2FE] p-2 rounded-xl text-sm" onChange={e => setForm({...form, transportMode: e.target.value})}>
              <option>地鐵</option><option>JR</option><option>巴士</option><option>步行</option><option>的士</option>
            </select>
            <div className="p-4 border-2 border-dashed border-blue-200 rounded-2xl text-center text-[10px] text-blue-400">
              提示：此交通卡支援多段轉乘儲存 🌸
            </div>
          </>
        )}

        <textarea placeholder="備註..." className="w-full bg-[#FFF9E3] p-4 rounded-2xl text-sm h-24" onChange={e => setForm({...form, note: e.target.value})} />

        <button 
          onClick={() => onSave(form)}
          className="w-full bg-[#8D775F] text-white py-4 rounded-full font-bold shadow-xl active:scale-95"
        >
          儲存此行程 🌸
        </button>
      </div>
    </motion.div>
  );
}
