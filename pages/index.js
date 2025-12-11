// pages/index.js
import Head from 'next/head';
import { useState, useMemo } from 'react';
import { catFoodData } from '../data/catFoodData';
import styles from '../styles/Home.module.css';

// --- ฟังก์ชันช่วยเหลือ (Helpers) ---

// ฟังก์ชันสำหรับคำนวณ Dry Matter Basis (DMB)
const calculateDMB = (nutrientValue, moisture) => {
    // แยก % ออก
    const nutrient = parseFloat(nutrientValue) / 100;
    const moistureDecimal = parseFloat(moisture) / 100;
    
    // Dry Matter (DM)
    const dryMatter = 1 - moistureDecimal;

    if (dryMatter <= 0) return 'N/A';
    
    // DMB Percentage
    const dmb = (nutrient / dryMatter) * 100;
    
    return dmb.toFixed(1) + '% (DMB)';
};

// --- FoodCard Component (ปรับปรุง: เพิ่มปุ่มเปรียบเทียบและเน้น Brand/Code) ---
const FoodCard = ({ food, isComparing, toggleComparison }) => {
    const formatKey = (key) => {
        return key.charAt(0).toUpperCase() + key.slice(1);
    };

    const cardClass = food.type === 'Dry' ? styles.dryType : styles.wetType;
    const isChecked = isComparing(food.id);

    return (
        <div className={`${styles.foodCard} ${cardClass} ${isChecked ? styles.selectedForComparison : ''}`}>
            
            <div className={styles.foodImageContainer}>
                {food.imageUrl && (
                    <img 
                        src={food.imageUrl} 
                        alt={`รูปภาพ ${food.name}`} 
                        className={styles.foodImage} 
                        loading="lazy"
                    />
                )}
            </div>

            <div className={styles.cardHeader}>
                {/* 1. เน้น Brand และ Food Code */}
                <p style={{ fontSize: '1.1em', color: '#555', fontWeight: 600 }}>
                    {food.brand}
                </p>
                <h2>{food.name}</h2>
                <p>ประเภท: {food.type} | อายุ: {food.age}</p>
                <p style={{ fontSize: '0.8em', color: '#999' }}>
                    Code: {food.foodcode || '-'}
                </p>
            </div>
            
            <hr style={{ margin: '15px 0', borderTop: '1px solid #eee' }} />

            <h3 style={{ fontSize: '1.1em', marginBottom: '10px', color: '#333' }}>
                อัตราส่วนโภชนาการ
            </h3>
            <ul className={styles.nutritionList}>
                {Object.entries(food.nutrition).map(([key, value]) => {
                    const moisture = food.nutrition.moisture;
                    let displayValue = value;

                    // 2. แสดงค่า DMB สำหรับ Protein/Fat/Fiber
                    if (['protein', 'fat', 'fiber'].includes(key)) {
                        displayValue = `${value} | ${calculateDMB(value, moisture)}`;
                    }

                    return (
                        <li key={key} className={styles.nutritionItem}>
                            <span>{formatKey(key)}</span>
                            <span style={{ color: key === 'moisture' ? '#d32f2f' : '#007bff' }}>
                                {displayValue}
                            </span>
                        </li>
                    );
                })}
            </ul>

            <button 
                className={`${styles.compareButton} ${isChecked ? styles.compareActive : ''}`}
                onClick={() => toggleComparison(food.id)}
            >
                {isChecked ? '✅ เลือกแล้ว (คลิกเพื่อยกเลิก)' : '➕ เลือกเปรียบเทียบ'}
            </button>
        </div>
    );
};
// --- สิ้นสุด FoodCard Component ---

