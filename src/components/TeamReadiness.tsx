import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Tent, 
  Search, 
  Edit2, 
  Check, 
  X, 
  User, 
  Clock, 
  ShieldAlert 
} from "lucide-react";
import { TeamItem, MEMBERS } from "../types";

interface TeamReadinessProps {
  items: TeamItem[];
  updatingItemId: string | null;
  onUpdateItem: (item: TeamItem) => Promise<void>;
}

// Map exact quantities to the 11 team items
function getQuantity(itemName: string): string {
  const nameLower = itemName.toLowerCase();
  if (nameLower.includes("tenda")) return "Sesuai kebutuhan";
  if (nameLower.includes("flysheet")) return "2 buah";
  if (nameLower.includes("peluit")) return "Secukupnya";
  if (nameLower.includes("lampu badai")) return "1 buah";
  if (nameLower.includes("korek api")) return "2 buah";
  if (nameLower.includes("p3k")) return "1 set";
  if (nameLower.includes("kompor") || nameLower.includes("parafin")) return "1 buah";
  if (nameLower.includes("nesting")) return "1 set";
  if (nameLower.includes("bendera")) return "Masing-masing 1";
  if (nameLower.includes("prusik") || nameLower.includes("webbing")) return "Secukupnya";
  if (nameLower.includes("tongkat") || nameLower.includes("kayu") || nameLower.includes("bambu")) return "4 batang";
  return "Secukupnya";
}

