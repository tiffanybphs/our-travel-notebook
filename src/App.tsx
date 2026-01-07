import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Clock, MapPin, ChevronDown, Trash2, Save, 
  Navigation, ShoppingBag, PieChart, Ticket, CheckSquare, 
  Train, Bus, Footprints, Plane, Ship, Link2, Target, Camera,
  MoreVertical, Calendar, Globe, Download, Upload, Map as MapIcon
} from 'lucide-react';
import { calculateEndTime, calculateDuration, formatExcelData } from './utils';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('行程');
  const [selectedDate, setSelectedDate] = useState('2026/01/01');
  const [schedules, setSchedules] = useState<any[]>([]); // 已收編
  const [backlog, setBacklog] = useState<any[]>([]); // 待編入行程區
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tripInfo, setTripInfo] = useState({ name: "我們的日本之旅", dates: "2026/01/01 - 2026/01/07" });

  useEffect(() => {
    setTimeout(() => setLoading(false), 2500);
  }, []);

  const handleAddItem = () => {
    const id = Date.now().toString();
    const lastItem = schedules.filter(s => s.date === selectedDate).sort((a,b) => b.endTime.localeCompare(a.endTime))[0];
    const startTime = lastItem ? lastItem.endTime.split(' ')[1] : "09:00";
    
    const newItem = {
      id, type: 'spot', title: '', date: selectedDate, startTime, duration: '01:00',
      endTime: calculateEndTime(selectedDate, startTime, '01:00'),
      location: '', category: '吃喝', area: '', photoId: '', target: '', remark: '', openTime: '', mapUrl: '',
      segments: []
    };
    setSchedules([newItem, ...schedules]);
    setEditingId(id);
  };

  if (loading) return <div className="fixed inset-0 z-[9999] bg-[#FFF9E3] flex items-center justify-center"><img src="/splash.jpeg" className="w-full h-full object-cover" /></div>;

  return (
    <div className="min-h-screen bg-[#FFF9E3] font-maru text-[#8D775F] pb-32">
      {/* Header */}
      <header className="bg-white p-6 rounded-b-[40px] shadow-sm text-center border-b border-[#FFD1DC]/30">
        <h1 className="text-xl font-bold text-[#FFD1DC]">{tripInfo.name}</h1>
        <p className="text-[10px] opacity-40">{tripInfo.dates}</p>
      </header>

      {/* 常駐 Tabs */}
      <nav className="sticky top-0 z-40 bg-[#FFF9E3]/90 backdrop-blur-md flex justify-around p-3 border-b border-[#FFD1DC]/10">
        {['行程', '導航', '憑證', '清單', '記帳'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${activeTab === t ? 'bg-[#FFD1DC] text-white' : 'opacity-40'}`}>{t}</button>
        ))}
      </nav>

      <main className="p-4 max-w-md mx-auto space-y-6">
        {activeTab === '行程' && (
          <>
            {/* 日期選擇器 */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {["01.01(Thu)", "01.02(Fri)", "01.03(Sat)"].map(d => (
                <button key={d} onClick={() => setSelectedDate(`2026/${d.split('(')[0].replace('.','/')}`)} className={`flex-shrink-0 px-4 py-2 rounded-2xl text-[11px] font-bold ${selectedDate.includes(d.split('(')[0].replace('.','/')) ? 'bg-[#FFD1DC] text-white' : 'bg-white opacity-50'}`}>{d}</button>
              ))}
            </div>

            {/* 行程卡片列表 */}
            <div className="space-y-4">
              {schedules.filter(s => s.date === selectedDate).map(item => (
                <ScheduleCard key={item.id} item={item} isEditing={editingId === item.id} onToggle={() => setEditingId(editingId === item.id ? null : item.id)} onUpdate={(upd: any) => setSchedules(schedules.map(s => s.id === item.id ? {...s, ...upd} : s))} onDelete={() => setSchedules(schedules.filter(s => s.id !== item.id))} />
              ))}
            </div>

            {/* 待編入行程區 */}
            <div className="pt-10 border-t-2 border-dashed border-[#FFD1DC]/30">
              <h4 className="text-center text-[10px] opacity-40 mb-4 tracking-widest uppercase">有待編入行程區</h4>
              {backlog.map(item => <ScheduleCard key={item.id} item={item} />)}
              {backlog.length === 0 && <div className="text-center py-8 bg-white/30 rounded-[30px] text-[10px] italic opacity-30">目前沒有暫存行程</div>}
            </div>
          </>
        )}
      </main>

      {/* Floating Save & Add */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-50">
        <button onClick={() => formatExcelData(schedules)} className="w-12 h-12 bg-green-400 text-white rounded-full shadow-lg flex items-center justify-center"><Download size={20}/></button>
        <button onClick={handleAddItem} className="w-14 h-14 bg-[#FFD1DC] text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white"><Plus size={30} /></button>
      </div>

      <div className="text-center py-10 opacity-10 text-[10px] font-bold">🌸 TIFFANY & BENJAMIN 🌸</div>
    </div>
  );
}

// --- 卡片組件 ---
function ScheduleCard({ item, isEditing, onToggle, onUpdate, onDelete }: any) {
  const isTransport = item.type === 'transport';
  
  return (
    <div className={`bg-white rounded-[30px] shadow-sm border-2 overflow-hidden transition-all ${isEditing ? 'border-[#FFD1DC]' : 'border-transparent'}`}>
      <div className="p-5 cursor-pointer flex justify-between items-center" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-black text-[#FFD1DC]">{item.startTime}</div>
          <h3 className="font-bold">{item.title || (isTransport ? `${item.startLoc} ➜ ${item.endLoc}` : "新行程")}</h3>
        </div>
        <ChevronDown size={18} className={`text-[#FFD1DC] transition-transform ${isEditing ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-[#FFF9E3]/30 p-5 space-y-4">
            <div className="flex bg-white p-1 rounded-xl shadow-inner border border-[#FFD1DC]/20">
              <button onClick={() => onUpdate({type:'spot'})} className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${item.type === 'spot' ? 'bg-[#FFD1DC] text-white' : 'opacity-30'}`}>景點活動</button>
              <button onClick={() => onUpdate({type:'transport'})} className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${item.type === 'transport' ? 'bg-blue-400 text-white' : 'opacity-30'}`}>交通</button>
            </div>

            {item.type === 'spot' ? (
              /* 12 欄位實作 */
              <div className="grid grid-cols-1 gap-3">
                <input placeholder="行程名稱*" className="in-f font-bold" value={item.title} onChange={e => onUpdate({title: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                  <div className="in-f"><label className="lb">開始時間</label><input type="time" value={item.startTime} onChange={e => onUpdate({startTime: e.target.value, endTime: calculateEndTime(item.date, e.target.value, item.duration)})} /></div>
                  <div className="in-f"><label className="lb">時長 (hh:mm)</label><input value={item.duration} onChange={e => onUpdate({duration: e.target.value, endTime: calculateEndTime(item.date, item.startTime, e.target.value)})} /></div>
                </div>
                <div className="in-f bg-pink-50/50"><label className="lb text-[#FFD1DC]">完結時間 (自動更新)</label><div className="text-xs font-bold">{item.endTime}</div></div>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="區域/商圈" className="in-f" value={item.area} />
                  <select className="in-f" value={item.category} onChange={e => onUpdate({category: e.target.value})}>
                    {['吃喝','購物','精品','景點活動','拍照錄影','集合地點','備註'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="照片編號" className="in-f" />
                  <input placeholder="目標" className="in-f" />
                </div>
                <input placeholder="Google Map 網址" className="in-f text-[10px]" value={item.mapUrl} />
                <textarea placeholder="備註" className="in-f h-20 text-xs" />
              </div>
            ) : (
              /* 交通多段格式 */
              <div className="space-y-4">
                <div className="flex gap-2 items-center bg-blue-50/50 p-3 rounded-2xl">
                  <input placeholder="起始" className="w-full text-center font-bold bg-transparent" value={item.startLoc} />
                  <span className="text-blue-300">➜</span>
                  <input placeholder="終點" className="w-full text-center font-bold bg-transparent" value={item.endLoc} />
                </div>
                <div className="pl-4 border-l-2 border-blue-200 space-y-4">
                  {item.segments?.map((seg: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm space-y-2 border border-blue-50 relative">
                      <select className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg outline-none border-none">
                        <option>地鐵</option><option>步行</option><option>巴士</option>
                      </select>
                      <input placeholder="路線名稱 (方向)" className="w-full text-[10px] outline-none" />
                      <div className="flex gap-2 text-[10px]">
                        <input placeholder="上車站" className="flex-1 bg-gray-50 p-2 rounded-lg" />
                        <input placeholder="下車站" className="flex-1 bg-gray-50 p-2 rounded-lg" />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => onUpdate({segments: [...(item.segments||[]), {id: Date.now()}]})} className="w-full py-2 border-2 border-dashed border-blue-100 rounded-xl text-blue-300 text-[10px] font-bold">+ 增加分段描述</button>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <button className="flex-1 bg-[#8D775F] text-white py-3 rounded-full font-bold shadow-lg flex items-center justify-center gap-2"><Save size={16}/> Save</button>
              <button onClick={onDelete} className="w-12 bg-red-50 text-red-400 rounded-full flex items-center justify-center border border-red-100"><Trash2 size={16}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
