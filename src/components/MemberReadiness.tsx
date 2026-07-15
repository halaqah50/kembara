import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckSquare, 
  Square, 
  Search, 
  Edit2, 
  Check, 
  X, 
  Clock, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import { IndividualItem, MEMBERS, MemberName } from "../types";

interface MemberReadinessProps {
  items: IndividualItem[];
  updatingItemId: string | null;
  onUpdateItem: (item: IndividualItem) => Promise<void>;
  selectedMember: MemberName;
  onSelectMember: (member: MemberName) => void;
}

// Utility to parse quantity out of parentheses at the end of the item name
function parseItemQty(name: string) {
  const match = name.match(/\(([^)]+)\)$/);
  if (match) {
    const qty = match[1];
    // Remove the trailing quantity and parentheses
    const cleanName = name.replace(/\s*\([^)]+\)$/, "").trim();
    return { cleanName, qty };
  }
  return { cleanName: name, qty: null };
}

export default function MemberReadiness({ 
  items, 
  updatingItemId, 
  onUpdateItem,
  selectedMember,
  onSelectMember
}: MemberReadinessProps) {
  
  // Note editing states
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"semua" | "pokok" | "sekunder">("semua");

  // Get active items for currently selected member
  const memberItems = items.filter((item) => {
    // Graceful mapping for Erwy/Erwin if any sheet mismatches exist
    const isTarget = item.user === selectedMember || 
                     (selectedMember as string === "Erwin" && item.user === "Erwy") ||
                     (selectedMember as string === "Erwy" && item.user === "Erwin");
    return isTarget;
  });

  const totalItemsCount = memberItems.length;
  const readyItemsCount = memberItems.filter((item) => item.status).length;
  const readyPercentage = totalItemsCount > 0 ? Math.round((readyItemsCount / totalItemsCount) * 100) : 0;

  // Filter items based on Category Filter and Search Query
  const filteredItems = memberItems.filter((item) => {
    // 1. Category Filter
    if (activeFilter === "pokok" && item.category !== "Pokok") return false;
    if (activeFilter === "sekunder" && item.category !== "Sekunder") return false;

    // 2. Search Query
    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();
      const nameLower = item.itemName.toLowerCase();
      const subcatLower = item.subcategory.toLowerCase();
      const notesLower = (item.notes || "").toLowerCase();
      return nameLower.includes(searchLower) || subcatLower.includes(searchLower) || notesLower.includes(searchLower);
    }

    return true;
  });

  // Toggle checklist status
  const handleToggleStatus = async (item: IndividualItem) => {
    const updated: IndividualItem = {
      ...item,
      status: !item.status,
      lastUpdated: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    };
    await onUpdateItem(updated);
  };

  // Note editing actions
  const startEditNote = (item: IndividualItem) => {
    setEditingNotesId(`${item.user}-${item.itemName}`);
    setNoteText(item.notes || "");
  };

  const saveNote = async (item: IndividualItem) => {
    const updated: IndividualItem = {
      ...item,
      notes: noteText,
      lastUpdated: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    };
    await onUpdateItem(updated);
    setEditingNotesId(null);
  };

  // Subcategory totals for core items
  const getSubcategoryTotals = (subcategoryName: string) => {
    const subItems = memberItems.filter(item => item.subcategory === subcategoryName);
    const subReady = subItems.filter(item => item.status).length;
    return { ready: subReady, total: subItems.length };
  };

  // Groups for 2-column layout
  const coreSubcategories = [
    "Perlengkapan Dasar",
    "Pakaian",
    "Makan dan Minum",
    "Bacaan, Dokumen, Alat Tulis",
    "Perlengkapan Mandi"
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. MEMBER SELECTION SUB-BAR (MATCHING IMAGE 2 EXACTLY) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <span className="text-[10px] font-sans font-extrabold text-slate-400 tracking-wider uppercase block mb-3">
          PILIH ANGGOTA:
        </span>
        
        <div className="flex flex-wrap gap-2">
          {MEMBERS.map((member) => {
            const isSelected = selectedMember === member;
            const mItems = items.filter(i => i.user === member || (member === "Erwin" && i.user === "Erwy"));
            const mReady = mItems.filter(i => i.status).length;
            const mPct = mItems.length > 0 ? Math.round((mReady / mItems.length) * 100) : 0;

            return (
              <button
                key={member}
                onClick={() => {
                  onSelectMember(member);
                  setEditingNotesId(null);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold font-sans tracking-wide transition-all flex items-center space-x-2 border cursor-pointer ${
                  isSelected
                    ? "bg-[#5D5FEF] text-white border-[#5D5FEF] shadow-sm font-extrabold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-white animate-pulse" : "bg-slate-300"}`} />
                <span>{member}</span>
                <span className={`text-[10px] font-mono leading-none px-1.5 py-0.5 rounded ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600 font-bold"
                }`}>
                  {mPct}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ACTIVE MEMBER HEADER CARD (MATCHING IMAGE 2) */}
      <div className="bg-gradient-to-r from-[#0d1630] to-[#14234c] border border-blue-900/20 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl md:text-2xl font-display font-extrabold tracking-tight">
              Persiapan {selectedMember}
            </h2>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-500/20 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Pribadi
            </span>
          </div>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl font-sans">
            Silakan checklist barang-barang yang sudah dimasukkan ke dalam ransel (carrier)
          </p>
        </div>

        {/* Packing Progress Bar */}
        <div className="w-full md:w-64 flex-shrink-0 bg-slate-900/60 border border-blue-950 p-4 rounded-xl text-xs">
          <div className="flex justify-between items-center mb-1.5 font-bold">
            <span className="text-slate-400 font-sans uppercase text-[10px] tracking-wide">Progres Pengemasan</span>
            <span className="font-mono text-blue-300 text-xs">{readyItemsCount} / {totalItemsCount} Item ({readyPercentage}%)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/50 shadow-inner">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${readyPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & CATEGORY QUICK FILTERS (MATCHING IMAGE 2) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari perlengkapan pribadi ${selectedMember}...`}
            className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-blue-500 transition-all font-medium shadow-inner"
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

        {/* Category Filters Pill Group */}
        <div className="flex items-center space-x-1.5 bg-slate-100 border border-slate-200/50 p-1 rounded-xl self-start md:self-center">
          <button
            onClick={() => setActiveFilter("semua")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "semua"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua ({totalItemsCount})
          </button>
          <button
            onClick={() => setActiveFilter("pokok")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "pokok"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Peralatan Pokok ({memberItems.filter(i => i.category === "Pokok").length})
          </button>
          <button
            onClick={() => setActiveFilter("sekunder")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "sekunder"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Peralatan Sekunder ({memberItems.filter(i => i.category === "Sekunder").length})
          </button>
        </div>
      </div>

      {/* 4. TWO-COLUMN LAYOUT FOR CHECKLIST ITEMS (MATCHING IMAGE 2 EXACTLY) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* COLUMN 1: PERALATAN POKOK (WAJIB UTAMA) */}
        {(activeFilter === "semua" || activeFilter === "pokok") && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2.5">
              <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
              <h3 className="text-slate-800 font-sans font-extrabold text-sm uppercase tracking-wider">
                PERALATAN POKOK (WAJIB UTAMA)
              </h3>
            </div>

            {coreSubcategories.map((subcat) => {
              const subcatItems = filteredItems.filter(
                (item) => item.category === "Pokok" && (
                  item.subcategory.toLowerCase() === subcat.toLowerCase() ||
                  (subcat === "Makan dan Minum" && item.subcategory.toLowerCase() === "makan dan minum") ||
                  (subcat === "Bacaan, Dokumen, Alat Tulis" && item.subcategory.toLowerCase() === "bacaan, dokumen, alat tulis") ||
                  (subcat === "Perlengkapan Mandi" && item.subcategory.toLowerCase() === "perlengkapan mandi")
                )
              );

              if (subcatItems.length === 0) return null;
              
              // Get actual totals for progress tracking
              const totals = getSubcategoryTotals(subcat);

              return (
                <div key={subcat} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-1">
                    <h4 className="text-xs font-sans font-extrabold text-slate-700 uppercase tracking-wider">
                      {subcat}
                    </h4>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {totals.ready} / {totals.total} Siap
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {subcatItems.map((item) => {
                      const itemKey = `${item.user}-${item.itemName}`;
                      const isUpdating = updatingItemId === itemKey;
                      const isEditingNotes = editingNotesId === itemKey;
                      const { cleanName, qty } = parseItemQty(item.itemName);

                      return (
                        <div key={item.itemName} className="py-2.5 flex flex-col transition-all duration-200 first:pt-0">
                          <div className="flex items-start justify-between space-x-3 group">
                            
                            {/* Checkbox and text label */}
                            <div className="flex items-start space-x-3 flex-1">
                              <button
                                onClick={() => handleToggleStatus(item)}
                                disabled={isUpdating}
                                className={`flex-shrink-0 mt-0.5 transition-all duration-150 cursor-pointer text-slate-400 hover:text-blue-600 disabled:opacity-50`}
                              >
                                {item.status ? (
                                  <CheckSquare className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-300" />
                                )}
                              </button>

                              <div className="flex-1">
                                <span
                                  onClick={() => handleToggleStatus(item)}
                                  className={`text-xs font-sans font-medium cursor-pointer select-none transition-colors leading-relaxed block ${
                                    item.status ? "text-slate-400 line-through" : "text-slate-700"
                                  }`}
                                >
                                  {cleanName}
                                </span>

                                {/* Display note if exists and not editing */}
                                {!isEditingNotes && item.notes && (
                                  <p className="mt-1 text-[11px] text-slate-500 italic font-sans leading-normal">
                                    {item.notes}
                                  </p>
                                )}

                                {/* Last Updated display */}
                                {item.lastUpdated && (
                                  <span className="text-[9px] font-mono text-slate-400 block mt-1">
                                    Last Update: {item.lastUpdated}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Item Quantity and Notes actions */}
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {qty && (
                                <span className="text-[10px] font-sans font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">
                                  {qty}
                                </span>
                              )}

                              <div className="w-6 flex justify-end">
                                {isUpdating ? (
                                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                ) : !isEditingNotes ? (
                                  <button
                                    onClick={() => startEditNote(item)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                                    title="Edit Catatan"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : null}
                              </div>
                            </div>

                          </div>

                          {/* Inline Notes Edit Form */}
                          {isEditingNotes && (
                            <div className="mt-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col space-y-2">
                              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Tulis Catatan / Keterangan:</span>
                              <input
                                type="text"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Klik untuk tulis catatan..."
                                className="w-full bg-white border border-slate-200 text-slate-800 text-xs px-2.5 py-1.5 rounded outline-none focus:border-blue-500"
                              />
                              <div className="flex justify-end space-x-1.5">
                                <button
                                  onClick={() => setEditingNotesId(null)}
                                  className="px-2.5 py-1 text-[10px] font-sans font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer"
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => saveNote(item)}
                                  className="px-2.5 py-1 text-[10px] font-sans font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all cursor-pointer shadow-sm"
                                >
                                  Simpan
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* COLUMN 2: PERALATAN SEKUNDER (PENDUKUNG) */}
        {(activeFilter === "semua" || activeFilter === "sekunder") && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2.5">
              <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
              <h3 className="text-slate-800 font-sans font-extrabold text-sm uppercase tracking-wider">
                PERALATAN SEKUNDER (PENDUKUNG)
              </h3>
            </div>

            {/* Perlengkapan Sekunder list */}
            {(() => {
              const secItems = filteredItems.filter((item) => item.category === "Sekunder");
              if (secItems.length === 0) return null;
              
              const secReady = secItems.filter(item => item.status).length;

              return (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-1">
                    <h4 className="text-xs font-sans font-extrabold text-slate-700 uppercase tracking-wider">
                      Perlengkapan Sekunder
                    </h4>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {secReady} / {secItems.length} Siap
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {secItems.map((item) => {
                      const itemKey = `${item.user}-${item.itemName}`;
                      const isUpdating = updatingItemId === itemKey;
                      const isEditingNotes = editingNotesId === itemKey;
                      const { cleanName, qty } = parseItemQty(item.itemName);

                      return (
                        <div key={item.itemName} className="py-2.5 flex flex-col transition-all duration-200 first:pt-0">
                          <div className="flex items-start justify-between space-x-3 group">
                            
                            {/* Checkbox and description */}
                            <div className="flex items-start space-x-3 flex-1">
                              <button
                                onClick={() => handleToggleStatus(item)}
                                disabled={isUpdating}
                                className={`flex-shrink-0 mt-0.5 transition-all duration-150 cursor-pointer text-slate-400 hover:text-blue-600 disabled:opacity-50`}
                              >
                                {item.status ? (
                                  <CheckSquare className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-300" />
                                )}
                              </button>

                              <div className="flex-1">
                                <span
                                  onClick={() => handleToggleStatus(item)}
                                  className={`text-xs font-sans font-medium cursor-pointer select-none transition-colors leading-relaxed block ${
                                    item.status ? "text-slate-400 line-through" : "text-slate-700"
                                  }`}
                                >
                                  {cleanName}
                                </span>

                                {!isEditingNotes && item.notes && (
                                  <p className="mt-1 text-[11px] text-slate-500 italic font-sans leading-normal">
                                    {item.notes}
                                  </p>
                                )}

                                {item.lastUpdated && (
                                  <span className="text-[9px] font-mono text-slate-400 block mt-1">
                                    Last Update: {item.lastUpdated}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quantity and Actions */}
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {qty && (
                                <span className="text-[10px] font-sans font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">
                                  {qty}
                                </span>
                              )}

                              <div className="w-6 flex justify-end">
                                {isUpdating ? (
                                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                ) : !isEditingNotes ? (
                                  <button
                                    onClick={() => startEditNote(item)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                                    title="Edit Catatan"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : null}
                              </div>
                            </div>

                          </div>

                          {/* Notes editing block */}
                          {isEditingNotes && (
                            <div className="mt-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col space-y-2">
                              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Tulis Catatan / Keterangan:</span>
                              <input
                                type="text"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Klik untuk tulis catatan..."
                                className="w-full bg-white border border-slate-200 text-slate-800 text-xs px-2.5 py-1.5 rounded outline-none focus:border-blue-500"
                              />
                              <div className="flex justify-end space-x-1.5">
                                <button
                                  onClick={() => setEditingNotesId(null)}
                                  className="px-2.5 py-1 text-[10px] font-sans font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer"
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => saveNote(item)}
                                  className="px-2.5 py-1 text-[10px] font-sans font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all cursor-pointer shadow-sm"
                                >
                                  Simpan
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>

    </div>
  );
}
