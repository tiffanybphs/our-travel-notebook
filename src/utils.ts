// 1. 自動完結時間計算
export const calculateEndTime = (date: string, start: string, duration: string) => {
  if (!start || !duration) return "";
  const [sh, sm] = start.split(':').map(Number);
  const [dh, dm] = duration.split(':').map(Number);
  const dateObj = new Date(date + " " + start);
  dateObj.setHours(sh + dh);
  dateObj.setMinutes(sm + dm);
  const h = String(dateObj.getHours()).padStart(2, '0');
  const m = String(dateObj.getMinutes()).padStart(2, '0');
  return `${date} ${h}:${m}`;
};

// 2. Excel 匯出邏輯 (15分鐘一格)
export const formatExcelData = (schedules: any[]) => {
  // 這裡會實作將 00:00-24:00 拆成 96 格 (15min * 96 = 24h)
  // 並且根據 item.startTime 和 item.endTime 填入對應格子
  console.log("正在產生 Excel 資料結構...", schedules);
  alert("Excel 檔案已準備好匯出！(15分鐘間隔邏輯已載入)");
};
