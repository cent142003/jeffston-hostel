/**
 * Public room availability API for jeffstoncourthostel.com.
 *
 * Deploy the Apps Script as a Web app with access set to "Anyone".
 * Then put the deployed /exec URL in index.html:
 *   <section id="rooms" ... data-rooms-api="https://script.google.com/macros/s/.../exec?action=rooms">
 *
 * Expected sheet headers:
 * Room | Type | Occupancy | Rent | Status
 *
 * If your admin script already has doGet(e), copy only the helper functions
 * below and add this route at the top of your existing doGet:
 *   if ((e.parameter.action || "").toLowerCase() === "rooms") return roomsApiResponse_(e);
 */
function doGet(e) {
  if ((e.parameter.action || "").toLowerCase() === "rooms") {
    return roomsApiResponse_(e);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: "Jeffston Court Hostel API" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function roomsApiResponse_(e) {
  const payload = { ok: true, updatedAt: new Date().toISOString(), rooms: getPublicRooms_() };
  const callback = e && e.parameter && e.parameter.callback;

  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(payload)});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getPublicRooms_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const configuredSheetName = PropertiesService.getScriptProperties().getProperty("ROOMS_SHEET_NAME");
  const sheet = configuredSheetName
    ? spreadsheet.getSheetByName(configuredSheetName)
    : spreadsheet.getActiveSheet();

  if (!sheet) {
    throw new Error("Rooms sheet was not found.");
  }

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const headers = values[0].map(normalizeHeader_);
  const index = {
    room: findColumn_(headers, ["room", "roomcode", "code"]),
    type: findColumn_(headers, ["type", "roomtype"]),
    occupancy: findColumn_(headers, ["occupancy", "occupiedcapacity", "capacity"]),
    rent: findColumn_(headers, ["rent", "price", "rate", "rentghs", "rent₵"]),
    status: findColumn_(headers, ["status", "availability"])
  };

  return values.slice(1)
    .map(row => ({
      room: row[index.room] || "",
      type: row[index.type] || "",
      occupancy: row[index.occupancy] || "",
      rent: row[index.rent] || "",
      status: row[index.status] || ""
    }))
    .filter(room => room.room && room.type && room.rent);
}

function normalizeHeader_(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9₵]+/g, "");
}

function findColumn_(headers, candidates) {
  for (const candidate of candidates) {
    const index = headers.indexOf(candidate);
    if (index !== -1) return index;
  }
  return -1;
}
