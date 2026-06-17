# Oil Analysis Dashboard on GitHub Pages

## ไฟล์ที่ต้องอัปโหลดขึ้น GitHub

ให้อัปโหลดทุกไฟล์และทุกโฟลเดอร์ใน `outputs` ไปไว้ที่ root ของ GitHub repository:

- `index.html`
- `oil-analysis-dashboard.html`
- `data/oil-reports.json`
- `assets/italian-thai-logo.png`
- `.nojekyll`
- `README-GitHub-Pages.md`

ไฟล์สำคัญที่สุดคือ `index.html` เพราะ GitHub Pages จะใช้ไฟล์นี้เป็นหน้าแรกของเว็บไซต์

## วิธีเปิด GitHub Pages

1. สร้าง GitHub repository ใหม่ เช่น `oil-analysis-dashboard`.
2. Upload ทุกไฟล์ในโฟลเดอร์ `outputs` เข้าไปที่หน้าแรกของ repo.
3. เข้า `Settings` > `Pages`.
4. ที่ `Source` เลือก `Deploy from a branch`.
5. เลือก branch `main` และ folder `/(root)`.
6. กด `Save`.
7. รอ GitHub deploy แล้วเปิด URL เช่น `https://USERNAME.github.io/oil-analysis-dashboard/`.

อ้างอิงจาก GitHub Docs: GitHub Pages ต้องมี `index.html` เป็น entry file และสามารถ publish จาก branch/folder ที่เลือกได้

## วิธีอัปเดตข้อมูล

แก้ไขไฟล์ `data/oil-reports.json` แล้ว commit/push ขึ้น GitHub

เมื่อ Dashboard เปิดผ่าน GitHub Pages ระบบจะดึง `data/oil-reports.json` ทุก 60 วินาที จึงเหมาะกับการอัปเดตแบบ near real-time ผ่านไฟล์ JSON

ถ้าต้องการ real-time แบบทันทีโดยไม่ต้อง commit ไฟล์ ควรต่อกับ API ภายนอก เช่น Google Sheets API, Firebase, Supabase หรือฐานข้อมูลบริษัท

## การ Preview ในเครื่อง

เปิด `index.html` ได้ทันทีสำหรับดูหน้า Dashboard แบบ static

ถ้าต้องการทดสอบการโหลด JSON เหมือน GitHub Pages ให้เปิดผ่าน local web server แทนการ double-click
