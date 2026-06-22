const SPREADSHEET_ID = '1isHfZCHRwdIBwqmMNikToWkdQEg63Oquxh9lrsUxojY';
const HEADER_ROW = 5;
const FIRST_DATA_ROW = 6;
const DASHBOARD_DATA_SHEET = 'Dashboard_Data';

const FIELD_TO_HEADER = {
  group: 'Group',
  machine: 'Machine',
  position: 'Gearbox Position',
  epCode: 'EP-CODE',
  description: 'Description',
  brand: 'Brand',
  model: 'Model',
  serialNumber: 'S/N',
  dashboardStatus: 'Dashboard Status',
  sampleDate: 'Sample Date',
  sampleNumber: 'Sample Number',
  oilHours: 'Oil Hours (hr)',
  oilVolume: 'Oil Volume',
  isoVG: 'ISO VG',
  newStatus: 'New Status',
  iso4406: 'ISO 4406',
  viscosity40: 'Viscosity @40°C (cSt)',
  viscosity100: 'Viscosity @100°C (cSt)',
  viscosityIndex: 'Viscosity Index',
  tan: 'TAN (mgKOH/g)',
  oxidation: 'Oxidation',
  fe: 'Fe (ppm)',
  cr: 'Cr (ppm)',
  sn: 'Sn (ppm)',
  pb: 'Pb (ppm)',
  cu: 'Cu (ppm)',
  ni: 'Ni (ppm)',
  al: 'Al (ppm)',
  water: 'Water (%)',
  silicon: 'Silicon [Si] (ppm)',
  sodium: 'Sodium [Na] (ppm)',
  phosphorus: 'Phosphorus [P] (ppm)',
  particle4: 'Particle >4µ',
  particle6: 'Particle >6µ',
  particle14: 'Particle >14µ',
  particle21: 'Particle >21µ',
  particle38: 'Particle >38µ',
  particle70: 'Particle >70µ',
  diagnosis: 'Diagnosis',
  recommendedAction: 'Recommended Action',
  nextSampleDate: 'Next Sample Date',
  updatedBy: 'Updated By',
  notes: 'Notes'
};

const NUMERIC_FIELDS = new Set([
  'oilHours', 'isoVG', 'viscosity40', 'viscosity100', 'viscosityIndex',
  'tan', 'oxidation', 'fe', 'cr', 'sn', 'pb', 'cu', 'ni', 'al', 'water',
  'silicon', 'sodium', 'phosphorus', 'particle4', 'particle6', 'particle14',
  'particle21', 'particle38', 'particle70'
]);

