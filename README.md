# Introduction
 This is a frontend application for an AI email client. 

## Prerequisites
- Node.js (recommended LTS version)

## Steps
1. Clone the repository

   Open the terminal and navigate to the directory where you want to clone the repository, then run:
   ```
   git clone https://github.com/ai-email-client/frontend.git
   ```
2. Install the required packages

    follow the instructions in the `frontend` directory and run:
    ```bash
    npm install
    ```

3. Set up the environment variables

   If you host the backend on your local computer, you don't need to set up the environment variables
   - VITE_API_URL: The URL of the backend API (Default: http://localhost:8000)

4. Run the application and build it

    In local development:
    ```bash
    npm run dev
    ```

    In production:
    ```bash
    npm run build
    ```
    after build, you will receive a `release` folder, so you install it on other computer

___
# บทนำ
แอปพลิเคชันฝั่ง Frontend สำหรับ AI Email Client

## ข้อกำหนดเบื้องต้น
- Node.js (แนะนำเวอร์ชัน LTS)

## ขั้นตอน
1. โคลนรีโพซิทอรี

   เปิด Terminal แล้วไปยังโฟลเดอร์ที่ต้องการโคลน จากนั้นรันคำสั่ง:
   ```
   git clone https://github.com/ai-email-client/frontend.git
   ```

2. ติดตั้งแพ็กเกจที่จำเป็น

   ทำตามคำแนะนำในโฟลเดอร์ `frontend` แล้วรันคำสั่ง:
   ```bash
   npm install
   ```

3. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)

   หากคุณโฮสต์ Backend เอง บนคอมพิวเตอร์ของคุณเอง ไม่จำเป็นต้องตั้งค่าตัวแปร
   - `VITE_API_URL`: URL ของ Backend API (ค่าเริ่มต้น: http://localhost:8000)

4. รันแอปพลิเคชันและบิลด์

   สำหรับการพัฒนาในเครื่อง (Local):
   ```bash
   npm run dev
   ```

   สำหรับโปรดักชัน:
   ```bash
   npm run build
   ```
   หลังจากบิลด์เสร็จ จะได้โฟลเดอร์ `release` สำหรับนำไปติดตั้งบนเครื่องอื่นได้

---