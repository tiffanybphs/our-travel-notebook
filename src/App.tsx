import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Plus, Clock, ChevronDown, Trash2, Save, MapPin, 
  Navigation, ShoppingBag, PieChart, Calendar, Camera, Target, 
  Car, Info, ExternalLink, Globe, FileDown, CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx'; // 需執行 npm install xlsx

// 1. 常量定義
const CATEGORIES = ['吃喝', '購物', '精品', '景點活動', '拍照錄影', '集合地點'];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('行程');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // --- 2. 核心時間邏輯：雙向同步與骨牌聯動 ---
  const syncTimes = (item: any, changedField: string, newVal: string) => {
    let { date, startTime, duration, endTime } = item;
    if (changedField === 'startTime') startTime = newVal;
    if (changedField === 'duration') duration = newVal;
    if (changedField === 'endTime') {
      const parts = newVal.split(' ');
      endTime = newVal;
      const [eH, eM] = parts[1].split(':').map(Number);
      const [sH, sM] = startTime.split(':').map(Number);
      let diffM = (eH * 60 + eM) - (sH * 60 + sM);
      if (diffM < 0) diffM += 1440;
      duration = `${String(Math.floor(diffM / 60)).padStart(2, '0')}:${String(diffM % 60).padStart(2, '0')}`;
    } else {
      const [sH, sM] = startTime.split(':').map(Number);
      const [dH, dM] = duration.split(':').map(Number);
      let totalM = sM + dM;
      let totalH = sH + dH + Math.floor(totalM / 60);
      endTime = `${date} ${String(totalH % 24).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
    }
    return { startTime, duration, endTime };
  };

  const handleReorder = (newOrder: any[]) => {
    if (newOrder.length === 0) return;
    let currentStart = newOrder[0].startTime;
    const syncedOrder = newOrder.map((item) => {
      const updated = { ...item, startTime: currentStart };
      const res = syncTimes(updated, 'startTime', currentStart);
      currentStart = res.endTime.split(' ')[1];
      return { ...updated, ...res };
    });
    setSchedules(syncedOrder);
  };

  // --- 3. Google Maps 導航編碼 ---
  const openGoogleMap = (location: string) => {
    if (!location) return;
    const encoded = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank');
  };

  // --- 4. Excel 匯出：15分鐘一格邏輯 ---
  const exportToExcel = () => {
    const timeSlots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }

    const data = timeSlots.map(slot => {
      const row: any = { "時間": slot };
      const event = schedules.find(s => slot >= s.startTime && slot < s.endTime.split(' ')[1]);
      
      if (event) {
        row["行程內容"] = event.title;
      } else {
        const hour = parseInt(slot.split(':')[0]);
        row["行程內容"] = (hour < 10 || hour >= 20) ? "Hotel/Rest (Grey)" : "";
      }
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedule");
    XLSX.writeFile(wb, "Travel_Plan_15min.xlsx");
  };

  if (loading) return <div className="fixed inset-0 z-50 bg-[#FFF9E3] flex items-center justify-center"><img src="/splash.jpeg" className="w-full h-full object-cover animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-[#FFF9E3] font-maru text-[#8D775F] pb-28">
      <header className="bg-white p-4 rounded-b-[40px] shadow-sm flex justify-between items-center px-6 border-b border-[#FFD1DC]/30">
        <img src="/icon.png" className="w-6 h-6 rounded-md" />
        <h1 className="text-sm font-bold text-[#FFD1DC] tracking-widest">TIFFANY & BENJAMIN</h1>
        <button onClick={exportToExcel} className="text-[#FFD1DC]"><FileDown size={20}/></button>
      </header>

      <main className="p-3 max-w-md mx-auto">
        <Reorder.Group axis="y" values={schedules} onReorder={handleReorder} className="space-y-2">
          {schedules.map(item => (
            <Reorder.Item key={item.id} value={item} dragListener={!editingId}>
              <Card 
                item={item} 
                isEditing={editingId === item.id}
                onToggle={() => setEditingId(editingId === item.id ? null : item.id)}
                onUpdate={(upd: any) => setSchedules(schedules.map(s => s.id === item.id ? {...s, ...upd} : s))}
                onSync={(field: string, val: string) => setSchedules(schedules.map(s => s.id === item.id ? {...item, ...syncTimes(item, field, val)} : s))}
                onDelete={() => setSchedules(schedules.filter(s => s.id !== item.id))}
                openMap={openGoogleMap}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* 有待編入行程區 */}
        <div className="mt-8 opacity-30 border-t-2 border-dashed border-[#FFD1DC] pt-4 text-center text-[10px] font-bold">有待編入行程區 (尚未定時)</div>
      </main>

      <button onClick={() => {
        const id = Date.now().toString();
        const newItem = { id, title: '', startTime: '09:00', duration: '01:00', endTime: '2026/01/01 10:00', date: '2026/01/01', category: '景點活動', segments: [] };
        setSchedules([...schedules, newItem]);
        setEditingId(id);
      }} className="fixed bottom-24 right-6 w-14 h-14 bg-[#FFD1DC] text-white rounded-full shadow-xl flex items-center justify-center border-4 border-white active:scale-90 z-50">
        <Plus size={30} />
      </button>

      {/* 底部導覽欄 */}
      <nav className="fixed bottom-0 w-full bg-white/95 h-18 border-t flex items-center justify-around px-6 pb-2">
        <div onClick={() => setActiveTab('導航')} className={`flex flex-col items-center ${activeTab === '導航' ? 'text-[#FFD1DC]' : 'opacity-20'}`}><Navigation size={22}/><span className="text-[8px]">導航</span></div>
        <div onClick={() => setActiveTab('行程')} className={`flex flex-col items-center ${activeTab === '行程' ? 'text-[#FFD1DC]' : 'opacity-20'}`}><Calendar size={22}/><span className="text-[8px] font-bold">行程</span></div>
        <div onClick={() => setActiveTab('記帳')} className={`flex flex-col items-center ${activeTab === '記帳' ? 'text-[#FFD1DC]' : 'opacity-20'}`}><PieChart size={22}/><span className="text-[8px]">記帳</span></div>
      </nav>
    </div>
  );
}

// --- 卡片組件 (緊湊且全功能) ---
function Card({ item, isEditing, onToggle, onUpdate, onSync, onDelete, openMap }: any) {
  return (
    <div className={`bg-white rounded-[28px] shadow-sm border transition-all ${isEditing ? 'border-[#FFD1DC]' : 'border-transparent'}`}>
      <div className="p-4 flex justify-between items-center" onClick={onToggle}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="text-[10px] font-black text-[#FFD1DC] bg-[#FFF9E3] px-2 py-0.5 rounded-full shrink-0">{item.startTime}</div>
          <h3 className="text-sm font-bold truncate">{item.title || "新行程"}</h3>
        </div>
        <div className="flex items-center gap-2">
           {item.title && <button onClick={(e) => { e.stopPropagation(); openMap(item.title); }} className="text-[#FFD1DC] opacity-40 hover:opacity-100"><Navigation size={14}/></button>}
           <ChevronDown size={16} className={`text-[#FFD1DC] transition-transform ${isEditing ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-[#FFF9E3]/10 border-t border-gray-50 overflow-hidden">
            <div className="p-4 space-y-3">
              <input placeholder="行程名稱*" className="in-box text-sm font-bold" value={item.title} onChange={e => onUpdate({title: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-2">
                <div className="in-box-sub"><label className="label-xs">開始</label><input type="time" className="w-full bg-transparent text-xs" value={item.startTime} onChange={e => onSync('startTime', e.target.value)} /></div>
                <div className="in-box-sub"><label className="label-xs">時長</label><input placeholder="01:00" className="w-full bg-transparent text-xs font-bold" value={item.duration} onChange={e => onSync('duration', e.target.value)} /></div>
              </div>

              <div className="bg-white p-2 rounded-xl border border-[#FFD1DC]/20 flex justify-between items-center">
                 <label className="text-[9px] font-bold text-[#FFD1DC]">🏁 完結時間</label>
                 <input className="text-xs font-bold text-[#FFD1DC] text-right bg-transparent outline-none" value={item.endTime} onChange={e => onSync('endTime', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select className="in-box text-xs" value={item.category} onChange={e => onUpdate({category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input placeholder="區域/商圈" className="in-box text-xs" value={item.area} onChange={e => onUpdate({area: e.target.value})} />
              </div>

              <div className="flex gap-2 text-[10px]">
                <input placeholder="📸 照片編號" className="in-box w-1/3" value={item.photoId} onChange={e => onUpdate({photoId: e.target.value})} />
                <input placeholder="🎯 目標" className="in-box w-2/3" value={item.target} onChange={e => onUpdate({target: e.target.value})} />
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-[#8D775F] text-white py-3 rounded-full text-xs font-bold shadow-lg flex items-center justify-center gap-1 active:scale-95 transition-all"><CheckCircle2 size={14}/> 儲存</button>
                <button onClick={() => { if(window.confirm('確定刪除此行程嗎？')) onDelete(); }} className="px-4 bg-red-50 text-red-300 rounded-full border border-red-100"><Trash2 size={16}/></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .in-box { width: 100%; background: white; padding: 8px 12px; border-radius: 15px; border: 1px solid #FFD1DC20; outline: none; }
        .in-box-sub { background: white; padding: 6px 10px; border-radius: 15px; border: 1px solid #FFD1DC20; }
        .label-xs { display: block; font-size: 8px; opacity: 0.3; font-weight: bold; text-transform: uppercase; }
      `}</style>
    </div>
  );
}
