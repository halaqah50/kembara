import { IndividualItem, TeamItem, INDIVIDUAL_ITEMS_TEMPLATE, TEAM_ITEMS_TEMPLATE, MEMBERS } from "../types";

/**
 * Searches for a spreadsheet named 'kembara 2026' in Google Drive.
 * Returns the spreadsheet ID if found, otherwise returns null.
 */
export async function findSpreadsheet(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent("name = 'kembara 2026' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
  
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!res.ok) {
      throw new Error(`Failed to search Drive: ${res.statusText}`);
    }
    
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (error) {
    console.error("Error finding spreadsheet:", error);
    throw error;
  }
}

/**
 * Creates a new spreadsheet named 'kembara 2026' with two sheets: 'Individu' and 'Regu'.
 * Populates them with headers and default items for all 6 members.
 */
export async function createAndInitializeSpreadsheet(accessToken: string): Promise<string> {
  const url = "https://sheets.googleapis.com/v4/spreadsheets";
  
  try {
    // 1. Create spreadsheet with custom sheets
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: { title: "kembara 2026" },
        sheets: [
          { properties: { title: "Individu" } },
          { properties: { title: "Regu" } },
        ],
      }),
    });
    
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Failed to create spreadsheet: ${res.statusText} - ${errorBody}`);
    }
    
    const spreadsheet = await res.json();
    const spreadsheetId = spreadsheet.spreadsheetId;
    
    // 2. Prepare Individu sheet data
    const individuRows: any[][] = [
      ["User", "Category", "Subcategory", "Item Name", "Status", "Notes", "Last Updated"]
    ];
    
    for (const member of MEMBERS) {
      for (const item of INDIVIDUAL_ITEMS_TEMPLATE) {
        individuRows.push([
          member,
          item.category,
          item.subcategory,
          item.itemName,
          "FALSE",
          "",
          ""
        ]);
      }
    }
    
    // 3. Prepare Regu sheet data
    const reguRows: any[][] = [
      ["Item Name", "Status", "PIC", "Notes", "Last Updated"]
    ];
    
    for (const item of TEAM_ITEMS_TEMPLATE) {
      reguRows.push([
        item.itemName,
        "FALSE",
        "Belum Ada",
        item.notes,
        ""
      ]);
    }
    
    // 4. Batch update sheets with the data
    const batchUpdateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
    const batchRes = await fetch(batchUpdateUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: [
          {
            range: "Individu!A1",
            values: individuRows,
          },
          {
            range: "Regu!A1",
            values: reguRows,
          }
        ]
      }),
    });
    
    if (!batchRes.ok) {
      throw new Error(`Failed to populate spreadsheet: ${batchRes.statusText}`);
    }
    
    return spreadsheetId;
  } catch (error) {
    console.error("Error creating and initializing spreadsheet:", error);
    throw error;
  }
}

/**
 * Reads all individual items from the spreadsheet.
 */
export async function readIndividualItems(accessToken: string, spreadsheetId: string): Promise<IndividualItem[]> {
  const range = "Individu!A2:G300"; // up to 300 rows (6 * 39 = 234 rows)
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
  
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!res.ok) {
      throw new Error(`Failed to read individual sheet: ${res.statusText}`);
    }
    
    const data = await res.json();
    const rows = data.values || [];
    
    return rows.map((row: any[], index: number) => {
      return {
        user: row[0] || "",
        category: (row[1] as "Pokok" | "Sekunder") || "Pokok",
        subcategory: row[2] || "",
        itemName: row[3] || "",
        status: row[4] === "TRUE",
        notes: row[5] || "",
        lastUpdated: row[6] || "",
        rowIndex: index + 2, // Row index is 1-based, and row index 1 is header, so row starts at index 2
      };
    });
  } catch (error) {
    console.error("Error reading individual items:", error);
    throw error;
  }
}

/**
 * Reads all team items from the spreadsheet.
 */
export async function readTeamItems(accessToken: string, spreadsheetId: string): Promise<TeamItem[]> {
  const range = "Regu!A2:E50"; // up to 50 rows (11 template rows)
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
  
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!res.ok) {
      throw new Error(`Failed to read team sheet: ${res.statusText}`);
    }
    
    const data = await res.json();
    const rows = data.values || [];
    
    return rows.map((row: any[], index: number) => {
      return {
        itemName: row[0] || "",
        status: row[1] === "TRUE",
        pic: row[2] || "Belum Ada",
        notes: row[3] || "",
        lastUpdated: row[4] || "",
        rowIndex: index + 2, // starts at row 2
      };
    });
  } catch (error) {
    console.error("Error reading team items:", error);
    throw error;
  }
}

/**
 * Updates a single individual item row in the spreadsheet.
 */
export async function updateIndividualItem(
  accessToken: string,
  spreadsheetId: string,
  item: IndividualItem
): Promise<void> {
  if (item.rowIndex === undefined) {
    throw new Error("rowIndex is required to update individual item");
  }
  
  const range = `Individu!A${item.rowIndex}:G${item.rowIndex}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
  
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [[
          item.user,
          item.category,
          item.subcategory,
          item.itemName,
          item.status ? "TRUE" : "FALSE",
          item.notes,
          item.lastUpdated
        ]]
      }),
    });
    
    if (!res.ok) {
      throw new Error(`Failed to update individual item: ${res.statusText}`);
    }
  } catch (error) {
    console.error("Error updating individual item:", error);
    throw error;
  }
}

/**
 * Updates a single team item row in the spreadsheet.
 */
export async function updateTeamItem(
  accessToken: string,
  spreadsheetId: string,
  item: TeamItem
): Promise<void> {
  if (item.rowIndex === undefined) {
    throw new Error("rowIndex is required to update team item");
  }
  
  const range = `Regu!A${item.rowIndex}:E${item.rowIndex}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
  
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [[
          item.itemName,
          item.status ? "TRUE" : "FALSE",
          item.pic,
          item.notes,
          item.lastUpdated
        ]]
      }),
    });
    
    if (!res.ok) {
      throw new Error(`Failed to update team item: ${res.statusText}`);
    }
  } catch (error) {
    console.error("Error updating team item:", error);
    throw error;
  }
}
