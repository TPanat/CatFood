// pages/index.js
import Head from 'next/head';
import { useState, useMemo } from 'react'; // Import hooks ที่จำเป็น
import { catFoodData } from '../data/catFoodData';
import styles from '../styles/Home.module.css';


// --- FoodCard Component (ส่วนที่แก้ไข) ---
const FoodCard = ({ food }) => {
    
    // ประกาศฟังก์ชัน formatKey ภายใน FoodCard
    const formatKey = (key) => {
        return key.charAt(0).toUpperCase() + key.slice(1);
    };

    const cardClass = food.type === 'Dry' ? styles.dryType : styles.wetType;

    return (
        <div className={`${styles.foodCard} ${cardClass}`}>
            
            {/* ... (โค้ดแสดงรูปภาพ) ... */}
            {food.imageUrl && ( // ตรวจสอบว่ามี imageUrl ถึงจะแสดงรูป
                <div className={styles.foodImageContainer}>
                    <img 
                        src={food.imageUrl} 
                        alt={`รูปภาพ ${food.name}`} 
                        className={styles.foodImage} 
                    />
                </div>
            )}

            <div className={styles.cardHeader}>
                <h2>{food.name}</h2>
                <p>ประเภท: {food.type} | อายุ: {food.age}</p> 
            </div>
            
            {/* ... (โค้ดแสดงส่วนผสม) ... */}
            
            <hr style={{ margin: '15px 0', borderTop: '1px solid #eee' }} />

            <h3 style={{ fontSize: '1.1em', marginBottom: '10px', color: '#333' }}>
                อัตราส่วนโภชนาการ
            </h3>
            <ul className={styles.nutritionList}>
                {/* ที่นี่เรียกใช้ formatKey ที่ถูกประกาศด้านบน */}
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
// --- สิ้นสุด FoodCard Component ---

// Component หลัก
const Home = () => {
    // 1. กำหนด State สำหรับ Filter (เหมือนเดิม)
    const [filterType, setFilterType] = useState('All'); // All, Dry, Wet
    const [filterAge, setFilterAge] = useState('All');   // All, Kitten, Adult, Senior
    
    // ตัวเลือกสำหรับ Filter (เหมือนเดิม)
    const typeOptions = ['All', 'Dry', 'Wet'];
    const ageOptions = ['All', 'Kitten', 'Adult', 'Senior'];

    // 2. ใช้ useMemo เพื่อกรองข้อมูล (เหมือนเดิม)
    const filteredFood = useMemo(() => {
        // ... (โค้ดการกรองเหมือนเดิม) ...
        return catFoodData.filter(food => {
            const typeMatch = filterType === 'All' || food.type === filterType;
            const ageMatch = filterAge === 'All' || food.age === filterAge;
            return typeMatch && ageMatch;
        });
    }, [filterType, filterAge]); 

    return (
        <div className={styles.container}>
            <Head>
                <title>Cat Food Comparator</title>
            </Head>
            
            <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>
                😻 เปรียบเทียบอาหารแมว
            </h1>
            
            {/* 3. ส่วนควบคุม Filter (รูปแบบใหม่: Buttons) */}
            <div className={styles.filterControls}>
                
                {/* Filter ประเภทอาหาร */}
                <div className={styles.filterGroup}>
                    <label>ประเภท:</label>
                    <div className={styles.buttonGroup}>
                        {typeOptions.map(option => (
                            <button 
                                key={option} 
                                className={`${styles.filterButton} ${filterType === option ? styles.active : ''}`}
                                onClick={() => setFilterType(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter อายุแมว */}
                <div className={styles.filterGroup}>
                    <label>อายุแมว:</label>
                    <div className={styles.buttonGroup}>
                        {ageOptions.map(option => (
                            <button 
                                key={option} 
                                className={`${styles.filterButton} ${filterAge === option ? styles.active : ''}`}
                                onClick={() => setFilterAge(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ส่วน Grid แสดง Card อาหารที่ถูกกรอง (โค้ดเดิม) */}
            <div className={styles.foodGrid}>
                {filteredFood.length > 0 ? (
                    filteredFood.map((food) => (
                        <FoodCard key={food.id} food={food} />
                    ))
                ) : (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#888' }}>
                        ไม่พบข้อมูลอาหารตามเงื่อนไขที่เลือก
                    </p>
                )}
            </div>
            
        </div>
    );
};

export default Home;