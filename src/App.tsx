import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Plus, Clock, ChevronDown, Trash2, Save, MapPin, 
  Navigation, ShoppingBag, PieChart, Calendar, Camera, Target, 
  Car, Info, FileDown, CheckCircle2, ArrowRight, Map
} from 'lucide-react';
import * as XLSX from 'xlsx';

// 1. 12個核心欄位定義
const CATEGORIES = ['吃喝', '購物', '精品', '景點活動', '拍照錄影', '集合地點'];
const FIELDS = ['類別', '區域/商圈', '照片編號', '目標', '營業時間', '地圖URL', '備註', '預算', '起點', '終點', '交通工具', '轉乘細節'];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // --- 核心邏輯：時間聯動與空檔計算 ---
  const syncTimes = (item: any, changedField: string, newVal: string) => {
    let { date, startTime, duration, endTime } = item;
    if (changedField === 'startTime') startTime = newVal;
    if (changedField === 'duration') duration = newVal;
    
    const [sH, sM] = startTime.split(':').map(Number);
    const [dH, dM] = duration.split(':').map(Number);
    let totalM = sM + dM;
    let totalH = sH + dH + Math.floor(totalM / 60);
    endTime = `${date} ${String(totalH % 24).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
    
    return { startTime, duration, endTime };
  };

  const handleReorder = (newOrder: any[]) => {
    if (newOrder.length === 0) return;
    let currentStart = newOrder[0].startTime;
    const syncedOrder = newOrder.map((item) => {
      const updated = { ...item, startTime: currentStart };
      const res = syncTimes(updated, 'startTime', item.duration);
      currentStart = res.endTime.split(' ')[1];
      return { ...updated, ...res };
    });
    setSchedules(syncedOrder);
  };

  const handleAdd = (type: 'spot' | 'transport') => {
    const id = Date.now().toString();
    const last = schedules[schedules.length - 1];
    const baseDate = last ? last.endTime.split(' ')[0] : '2026/01/01';
    const baseStart = last ? last.endTime.split(' ')[1] : '09:00';
    
    const newItem = {
      id, type, title: '', date: baseDate, startTime: baseStart, duration: '01:00',
      endTime: syncTimes({date: baseDate, startTime: baseStart, duration: '01:00'}, 'duration', '01:00').endTime,
      category: type === 'spot' ? '景點活動' : '交通',
      area: '', photoId: '', target: '', openTime: '', mapUrl: '', remark: '', budget: '',
      startLoc: '', endLoc: '', transMode: '', segments: []
    };
    setSchedules([...schedules, newItem]);
    setEditingId(id);
  };

  // --- Excel 匯出：包含所有 12 欄位的 Column ---
  const exportToExcel = () => {
    const timeSlots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }

    const data = timeSlots.map(slot => {
      const event = schedules.find(s => slot >= s.startTime && slot < s.endTime.split(' ')[1]);
      const row: any = { "時間": slot, "行程名稱": event?.title || "" };
      // 強制寫入所有 12 個欄位，確保 Column 存在
      FIELDS.forEach(f => row[f] = event ? (event[f] || "") : "");
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedule");
    XLSX.writeFile(wb, "Travel_Planner_Full.xlsx");
  };

  if (loading) return <div className="fixed inset-0 bg-[#FFF9E3] flex items-center justify-center font-bold text-[#FFD1DC] animate-pulse">Loading Diary...</div>;

  return (
    <div className="min-h-screen bg-[#FFF9E3] font-maru text-[#8D775F] pb-32">
      <header className="bg-white p-4 rounded-b-[40px] shadow-sm flex justify-between items-center px-6">
        <h1 className="text-sm font-bold text-[#FFD1DC] tracking-widest">TIFFANY & BENJAMIN</h1>
        <button onClick={exportToExcel} className="p-2 bg-[#FFF9E3] rounded-full text-[#FFD1DC]"><FileDown size={20}/></button>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <Reorder.Group axis="y" values={schedules} onReorder={handleReorder} className="space-y-0">
          {schedules.map((item, index) => (
            <React.Fragment key={item.id}>
              {/* Timeline 需時顯示 (顯示與上一項之間的間隔) */}
              {index > 0 && (
                <div className="py-2 ml-10 border-l-2 border-dashed border-[#FFD1DC]/30 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FFD1DC]/30 -ml-[5px]"></div>
                  <span className="text-[9px] font-bold opacity-30">需時 / 轉場</span>
                </div>
              )}

              <Reorder.Item value={item} dragListener={!editingId} className="py-1">
                <Card 
                  item={item} 
                  isEditing={editingId === item.id}
                  onToggle={() => setEditingId(editingId === item.id ? null : item.id)}
                  onUpdate={(upd: any) => setSchedules(schedules.map(s => s.id === item.id ? {...s, ...upd} : s))}
                  onSync={(f: string, v: string) => setSchedules(schedules.map(s => s.id === item.id ? {...item, ...syncTimes(item, f, v)} : s))}
                  onDelete={() => setSchedules(schedules.filter(s => s.id !== item.id))}
                />
              </Reorder.Item>
            </React.Fragment>
          ))}
        </Reorder.Group>
      </main>

      {/* 新增按鈕區：分為景點與交通 */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-50">
        <button onClick={() => handleAdd('transport')} className="w-12 h-12 bg-blue-400 text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all border-2 border-white"><Car size={20}/></button>
        <button onClick={() => handleAdd('spot')} className="w-14 h-14 bg-[#FFD1DC] text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-all border-4 border-white"><Plus size={30}/></button>
      </div>

      <nav className="fixed bottom-0 w-full bg-white h-20 border-t flex items-center justify-around px-8">
        <Calendar className="text-[#FFD1DC]" size={24}/>
        <PieChart className="opacity-20" size={24}/>
        <ShoppingBag className="opacity-20" size={24}/>
      </nav>
    </div>
  );
}

function Card({ item, isEditing, onToggle, onUpdate, onSync, onDelete }: any) {
  const isTrans = item.type === 'transport';
  
  return (
    <div className={`bg-white rounded-[30px] shadow-sm border transition-all ${isEditing ? 'border-[#FFD1DC]' : 'border-transparent'}`}>
      <div className="p-4 flex justify-between items-center" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isTrans ? 'bg-blue-50 text-blue-400' : 'bg-[#FFF9E3] text-[#FFD1DC]'}`}>
            {item.startTime}
          </div>
          <h3 className="text-sm font-bold">{item.title || (isTrans ? "新增交通" : "新行程")}</h3>
        </div>
        <ChevronDown size={16} className={`text-[#FFD1DC] transition-transform ${isEditing ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-[#FFF9E3]/10 border-t overflow-hidden">
            <div className="p-5 space-y-4">
              <input placeholder={isTrans ? "交通名稱 (如：往築地市場)" : "行程名稱*"} className="in-box font-bold" value={item.title} onChange={e => onUpdate({title: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-2">
                <div className="in-box-sub"><label className="label-xs">開始</label><input type="time" className="w-full text-xs" value={item.startTime} onChange={e => onSync('startTime', e.target.value)} /></div>
                <div className="in-box-sub"><label className="label-xs">時長</label><input className="w-full text-xs font-bold" value={item.duration} onChange={e => onSync('duration', e.target.value)} /></div>
              </div>

              {/* 12 欄位實體化 */}
              <div className="grid grid-cols-2 gap-2">
                <select className="in-box text-xs" value={item.category} onChange={e => onUpdate({category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  <option>交通</option>
                </select>
                <input placeholder="區域/商圈" className="in-box text-xs" value={item.area} onChange={e => onUpdate({area: e.target.value})} />
              </div>

              {isTrans && (
                <div className="space-y-2 bg-blue-50/30 p-3 rounded-2xl">
                  <div className="flex gap-2 items-center">
                    <input placeholder="起點" className="in-box text-xs" value={item.startLoc} onChange={e => onUpdate({startLoc: e.target.value})} />
                    <ArrowRight size={14} className="text-blue-300"/>
                    <input placeholder="終點" className="in-box text-xs" value={item.endLoc} onChange={e => onUpdate({endLoc: e.target.value})} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="in-box-sub"><label className="label-xs">照片編號</label><input className="w-full" value={item.photoId} onChange={e => onUpdate({photoId: e.target.value})} /></div>
                <div className="in-box-sub"><label className="label-xs">目標</label><input className="w-full" value={item.target} onChange={e => onUpdate({target: e.target.value})} /></div>
              </div>

              <input placeholder="🔗 地圖 URL (Google Maps)" className="in-box text-[10px] text-blue-400" value={item.mapUrl} onChange={e => onUpdate({mapUrl: e.target.value})} />

              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-[#8D775F] text-white py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"><CheckCircle2 size={16}/> 儲存</button>
                <button onClick={onDelete} className="px-4 bg-red-50 text-red-300 rounded-full border border-red-100"><Trash2 size={16}/></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .in-box { width: 100%; background: white; padding: 10px 15px; border-radius: 18px; border: 1px solid #FFD1DC30; outline: none; }
        .in-box-sub { background: white; padding: 6px 12px; border-radius: 15px; border: 1px solid #FFD1DC20; }
        .label-xs { display: block; font-size: 8px; opacity: 0.3; font-weight: bold; }
      `}</style>
    </div>
  );
}
