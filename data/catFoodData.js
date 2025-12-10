// data/catFoodData.js

export const catFoodData = [
  {
    id: 1,
    name: 'Kaniva Tuna & Shrimp in Gravy Pouch',
    brand: 'Kaniva',
    type: 'Wet',
    age: 'Kitten', // เพิ่มข้อมูลอายุ
    imageUrl: './images/kaniva_wet_tunashrimp_gravy.png', // Path สัมพัทธ์จาก public
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
    name: 'Kaniva Wet Food Skin & Coat Salmon & Cod',
    brand: 'Kaniva',
    type: 'Wet',
    age: 'Adult', // เพิ่มข้อมูลอายุ
    imageUrl: './images/kaniva_wet_skincoat_salmoncod_gravy.png', 
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
    brand: '',
    type: 'Dry',
    age: 'Adult', // อาหารแห้งสำหรับแมวโต
    imageUrl: '', 
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
    brand: '',
    type: 'Wet',
    age: 'Senior', // อาหารเปียกสำหรับแมวสูงวัย
    imageUrl: '', 
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