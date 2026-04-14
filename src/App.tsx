/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { format, isWithinInterval, parse, startOfToday, getDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, BookOpen, Smartphone, Edit3, X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Initial Schedule Data
const INITIAL_SCHEDULE: Record<string, { time: string; name: string; start: string; end: string }[]> = {
  'Senin': [
    { time: '09:00-11:00', name: 'Workshop RPL B', start: '09:00', end: '11:00' },
    { time: '13:00-15:00', name: 'Workshop Sistem Info. Web B', start: '13:00', end: '15:00' },
  ],
  'Selasa': [
    { time: '07:00-11:00', name: 'Workshop RPL B', start: '07:00', end: '11:00' },
    { time: '13:00-16:00', name: 'Kewarganegaraan / B. Indonesia', start: '13:00', end: '16:00' },
  ],
  'Rabu': [
    { time: '13:00-16:00', name: 'Workshop Sistem Info. Web Framework B', start: '13:00', end: '16:00' },
  ],
  'Kamis': [
    { time: '08:00-11:00', name: 'Workshop Sistem Info. Web Framework B', start: '08:00', end: '11:00' },
    { time: '11:00-13:00', name: 'Intermediate English', start: '11:00', end: '13:00' },
    { time: '13:00-15:00', name: 'Workshop Mobile App Framework B', start: '13:00', end: '15:00' },
  ],
  'Jumat': [
    { time: '07:00-09:00', name: 'Literasi Digital / Konsep Dasar Jaringan', start: '07:00', end: '09:00' },
    { time: '13:00-15:00', name: 'Sistem Operasi / Trend Teknologi', start: '13:00', end: '15:00' },
    { time: '15:00-17:00', name: 'Statistika', start: '15:00', end: '17:00' },
  ],
};

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(DAYS_ID[getDay(new Date())]);
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentDayName = DAYS_ID[getDay(currentTime)];
  const todaySchedule = schedule[selectedDay] || [];

  const getStatus = (start: string, end: string) => {
    const today = startOfToday();
    const startTime = parse(start, 'HH:mm', today);
    const endTime = parse(end, 'HH:mm', today);
    
    if (isWithinInterval(currentTime, { start: startTime, end: endTime })) {
      return 'ongoing';
    }
    if (currentTime < startTime) {
      return 'upcoming';
    }
    return 'passed';
  };

  const currentClass = useMemo(() => {
    const today = schedule[currentDayName] || [];
    return today.find(item => getStatus(item.start, item.end) === 'ongoing');
  }, [currentTime, currentDayName, schedule]);

  const nextClass = useMemo(() => {
    const today = schedule[currentDayName] || [];
    return today.find(item => getStatus(item.start, item.end) === 'upcoming');
  }, [currentTime, currentDayName, schedule]);

  const updateClass = (day: string, index: number, field: string, value: string) => {
    const newSchedule = { ...schedule };
    newSchedule[day][index] = { ...newSchedule[day][index], [field]: value };
    setSchedule(newSchedule);
  };

  const addClass = (day: string) => {
    const newSchedule = { ...schedule };
    if (!newSchedule[day]) newSchedule[day] = [];
    newSchedule[day].push({ time: "08:00-10:00", name: "Kelas Baru", start: "08:00", end: "10:00" });
    setSchedule(newSchedule);
  };

  const removeClass = (day: string, index: number) => {
    const newSchedule = { ...schedule };
    newSchedule[day].splice(index, 1);
    setSchedule(newSchedule);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-10 overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,#1e293b,#0f172a)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Phone Frame Section */}
        <div className="w-full max-w-[360px] mx-auto lg:mx-0 shrink-0">
          <div className="aspect-[9/19] bg-slate-900 border-[12px] border-slate-700 rounded-[48px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">
            
            {/* Status Bar */}
            <div className="h-8 px-6 flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <span>{format(currentTime, 'HH:mm')}</span>
              <div className="flex gap-2">
                <span>WiFi</span>
                <span>100%</span>
              </div>
            </div>

            {/* App Header */}
            <div className="p-6 border-b border-slate-700">
              <h1 className="text-2xl font-bold text-slate-50">Jadwal Kuliah</h1>
              <p className="text-sm text-slate-400 mt-1">
                {format(currentTime, 'EEEE, d MMMM', { locale: id })}
              </p>
            </div>

            {/* Day Selector */}
            <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar">
              {DAYS_ID.slice(1, 6).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[13px] transition-all whitespace-nowrap border",
                    selectedDay === day 
                      ? "bg-sky-400 text-slate-900 border-sky-400 font-bold" 
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  )}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>

            {/* Schedule List */}
            <div className="flex-1 px-6 py-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((item, idx) => {
                  const status = getStatus(item.start, item.end);
                  const isOngoing = status === 'ongoing';
                  
                  return (
                    <motion.div
                      key={`${selectedDay}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "p-4 rounded-2xl bg-slate-800 border-l-4 transition-all relative",
                        isOngoing 
                          ? "border-emerald-400 bg-gradient-to-r from-emerald-400/10 to-slate-800 shadow-[0_0_20px_rgba(74,222,128,0.1)]" 
                          : "border-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isOngoing && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />}
                        <span className="text-[12px] font-bold text-sky-400 uppercase tracking-wide">
                          {item.time} {isOngoing && "• SEDANG BERLANGSUNG"}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-50 leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-[12px] text-slate-400 mt-2 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Gedung Kuliah Terpadu
                      </p>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm">
                  <Calendar className="w-10 h-10 mb-2 opacity-20" />
                  <p>Tidak ada jadwal</p>
                </div>
              )}
            </div>

            {/* Sync Status */}
            <div className="p-6 text-center border-t border-slate-700 bg-slate-800/50">
              <span className="text-[12px] text-sky-400 font-bold">Sync ke Android Widget Berhasil</span>
            </div>
          </div>
        </div>

        {/* Documentation & Widget Section */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Actions Section */}
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center justify-center gap-3 bg-sky-400 hover:bg-sky-300 text-slate-900 p-5 rounded-2xl transition-all group shadow-lg shadow-sky-400/20"
            >
              <Edit3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-bold">Edit Jadwal Kuliah</span>
            </button>
          </div>

          {/* Tech Implementation Card */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-bold text-sky-400 mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Manajemen Jadwal
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Kelola jadwal kuliah Anda dengan mudah secara manual. Klik tombol <span className="text-sky-400 font-semibold">Edit Jadwal</span> di atas untuk menambah, mengubah, atau menghapus mata kuliah. Semua perubahan akan langsung tersinkronisasi ke widget Android Anda.
            </p>
          </div>

          {/* Widget Preview Box */}
          <div className="bg-white/5 border border-dashed border-slate-700 rounded-3xl p-8 flex flex-col items-center">
            <span className="text-[11px] uppercase tracking-[0.1em] text-slate-400 mb-5">Android Home Screen Widget Preview</span>
            
            <div className="w-[280px] h-[140px] bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-[28px] p-5 flex flex-col justify-center gap-1 shadow-2xl">
              <span className="text-[11px] text-sky-400 font-bold uppercase">Sekarang</span>
              <h4 className="text-lg font-bold text-white leading-tight">
                {currentClass ? currentClass.name : "Tidak ada kelas"}
              </h4>
              <p className="text-[13px] text-white/60">
                {currentClass ? `${currentClass.time} • Gedung Kuliah` : nextClass ? `Berikutnya: ${nextClass.name}` : "Selesai untuk hari ini"}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Schedule Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Edit3 className="w-6 h-6 text-sky-400" />
                  <h2 className="text-xl font-bold">Edit Jadwal Kuliah</h2>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {DAYS_ID.slice(1, 6).map((day) => (
                  <div key={day} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-sky-400 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {day}
                      </h3>
                      <button 
                        onClick={() => addClass(day)}
                        className="text-xs font-bold bg-sky-400/10 text-sky-400 px-3 py-1.5 rounded-lg hover:bg-sky-400/20 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Tambah Kelas
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {schedule[day]?.map((item, idx) => (
                        <div key={idx} className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl relative group">
                          <button 
                            onClick={() => removeClass(day, idx)}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Nama Mata Kuliah</label>
                              <input 
                                type="text" 
                                value={item.name} 
                                onChange={(e) => updateClass(day, idx, 'name', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-sky-400 outline-none transition-colors"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Mulai (HH:mm)</label>
                                <input 
                                  type="text" 
                                  value={item.start} 
                                  onChange={(e) => updateClass(day, idx, 'start', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-sky-400 outline-none transition-colors"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Selesai (HH:mm)</label>
                                <input 
                                  type="text" 
                                  value={item.end} 
                                  onChange={(e) => updateClass(day, idx, 'end', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-sky-400 outline-none transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-sky-400 text-slate-900 font-bold px-8 py-3 rounded-2xl hover:bg-sky-300 transition-colors shadow-lg shadow-sky-400/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