// Component หลัก
const Home = () => {
    // 1. State สำหรับ Filter
    const [filterType, setFilterType] = useState('All');
    const [filterAge, setFilterAge] = useState('All');
    const [filterBrand, setFilterBrand] = useState('All'); // เพิ่ม Brand State
    
    // 2. State สำหรับ Comparison
    const [comparisonList, setComparisonList] = useState([]); // เก็บ array ของ food.id ที่ถูกเลือก

    // ตัวเลือกสำหรับ Filter
    const typeOptions = ['All', 'Dry', 'Wet', 'Freeze-Dried', 'Prescription'];
    const ageOptions = ['All', 'Kitten', 'Adult', 'Senior', 'All Life Stages', 'Mother & Baby'];
    const brandOptions = ['All', ...new Set(catFoodData.map(f => f.brand))].sort(); // ดึงแบรนด์ที่ไม่ซ้ำ

    // 3. ฟังก์ชันจัดการการเลือกเปรียบเทียบ
    const toggleComparison = (id) => {
        setComparisonList(prevList => {
            if (prevList.includes(id)) {
                // ถ้ามีอยู่แล้ว ให้ลบออก
                return prevList.filter(foodId => foodId !== id);
            } else if (prevList.length < 4) {
                // ถ้ายังไม่เกิน 4 รายการ ให้เพิ่มเข้าไป
                return [...prevList, id];
            } else {
                alert('คุณสามารถเลือกเปรียบเทียบได้สูงสุด 4 รายการเท่านั้น');
                return prevList;
            }
        });
    };

    const isComparing = (id) => comparisonList.includes(id);

    // 4. useMemo เพื่อกรองข้อมูล (รวม Brand Filter)
    const filteredFood = useMemo(() => {
        return catFoodData.filter(food => {
            const typeMatch = filterType === 'All' || food.type.includes(filterType);
            const ageMatch = filterAge === 'All' || food.age.includes(filterAge);
            const brandMatch = filterBrand === 'All' || food.brand === filterBrand;
            
            return typeMatch && ageMatch && brandMatch;
        });
    }, [filterType, filterAge, filterBrand]);

    // 5. ดึงข้อมูลสินค้าที่ถูกเลือกสำหรับ Comparison Modal
    const comparingItems = useMemo(() => {
        return catFoodData.filter(food => comparisonList.includes(food.id));
    }, [comparisonList]);


    // --- Comparison Modal Component ---
    const ComparisonModal = () => {
        if (comparingItems.length === 0) return null;

        return (
            <div className={styles.comparisonModalOverlay}>
                <div className={styles.comparisonModal}>
                    <h2>📊 เปรียบเทียบสินค้า ({comparingItems.length} รายการ)</h2>
                    
                    <div className={styles.comparisonTableContainer}>
                        {/* ตารางเปรียบเทียบ (สำหรับ 4 รายการ) */}
                        <table className={styles.comparisonTable}>
                            <thead>
                                <tr>
                                    <th>สารอาหาร</th>
                                    {comparingItems.map(item => (
                                        <th key={item.id} className={styles.compareHeader}>
                                            {item.name} 
                                            <span style={{ display: 'block', fontSize: '0.7em', color: '#999' }}>({item.brand})</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* แสดงโภชนาการหลัก */}
                                {['protein', 'fat', 'moisture', 'taurine', 'fiber'].map(key => (
                                    <tr key={key}>
                                        <td className={styles.tableKey}>
                                            {formatKey(key)} 
                                            {(key === 'protein' || key === 'fat') && <span className={styles.dmbLabel}>(DMB)</span>}
                                        </td>
                                        {comparingItems.map(item => {
                                            const value = item.nutrition[key];
                                            let display = value;
                                            
                                            // คำนวณ DMB สำหรับ Protein/Fat
                                            if (key === 'protein' || key === 'fat') {
                                                display = calculateDMB(value, item.nutrition.moisture);
                                            }
                                            
                                            return <td key={item.id} className={styles.tableValue}>{display}</td>;
                                        })}
                                    </tr>
                                ))}
                                {/* เพิ่มแถวสำหรับ Age และ Type */}
                                <tr>
                                    <td className={styles.tableKey}>Age</td>
                                    {comparingItems.map(item => <td key={item.id}>{item.age}</td>)}
                                </tr>
                                <tr>
                                    <td className={styles.tableKey}>Type</td>
                                    {comparingItems.map(item => <td key={item.id}>{item.type}</td>)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button 
                        onClick={() => setComparisonList([])} 
                        className={styles.closeModalButton}
                    >
                        ปิดและล้างรายการเปรียบเทียบ
                    </button>
                </div>
            </div>
        );
    };

    // --- Main Render ---
    return (
        <div className={styles.container}>
            <Head>
                <title>Cat Food Comparator</title>
            </Head>
            
            <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>
                😻 เปรียบเทียบอาหารแมว
            </h1>
            
            {/* 3. ส่วนควบคุม Filter (เพิ่ม Brand Filter) */}
            <div className={styles.filterControls}>
                
                {/*  เพิ่มปุ่ม "แสดงตารางเปรียบเทียบ" (Fix) */}
                {comparingItems.length > 0 && (
                    <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <button
                            onClick={() => { 
                                /* Logic: ให้ Modal แสดงอยู่แล้ว แต่ถ้าอยากให้มันเลื่อนไปที่ Modal 
                                   หรือเปิด Modal เต็มหน้าจอ อาจต้องเพิ่ม State สำหรับ Modal */ 
                                alert('ตารางเปรียบเทียบแสดงอยู่ด้านบนสุดของหน้าต่าง'); 
                            }} 
                            className={styles.showCompareSummaryButton} // กำหนด CSS สำหรับปุ่มนี้
                        >
                            ดูตารางเปรียบเทียบ ({comparingItems.length} / 4)
                        </button>
                    </div>
                )}


                {/* Filter แบรนด์ (ใช้ Select) */}
                <div className={styles.filterGroup}>
                    <label>แบรนด์:</label>
                    <select 
                        value={filterBrand} 
                        onChange={(e) => setFilterBrand(e.target.value)}
                        className={styles.filterSelectBrand} // ต้องเพิ่มสไตล์ให้ Select ใน CSS
                    >
                        {brandOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* Filter ประเภทอาหาร (ใช้ Button Group) */}
                <div className={styles.filterGroup}>
                    <label>ประเภท:</label>
                    <div className={styles.buttonGroup}>
                        {typeOptions.map(option => (
                            <button 
                                key={option} 
                                className={`${styles.filterButton} ${filterType.includes(option) ? styles.active : ''}`}
                                onClick={() => setFilterType(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter อายุแมว (ใช้ Button Group) */}
                <div className={styles.filterGroup}>
                    <label>อายุแมว:</label>
                    <div className={styles.buttonGroup}>
                        {ageOptions.map(option => (
                            <button 
                                key={option} 
                                className={`${styles.filterButton} ${filterAge.includes(option) ? styles.active : ''}`}
                                onClick={() => setFilterAge(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ส่วน Grid แสดง Card อาหารที่ถูกกรอง */}
            <div className={styles.foodGrid}>
                {filteredFood.length > 0 ? (
                    filteredFood.map((food) => (
                        <FoodCard 
                            key={food.id} 
                            food={food} 
                            toggleComparison={toggleComparison}
                            isComparing={isComparing}
                        />
                    ))
                ) : (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#888' }}>
                        ไม่พบข้อมูลอาหารตามเงื่อนไขที่เลือก
                    </p>
                )}
            </div>

            {/* แสดง Comparison Modal */}
            <ComparisonModal />
            
        </div>
    );
};

// ฟังก์ชัน formatKey ถูกย้ายมาอยู่ด้านนอกเพื่อให้ ComparisonModal ใช้ได้
const formatKey = (key) => {
    return key.charAt(0).toUpperCase() + key.slice(1);
};


export default Home;