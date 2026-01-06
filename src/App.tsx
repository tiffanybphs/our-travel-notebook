import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Clock, Calendar, Plus, Trash2, 
  Save, Camera, Target, Share2, Download 
} from 'lucide-react';

// 初始化 Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function TravelPlanner() {
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState<'spot' | 'transport' | null>(null);
  const [scheduleList, setScheduleList] = useState<any[]>([]);

  useEffect(() => {
    // 2.5 秒啟動畫面
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <motion.div className="fixed inset-0 z-[9999] bg-[#FFF9E3] flex items-center justify-center">
        {/* 注意：這裡已經更新為 splash.jpeg */}
        <motion.img 
          src="/splash.jpeg" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="w-full h-full object-cover" 
        />
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9E3] text-[#8D775F] pb-32">
      <header className="bg-white p-6 rounded-b-[30px] shadow-sm text-center border-b border-[#FFD1DC]/30">
        <h1 className="text-2xl font-bold text-[#FFD1DC]">🌸 旅遊手帳 🌸</h1>
        <p className="text-[10px] mt-1 opacity-50">Tiffany & Benjamin 專屬</p>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="space-y-4">
          {scheduleList.map((item, idx) => (
            <div key={idx} className={`p-5 rounded-[25px] shadow-sm border ${item.category === '交通' ? 'bg-[#E0F2FE] border-[#bae6fd]' : 'bg-white border-[#FFD1DC]/20'}`}>
              <div className="text-[10px] font-bold opacity-40 mb-1">{item.date} | {item.startTime} - {item.endTime}</div>
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-xs mt-2 opacity-70 italic">{item.location || item.startLocation + ' ➜ ' + item.endLocation}</p>
            </div>
          ))}
        </div>
      </main>

      {/* 底部按鈕 */}
      <div className="fixed bottom-8 left-0 w-full flex justify-center gap-4 px-10 z-50">
        <button onClick={() => setShowEditor('spot')} className="flex-1 bg-white border-2 border-[#FFD1DC] text-[#FFD1DC] h-14 rounded-full font-bold">景點</button>
        <button onClick={() => setShowEditor('transport')} className="flex-1 bg-[#FFD1DC] text-white h-14 rounded-full font-bold">交通</button>
      </div>

      <div className="fixed bottom-2 w-full text-center text-[10px] opacity-20 pointer-events-none">🌸 Tiffany & Benjamin 🌸</div>
    </div>
  );
}
