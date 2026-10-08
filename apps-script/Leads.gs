/**
 * Or Scent - קבלת פניות מדף הנחיתה (פרויקט Apps Script נפרד, לא הפרויקט של האפליקציה).
 * פריסה: Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone.
 * אחרי הפריסה מדביקים את כתובת ה-exec ב-docs/config.js (LEADS_URL).
 */
const LEADS_SS_ID = '11y7OabU_v-UmBz83xijEEkAjqL0fghCr4AZtoDW-QLU'; // "ניהול אור סנט"
const LEADS_SHEET = 'פניות מהאתר';
const LEADS_NOTIFY = 'orscent1@gmail.com';

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return out_('ok');                         // הוניפוט: בוט
    const name = clean_(d.name), phone = clean_(d.phone);
    if (!name || phone.replace(/\D/g, '').length < 9) return out_('bad');
    const ss = SpreadsheetApp.openById(LEADS_SS_ID);
    let s = ss.getSheetByName(LEADS_SHEET);
    if (!s) {
      s = ss.insertSheet(LEADS_SHEET);
      s.setRightToLeft(true);
      s.getRange(1, 1, 1, 8).setValues([['תאריך', 'שם', 'טלפון', 'סוג', 'כתובת / עסק', 'הערות', 'מקור', 'טופל']])
        .setFontWeight('bold').setBackground('#356854').setFontColor('#ffffff');
      s.setFrozenRows(1);
      s.getRange('C2:C2000').setNumberFormat('@');
      s.getRange('H2:H2000').insertCheckboxes();
    }
    s.appendRow([new Date(), name, phone, clean_(d.type), clean_(d.address), clean_(d.note), clean_(d.source), false]);
    MailApp.sendEmail({
      to: LEADS_NOTIFY,
      subject: 'פנייה חדשה מהאתר: ' + name,
      body: 'שם: ' + name + '\nטלפון: ' + phone + '\nסוג: ' + clean_(d.type) + '\nכתובת/עסק: ' + clean_(d.address) +
        '\nהערות: ' + clean_(d.note) + '\nמקור: ' + clean_(d.source) + '\n\nכדאי לחזור אליו היום. הפנייה נשמרה בלשונית "' + LEADS_SHEET + '".'
    });
    return out_('ok');
  } catch (err) {
    return out_('error');
  }
}

function doGet() { return out_('Or Scent leads'); }
function clean_(v) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 500); }
function out_(t) { return ContentService.createTextOutput(t); }
