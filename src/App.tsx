import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Clock, Calendar, Plus, Trash2, 
  Save, Camera, Target, Info, ChevronDown, Map, Car, Train, Bus, Footprints
} from 'lucide-react';

// 初始化 Supabase (Vercel 環境變數)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState<'spot' | 'transport' | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    // 啟動畫面停留 2.5 秒
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <motion.div className="fixed inset-0 z-[9999] bg-[#FFF9E3] flex items-center justify-center">
        <motion.img 
          src="/splash.jpeg" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="w-full h-full object-cover" 
        />
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9E3] font-maru text-[#8D775F] pb-32">
      <header className="bg-white p-6 rounded-b-[30px] shadow-sm text-center border-b border-[#FFD1DC]/30">
        <h1 className="text-2xl font-bold text-[#FFD1DC]">🌸 Our Travel Diary 🌸</h1>
        <p className="text-[10px] mt-1 opacity-50 tracking-widest">TIFFANY & BENJAMIN</p>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-4">
        {schedules.length === 0 && (
          <div className="text-center py-20 opacity-30 italic">點擊下方按鈕開始記錄旅程...</div>
        )}
        
        {schedules.map((item, idx) => (
          <ScheduleCard key={idx} item={item} />
        ))}
      </main>

      {/* 底部導覽按鈕 */}
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

      <AnimatePresence>
        {showEditor && (
          <EditorDrawer 
            type={showEditor} 
            onClose={() => setShowEditor(null)} 
            onSave={(data) => setSchedules([data, ...schedules])} 
          />
        )}
      </AnPresence>
    </div>
  );
}

