// pages/index.js
import Head from 'next/head';
import { catFoodData } from '../data/catFoodData';
// Import สไตล์ใหม่
import styles from '../styles/Home.module.css'; 

// ฟังก์ชัน helper เพื่อจัดรูปแบบชื่อโภชนาการให้ดูดีขึ้น
const formatKey = (key) => {
    // เช่น เปลี่ยน protein เป็น Protein
    return key.charAt(0).toUpperCase() + key.slice(1);
};

// Component สำหรับแสดง Card อาหารแต่ละยี่ห้อ
const FoodCard = ({ food }) => {
    const cardClass = food.type === 'Dry' ? styles.dryType : styles.wetType;

    return (
        <div className={`${styles.foodCard} ${cardClass}`}>
            
            {/* ส่วนหัว Card: ชื่อและประเภท */}
            <div className={styles.cardHeader}>
                <h2>{food.name}</h2>
                <p>ประเภท: {food.type}</p>
            </div>

            {/* ส่วนผสมหลัก */}
            <p style={{ fontSize: '0.9em', color: '#777' }}>
                **ส่วนผสมหลัก:** {food.ingredients.slice(0, 3).join(', ')}{food.ingredients.length > 3 ? '...' : ''}
            </p>
            
            <hr style={{ margin: '15px 0', borderTop: '1px solid #eee' }} />

            {/* ส่วนเปรียบเทียบโภชนาการ */}
            <h3 style={{ fontSize: '1.1em', marginBottom: '10px', color: '#333' }}>
                อัตราส่วนโภชนาการ
            </h3>
            <ul className={styles.nutritionList}>
                {Object.entries(food.nutrition).map(([key, value]) => (
                    <li key={key} className={styles.nutritionItem}>
                        <span>{formatKey(key)}</span>
                        <span>{value}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const Home = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Cat Food Comparator</title>
      </Head>
      
      {/* ส่วน Header หลัก */}
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>
        😻 เปรียบเทียบอาหารแมว
      </h1>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1em' }}>
        โภชนาการสำคัญ 5 ตัวเปรียบเทียบในรูปแบบ Card ดูง่าย
      </p>

      {/* ส่วน Grid แสดง Card อาหารทั้งหมด */}
      <div className={styles.foodGrid}>
        {catFoodData.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
      </div>
      
      <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.8em', color: '#999' }}>
        *ข้อมูลโภชนาการอ้างอิงจาก Guaranteed Analysis (โปรตีน, ไขมัน, ไฟเบอร์, ความชื้น, ทอรีน)
      </p>
    </div>
  );
};

export default Home;