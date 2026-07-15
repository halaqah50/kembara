import { IndividualItem, TeamItem, INDIVIDUAL_ITEMS_TEMPLATE, TEAM_ITEMS_TEMPLATE, MEMBERS } from "../types";

const APPS_SCRIPT_URL_KEY = "kembara_apps_script_url";

/**
 * Gets the configured Google Apps Script Web App URL from localStorage.
 */
export function getAppsScriptUrl(): string | null {
  return localStorage.getItem(APPS_SCRIPT_URL_KEY);
}

/**
 * Saves the Google Apps Script Web App URL to localStorage.
 */
export function setAppsScriptUrl(url: string): void {
  if (url) {
    localStorage.setItem(APPS_SCRIPT_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(APPS_SCRIPT_URL_KEY);
  }
}

/**
 * Checks if the application is connected to a Google Sheets Apps Script bridge.
 */
export function isSheetsConnected(): boolean {
  const url = getAppsScriptUrl();
  return !!url && url.startsWith("https://script.google.com/");
}

/**
 * Fetches all individual and team checklist items from Google Sheets.
 */
export async function readSheetsData(webAppUrl: string): Promise<{
  individualData: IndividualItem[];
  teamData: TeamItem[];
}> {
  try {
    // Standard Apps Script doGet returns the JSON payload
    const res = await fetch(webAppUrl, {
      method: "GET",
      mode: "cors",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from Apps Script: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.status === "error") {
      throw new Error(data.message || "Unknown Apps Script error");
    }

    return {
      individualData: data.individualData || [],
      teamData: data.teamData || [],
    };
  } catch (error) {
    console.error("Error reading sheets data via Apps Script:", error);
    throw error;
  }
}

/**
 * Updates a single individual item row in the spreadsheet.
 */
export async function updateIndividualItemOnSheet(
  webAppUrl: string,
  item: IndividualItem
): Promise<void> {
  try {
    const res = await fetch(webAppUrl, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // text/plain avoids preflight CORS checks in some legacy envs
      },
      body: JSON.stringify({
        action: "updateIndividual",
        item: item,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update individual item on Sheet: ${res.statusText}`);
    }

    const result = await res.json();
    if (result.status === "error") {
      throw new Error(result.message || "Apps Script rejected individual update");
    }
  } catch (error) {
    console.error("Error updating individual item on Sheet:", error);
    throw error;
  }
}

/**
 * Updates a single team item row in the spreadsheet.
 */
export async function updateTeamItemOnSheet(
  webAppUrl: string,
  item: TeamItem
): Promise<void> {
  try {
    const res = await fetch(webAppUrl, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "updateTeam",
        item: item,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update team item on Sheet: ${res.statusText}`);
    }

    const result = await res.json();
    if (result.status === "error") {
      throw new Error(result.message || "Apps Script rejected team update");
    }
  } catch (error) {
    console.error("Error updating team item on Sheet:", error);
    throw error;
  }
}

/**
 * Initializes the target Google Sheet with headers and all templates.
 */
export async function initializeSheetsOnSpreadsheet(webAppUrl: string): Promise<void> {
  try {
    const res = await fetch(webAppUrl, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "initializeSheets",
        members: MEMBERS,
        indTemplate: INDIVIDUAL_ITEMS_TEMPLATE,
        teamTemplate: TEAM_ITEMS_TEMPLATE,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to initialize Google Sheet: ${res.statusText}`);
    }

    const result = await res.json();
    if (result.status === "error") {
      throw new Error(result.message || "Apps Script rejected sheet initialization");
    }
  } catch (error) {
    console.error("Error initializing Sheet:", error);
    throw error;
  }
}

/**
 * Generated Google Apps Script code that the user needs to paste into their sheet's Apps Script editor.
 */
export function getGeneratedAppsScriptCode(spreadsheetId: string): string {
  return `/**
 * GOOGLE APPS SCRIPT WEB APP FOR KEMBARA MONITORING SYSTEM (CM3105)
 * 
 * SPREADSHEET TARGET:
 * https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Click Extensions -> Apps Script
 * 3. Delete any default code in Code.gs
 * 4. Paste this entire code block
 * 5. Click Save (Disk icon)
 * 6. Click Deploy -> New deployment
 * 7. Choose type: "Web app"
 * 8. Set Configuration:
 *    - Description: "Kembara Realtime Sync"
 *    - Execute as: "Me" (your-email@gmail.com)
 *    - Who has access: "Anyone" (crucial!)
 * 9. Click Deploy, Authorize access, and copy the generated Web App URL!
 * 10. Paste the URL into Kembara Monitoring configuration panel.
 */

const SPREADSHEET_ID = "${spreadsheetId}";

function doGet(e) {
  const originHeader = e && e.parameter && e.parameter.origin;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Read Tab: Individu
    const sheetIndividu = ss.getSheetByName("Individu");
    let individualData = [];
    if (sheetIndividu) {
      const rows = sheetIndividu.getDataRange().getValues();
      // Skip headers (row 0)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue; // Skip empty rows
        individualData.push({
          user: String(row[0] || ""),
          category: String(row[1] || "Pokok"),
          subcategory: String(row[2] || ""),
          itemName: String(row[3] || ""),
          status: row[4] === true || String(row[4]).toUpperCase() === "TRUE" || row[4] === 1,
          notes: String(row[5] || ""),
          lastUpdated: String(row[6] || ""),
          rowIndex: i + 1
        });
      }
    }
    
    // Read Tab: Regu
    const sheetRegu = ss.getSheetByName("Regu");
    let teamData = [];
    if (sheetRegu) {
      const rows = sheetRegu.getDataRange().getValues();
      // Skip headers (row 0)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue; // Skip empty rows
        teamData.push({
          itemName: String(row[0] || ""),
          status: row[1] === true || String(row[1]).toUpperCase() === "TRUE" || row[1] === 1,
          pic: String(row[2] || "Belum Ada"),
          notes: String(row[3] || ""),
          lastUpdated: String(row[4] || ""),
          rowIndex: i + 1
        });
      }
    }
    
    const output = JSON.stringify({
      status: "success",
      individualData: individualData,
      teamData: teamData
    });

    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    const errorOutput = JSON.stringify({
      status: "error",
      message: err.toString()
    });
    return ContentService.createTextOutput(errorOutput)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const action = postData.action;
    
    if (action === "updateIndividual") {
      const sheet = ss.getSheetByName("Individu");
      if (!sheet) throw new Error("Sheet 'Individu' not found");
      
      const item = postData.item;
      const rIdx = item.rowIndex;
      
      // Update specific row: User, Category, Subcategory, Item Name, Status, Notes, Last Updated
      sheet.getRange(rIdx, 1, 1, 7).setValues([[
        item.user,
        item.category,
        item.subcategory,
        item.itemName,
        item.status ? "TRUE" : "FALSE",
        item.notes || "",
        item.lastUpdated || ""
      ]]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "updateTeam") {
      const sheet = ss.getSheetByName("Regu");
      if (!sheet) throw new Error("Sheet 'Regu' not found");
      
      const item = postData.item;
      const rIdx = item.rowIndex;
      
      // Update specific row: Item Name, Status, PIC, Notes, Last Updated
      sheet.getRange(rIdx, 1, 1, 5).setValues([[
        item.itemName,
        item.status ? "TRUE" : "FALSE",
        item.pic || "Belum Ada",
        item.notes || "",
        item.lastUpdated || ""
      ]]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "initializeSheets") {
      // Initialize or seed sheets if they are empty
      let sheetIndividu = ss.getSheetByName("Individu");
      if (!sheetIndividu) {
        sheetIndividu = ss.insertSheet("Individu");
      }
      sheetIndividu.clear();
      sheetIndividu.appendRow(["User", "Category", "Subcategory", "Item Name", "Status", "Notes", "Last Updated"]);
      
      const members = postData.members;
      const indTemplate = postData.indTemplate;
      
      let rowsToAppend = [];
      members.forEach(m => {
        indTemplate.forEach(t => {
          rowsToAppend.push([m, t.category, t.subcategory, t.itemName, "FALSE", "", ""]);
        });
      });
      sheetIndividu.getRange(2, 1, rowsToAppend.length, 7).setValues(rowsToAppend);
      
      let sheetRegu = ss.getSheetByName("Regu");
      if (!sheetRegu) {
        sheetRegu = ss.insertSheet("Regu");
      }
      sheetRegu.clear();
      sheetRegu.appendRow(["Item Name", "Status", "PIC", "Notes", "Last Updated"]);
      
      let teamRows = [];
      postData.teamTemplate.forEach(t => {
        teamRows.push([t.itemName, "FALSE", "Belum Ada", t.notes || "", ""]);
      });
      sheetRegu.getRange(2, 1, teamRows.length, 5).setValues(teamRows);
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    throw new Error("Invalid action: " + action);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
}
