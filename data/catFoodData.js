// data/catFoodData.js

export const catFoodData = [
  {
    id: 1,
    name: 'ยี่ห้อ A (แห้ง)',
    type: 'Dry',
    age: 'Kitten', // เพิ่มข้อมูลอายุ
    ingredients: ['เนื้อไก่', 'ข้าวกล้อง', 'วิตามินรวม', 'แร่ธาตุ'],
    nutrition: {
      protein: '32%',
      fat: '15%',
      fiber: '4%',
      moisture: '10%',
      taurine: '0.2%',
    },
  },
  {
    id: 2,
    name: 'ยี่ห้อ B (เปียก)',
    type: 'Wet',
    age: 'Adult', // เพิ่มข้อมูลอายุ
    ingredients: ['ปลาทูน่า', 'น้ำเกรวี่', 'น้ำมันปลา', 'ผักโขม'],
    nutrition: {
      protein: '10%',
      fat: '5%',
      fiber: '1%',
      moisture: '82%',
      taurine: '0.15%',
    },
  },
  {
    id: 3,
    name: 'ยี่ห้อ C (แห้ง)',
    type: 'Dry',
    age: 'Adult', // อาหารแห้งสำหรับแมวโต
    ingredients: ['ปลาแซลมอน', 'มันฝรั่ง', 'แครอท'],
    nutrition: {
      protein: '30%',
      fat: '12%',
      fiber: '5%',
      moisture: '10%',
      taurine: '0.18%',
    },
  },
  {
    id: 4,
    name: 'ยี่ห้อ D (เปียก)',
    type: 'Wet',
    age: 'Senior', // อาหารเปียกสำหรับแมวสูงวัย
    ingredients: ['ไก่บดละเอียด', 'น้ำสต็อก', 'กลูโคซามีน'],
    nutrition: {
      protein: '8%',
      fat: '4%',
      fiber: '1%',
      moisture: '85%',
      taurine: '0.15%',
    },
  },
  // เพิ่มข้อมูลอื่นๆ และใส่ property 'age' ด้วย
];