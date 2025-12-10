// pages/index.js
import Head from 'next/head';
import { useState, useMemo } from 'react'; // Import hooks ที่จำเป็น
import { catFoodData } from '../data/catFoodData';
import styles from '../styles/Home.module.css';

// ... (FoodCard Component โค้ดเดิม) ...
// เพื่อให้โค้ดกระชับ ผมจะใส่เฉพาะส่วนที่เปลี่ยนไป
// คุณสามารถคัดลอกส่วน FoodCard Component เดิมมาวางได้เลย
const formatKey = (key) => {
    return key.charAt(0).toUpperCase() + key.slice(1);
};

const FoodCard = ({ food }) => {
    const cardClass = food.type === 'Dry' ? styles.dryType : styles.wetType;
    // ปรับการแสดงผล: เพิ่ม Age ใน Card
    return (
        <div className={`${styles.foodCard} ${cardClass}`}>
            <div className={styles.cardHeader}>
                <h2>{food.name}</h2>
                <p>ประเภท: {food.type} | **อายุ: {food.age}**</p> 
            </div>
            <p style={{ fontSize: '0.9em', color: '#777' }}>
                **ส่วนผสมหลัก:** {food.ingredients.slice(0, 3).join(', ')}{food.ingredients.length > 3 ? '...' : ''}
            </p>
            <hr style={{ margin: '15px 0', borderTop: '1px solid #eee' }} />
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

// Component หลัก
const Home = () => {
    // 1. กำหนด State สำหรับ Filter
    const [filterType, setFilterType] = useState('All'); // All, Dry, Wet
    const [filterAge, setFilterAge] = useState('All');   // All, Kitten, Adult, Senior
    
    // ตัวเลือกสำหรับ Filter
    const typeOptions = ['All', 'Dry', 'Wet'];
    const ageOptions = ['All', 'Kitten', 'Adult', 'Senior'];

    // 2. ใช้ useMemo เพื่อกรองข้อมูล
    const filteredFood = useMemo(() => {
        return catFoodData.filter(food => {
            // กรองตามประเภท (Dry/Wet)
            const typeMatch = filterType === 'All' || food.type === filterType;
            
            // กรองตามอายุ (Kitten/Adult/Senior)
            const ageMatch = filterAge === 'All' || food.age === filterAge;
            
            return typeMatch && ageMatch;
        });
    }, [filterType, filterAge]); // จะ re-run เมื่อ filterType หรือ filterAge เปลี่ยน

    return (
        <div className={styles.container}>
            <Head>
                <title>Cat Food Comparator</title>
            </Head>
            
            <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>
                😻 เปรียบเทียบอาหารแมว
            </h1>
            
            {/* 3. ส่วนควบคุม Filter */}
            <div className={styles.filterControls}>
                
                {/* Filter ประเภทอาหาร */}
                <div className={styles.filterGroup}>
                    <label>ประเภท:</label>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className={styles.filterSelect}
                    >
                        {typeOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* Filter อายุแมว */}
                <div className={styles.filterGroup}>
                    <label>อายุแมว:</label>
                    <select 
                        value={filterAge} 
                        onChange={(e) => setFilterAge(e.target.value)}
                        className={styles.filterSelect}
                    >
                        {ageOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ส่วน Grid แสดง Card อาหารที่ถูกกรอง */}
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