// --- 行程卡片組件 ---
function ScheduleCard({ item }: { item: any }) {
  const isTransport = item.category === '交通';
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-[25px] shadow-sm border ${isTransport ? 'bg-[#E0F2FE] border-[#bae6fd]' : 'bg-white border-[#FFD1DC]/20'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold opacity-60">{item.date}</span>
          <span className="text-xs font-bold text-[#FFD1DC]">{item.startTime} - {item.endTime}</span>
        </div>
        <span className="text-[10px] opacity-40 italic">{item.duration}</span>
      </div>
      
      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
      
      {isTransport ? (
        <div className="space-y-2 text-xs opacity-80">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white rounded-md">🚩 {item.startLocation}</div>
            <span>➜</span>
            <div className="p-1 bg-white rounded-md">🏁 {item.endLocation}</div>
          </div>
          {item.segments?.length > 0 && (
            <div className="bg-white/40 p-2 rounded-lg space-y-1">
              {item.segments.map((seg: any, i: number) => (
                <div key={i} className="flex gap-2 items-center text-[10px]">
                  <span className="bg-blue-500 text-white px-1 rounded">{seg.mode}</span>
                  <span>{seg.from} ➜ {seg.to}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-2 text-[10px] opacity-70 border-t border-[#FFD1DC]/10 pt-2 mt-2">
          <p className="flex items-center gap-1"><MapPin size={10}/> {item.location} ({item.area})</p>
          <p className="flex items-center gap-1"><Target size={10}/> {item.goal}</p>
          <p className="flex items-center gap-1"><Camera size={10}/> {item.photoRef}</p>
          <p className="flex items-center gap-1"><Clock size={10}/> {item.openingHours}</p>
          {item.mapUrl && <a href={item.mapUrl} className="col-span-2 text-blue-400 underline">查看 Google Map</a>}
        </div>
      )}
    </motion.div>
  );
}

// --- 萬能編輯器 ---
function EditorDrawer({ type, onClose, onSave }: any) {
  const [form, setForm] = useState<any>({
    title: '', date: '2026/01/01', startTime: '09:00', duration: '01:00', endTime: '10:00',
    location: '', category: type === 'spot' ? '景點活動' : '交通',
    area: '', photoRef: '', goal: '', note: '', openingHours: '', mapUrl: '',
    startLocation: '', endLocation: '', transportMode: '地鐵', segments: []
  });

  useEffect(() => {
    const [h, m] = form.startTime.split(':').map(Number);
    const [dh, dm] = form.duration.split(':').map(Number);
    let eh = h + dh; let em = m + dm;
    if (em >= 60) { eh += Math.floor(em/60); em %= 60; }
    setForm((f:any) => ({ ...f, endTime: `${String(eh % 24).padStart(2, '0')}:${String(em).padStart(2, '0')}` }));
  }, [form.startTime, form.duration]);

  const addSegment = () => {
    setForm({...form, segments: [...form.segments, { mode: '地鐵', from: '', to: '' }]});
  };

  return (
    <motion.div 
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      className="fixed inset-0 z-[100] bg-white rounded-t-[40px] shadow-2xl p-8 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{type === 'spot' ? '🌸 新增景點' : '🚌 新增交通'}</h2>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">✕</button>
      </div>

      <div className="space-y-5 pb-20">
        <div className="border-b-2 border-[#FFD1DC] pb-1">
          <label className="text-[10px] font-bold opacity-40">行程名稱</label>
          <input className="w-full bg-transparent outline-none text-lg font-bold" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#FFF9E3] p-3 rounded-2xl">
            <label className="text-[10px] font-bold opacity-40 block">日期 (yyyy/mm/dd)</label>
            <input className="bg-transparent w-full text-sm outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="bg-[#FFF9E3] p-3 rounded-2xl">
            <label className="text-[10px] font-bold opacity-40 block">時間 (24h)</label>
            <input type="time" className="bg-transparent w-full text-sm outline-none" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#FFF9E3] p-3 rounded-2xl">
            <label className="text-[10px] font-bold opacity-40 block">時長 (hh:mm)</label>
            <input className="bg-transparent w-full text-sm outline-none" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />
          </div>
          <div className="flex items-center text-xs font-bold text-[#FFD1DC]">
            預計完結：{form.endTime}
          </div>
        </div>

        {type === 'spot' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="地點" className="bg-[#FFF9E3] p-3 rounded-2xl text-sm" onChange={e => setForm({...form, location: e.target.value})} />
              <input placeholder="區域/商圈" className="bg-[#FFF9E3] p-3 rounded-2xl text-sm" onChange={e => setForm({...form, area: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="照片編號" className="bg-[#FFF9E3] p-3 rounded-2xl text-sm" onChange={e => setForm({...form, photoRef: e.target.value})} />
              <input placeholder="行程目標" className="bg-[#FFF9E3] p-3 rounded-2xl text-sm" onChange={e => setForm({...form, goal: e.target.value})} />
            </div>
            <input placeholder="營業時間" className="w-full bg-[#FFF9E3] p-3 rounded-2xl text-sm" onChange={e => setForm({...form, openingHours: e.target.value})} />
            <input placeholder="Google Map 網址" className="w-full bg-[#FFF9E3] p-3 rounded-2xl text-xs" onChange={e => setForm({...form, mapUrl: e.target.value})} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="起始地" className="bg-[#E0F2FE] p-3 rounded-2xl text-sm" onChange={e => setForm({...form, startLocation: e.target.value})} />
              <input placeholder="目的地" className="bg-[#E0F2FE] p-3 rounded-2xl text-sm" onChange={e => setForm({...form, endLocation: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold opacity-40">多段行程設定</label>
              {form.segments.map((seg: any, i: number) => (
                <div key={i} className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl">
                   <input placeholder="模式" className="w-16 bg-white p-1 rounded text-[10px]" onChange={e => {
                     const s = [...form.segments]; s[i].mode = e.target.value; setForm({...form, segments: s});
                   }} />
                   <input placeholder="從" className="flex-1 bg-white p-1 rounded text-[10px]" onChange={e => {
                     const s = [...form.segments]; s[i].from = e.target.value; setForm({...form, segments: s});
                   }} />
                   <input placeholder="到" className="flex-1 bg-white p-1 rounded text-[10px]" onChange={e => {
                     const s = [...form.segments]; s[i].to = e.target.value; setForm({...form, segments: s});
                   }} />
                </div>
              ))}
              <button onClick={addSegment} className="w-full py-2 border-2 border-dashed border-blue-200 rounded-xl text-blue-400 text-[10px]">+ 增加一段轉乘</button>
            </div>
          </div>
        )}

        <button 
          onClick={() => { onSave(form); onClose(); }}
          className="w-full bg-[#8D775F] text-white py-4 rounded-full font-bold shadow-xl active:scale-95 transition-all"
        >
          確認儲存 🌸
        </button>
      </div>
    </motion.div>
  );
}
