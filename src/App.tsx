import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Plus, Clock, ChevronDown, Trash2, Save, MapPin, Navigation, 
  ShoppingBag, PieChart, Calendar, Camera, Target, Car, 
  ArrowRight, Train, Plane, Bus, Info, FileDown, Globe, 
  CheckCircle, History, AlertCircle 
} from 'lucide-react';
import * as XLSX from 'xlsx';

// --- Supabase 初始化 (請自行填入 Key) ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- 常量定義 ---
const CATEGORIES = ['吃喝', '購物', '精品', '景點活動', '拍照錄影', '集合地點', '其他'];
const TRANS_MODES = ['步行', '地鐵', '捷運', '火車', '高鐵', '電車', '輕軌', '巴士', '小巴', '的士', '船', '飛機', '纜車', '其他'];

export default function TravelApp() {
  const [activeTab, setActiveTab] = useState('行程');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- 1. 時間聯動與骨牌效應邏輯 ---
  const calculateEndTime = (start: string, duration: string) => {
    if (!start || !duration) return "";
    const [h, m] = start.replace(':', '').match(/.{1,2}/g)!.map(Number);
    const [dh, dm] = duration.split(':').map(Number);
    const totalMinutes = h * 60 + m + dh * 60 + dm;
    return `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
  };

  const rippleTimeEffect = (items: any[]) => {
    let lastEndTime = items[0]?.startTime || "09:00";
    return items.map((item, index) => {
      if (index === 0) return item;
      const newStart = lastEndTime;
      const newEnd = calculateEndTime(newStart, item.duration);
      lastEndTime = newEnd;
      return { ...item, startTime: newStart, endTime: newEnd };
    });
  };

  // --- 2. Excel 匯出 (15分鐘一格精確排版) ---
  const exportToExcel = () => {
    const timeSlots = [];
    for (let i = 0; i < 96; i++) {
      const h = Math.floor(i / 4);
      const m = (i % 4) * 15;
      timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }

    const data = timeSlots.map(slot => {
      const event = schedules.find(s => slot >= s.startTime && slot < s.endTime);
      const isSleep = (slot < "10:00" || slot > "21:00") && !event;
      return {
        "時間": slot,
        "行程內容": event ? event.title : (isSleep ? "💤 休息" : ""),
        "類別": event?.category || "",
        "地點": event?.location || "",
        "區域": event?.area || "",
        "備註": event?.remark || ""
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "日系旅行計畫");
    XLSX.writeFile(wb, "MyTravel_15min.xlsx");
  };

  // --- 渲染 UI ---
  return (
    <div className="min-h-screen bg-[#FFF9E3] font-maru text-[#8D775F] selection:bg-[#FFD1DC]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md p-4 rounded-b-[30px] shadow-sm">
        <div className="flex justify-between items-center">
          <img src="/icon.png" className="w-8 h-8 rounded-xl" alt="icon" />
          <div className="text-center">
            <h1 className="font-bold text-lg">東京櫻花之旅 🌸</h1>
            <p className="text-[10px] opacity-50 tracking-widest uppercase">2026/01/01 - 2026/01/05</p>
          </div>
          <button onClick={exportToExcel} className="p-2 bg-[#FFD1DC] text-white rounded-full"><FileDown size={18}/></button>
        </div>
        
        {/* 常駐置頂 Tabs */}
        <div className="flex justify-around mt-4 border-t border-[#FFD1DC]/20 pt-3">
          {['行程', '導航', '憑證', '清單', '記帳'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-black transition-all ${activeTab === tab ? 'text-[#FFD1DC] scale-110' : 'opacity-30'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto">
        {activeTab === '行程' && (
          <div className="space-y-4">
            {/* 橫向日期選擇器 */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {["01.01(Thu)", "01.02(Fri)", "01.03(Sat)"].map(d => (
                <button key={d} className="flex-shrink-0 px-4 py-2 bg-white rounded-full text-[10px] font-bold shadow-sm active:scale-95">
                  {d}
                </button>
              ))}
            </div>

            <Reorder.Group axis="y" values={schedules} onReorder={setSchedules} className="space-y-4">
              {schedules.map((item, idx) => (
                <ScheduleItem 
                  key={item.id} 
                  item={item} 
                  isEditing={editingId === item.id}
                  onToggle={() => setEditingId(editingId === item.id ? null : item.id)}
                  prevEndTime={idx > 0 ? schedules[idx-1].endTime : null}
                />
              ))}
            </Reorder.Group>

            {/* 有待編入行程區 */}
            <div className="mt-10 pt-10 border-t-2 border-dashed border-[#FFD1DC]/30">
              <div className="bg-white/40 p-6 rounded-[40px] text-center">
                <p className="text-[10px] font-bold opacity-30 tracking-[0.2em] mb-4">有待編入行程區</p>
                <div className="flex flex-col gap-2">
                  {/* 待定卡片渲染 */}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FAB 按鈕 */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button onClick={() => {}} className="w-12 h-12 bg-[#B9E2F5] text-white rounded-full shadow-lg flex items-center justify-center border-2 border-white"><Car size={20}/></button>
        <button onClick={() => {}} className="w-16 h-16 bg-[#FFD1DC] text-white rounded-full shadow-xl flex items-center justify-center border-4 border-white active:scale-90"><Plus size={32}/></button>
      </div>

      <div className="py-10 text-center opacity-10 text-[10px] font-black tracking-widest uppercase">
        🌸 Tiffany & Benjamin 🌸
      </div>
    </div>
  );
}

// --- 行程卡片組件 (複雜邏輯封裝) ---
function ScheduleItem({ item, isEditing, onToggle, prevEndTime }: any) {
  const isTransport = item.type === 'transport';

  return (
    <motion.div layout className={`bg-white rounded-[35px] shadow-sm border-2 overflow-hidden transition-all ${isEditing ? 'border-[#FFD1DC]' : 'border-transparent'}`}>
      {/* 緊湊預覽 */}
      <div className="p-5 flex justify-between items-center cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-[#FFD1DC]">{item.startTime}</span>
            <div className="w-[1px] h-4 bg-[#FFD1DC]/20 my-1"></div>
            <span className="text-[10px] font-black opacity-20">{item.endTime}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               {isTransport ? <Car size={14} className="text-[#B9E2F5]"/> : <MapPin size={14} className="text-[#FFD1DC]"/>}
               <h3 className="font-bold text-sm">{item.title}</h3>
            </div>
            {item.area && <span className="text-[9px] bg-[#FFF9E3] px-2 py-0.5 rounded-md mt-1 inline-block">{item.area}</span>}
          </div>
        </div>
        <ChevronDown size={18} className={`text-[#FFD1DC] transition-transform ${isEditing ? 'rotate-180' : ''}`} />
      </div>

      {/* 向下展開編輯模式 (手風琴) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-[#FFF9E3]/30 px-6 pb-6 space-y-4">
            <div className="pt-2 space-y-3">
              <div className="group">
                <label className="text-[9px] font-black opacity-30 uppercase ml-2">行程名稱</label>
                <input className="w-full bg-white rounded-2xl p-3 text-sm outline-none border border-transparent focus:border-[#FFD1DC]" defaultValue={item.title} />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-2xl">
                  <label className="text-[8px] opacity-30 block">時長 (HH:mm)</label>
                  <input className="w-full font-bold text-xs" defaultValue={item.duration} />
                </div>
                <div className="bg-[#FFD1DC] p-3 rounded-2xl text-white">
                  <label className="text-[8px] opacity-70 block font-bold">完結時間</label>
                  <div className="font-black text-xs">{item.endTime}</div>
                </div>
              </div>

              {/* 景點專屬欄位 */}
              {!isTransport && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select className="flex-1 bg-white rounded-xl p-2 text-xs">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input placeholder="商圈" className="flex-1 bg-white rounded-xl p-2 text-xs" />
                  </div>
                  <input placeholder="Google Map 網址" className="w-full bg-white rounded-xl p-2 text-xs text-blue-400" />
                </div>
              )}

              {/* 交通段落：多段路徑邏輯 */}
              {isTransport && (
                <div className="bg-white/60 p-4 rounded-[25px] border-2 border-dashed border-[#B9E2F5]">
                  <p className="text-[8px] font-bold text-[#B9E2F5] mb-2 uppercase tracking-widest">分段路徑</p>
                  <div className="space-y-4">
                    {/* 這邊循環渲染交通節點 */}
                    <div className="flex items-center gap-2">
                      <Train size={12}/> <span className="text-xs font-bold">地鐵 - 港島線</span>
                    </div>
                  </div>
                  <button className="w-full py-2 mt-4 bg-white rounded-xl text-[9px] font-bold text-[#B9E2F5]">+ 添加轉乘/步行</button>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button className="flex-1 bg-[#8D775F] text-white py-3 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"><Save size={16}/> 儲存</button>
                <button className="w-12 h-12 bg-red-50 text-red-400 rounded-full flex items-center justify-center border border-red-100"><Trash2 size={16}/></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
