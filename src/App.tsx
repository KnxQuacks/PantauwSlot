import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Search,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  Compass,
  ArrowRight,
  Info,
  Play,
  X,
  ChevronDown,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import jkt48FightVideo from "../assets/video/JKT48-Fight.mp4";

import { supabase } from "./utils/supabase";
import { Member, ExclusiveEvent } from "./types";
import { fetchWithCache } from "./utils/api";
import { CleanMemberCard } from "./components/CleanMemberCard";
import { SkeletonCard } from "./components/SkeletonCard";
import { SessionGroup } from "./components/SessionGroup";
import { useLocalStorage } from "./hooks/useLocalStorage";

// Interactive Clean Header section with Dynamic real-time ambient color glow
function ElegantHeader({ stats }: { stats: any }) {
  const primaryVideoRef = useRef<HTMLVideoElement>(null);
  const ambientVideoRef = useRef<HTMLVideoElement>(null);
  const secondaryAmbientRef = useRef<HTMLVideoElement>(null);

  // Hook to ensure ambient videos play and sync dynamically on start, source changes, or hover/interactions
  useEffect(() => {
    const playAmbients = () => {
      if (primaryVideoRef.current) primaryVideoRef.current.play().catch(() => { });
      if (ambientVideoRef.current) ambientVideoRef.current.play().catch(() => { });
      if (secondaryAmbientRef.current) secondaryAmbientRef.current.play().catch(() => { });
    };

    // Auto-trigger playing immediately
    playAmbients();

    // Use multiple triggers to fully bypass any browser/iframe autoplay sandbox limitations
    const interactions = ["mouseenter", "click", "touchstart", "mousemove"];
    interactions.forEach(item => document.addEventListener(item, playAmbients, { once: true }));

    return () => {
      interactions.forEach(item => document.removeEventListener(item, playAmbients));
    };
  }, []);

  return (
    <div className="w-full mb-8">
      <div
        className="w-full bg-[#ffffff] p-8 md:p-12 rounded-[24px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="max-w-xl md:max-w-2xl">

          <h1 className="text-[40px] md:text-[56px] lg:text-[72px] font-bold tracking-tight text-[#1d1d1f] leading-[1.05] antialiased mb-2">
            Pantau Slot JKT48.
            <br />
            <span className="animate-apple-shimmer">Cepat. Tepat. Praktis.</span>
          </h1>
          <p className="text-[#86868b] text-[19px] md:text-[21px] mt-6 leading-[1.38] font-medium max-w-[600px] tracking-tight">
            Melacak ketersediaan sesi <span className="text-[#1d1d1f] font-semibold">2Shot</span> dan <span className="text-[#1d1d1f] font-semibold">Meet & Greet</span> member JKT48.
          </p>

        </div>

        {/* Gorgeous custom JKT48 Card with Dynamic Real-Time Active Video Ambient Glow */}
        <div className="w-full md:w-[350px] lg:w-[410px] aspect-[1.58] shrink-0 mt-6 md:mt-0 relative isolate group/video transition-all duration-300">
          {/* DYNAMIC REAL-TIME VIDEO AMBIENT BLUR BACKDROP LAYERS (Sophisticated softer, feathered atmospheric glow) */}
          <div className="absolute -inset-8 -z-10 pointer-events-none select-none overflow-visible flex items-center justify-center">
            {/* Layer 1: Elegant wide-range soft color halo */}
            <video
              ref={ambientVideoRef}
              src={jkt48FightVideo}
              className="w-[120%] h-[120%] absolute object-cover rounded-[32px] blur-[56px] md:blur-[72px] opacity-[0.48] saturate-[1.4] scale-105 pointer-events-none transition-all duration-500"
              muted={true}
              loop={true}
              playsInline={true}
              autoPlay={true}
            />
            {/* Layer 2: Tight soft glow to blend borders */}
            <video
              ref={secondaryAmbientRef}
              src={jkt48FightVideo}
              className="w-[108%] h-[108%] absolute object-cover rounded-[28px] blur-[32px] md:blur-[40px] opacity-[0.52] saturate-[1.3] pointer-events-none transition-all duration-500"
              muted={true}
              loop={true}
              playsInline={true}
              autoPlay={true}
            />
          </div>

          {/* Direct Playable HTML5 Video Player with perfect bindings & no control bar */}
          <div className="w-full h-full bg-black rounded-[24px] shadow-[0_22px_45px_rgba(0,0,0,0.3)] overflow-hidden relative group/player">
            <video
              ref={primaryVideoRef}
              src={jkt48FightVideo}
              className="w-full h-full object-cover rounded-[24px]"
              autoPlay
              muted
              loop
              playsInline
              onPlay={() => {
                if (ambientVideoRef.current) ambientVideoRef.current.play().catch(() => { });
                if (secondaryAmbientRef.current) secondaryAmbientRef.current.play().catch(() => { });
              }}
              onPause={() => {
                if (ambientVideoRef.current) ambientVideoRef.current.pause();
                if (secondaryAmbientRef.current) secondaryAmbientRef.current.pause();
              }}
              onTimeUpdate={() => {
                if (primaryVideoRef.current) {
                  const time = primaryVideoRef.current.currentTime;
                  if (ambientVideoRef.current) {
                    const diff = Math.abs(time - ambientVideoRef.current.currentTime);
                    if (diff > 0.15) {
                      ambientVideoRef.current.currentTime = time;
                    }
                  }
                  if (secondaryAmbientRef.current) {
                    const diff = Math.abs(time - secondaryAmbientRef.current.currentTime);
                    if (diff > 0.15) {
                      secondaryAmbientRef.current.currentTime = time;
                    }
                  }
                }
              }}
              onRateChange={() => {
                if (primaryVideoRef.current) {
                  const rate = primaryVideoRef.current.playbackRate;
                  if (ambientVideoRef.current) ambientVideoRef.current.playbackRate = rate;
                  if (secondaryAmbientRef.current) secondaryAmbientRef.current.playbackRate = rate;
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "remaining">("name");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isSoldOutExpanded, setIsSoldOutExpanded] = useState(false);

  const [events, setEvents] = useState<ExclusiveEvent[]>([]);
  const [selectedEventCode, setSelectedEventCode] = useState<string | null>(null);
  const [memberPhotos, setMemberPhotos] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<"NORMAL" | "WAITING_ROOM" | "ERROR">("NORMAL");
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useLocalStorage<string[]>("jkt48-pinned-oshi", []);

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pid) => pid !== id);
      } else {
        // Scroll ke atas secara halus saat melakukan Pin Oshi
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return [...prev, id];
      }
    });
  }, [setPinnedIds]);

  useEffect(() => {
    fetchWithCache("/api/v1/exclusives?lang=id")
      .then(async data => {
        if (data && data.error === "WAITING_ROOM") {
          setSystemStatus("WAITING_ROOM");
          setSystemMessage(data.message);

          // FALLBACK: Load known events from Supabase cache
          const { data: sbData } = await supabase.from('jkt48_slots').select('event_code, category');
          if (sbData && sbData.length > 0) {
            const uniqueCodes = Array.from(new Set(sbData.map((d: any) => d.event_code)));
            const fallbackEvents = uniqueCodes.map(code => ({
              code: code as string,
              title: `Event ${code} (Data Backup)`,
              category: sbData.find((d: any) => d.event_code === code)?.category || "2Shot"
            }));
            setEvents(fallbackEvents);
            if (fallbackEvents.length > 0) {
              setSelectedEventCode(fallbackEvents[0].code);
            }
          }
          return;
        }
        if (data && data.status && data.data) {
          setSystemStatus("NORMAL");
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const filteredEvents = data.data.filter((ev: any) => {
            if (!ev.valid_date_from) return false;
            const eventDate = new Date(ev.valid_date_from);
            return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
          });

          setEvents(filteredEvents);
          if (filteredEvents.length > 0) {
            setSelectedEventCode(filteredEvents[0].code);
          }
        }
      })
      .catch(err => console.error("Failed to fetch events:", err));

    fetchWithCache("/api/v1/members?lang=id")
      .then(data => {
        if (data && data.status && data.data) {
          const photoMap: Record<string, string> = {};
          data.data.forEach((m: any) => {
            if (m.name && m.photo) {
              // Strip the absolute URL to route through the Vite proxy and bypass CORS
              const proxyUrl = m.photo.replace(/^https?:\/\/jkt48\.com/, "");
              photoMap[m.name.toLowerCase()] = proxyUrl;
            }
          });
          setMemberPhotos(photoMap);
        }
      })
      .catch(err => console.error("Failed to fetch members photo:", err));
  }, []);

  const [members, setMembers] = useState<Member[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleToast = (e: any) => {
      setToastMessage(e.detail);
      setTimeout(() => setToastMessage(null), 3000);
    };
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  const fetchMemberData = useCallback((bypassCache = false) => {
    if (!selectedEventCode) return;
    setIsLoading(true);
    const selectedEvent = events.find(ev => ev.code === selectedEventCode);
    const is2Shot = selectedEvent?.category === "TWO_SHOT" || selectedEvent?.title?.toLowerCase().includes("2shot");
    const category = is2Shot ? "2Shot" : "MeetGreet";
    const endpoint = category === "2Shot"
      ? `/api/v1/exclusives/${selectedEventCode}/bonus?lang=id`
      : `/api/v1/exclusives/${selectedEventCode}?lang=id`;

    fetchWithCache(endpoint, bypassCache)
      .then(async data => {
        if (data && data.error === "WAITING_ROOM") {
          setSystemStatus("WAITING_ROOM");
          setSystemMessage(data.message);

          // FALLBACK: Load slot data from Supabase cache
          const { data: sbData } = await supabase.from('jkt48_slots').select('*').eq('event_code', selectedEventCode);
          if (sbData && sbData.length > 0) {
            const newMembers: Member[] = sbData.map((d: any) => ({
              id: d.id,
              name: d.name,
              category: d.category,
              total: d.total_quota,
              filled: d.filled_quota,
              avatarBg: "bg-gray-50 text-gray-800 border-gray-200",
              session: d.session_label,
              jkt48Gen: d.jkt48_gen || "Jalur Khusus",
              photoUrl: memberPhotos[d.name.toLowerCase()] || undefined
            }));
            setMembers(newMembers);
          }
          return;
        }
        if (data && data.status && data.data) {
          const newMembers: Member[] = [];
          const sessions = Array.isArray(data.data) ? data.data : (data.data.session || []);

          sessions.forEach((session: any, sessionIndex: number) => {
            const details = session.session_members || session.session_detail || [];
            details.forEach((sm: any, memberIndex: number) => {
              const name = sm.member_name || sm.jkt48_member_name;
              const quota = Number(sm.quota !== undefined ? sm.quota : sm.available_quota) || 0;
              const filled = Number(sm.tickets_sold) || 0;
              const id = sm.session_detail_code || sm.id || `session-${sessionIndex}-${session.label}-${name}-${memberIndex}`;

              newMembers.push({
                id: id,
                name: name,
                category: category,
                total: quota + filled,
                filled: filled,
                avatarBg: "bg-gray-50 text-gray-800 border-gray-200",
                session: session.label,
                jkt48Gen: sm.label || "Jalur Khusus",
                photoUrl: memberPhotos[name.toLowerCase()] || undefined
              });
            });
          });
          setMembers(newMembers);
        }
      })
      .catch(err => console.error("Failed to fetch event details:", err))
      .finally(() => setIsLoading(false));
  }, [selectedEventCode, events, memberPhotos]);

  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  const getSlotStatus = (filled: number, total: number) => {
    const remaining = total - filled;
    const ratio = remaining / total;

    if (remaining === 0) {
      return {
        label: "Fully Booked",
        badgeClass: "bg-[#ff3b30]/10 text-[#ff3b30] border border-[#ff3b30]/20",
        dotClass: "bg-[#ff3b30]",
        barClass: "bg-[#ff3b30]",
      };
    } else if (ratio <= 0.20) {
      return {
        label: "Hampir Habis",
        badgeClass: "bg-[#ff9500]/10 text-[#ff9500] border border-[#ff9500]/20",
        dotClass: "bg-[#ff9500]",
        barClass: "bg-[#ff9500]",
      };
    } else {
      return {
        label: "Tersedia",
        badgeClass: "bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20",
        dotClass: "bg-[#34c759]",
        barClass: "bg-[#007aff]",
      };
    }
  };

  const handleShuffle = () => {
    fetchMemberData(true); // Bypass cache on manual shuffle
    showToast("Data slot berhasil disinkronkan langsung dari server JKT48.");
  };



  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const searchedAndSortedMembers = useMemo(() => {
    let result = members.filter((member) => {
      return member.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "remaining") {
      result.sort((a, b) => (a.total - a.filled) - (b.total - b.filled));
    }

    return result;
  }, [members, searchQuery, sortBy]);

  const availableMembers = useMemo(() => searchedAndSortedMembers.filter(m => (m.total - m.filled) > 0), [searchedAndSortedMembers]);
  const soldOutMembers = useMemo(() => searchedAndSortedMembers.filter(m => (m.total - m.filled) === 0), [searchedAndSortedMembers]);

  const stats = useMemo(() => {
    const totalSlots = members.reduce((sum, m) => sum + m.total, 0);
    const filledSlots = members.reduce((sum, m) => sum + m.filled, 0);
    const sisaSlots = totalSlots - filledSlots;
    const availableCount = members.filter((m) => m.total - m.filled > 10).length;
    const percentageRemaining = Math.max(0, Math.min(100, Math.round((sisaSlots / totalSlots) * 100)));
    const percentageFilled = Math.max(0, Math.min(100, Math.round((filledSlots / totalSlots) * 100)));
    return { totalSlots, filledSlots, sisaSlots, availableCount, percentageRemaining, percentageFilled };
  }, [members]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col antialiased selection:bg-[#007aff]/10 selection:text-[#007aff] text-[#1d1d1f]">

      {/* Full-Screen Apple-Style Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
            className="fixed inset-0 z-[99999] bg-[#f5f5f7]/80 backdrop-blur-3xl flex flex-col items-center justify-center pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.05, opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center justify-center bg-[#ff3b30] text-white text-[15px] font-bold px-6 py-2 rounded-full tracking-widest shadow-sm mb-8">
                JKT48
              </div>
              <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight text-[#1d1d1f] mb-3">
                Memuat Data
              </h2>
              <p className="text-[#86868b] text-[15px] md:text-[17px] font-medium tracking-tight">
                Menyinkronkan ketersediaan slot secara real-time...
              </p>

              {/* Premium minimal indeterminate progress line */}
              <div className="w-64 h-[3px] bg-[#e8e8ed] rounded-full mt-10 overflow-hidden relative">
                <motion.div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#ff3b30] to-[#ff2d55] rounded-full w-1/3"
                  animate={{
                    left: ["-30%", "100%"]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Contemporary Glassmorphism Navbar - Apple Style */}
      <div className="sticky top-4 z-50 w-full px-4 flex justify-center mt-4">
        <header className="relative w-full max-w-3xl bg-white/70 backdrop-blur-2xl border border-[#000000]/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-full overflow-hidden transition-all duration-300">

          <div className="relative z-10 px-5 h-[52px] flex items-center justify-between">
            {/* Brand Emblem & Wordmark */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center justify-center bg-[#ff3b30] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider">
                JKT48
              </div>
              <span className="text-[13px] font-semibold tracking-tight text-[#1d1d1f] antialiased hidden sm:inline-block">
                Slot Tracker
              </span>
            </div>

            {/* Middle: Progress Text */}
            <div className="flex flex-col items-center justify-center gap-0.5 flex-1 mx-4">
              <span className="text-[10px] font-semibold tracking-wide text-[#86868b]">
                Ketersediaan Slot
              </span>
              <span className="text-[11px] font-bold text-[#1d1d1f] tracking-tight">
                {stats.percentageRemaining}% Terbuka <span className="text-[#86868b] font-medium ml-1">({stats.sisaSlots} dari {stats.totalSlots})</span>
              </span>
            </div>

            {/* Interactive Right Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleShuffle}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-[11px] font-semibold rounded-full transition-colors duration-200 active:scale-95"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34c759] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#34c759]"></span>
                </span>
                <span className="hidden sm:inline-block">Sinkronkan</span>
                <span className="sm:hidden">Sync</span>
              </button>
            </div>
          </div>

          {/* Ultra-sleek Apple Safari-style Bottom Loading Bar */}
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-transparent">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentageRemaining}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${stats.percentageRemaining <= 10 ? "from-[#ff3b30] to-[#ff2d55]" :
                stats.percentageRemaining <= 30 ? "from-[#ff9500] to-[#ffcc00]" : "from-[#34c759] to-[#30d158]"
                }`}
            />
          </div>
        </header>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-12">

        {/* Clean Interactive Dynamic Header Section */}
        <ElegantHeader stats={stats} />



        {/* Dynamic Controls Bar */}
        <section className="bg-[#ffffff] rounded-2xl p-4 sm:p-5 mb-10 border border-[#e8e8ed] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          {/* Left: Event Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:flex-1">
            <span className="text-xs font-bold text-[#86868b] uppercase tracking-wider px-1 shrink-0">Event:</span>
            <div className="relative w-full sm:w-auto flex-1 lg:max-w-md">
              <select
                value={selectedEventCode || ""}
                onChange={(e) => setSelectedEventCode(e.target.value)}
                className="w-full appearance-none bg-[#f5f5f7] border border-[#e8e8ed] text-sm text-[#1d1d1f] font-semibold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:border-[#007aff]/30 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                disabled={isLoading || events.length === 0}
              >
                {events.length === 0 && <option value="">Loading events...</option>}
                {events.map(ev => (
                  <option key={ev.code} value={ev.code}>
                    {ev.title}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-[#86868b]" />
              </div>
            </div>
          </div>

          {/* Right: Search box & Sorting Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0 border-t border-[#f5f5f7] pt-4 lg:border-t-0 lg:pt-0">
            {/* Sorting button */}
            <div className="flex items-center gap-1.5 bg-[#f5f5f7] p-1 rounded-xl border border-[#e8e8ed] shrink-0">
              <button
                onClick={() => setSortBy(sortBy === "name" ? "remaining" : "name")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1d1d1f] hover:bg-[#ffffff] hover:shadow-xs rounded-lg transition-all"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#86868b]" />
                Urutan: {sortBy === "name" ? "Abjad" : "Sisa Slot"}
              </button>
            </div>

            {/* Apple Search Input */}
            <div className="relative flex-1 sm:w-64">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#86868b]" />
              </div>
              <input
                type="text"
                placeholder="Cari nama member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f5f5f7] text-sm text-[#1d1d1f] placeholder:text-[#86868b] border-transparent focus:border-[#007aff]/30 outline-none rounded-xl transition-all duration-200 border shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Main Available Data Section */}
        {systemStatus === "WAITING_ROOM" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#ff9500]/10 border border-[#ff9500]/20 rounded-2xl p-10 md:p-16 text-center shadow-sm mb-8"
          >
            <div className="w-16 h-16 bg-[#ff9500]/20 text-[#ff9500] flex items-center justify-center rounded-full mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">
              Menunggu Antrean (Waiting Room)
            </h3>
            <p className="text-sm text-[#86868b] leading-relaxed max-w-md mx-auto mb-6">
              {systemMessage || "Server JKT48 sedang dalam mode antrean karena tingginya lalu lintas pengunjung. Sistem pemantauan sementara tertunda hingga akses dibuka kembali."}
            </p>
            <button
              onClick={handleShuffle}
              className="bg-[#1d1d1f] hover:bg-[#000000] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all"
            >
              Coba Sinkronkan Ulang
            </button>
          </motion.div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : availableMembers.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <div className="mb-8">
              {/* Render Pinned Oshi First */}
              <SessionGroup
                title="⭐ Oshimen"
                members={availableMembers.filter((m) => pinnedIds.includes(m.id))}
                pinnedIds={pinnedIds}
                onTogglePin={togglePin}
                getSlotStatus={getSlotStatus}
              />

              {/* Render Groups by Session */}
              {Array.from(new Set(availableMembers.filter((m) => !pinnedIds.includes(m.id)).map(m => m.session as string))).sort().map((session: string) => (
                <SessionGroup
                  key={`available-${session}`}
                  title={session}
                  members={availableMembers.filter((m) => m.session === session && !pinnedIds.includes(m.id))}
                  pinnedIds={pinnedIds}
                  onTogglePin={togglePin}
                  getSlotStatus={getSlotStatus}
                />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/70 backdrop-blur-md rounded-2xl p-16 text-center border border-[#000000]/[0.03] max-w-sm mx-auto shadow-sm mb-8"
          >
            <h4 className="text-base font-bold text-[#1d1d1f] mb-1">Hasil Tidak Ditemukan</h4>
            <p className="text-xs text-[#86868b] leading-relaxed max-w-xs mx-auto">
              Silakan ketik ulang pencarian untuk menemukan slot JKT48 yang tersedia.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
              }}
              className="mt-4 text-xs font-semibold text-[#007aff] hover:underline"
            >
              Reset Pencarian
            </button>
          </motion.div>
        )}

        {/* Sold Out Accordion Section */}
        {!isLoading && soldOutMembers.length > 0 && (
          <div className="mt-8 border-t border-[#e8e8ed] pt-8">
            <button
              onClick={() => setIsSoldOutExpanded(!isSoldOutExpanded)}
              className="flex items-center justify-between w-full text-left focus:outline-none mb-6 group"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-[#1d1d1f]">Habis Terjual</h3>
                <span className="bg-[#ff3b30]/10 text-[#ff3b30] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {soldOutMembers.length} Slot
                </span>
              </div>
              <div className={`p-2 rounded-full bg-[#f5f5f7] transition-transform duration-300 ${isSoldOutExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-[#86868b] group-hover:text-[#1d1d1f] transition-colors" />
              </div>
            </button>

            <AnimatePresence>
              {isSoldOutExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-4">
                    {/* Render Pinned Oshi Sold Out */}
                    <SessionGroup
                      title="⭐ Pin Oshi (Habis)"
                      members={soldOutMembers.filter((m) => pinnedIds.includes(m.id))}
                      pinnedIds={pinnedIds}
                      onTogglePin={togglePin}
                      getSlotStatus={getSlotStatus}
                    />

                    {/* Render Groups by Session */}
                    {Array.from(new Set(soldOutMembers.filter((m) => !pinnedIds.includes(m.id)).map(m => m.session as string))).sort().map((session: string) => (
                      <SessionGroup
                        key={`soldout-${session}`}
                        title={session}
                        members={soldOutMembers.filter((m) => m.session === session && !pinnedIds.includes(m.id))}
                        pinnedIds={pinnedIds}
                        onTogglePin={togglePin}
                        getSlotStatus={getSlotStatus}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </main>

      {/* Floating System Apple Notification Center */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1d1d1f]/95 text-white text-xs font-medium px-5 py-3.5 rounded-full shadow-2xl backdrop-blur-md border border-white/[0.08] flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ultra Clean Glassmorphic Footer */}
      <footer className="w-full bg-[#ffffff] border-t border-[#000000]/[0.05] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-[12px] text-[#86868b]">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span className="font-bold text-[#1d1d1f] tracking-wide uppercase">Indikator Sisa Sesi:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34c759]" />
              <span>Sisa &gt; 20% (Tersedia)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff9500]" />
              <span>Sisa 1% - 20% (Hampir Habis)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30]" />
              <span>Sisa 0% (Fully Booked)</span>
            </div>
          </div>
          <div className="text-center md:text-right font-medium">
            Knx.Quacksss &copy; 2026.
          </div>
        </div>
      </footer>

      {/* Floating Live Chat WidgetBot Button & Modal */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[60] flex flex-col items-end">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="mb-4 w-[calc(100vw-3rem)] h-[65vh] max-h-[500px] sm:w-[360px] md:w-[400px] md:h-[600px] md:max-h-none bg-transparent rounded-[28px] shadow-[0_24px_48px_rgba(0,0,0,0.12)] border border-[#000000]/[0.04] overflow-hidden flex flex-col origin-bottom-right"
            >
              {/* Ultra Minimalist Iframe - Let WidgetBot handle its own UI natively */}
              <iframe
                src="https://e.widgetbot.io/channels/1518364650268397688/1518370299177861291"
                title="Live Chat Discord"
                width="100%"
                height="100%"
                className="border-none w-full h-full bg-[#ffffff]"
              ></iframe>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(0,0,0,0.08)] border ${isChatOpen
            ? 'bg-[#1d1d1f] border-transparent text-white'
            : 'bg-[#ffffff]/90 backdrop-blur-xl border-[#000000]/[0.05] text-[#1d1d1f] hover:bg-white'
            }`}
        >
          {isChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </button>
      </div>

    </div>
  );
}
