/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Tent, 
  Compass, 
  RefreshCw, 
  LogOut, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  PlusCircle, 
  ShieldAlert, 
  Users, 
  UserCheck, 
  BookOpen, 
  Download,
  AlertCircle,
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  FileText
} from "lucide-react";
import { IndividualItem, TeamItem, MEMBERS, MemberName, INDIVIDUAL_ITEMS_TEMPLATE, TEAM_ITEMS_TEMPLATE } from "./types";
import MemberReadiness from "./components/MemberReadiness";
import TeamReadiness from "./components/TeamReadiness";

interface LocalUser {
  username: string;
  displayName: string;
  role: string;
}

export default function App() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sheets data states
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [individualItems, setIndividualItems] = useState<IndividualItem[]>([]);
  const [teamItems, setTeamItems] = useState<TeamItem[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [initializingSpreadsheet, setInitializingSpreadsheet] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced");
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("");

  // Navigation: "dashboard" | "regu" | "individu"
  const [activeTab, setActiveTab] = useState<"dashboard" | "regu" | "individu">("dashboard");
  const [selectedMember, setSelectedMember] = useState<MemberName>("Rovi");

  // App Script Config Drawer Toggles
  const [showConfig, setShowConfig] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Technical guide modal
  const [showTechnicalGuide, setShowTechnicalGuide] = useState(false);

  // Initialize Auth on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("kembara_logged_in") === "true";
    if (isLoggedIn) {
      setUser({
        username: "cm3105",
        displayName: "CM3105 Member",
        role: "Regu"
      });
      setNeedsAuth(false);
      loadLocalData();
    } else {
      setNeedsAuth(true);
    }
    // Initialize synced timestamp
    const now = new Date();
    setLastSyncedTime(now.toTimeString().split(' ')[0]);
  }, []);

  const loadLocalData = () => {
    setIsLoadingData(true);
    setError(null);
    try {
      // 1. Individual Items
      const storedIndividual = localStorage.getItem("kembara_individual_items");
      if (storedIndividual) {
        setIndividualItems(JSON.parse(storedIndividual));
      } else {
        // Initialize default individual items for ALL 6 MEMBERS
        const defaultIndItems: IndividualItem[] = [];
        let indexCounter = 2;
        MEMBERS.forEach(member => {
          INDIVIDUAL_ITEMS_TEMPLATE.forEach(template => {
            defaultIndItems.push({
              user: member,
              category: template.category,
              subcategory: template.subcategory,
              itemName: template.itemName,
              status: false,
              notes: "",
              lastUpdated: "",
              rowIndex: indexCounter++
            });
          });
        });
        setIndividualItems(defaultIndItems);
        localStorage.setItem("kembara_individual_items", JSON.stringify(defaultIndItems));
      }

      // 2. Team Items
      const storedTeam = localStorage.getItem("kembara_team_items");
      if (storedTeam) {
        setTeamItems(JSON.parse(storedTeam));
      } else {
        const defaultTeamItems: TeamItem[] = TEAM_ITEMS_TEMPLATE.map((template, idx) => ({
          itemName: template.itemName,
          status: false,
          pic: "Belum Ada",
          notes: template.notes,
          lastUpdated: "",
          rowIndex: idx + 2
        }));
        setTeamItems(defaultTeamItems);
        localStorage.setItem("kembara_team_items", JSON.stringify(defaultTeamItems));
      }
      setSyncStatus("synced");
      setLastSyncedTime(new Date().toTimeString().split(' ')[0]);
    } catch (err) {
      console.error("Failed to load local data:", err);
      setError("Gagal memuat data lokal.");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Keep loadSpreadsheetData as an alias for compatibility with refresh buttons
  const loadSpreadsheetData = () => {
    loadLocalData();
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    setError(null);
    
    // Artificial slight delay for organic feedback feel
    await new Promise(resolve => setTimeout(resolve, 500));

    if (usernameInput.trim() === "cm3105" && passwordInput === "kembara") {
      localStorage.setItem("kembara_logged_in", "true");
      setUser({
        username: "cm3105",
        displayName: "CM3105 Member",
        role: "Regu"
      });
      setNeedsAuth(false);
      
      // Load data
      const storedIndividual = localStorage.getItem("kembara_individual_items");
      const storedTeam = localStorage.getItem("kembara_team_items");
      if (storedIndividual) {
        setIndividualItems(JSON.parse(storedIndividual));
      } else {
        const defaultIndItems: IndividualItem[] = [];
        let indexCounter = 2;
        MEMBERS.forEach(member => {
          INDIVIDUAL_ITEMS_TEMPLATE.forEach(template => {
            defaultIndItems.push({
              user: member,
              category: template.category,
              subcategory: template.subcategory,
              itemName: template.itemName,
              status: false,
              notes: "",
              lastUpdated: "",
              rowIndex: indexCounter++
            });
          });
        });
        setIndividualItems(defaultIndItems);
        localStorage.setItem("kembara_individual_items", JSON.stringify(defaultIndItems));
      }

      if (storedTeam) {
        setTeamItems(JSON.parse(storedTeam));
      } else {
        const defaultTeamItems: TeamItem[] = TEAM_ITEMS_TEMPLATE.map((template, idx) => ({
          itemName: template.itemName,
          status: false,
          pic: "Belum Ada",
          notes: template.notes,
          lastUpdated: "",
          rowIndex: idx + 2
        }));
        setTeamItems(defaultTeamItems);
        localStorage.setItem("kembara_team_items", JSON.stringify(defaultTeamItems));
      }
      setSyncStatus("synced");
      setLastSyncedTime(new Date().toTimeString().split(' ')[0]);
    } else {
      setLoginError("Username atau Password salah!");
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem("kembara_logged_in");
    setUser(null);
    setIndividualItems([]);
    setTeamItems([]);
    setNeedsAuth(true);
  };

  // Update handler for individual items
  const handleUpdateIndividualItem = async (updatedItem: IndividualItem) => {
    const itemKey = `${updatedItem.user}-${updatedItem.itemName}`;
    setUpdatingItemId(itemKey);
    setSyncStatus("syncing");
    try {
      const newItems = individualItems.map(item => 
        (item.user === updatedItem.user && item.itemName === updatedItem.itemName) ? updatedItem : item
      );
      setIndividualItems(newItems);
      localStorage.setItem("kembara_individual_items", JSON.stringify(newItems));
      setSyncStatus("synced");
      setLastSyncedTime(new Date().toTimeString().split(' ')[0]);
    } catch (err) {
      console.error("Failed to update individual item:", err);
      setSyncStatus("error");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Update handler for team items
  const handleUpdateTeamItem = async (updatedItem: TeamItem) => {
    setUpdatingItemId(updatedItem.itemName);
    setSyncStatus("syncing");
    try {
      const newItems = teamItems.map(item => 
        item.itemName === updatedItem.itemName ? updatedItem : item
      );
      setTeamItems(newItems);
      localStorage.setItem("kembara_team_items", JSON.stringify(newItems));
      setSyncStatus("synced");
      setLastSyncedTime(new Date().toTimeString().split(' ')[0]);
    } catch (err) {
      console.error("Failed to update team item:", err);
      setSyncStatus("error");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Progress Calculations
  const totalIndividualChecked = individualItems.filter(i => i.status).length;
  const totalIndividualCount = individualItems.length;
  const totalIndividualPercentage = totalIndividualCount > 0 
    ? Math.round((totalIndividualChecked / totalIndividualCount) * 100) 
    : 0;

  const totalTeamChecked = teamItems.filter(t => t.status).length;
  const totalTeamCount = teamItems.length;
  const totalTeamPercentage = totalTeamCount > 0 
    ? Math.round((totalTeamChecked / totalTeamCount) * 100) 
    : 0;

  // Siap Tempur overall calculation: simple average of team and individual percentages
  const overallReadyPercentage = Math.round((totalIndividualPercentage + totalTeamPercentage) / 2);

  // Copy Apps Script template to clipboard
  const copyAppsScript = () => {
    const code = `/**
 * Google Apps Script to Sync Sheets updates in Real-time to Kembara Dashboard Webhook
 * Paste this in Extension -> Apps Script of your spreadsheet
 */
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var sheetName = sheet.getName();
  
  // Only trigger on 'Individu' and 'Regu' sheets
  if (sheetName !== "Individu" && sheetName !== "Regu") return;
  
  var range = e.range;
  var row = range.getRow();
  
  // Skip headers
  if (row < 2) return;
  
  // Trigger update webhook to clear dashboard cache
  var url = "${window.location.origin}/api/webhook-sync";
  var payload = {
    "spreadsheetId": e.source.getId(),
    "sheetName": sheetName,
    "row": row
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  try {
    UrlFetchApp.fetch(url, options);
  } catch(err) {
    Logger.log("Webhook failed: " + err.toString());
  }
}`;
    navigator.clipboard.writeText(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Render Login State
  if (needsAuth) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans flex flex-col justify-between p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="my-auto flex flex-col items-center justify-center max-w-md w-full mx-auto relative z-10">
          {/* Compass Logo Container */}
          <div className="w-20 h-20 bg-[#0B1530] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-950/10 border border-blue-900/10">
            <Compass className="w-10 h-10 text-white animate-spin" style={{ animationDuration: "35s" }} />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-display font-extrabold tracking-tight text-slate-900">
              KEMBARA MONITORING
            </h1>
            <p className="text-sm font-sans text-blue-800 font-bold tracking-wide mt-2">
              Kemah Bela Negara • Regu CM3105
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-8 rounded-3xl w-full shadow-xl shadow-slate-200/40">
            <h3 className="text-lg font-sans font-extrabold text-slate-800 mb-2 text-center">
              Akses Log Masuk
            </h3>
            <p className="text-slate-500 text-xs text-center mb-6 leading-relaxed">
              Silakan masukkan Username dan Password Anda untuk memantau dan mengelola kesiapan perlengkapan.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                  Username
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Masukkan username"
                  required
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white text-sm px-4 py-3 rounded-xl outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white text-sm px-4 py-3 rounded-xl outline-none transition-all duration-200"
                />
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span className="font-semibold text-left">{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#0B1530] hover:bg-blue-900 active:scale-[0.99] text-white font-sans font-bold text-sm py-3.5 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white/80" />
                    <span>Memproses Masuk...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>


          </div>

          <div className="mt-6 text-center text-xs text-slate-400 font-mono">
            <span>Personel Terdaftar: </span>
            <div className="flex flex-wrap justify-center gap-1.5 mt-2 max-w-sm">
              {MEMBERS.map(m => (
                <span key={m} className="bg-white border border-slate-200/60 shadow-xs px-2.5 py-0.5 rounded-full text-slate-500 font-sans text-[11px]">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400 font-mono mt-6">
          © 2026 KEMBARA MONITORING SYSTEM • CM3105
        </div>
      </div>
    );
  }

  // Handle switching to a specific member checklist from the dashboard cards
  const viewMemberDetails = (member: MemberName) => {
    setSelectedMember(member);
    setActiveTab("individu");
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans pb-32 relative">
      
      {/* 1. MAIN GRADIENT NAVY HEADER (MATCHING THE REFERENCE IMAGES EXACTLY) */}
      <header className="bg-gradient-to-r from-[#0a1023] via-[#0d1736] to-[#0a1023] text-white py-6 px-4 md:px-8 border-b border-slate-850 relative shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            {/* Round Blue Logo container */}
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg border border-blue-400/20 mt-1 flex-shrink-0">
              <Compass className="w-6 h-6 text-white animate-spin" style={{ animationDuration: "60s" }} />
            </div>
            
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1.5 mb-1.5">
                <span className="text-[10px] font-sans font-bold tracking-wide uppercase bg-blue-900/80 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-700/40">
                  VARIAN LEADERSHIP
                </span>
                <span className="text-[10px] font-sans font-medium tracking-wide bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700/40">
                  Group CM3105
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-white uppercase">
                KEMBARA MONITORING
              </h1>
              <p className="text-slate-400 text-xs md:text-sm font-sans mt-0.5 font-medium">
                Group CM3105 • Kemah Bela Negara Readiness
              </p>
            </div>
          </div>

          {/* Right Profile / Access indicator */}
          {user && (
            <div className="flex items-center space-x-3 bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-1.5 pr-3.5 rounded-full self-start md:self-center">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-slate-700" />
              ) : (
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                  {user.email?.substring(0, 1).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <span className="text-xs text-white font-sans font-medium block leading-tight">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Google Account Active
                </span>
              </div>
              <div className="w-[1px] h-5 bg-slate-800" />
              <button
                onClick={handleLogout}
                className="p-1 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-full transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. SUB NAV BAR (LIGHT SLATE) */}
      <div className="bg-[#EAEDF4] border-b border-slate-200 sticky top-0 z-30 shadow-sm px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between py-2.5 gap-3">
          {/* Main Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition-all duration-250 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Dashboard Kelompok</span>
            </button>
            
            <button
              onClick={() => setActiveTab("regu")}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition-all duration-250 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "regu"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Tent className="w-3.5 h-3.5 text-indigo-600" />
              <span>Perlengkapan Regu</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 ${
                activeTab === "regu" ? "bg-indigo-100 text-indigo-700" : "bg-slate-300/60 text-slate-700"
              }`}>
                {totalTeamChecked}/11
              </span>
            </button>

            <button
              onClick={() => setActiveTab("individu")}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition-all duration-250 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "individu"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Persiapan Individu</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 self-end sm:self-center">
            <button
              onClick={() => setShowTechnicalGuide(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm transition-all text-xs font-bold font-sans flex items-center space-x-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Petunjuk Teknis PDF</span>
            </button>

            <button
              onClick={loadSpreadsheetData}
              disabled={isLoadingData}
              className="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center cursor-pointer"
              title="Refresh / Tarik data terbaru"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoadingData ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTAINER CONTENT */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        
        {/* Error Notification banner if any */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start space-x-3 shadow-sm animate-pulse">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <h5 className="font-bold text-red-800">Terjadi Kendala Sinkronisasi</h5>
              <p className="text-xs text-red-700/90 mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-xs font-semibold underline hover:text-red-900"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Tab content rendering loader */}
        {isLoadingData ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-mono text-xs tracking-widest uppercase">
              Sinkronisasi data Google Sheets ...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* TAB 1: DASHBOARD KELOMPOK (IMAGE 3) */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Banner Card Premium Dark */}
                  <div className="bg-gradient-to-br from-[#0c183e] to-[#0a1128] border border-blue-900/30 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
                      
                      {/* Banner Left Info */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                          <span className="text-[10px] font-sans font-bold tracking-wide uppercase bg-blue-900/60 text-blue-200 border border-blue-700/50 px-3 py-1 rounded-full">
                            Status Kesiapan Regu CM3105
                          </span>
                          <span className="text-[10px] font-sans font-bold tracking-wide uppercase bg-red-950/60 text-red-300 border border-red-700/50 px-3 py-1 rounded-full flex items-center">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-ping" />
                            T-MINUS 3 HARI
                          </span>
                        </div>
                        
                        <div>
                          <h2 className="text-3xl font-display font-extrabold tracking-tight">
                            Kesiapan Tempur
                          </h2>
                          <h3 className="text-xl font-display font-bold text-blue-400 mt-0.5">
                            KEMBARA <span className="text-[#00d2ff]">Varian Leadership</span>
                          </h3>
                        </div>

                        <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl font-sans">
                          Berikut adalah ringkasan kesiapan perlengkapan pokok dan sekunder untuk 6 personel regu serta peralatan regu bersama. Pastikan semua perlengkapan terchecklist 100% sebelum hari keberangkatan!
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <div className="flex items-center space-x-1.5 bg-slate-900/40 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 font-medium">
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                            <span>6 Anggota Kelompok</span>
                          </div>
                          <div className="flex items-center space-x-1.5 bg-slate-900/40 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 font-medium">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>39 Perlengkapan Individu / Org</span>
                          </div>
                          <div className="flex items-center space-x-1.5 bg-slate-900/40 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 font-medium">
                            <Tent className="w-3.5 h-3.5 text-amber-400" />
                            <span>11 Peralatan Regu Utama</span>
                          </div>
                        </div>
                      </div>

                      {/* Banner Right Gauge Visual */}
                      <div className="flex flex-col items-center justify-center bg-slate-950/40 border border-blue-950/50 p-6 rounded-2xl text-center self-stretch">
                        <div className="relative flex items-center justify-center w-32 h-32 mb-4">
                          {/* Circle Progress Bar SVG */}
                          <svg className="absolute w-full h-full transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              className="stroke-slate-800"
                              strokeWidth="8"
                              fill="transparent"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              className="stroke-blue-500"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 56}`}
                              strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallReadyPercentage / 100)}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="flex flex-col items-center justify-center z-10">
                            <span className="text-3xl font-display font-black tracking-tight leading-none text-white">{overallReadyPercentage}%</span>
                            <span className="text-[9px] font-mono font-semibold text-blue-300 tracking-wider uppercase mt-1">SIAP TEMPUR</span>
                          </div>
                        </div>

                        <div className="w-full space-y-1.5 text-xs text-slate-300 font-sans border-t border-slate-900 pt-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Peralatan Regu:</span>
                            <span className="font-mono font-bold text-[#00d2ff]">{totalTeamPercentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Rata-rata Individu:</span>
                            <span className="font-mono font-bold text-[#00d2ff]">{totalIndividualPercentage}%</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Section Title */}
                  <div className="space-y-1">
                    <h3 className="text-slate-600 font-display font-bold text-xs uppercase tracking-wider flex items-center">
                      <Users className="w-4 h-4 text-blue-600 mr-1.5" />
                      KESIAPAN PERLENGKAPAN ANGGOTA REGU (KLIK UNTUK DETAIL)
                    </h3>
                  </div>

                  {/* 6 Member Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    {MEMBERS.map((member, i) => {
                      const memberItems = individualItems.filter(item => item.user === member);
                      const checked = memberItems.filter(item => item.status).length;
                      const pct = memberItems.length > 0 ? Math.round((checked / memberItems.length) * 100) : 0;
                      
                      // Circle avatars colors cycle
                      const colors = [
                        "bg-blue-600/10 text-blue-600 border-blue-500/20",
                        "bg-purple-600/10 text-purple-600 border-purple-500/20",
                        "bg-pink-600/10 text-pink-600 border-pink-500/20",
                        "bg-indigo-600/10 text-indigo-600 border-indigo-500/20",
                        "bg-teal-600/10 text-teal-600 border-teal-500/20",
                        "bg-emerald-600/10 text-emerald-600 border-emerald-500/20",
                      ];
                      
                      const colorClass = colors[i % colors.length];

                      return (
                        <div
                          key={member}
                          onClick={() => viewMemberDetails(member)}
                          className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:border-blue-400/50 cursor-pointer transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <div className="truncate">
                              <h4 className="font-sans font-bold text-slate-800 text-sm block leading-tight truncate">
                                {member}
                              </h4>
                              <p className="text-slate-500 text-[10px] font-mono mt-0.5 leading-none">
                                {checked} dari {memberItems.length || 39} item
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span className="text-xs font-mono font-extrabold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded leading-none">
                              {pct}%
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 mt-1 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Row: Peralatan Regu Bersama */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                      <div>
                        <h4 className="font-sans font-extrabold text-slate-800 text-base flex items-center">
                          <Tent className="w-4 h-4 text-blue-600 mr-2" />
                          Peralatan Regu Bersama
                        </h4>
                        <p className="text-xs text-slate-500">Kebutuhan logistik kemah kelompok</p>
                      </div>
                      
                      <button
                        onClick={() => setActiveTab("regu")}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center cursor-pointer bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <span>Kelola Peralatan Regu</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>

                    <div className="text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-lg inline-block font-mono">
                      Progres Kesiapan Tenda & Perlengkapan: <strong className="text-slate-800 font-bold">{totalTeamChecked} dari 11 Terpenuhi</strong>
                    </div>

                    {/* Team Items Preview Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                      {teamItems.map((item) => (
                        <div key={item.itemName} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                          <span className="text-xs font-sans font-semibold text-slate-700 truncate mr-2" title={item.itemName}>
                            {item.itemName.split("(")[0].trim()}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold flex-shrink-0 ${
                            item.status 
                              ? "bg-emerald-100 text-emerald-800" 
                              : item.notes?.toLowerCase().includes("progres") || item.notes?.toLowerCase().includes("progress")
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                          }`}>
                            {item.status 
                              ? "Siap" 
                              : item.notes?.toLowerCase().includes("progres") || item.notes?.toLowerCase().includes("progress")
                                ? "Progres" 
                                : "Belum Siap"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PERLENGKAPAN REGU (RENDERED VIA COMPONENT, MATCHING IMAGE 1) */}
              {activeTab === "regu" && (
                <TeamReadiness 
                  items={teamItems} 
                  updatingItemId={updatingItemId}
                  onUpdateItem={handleUpdateTeamItem}
                />
              )}

              {/* TAB 3: PERSIAPAN INDIVIDU (RENDERED VIA COMPONENT, MATCHING IMAGE 2) */}
              {activeTab === "individu" && (
                <MemberReadiness 
                  items={individualItems} 
                  updatingItemId={updatingItemId}
                  onUpdateItem={handleUpdateIndividualItem}
                  selectedMember={selectedMember}
                  onSelectMember={setSelectedMember}
                />
              )}

            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* 4. TECHNICAL PDF GUIDE MODAL POPUP */}
      <AnimatePresence>
        {showTechnicalGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-display font-extrabold text-slate-800 text-lg flex items-center">
                  <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                  Petunjuk Teknis PDF - KEMBARA 2026
                </h3>
                <button 
                  onClick={() => setShowTechnicalGuide(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer text-sm font-sans font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs md:text-sm text-slate-600 leading-relaxed max-h-[350px] overflow-y-auto pr-1">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900 flex items-start space-x-3">
                  <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs">
                    Unduh file panduan resmi atau baca ringkasan petunjuk pelaksanaan KEMBARA 2026 di bawah ini untuk memastikan tidak ada kesalahan persiapan taktis.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-800 uppercase font-mono tracking-wide text-[11px]">
                    1. ATURAN PENGEPAKAN BARANG (MANAJEMEN BACKPACK / CARRIER)
                  </h4>
                  <p>
                    Gunakan trash bag (kantong plastik sampah besar) sebagai inner-layer (pelapis utama) di dalam carrier ransel untuk menghindari rembesan air hujan. Seluruh pakaian cadangan, pakaian tidur, dan logistik kertas wajib dimasukkan ke plastik obat/ziplock agar kedap air 100%.
                  </p>

                  <h4 className="font-extrabold text-slate-800 uppercase font-mono tracking-wide text-[11px]">
                    2. PROTOKOL KESEHATAN & OBAT PRIBADI
                  </h4>
                  <p>
                    Setiap personel bertanggung jawab atas obat khususnya (asma, alergi dingin, kram, lambung). Tim medis regu hanya membekali P3K umum lapangan. Laporkan ke PIC logistik jika memiliki kondisi khusus.
                  </p>

                  <h4 className="font-extrabold text-slate-800 uppercase font-mono tracking-wide text-[11px]">
                    3. LOGISTIK & LOGISTIK MAKANAN
                  </h4>
                  <p>
                    Bawa makanan instan atau praktis yang tahan untuk minimal 2 hari masa kegiatan. Botol minum / tumbler harus dalam kondisi penuh saat memulai perjalanan ke lokasi perkemahan.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400">
                  Panduan versi cetak: v2.4 (Terbit Juni 2026)
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowTechnicalGuide(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-sans rounded-xl transition-all cursor-pointer"
                  >
                    Tutup
                  </button>
                  <a
                    href="https://docs.google.com/document/d/e/2PACX-1vSb4nO0b2Y-C7Z8_K75Yqj_Sg6E423p66_sample/pub"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-sans rounded-xl shadow-md transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. BOTTOM LOCAL STORAGE STATUS FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a1023] border-t border-slate-800 text-white shadow-xl px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-900/40 rounded-xl flex items-center justify-center border border-emerald-700/20">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-sans font-bold text-white tracking-wide block">
                Sistem Penyimpanan Lokal Aktif
              </span>
              <p className="text-[10px] text-slate-400 font-sans">
                Seluruh pembaruan checklist disimpan secara otomatis di peramban (browser) perangkat ini.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (window.confirm("Apakah Anda yakin ingin mengatur ulang semua data checklist kembali ke setelan awal? Tindakan ini tidak dapat dibatalkan.")) {
                  localStorage.removeItem("kembara_individual_items");
                  localStorage.removeItem("kembara_team_items");
                  loadLocalData();
                }
              }}
              className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white rounded-xl border border-red-900/30 text-xs font-bold transition-all cursor-pointer"
            >
              Atur Ulang Data
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Synced Timestamp Indicator (Matches far bottom right) */}
      <div className="fixed bottom-20 right-4 md:right-8 z-40 bg-[#0e162d] border border-emerald-500/30 text-white rounded-full py-1.5 px-3 shadow-lg flex items-center space-x-2 text-xs font-mono font-bold">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Synced ({lastSyncedTime || "Ready"})</span>
      </div>

    </div>
  );
}
