import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Clock, MapPin, ChevronDown, Trash2, Save, 
  Navigation, ShoppingBag, PieChart, Ticket, CheckSquare, 
  Map, Car, Train, Bus, Footprints, Plane, Ship, Link2, Target, Camera
} from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('行程');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 1. 初始化 Splash Screen
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // 2. 自動時間運算邏輯 (24小時制)
  const calculateEndTime = (dateStr: string, startTime: string, duration: string) => {
    if (!startTime || !duration) return "";
    try {
      const [h, m] = startTime.split(':').map(Number);
      const [dH, dM] = duration.split(':').map(Number);
      let totalM = m + dM;
      let totalH = h + dH + Math.floor(totalM / 60);
      return `${dateStr} ${String(totalH % 24).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
    } catch { return ""; }
  };

  // 3. 新增行程：自動抓取上一項的結束時間
  const handleAdd = () => {
    const id = Date.now().toString();
    let start = "09:00";
    let date = "2026/01/01";
    if (schedules.length > 0) {
      const last = schedules[0];
      const parts = last.endTime.split(' ');
      date = parts[0];
      start = parts[1];
    }
    const newItem = {
      id, type: 'spot', title: '', date, startTime: start, duration: '01:00',
      endTime: calculateEndTime(date, start, '01:00'),
      location: '', category: '吃喝', area: '', photoId: '', target: '', remark: '', openTime: '', mapUrl: '',
      segments: []
    };
    setSchedules([newItem, ...schedules]);
    setEditingId(id);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#FFF9E3]">
        <img src="/splash.jpeg" className="w-full h-full object-cover" alt="Splash" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9E3] font-maru text-[#8D775F] pb-32 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white p-6 rounded-b-[40px] shadow-sm text-center border-b border-[#FFD1DC]/30">
        <h1 className="text-2xl font-bold text-[#FFD1DC] tracking-tight">🌸 Our Travel Diary</h1>
        <div className="text-[10px] mt-1 opacity-40 font-bold uppercase tracking-widest">Tiffany & Benjamin</div>
      </header>

      {/* 常駐置頂 Tabs */}
      <div className="sticky top-0 z-40 bg-[#FFF9E3]/90 backdrop-blur-md px-2 py-3 flex justify-around border-b border-[#FFD1DC]/10">
        {['行程', '憑證', '清單', '記帳'].map(tab => (
          <button 
            key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${activeTab === tab ? 'bg-[#FFD1DC] text-white shadow-md' : 'opacity-40'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="p-4 max-w-md mx-auto space-y-4">
        {activeTab === '行程' && schedules.map(item => (
          <ScheduleCard 
            key={item.id} item={item} isEditing={editingId === item.id}
            onToggle={() => setEditingId(editingId === item.id ? null : item.id)}
            onUpdate={(upd: any) => {
              const newItem = { ...item, ...upd };
              if (upd.startTime || upd.duration || upd.date) {
                newItem.endTime = calculateEndTime(newItem.date, newItem.startTime, newItem.duration);
              }
              setSchedules(schedules.map(s => s.id === item.id ? newItem : s));
            }}
            onDelete={() => setSchedules(schedules.filter(s => s.id !== item.id))}
          />
        ))}
      </main>

      {/* Floating Plus Button */}
      <button onClick={handleAdd} className="fixed bottom-28 right-6 w-15 h-15 bg-[#FFD1DC] text-white rounded-full shadow-2xl flex items-center justify-center z-50 border-4 border-white active:scale-90 transition-all">
        <Plus size={32} />
      </button>

      {/* Safety Render */}
      <div className="text-center py-10 opacity-10 text-[10px] font-bold">🌸 TIFFANY & BENJAMIN 🌸</div>
    </div>
  );
}

// --- 專業行程卡片組件 ---
function ScheduleCard({ item, isEditing, onToggle, onUpdate, onDelete }: any) {
  const isTransport = item.type === 'transport';

  return (
    <div className={`bg-white rounded-[35px] shadow-sm border-2 transition-all ${isEditing ? 'border-[#FFD1DC] scale-[1.02]' : 'border-transparent'}`}>
      <div className="p-6 cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#FFD1DC]">
              <Clock size={14} />
              <span className="text-[11px] font-bold tracking-tighter">{item.startTime} - {item.endTime.split(' ')[1]}</span>
            </div>
            <h3 className="text-lg font-bold leading-tight">{item.title || (isTransport ? `${item.startLoc} ➜ ${item.endLoc}` : "新行程")}</h3>
          </div>
          <ChevronDown size={20} className={`text-[#FFD1DC] transition-transform ${isEditing ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-[#FFF9E3]/30 overflow-hidden">
            <div className="p-6 pt-0 space-y-4">
              <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-inner border border-[#FFD1DC]/20">
                <button onClick={() => onUpdate({type: 'spot'})} className={`flex-1 py-2 text-[10px] rounded-xl font-bold transition-all ${!isTransport ? 'bg-[#FFD1DC] text-white' : 'opacity-30'}`}>景點活動</button>
                <button onClick={() => onUpdate({type: 'transport'})} className={`flex-1 py-2 text-[10px] rounded-xl font-bold transition-all ${isTransport ? 'bg-blue-400 text-white' : 'opacity-30'}`}>交通工具</button>
              </div>

              {!isTransport ? (
                <div className="space-y-3">
                  <input placeholder="行程名稱*" className="in-box font-bold text-base" value={item.title} onChange={e => onUpdate({title: e.target.value})} />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="in-box"><label className="label-t">日期</label><input type="date" value={item.date} className="w-full bg-transparent outline-none" onChange={e => onUpdate({date: e.target.value})}/></div>
                    <div className="in-box"><label className="label-t">開始時間</label><input type="time" value={item.startTime} className="w-full bg-transparent outline-none" onChange={e => onUpdate({startTime: e.target.value})}/></div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-[#FFD1DC]/20 shadow-sm">
                    <div className="flex-1"><label className="label-t">預計時長 (hh:mm)</label><input placeholder="01:00" className="w-full font-bold outline-none" value={item.duration} onChange={e => onUpdate({duration: e.target.value})} /></div>
                    <div className="w-[1px] h-10 bg-[#FFD1DC]/30"></div>
                    <div className="flex-1"><label className="label-t text-[#FFD1DC]">🏁 完結時間</label><div className="font-bold text-[#FFD1DC] text-lg">{item.endTime.split(' ')[1]}</div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="in-box"><label className="label-t">區域/商圈</label><input className="w-full bg-transparent outline-none" value={item.area} onChange={e => onUpdate({area: e.target.value})} /></div>
                    <div className="in-box"><label className="label-t">類別</label>
                      <select className="w-full bg-transparent outline-none" value={item.category} onChange={e => onUpdate({category: e.target.value})}>
                        {['吃喝','購物','精品','景點活動','拍照錄影','集合地點','備註'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="in-box"><label className="label-t flex gap-1"><Camera size={10}/> 照片參考編號 / <Target size={10}/> 目標</label>
                    <div className="flex gap-2"><input placeholder="編號" className="w-1/3 border-r" value={item.photoId} onChange={e => onUpdate({photoId: e.target.value})} /><input placeholder="例如：買到限量版" className="w-2/3" value={item.target} onChange={e => onUpdate({target: e.target.value})} /></div>
                  </div>
                  <div className="in-box"><label className="label-t flex gap-1"><MapPin size={10}/> Google Map 網址</label><input className="w-full bg-transparent outline-none text-blue-400 text-[10px]" value={item.mapUrl} onChange={e => onUpdate({mapUrl: e.target.value})} /></div>
                </div>
              ) : (
                <div className="space-y-3">
                   <div className="flex gap-2 items-center bg-blue-50/50 p-4 rounded-3xl">
                    <input placeholder="起始地" className="w-full bg-transparent font-bold text-center" value={item.startLoc} onChange={e => onUpdate({startLoc: e.target.value})} />
                    <span className="text-blue-300">➜</span>
                    <input placeholder="目的地" className="w-full bg-transparent font-bold text-center" value={item.endLoc} onChange={e => onUpdate({endLoc: e.target.value})} />
                  </div>
                  {/* 多段交通設計 */}
                  <div className="pl-4 border-l-2 border-blue-100 space-y-4">
                    {item.segments?.map((seg: any, idx: number) => (
                      <div key={idx} className="bg-white p-4 rounded-3xl shadow-sm space-y-2 relative border border-blue-50">
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-blue-400"># 階段 {idx+1}</span><button onClick={() => onUpdate({segments: item.segments.filter((_:any,i:any)=>i!==idx)})}><Trash2 size={12} className="text-red-300"/></button></div>
                        <select className="w-full text-xs font-bold text-blue-600 bg-blue-50 p-2 rounded-xl border-none outline-none">
                          <option>地鐵</option><option>步行</option><option>巴士</option><option>飛機</option>
                        </select>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <input placeholder="上車點" className="bg-gray-50 p-2 rounded-lg" value={seg.from} onChange={e => { const newS = [...item.segments]; newS[idx].from = e.target.value; onUpdate({segments: newS}); }} />
                          <input placeholder="下車點" className="bg-gray-50 p-2 rounded-lg" value={seg.to} onChange={e => { const newS = [...item.segments]; newS[idx].to = e.target.value; onUpdate({segments: newS}); }} />
                        </div>
                      </div>
                    ))}
                    <button onClick={() => onUpdate({segments: [...(item.segments||[]), {mode:'地鐵', from:'', to:''}]})} className="w-full py-3 border-2 border-dashed border-blue-100 rounded-2xl text-blue-300 text-[10px] font-bold">+ 增加一段轉乘節點</button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <button className="flex-1 bg-[#8D775F] text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"><Save size={18}/> 保存變更</button>
                <button onClick={onDelete} className="w-14 bg-red-50 text-red-400 rounded-full flex items-center justify-center border border-red-100 active:scale-90"><Trash2 size={18}/></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .in-box { background: white; padding: 10px 15px; border-radius: 20px; border: 1px solid #FFD1DC40; }
        .label-t { display: block; font-size: 9px; font-weight: 900; opacity: 0.3; margin-bottom: 2px; text-transform: uppercase; }
      `}</style>
    </div>
  );
}
