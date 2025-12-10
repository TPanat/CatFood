//import type { NextConfig } from "next";

//const nextConfig: NextConfig = {
//  /* config options here */
//};

//export default nextConfig;

/////////////////////////////////////////
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. ทำให้ Next.js สร้าง Static HTML แทน Server
  output: 'export',
  
  // 2. กำหนด Path หลัก (Base Path) 
  // แทนที่ YOUR_REPO_NAME ด้วยชื่อ Repository ของคุณ เช่น /cat-food-compare
  basePath: '/CatFood', 
  
  // 3. (Optional) ปิด Trailing Slash เพื่อให้ URL ดูดีขึ้น
  trailingSlash: true,
  
  // 4. (Optional) ปิดการ Optimize รูปภาพ
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