function doGet(event) {
  const response = {
    ok: true,
    service: 'Oil Analysis Data Entry',
    spreadsheetId: SPREADSHEET_ID,
    timestamp: new Date().toISOString()
  };
  const callback = event && event.parameter && event.parameter.callback;
  if (callback && /^[A-Za-z_$][\w$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(response) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(event) {
  let requestId = '';
  try {
    const payload = parsePayload_(event);
    requestId = String(payload.requestId || '');
    const result = saveOilAnalysis_(payload);
    return postMessageResponse_({
      source: 'oil-analysis-entry',
      ok: true,
      requestId: requestId,
      result: result
    });
  } catch (error) {
    return postMessageResponse_({
      source: 'oil-analysis-entry',
      ok: false,
      requestId: requestId,
      error: error && error.message ? error.message : String(error)
    });
  }
}

function parsePayload_(event) {
  if (!event || !event.parameter) throw new Error('Missing request payload');
  if (event.parameter.payload) return JSON.parse(event.parameter.payload);
  return event.parameter;
}

function saveOilAnalysis_(payload) {
  validatePayload_(payload);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(payload.machine);
    if (!sheet || ['Summary', 'Lists', DASHBOARD_DATA_SHEET].indexOf(sheet.getName()) >= 0) {
      throw new Error('Machine sheet was not found: ' + payload.machine);
    }

    const lastColumn = sheet.getLastColumn();
    const headers = sheet.getRange(HEADER_ROW, 1, 1, lastColumn).getDisplayValues()[0];
    const headerMap = {};
    headers.forEach(function(header, index) { headerMap[String(header).trim()] = index; });
    const machineIndex = requiredHeader_(headerMap, 'Machine');
    const positionIndex = requiredHeader_(headerMap, 'Gearbox Position');
    const sampleDateIndex = requiredHeader_(headerMap, 'Sample Date');
    const recordIdIndex = requiredHeader_(headerMap, 'Trend Record ID');

    const originalLastRow = Math.max(sheet.getLastRow(), FIRST_DATA_ROW - 1);
    const rowCount = Math.max(0, originalLastRow - FIRST_DATA_ROW + 1);
    const values = rowCount
      ? sheet.getRange(FIRST_DATA_ROW, 1, rowCount, lastColumn).getValues()
      : [];

    const matchingRows = [];
    let targetRow = 0;
    let insertedRow = false;
    values.forEach(function(row, offset) {
      const rowNumber = FIRST_DATA_ROW + offset;
      if (String(row[machineIndex]).trim() !== payload.machine) return;
      if (String(row[positionIndex]).trim() !== payload.position) return;
      matchingRows.push(rowNumber);
      if (!targetRow && !row[sampleDateIndex]) targetRow = rowNumber;
    });

    if (!matchingRows.length) {
      throw new Error('Gearbox position was not found in the machine sheet: ' + payload.position);
    }

    if (!targetRow) {
      const templateRow = matchingRows[matchingRows.length - 1];
      sheet.insertRowAfter(templateRow);
      targetRow = templateRow + 1;
      insertedRow = true;
      sheet.getRange(templateRow, 1, 1, lastColumn)
        .copyTo(sheet.getRange(targetRow, 1, 1, lastColumn));
      sheet.getRange(targetRow, 11, 1, 34).clearContent();
      extendDashboardFormula_(spreadsheet, payload.machine, originalLastRow, originalLastRow + 1);
    }

    const target = sheet.getRange(targetRow, 1, 1, Math.min(44, lastColumn));
    const rowValues = target.getValues()[0];
    const sequence = matchingRows.length + (targetRow > matchingRows[matchingRows.length - 1] ? 1 : 0);
    if (insertedRow || !String(rowValues[recordIdIndex] || '').trim()) {
      rowValues[recordIdIndex] = payload.machine + '|' + payload.position + '|T' + String(sequence).padStart(2, '0');
    }

    Object.keys(FIELD_TO_HEADER).forEach(function(field) {
      const header = FIELD_TO_HEADER[field];
      const index = headerMap[header];
      if (index === undefined || index >= rowValues.length) return;
      rowValues[index] = normalizeValue_(field, payload[field]);
    });

    target.setValues([rowValues]);
    SpreadsheetApp.flush();

    return {
      sheet: sheet.getName(),
      row: targetRow,
      recordId: rowValues[recordIdIndex],
      epCode: payload.epCode,
      sampleDate: payload.sampleDate
    };
  } finally {
    lock.releaseLock();
  }
}

function validatePayload_(payload) {
  ['machine', 'position', 'epCode', 'sampleDate', 'newStatus', 'updatedBy'].forEach(function(field) {
    if (!String(payload[field] || '').trim()) throw new Error('Required field is missing: ' + field);
  });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(payload.sampleDate))) {
    throw new Error('Sample Date must use YYYY-MM-DD');
  }
  if (['Normal', 'Monitor', 'Critical'].indexOf(payload.newStatus) < 0) {
    throw new Error('Invalid status value');
  }
}

function normalizeValue_(field, value) {
  if (field === 'sampleDate' || field === 'nextSampleDate') {
    if (!value) return '';
    const parts = String(value).split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  if (NUMERIC_FIELDS.has(field)) {
    if (value === '' || value === null || value === undefined) return '';
    const cleaned = String(value).replace(/,/g, '').trim();
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : String(value).trim();
  }
  return value === null || value === undefined ? '' : String(value).trim();
}

function requiredHeader_(headerMap, name) {
  if (headerMap[name] === undefined) throw new Error('Required header was not found: ' + name);
  return headerMap[name];
}

function extendDashboardFormula_(spreadsheet, machine, oldLastRow, newLastRow) {
  if (newLastRow <= oldLastRow) return;
  const dashboard = spreadsheet.getSheetByName(DASHBOARD_DATA_SHEET);
  if (!dashboard) return;
  const cell = dashboard.getRange('A1');
  const formula = cell.getFormula();
  if (!formula) return;
  const escapedMachine = machine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp("('" + escapedMachine + "'|" + escapedMachine + ")!A6:AS" + oldLastRow + "\\b", 'g');
  const updated = formula.replace(pattern, function(match) {
    return match.replace('AS' + oldLastRow, 'AS' + newLastRow);
  });
  if (updated !== formula) cell.setFormula(updated);
}

function postMessageResponse_(payload) {
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><script>' +
    'parent.postMessage(' + json + ', "*");' +
    '<\/script>'
  );
}
