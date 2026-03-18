## 🛠️ การติดตั้งและการใช้งาน (Installation & Setup)

**ข้อกำหนดเบื้องต้น (Prerequisites):**
- Node.js (แนะนำเวอร์ชัน LTS ล่าสุด)
- npm หรือ yarn

**ขั้นตอนการติดตั้ง:**

**โคลนโปรเจกต์และเข้าไปที่โฟลเดอร์ของ Frontend ไปยังพื้นที่ต้องการด้วยคำสั่ง:**
```bash
git clone <repository-url>
cd ai-email-client/frontend
```

**ติดตั้ง Dependencies:**
ทำการติดตั้งไลบรารีที่จำเป็นทั้งหมด (เช่น Vue, Pinia, Electron, TailwindCSS)
```bash
npm install
```

**ตั้งค่า Environment Variables:**
คัดลอกไฟล์ `.env.example` เป็นไฟล์ `.env` และแก้ไขค่าตามที่จำเป็น
```bash
VITE_API_URL="http://localhost:8000"
```

**รัน Development Server:**
```bash
npm run dev
```

**Build สำหรับ Production:**
```bash
npm run build
```
