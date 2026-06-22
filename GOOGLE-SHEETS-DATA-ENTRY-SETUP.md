# เชื่อมหน้า Oil Analysis Data Entry กับ Google Sheets

หน้าแบบฟอร์ม: `oil-analysis-data-entry.html`
Google Sheets: [Oil Analysis Gearbox Update - ITD Phase 9](https://docs.google.com/spreadsheets/d/1isHfZCHRwdIBwqmMNikToWkdQEg63Oquxh9lrsUxojY/edit)

## 1. สร้าง Google Apps Script

1. เปิด Google Sheets จากลิงก์ด้านบน
2. เลือก `ส่วนขยาย` > `Apps Script`
3. เปิดไฟล์ `Code.gs` ใน Apps Script
4. ลบโค้ดตัวอย่างเดิม
5. นำโค้ดจากไฟล์ `outputs/google-apps-script/Code.gs` ไปวางแทน
6. กด `บันทึก`

ไฟล์ `appsscript.json` ในโฟลเดอร์เดียวกันกำหนด Time Zone เป็น `Asia/Bangkok` หากต้องการใช้ไฟล์นี้ ให้เปิด `การตั้งค่าโปรเจ็กต์` และเปิดการแสดงไฟล์ Manifest ก่อนนำเนื้อหาไปแทนที่

## 2. Deploy เป็น Web App

1. กด `ทำให้ใช้งานได้` > `การทำให้ใช้งานได้รายการใหม่`
2. เลือกประเภท `เว็บแอป`
3. ตั้งค่า `ดำเนินการในฐานะ` เป็น `ฉัน`
4. ตั้งค่า `ผู้ที่มีสิทธิ์เข้าถึง` เป็น `ทุกคน`
5. กด `ทำให้ใช้งานได้` และอนุญาตสิทธิ์ Google Sheets
6. คัดลอก Web App URL ที่ลงท้ายด้วย `/exec`

## 3. เชื่อมหน้าแบบฟอร์ม

1. เปิด `oil-analysis-data-entry.html`
2. กด `ตั้งค่าการเชื่อมต่อ`
3. วาง Web App URL
4. กด `บันทึกการเชื่อมต่อ`
5. กด `ทดสอบ` สถานะด้านบนต้องแสดง `Google Sheets พร้อมบันทึก`

หลังจากนั้นปุ่ม `ส่งเข้า Google Sheets` จะบันทึกข้อมูลลงแท็บชื่อเครื่องจักร เช่น `A1`, `B2`, `SPD.A` และแท็บ `Dashboard_Data` จะนำข้อมูลไปใช้กับ Trend Analysis

## การจัดเก็บข้อมูล

- ระบบใช้แถว Trend ที่ยังไม่มี `Sample Date` ก่อน
- เมื่อแถวของ Gearbox เดิมเต็ม ระบบจะเพิ่ม Trend Record ใหม่
- ช่องผลทดสอบรองรับค่าตัวเลขและค่ารูปแบบ `<6`, `<8`, `<0.2`
- ช่องบังคับคือ Machine, Gearbox Position, EP-CODE, Sample Date, New Status และ Updated By
- URL เชื่อมต่อและฉบับร่างเก็บในเบราว์เซอร์ของเครื่องที่ใช้งาน

## ความปลอดภัย

Web App ที่ตั้งเป็น `ทุกคน` สามารถรับข้อมูลจากผู้ที่มี URL ได้ ควรเก็บ URL ภายในทีม และเปลี่ยน Deployment เมื่อต้องการยกเลิก URL เดิม

## หมายเหตุ

ไฟล์ทั้งหมดอยู่ในเครื่องและยังไม่ได้อัปเดตขึ้น GitHub Pages