export default function TeamReadiness({ 
  items, 
  updatingItemId, 
  onUpdateItem 
}: TeamReadinessProps) {
  
  // Note editing states
  const [editingNotesIndex, setEditingNotesIndex] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  const totalItemsCount = items.length;
  const readyItemsCount = items.filter((item) => item.status).length;
  const readyPercentage = totalItemsCount > 0 ? Math.round((readyItemsCount / totalItemsCount) * 100) : 0;

  // Filter items by Search query
  const filteredItems = items.filter((item) => {
    if (searchQuery.trim() === "") return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      item.itemName.toLowerCase().includes(lowerQuery) ||
      (item.pic || "").toLowerCase().includes(lowerQuery) ||
      (item.notes || "").toLowerCase().includes(lowerQuery)
    );
  });

  // Check the three status states
  const getStatusState = (item: TeamItem): "Belum" | "Progres" | "Siap" => {
    if (item.status) return "Siap";
    if (item.notes?.startsWith("[Progres]") || item.notes?.startsWith("[Progress]")) {
      return "Progres";
    }
    return "Belum";
  };

  // Three-state pill click handler
  const handleSetStatusState = async (item: TeamItem, state: "Belum" | "Progres" | "Siap") => {
    let updatedStatus = false;
    let updatedNotes = item.notes || "";

    // Clean notes from existing [Progres] tags
    const cleanNotes = (notes: string) => {
      return notes.replace(/^\[Progres\]\s*/i, "").replace(/^\[Progress\]\s*/i, "").trim();
    };

    if (state === "Siap") {
      updatedStatus = true;
      updatedNotes = cleanNotes(updatedNotes);
    } else if (state === "Progres") {
      updatedStatus = false;
      const base = cleanNotes(updatedNotes);
      updatedNotes = base ? `[Progres] ${base}` : "[Progres]";
    } else {
      updatedStatus = false;
      updatedNotes = cleanNotes(updatedNotes);
    }

    const updated: TeamItem = {
      ...item,
      status: updatedStatus,
      notes: updatedNotes,
      lastUpdated: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    };

    await onUpdateItem(updated);
  };

  // PIC assignment handler
  const handleAssignPIC = async (item: TeamItem, pic: string) => {
    const updated: TeamItem = {
      ...item,
      pic: pic,
      lastUpdated: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    };
    await onUpdateItem(updated);
  };

  // Notes editing helpers
  const startEditNote = (item: TeamItem, index: number) => {
    setEditingNotesIndex(index);
    // strip the leading [Progres] tag for user typing
    const strippedNotes = (item.notes || "")
      .replace(/^\[Progres\]\s*/i, "")
      .replace(/^\[Progress\]\s*/i, "")
      .trim();
    setNoteText(strippedNotes);
  };

  const saveNote = async (item: TeamItem) => {
    // Preserve [Progres] tag if the current state is Progres
    const state = getStatusState(item);
    let finalNotes = noteText.trim();
    if (state === "Progres") {
      finalNotes = finalNotes ? `[Progres] ${finalNotes}` : "[Progres]";
    }

    const updated: TeamItem = {
      ...item,
      notes: finalNotes,
      lastUpdated: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    };
    await onUpdateItem(updated);
    setEditingNotesIndex(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* 1. TOP HEADER STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50 border border-slate-200/60 p-5 rounded-2xl">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 block">
            PERALATAN BERSAMA
          </span>
          <h2 className="text-2xl font-display font-black text-slate-800">
            Kesiapan Regu
          </h2>
          <p className="text-slate-500 text-xs">
            {readyItemsCount} dari {totalItemsCount} perlengkapan regu siap
          </p>
        </div>

        {/* Circular gauge indicator */}
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full border border-slate-200 bg-white shadow-sm flex-shrink-0">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-slate-100"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-amber-500"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - readyPercentage / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-sm font-mono font-bold text-slate-800 z-10">{readyPercentage}%</span>
          </div>
          <div>
            <span className="text-xs font-sans font-bold text-slate-700 block">Tanggung Jawab Bersama</span>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 max-w-[180px]">
              Setiap perlengkapan regu wajib ditunjuk penanggung jawabnya (PIC).
            </p>
          </div>
        </div>

        {/* Warning Alert Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-2.5 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="font-mono font-bold text-[10px] uppercase tracking-wide text-amber-800">PENTING UNTUK TENDA</h5>
            <p className="text-[11px] leading-relaxed text-amber-950 font-medium">
              Tenda regu bisa disewa melalui panitia. Hubungi <strong>Kusbiantoro: +62 857-7696-0436</strong> untuk memesan.
            </p>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTROLS AND SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-slate-800 font-sans font-extrabold text-base flex items-center">
            <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-mono mr-2 font-bold">REGU</span>
            <span>Status Kesiapan Perlengkapan Regu Bersama</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Semua item berikut wajib disiapkan oleh perwakilan penanggung jawab (PIC) kelompok</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari perlengkapan regu..."
            className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2 outline-none focus:border-amber-500 transition-all font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-sans font-bold text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. TABLE COMPONENT (EXACTLY REPLICATING IMAGE 1) */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-inner">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-sans font-bold text-slate-500 tracking-wider">
              <th className="py-3 px-4">NAMA BARANG</th>
              <th className="py-3 px-4 w-32">JUMLAH</th>
              <th className="py-3 px-4 w-60">STATUS KESIAPAN</th>
              <th className="py-3 px-4 w-48">PIC PENANGGUNG JAWAB</th>
              <th className="py-3 px-4">CATATAN / DETAIL TAMBAHAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700 text-xs">
            {filteredItems.map((item, index) => {
              const isUpdating = updatingItemId === item.itemName;
              const isEditingNotes = editingNotesIndex === index;
              const statusState = getStatusState(item);
              const qty = getQuantity(item.itemName);

              // Strip notes display from internal [Progres] prefix tag
              const displayNotes = (item.notes || "")
                .replace(/^\[Progres\]\s*/i, "")
                .replace(/^\[Progress\]\s*/i, "")
                .trim();

              return (
                <React.Fragment key={item.itemName}>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Item Name */}
                    <td className="py-4 px-4 font-sans font-bold text-slate-800">
                      {item.itemName}
                    </td>

                    {/* Quantity */}
                    <td className="py-4 px-4 font-mono font-medium text-slate-500">
                      {qty}
                    </td>

                    {/* Status Pill Toggles */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 w-fit">
                        {/* Belum Toggle Button */}
                        <button
                          onClick={() => handleSetStatusState(item, "Belum")}
                          disabled={isUpdating}
                          className={`px-3 py-1 rounded text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                            statusState === "Belum"
                              ? "bg-red-500 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-200/50"
                          }`}
                        >
                          Belum
                        </button>

                        {/* Progres Toggle Button */}
                        <button
                          onClick={() => handleSetStatusState(item, "Progres")}
                          disabled={isUpdating}
                          className={`px-3 py-1 rounded text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                            statusState === "Progres"
                              ? "bg-blue-500 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-200/50"
                          }`}
                        >
                          Progres
                        </button>

                        {/* Siap Toggle Button */}
                        <button
                          onClick={() => handleSetStatusState(item, "Siap")}
                          disabled={isUpdating}
                          className={`px-3 py-1 rounded text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                            statusState === "Siap"
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-200/50"
                          }`}
                        >
                          Siap
                        </button>
                      </div>
                    </td>

                    {/* PIC Selector */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <div className="relative">
                          <select
                            value={item.pic || "Belum Ada"}
                            onChange={(e) => handleAssignPIC(item, e.target.value)}
                            disabled={isUpdating}
                            className="bg-white text-slate-700 border border-slate-200 text-xs rounded-lg px-2 py-1 outline-none focus:border-amber-500 cursor-pointer disabled:opacity-50 appearance-none pr-8 min-w-[140px] shadow-sm font-medium"
                          >
                            <option value="Belum Ada">-- Pilih PIC --</option>
                            {MEMBERS.map((member) => (
                              <option key={member} value={member}>
                                {member}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">
                            ▼
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Notes Detail View/Edit trigger */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-between space-x-2 group">
                        <div className="truncate flex-1 max-w-[200px]">
                          {displayNotes ? (
                            <span className="text-slate-600 font-sans italic">{displayNotes}</span>
                          ) : (
                            <span className="text-slate-300 italic">Klik pensil untuk menulis catatan...</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          {isUpdating ? (
                            <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <button
                              onClick={() => startEditNote(item, index)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              title="Tulis Catatan"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                  </tr>

                  {/* Expanded inline note editor */}
                  {isEditingNotes && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={5} className="py-3 px-4 border-t border-slate-100">
                        <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex flex-col space-y-2 max-w-xl">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Tulis Catatan / Keterangan:</span>
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Klik untuk tulis catatan..."
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-2.5 py-1.5 rounded outline-none focus:border-amber-500"
                          />
                          <div className="flex justify-end space-x-1.5">
                            <button
                              onClick={() => setEditingNotesIndex(null)}
                              className="px-2.5 py-1 text-[10px] font-sans font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => saveNote(item)}
                              className="px-2.5 py-1 text-[10px] font-sans font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all cursor-pointer shadow-sm"
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
