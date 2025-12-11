// pages/index.js (CODE FINALIZED)
import Head from 'next/head';
import { useState, useMemo } from 'react';
// 🟢 ไม่ต้องเปลี่ยนบรรทัดนี้ เพราะ catFoodData ถูกเรียกจากไฟล์ภายนอกอยู่แล้ว
import { catFoodData } from '../data/catFoodData'; 
import styles from '../styles/Home.module.css';

// --- ฟังก์ชันช่วยเหลือ (Helpers) ---

// ฟังก์ชันสำหรับคำนวณ Dry Matter Basis (DMB)
const calculateDMB = (nutrientValue, moisture) => {
    // ใช้ parseFloat เพื่อให้มั่นใจว่าค่าที่ส่งเข้ามาเป็นตัวเลข
    const nutrient = parseFloat(nutrientValue) / 100;
    const moistureDecimal = parseFloat(moisture) / 100;
    
    const dryMatter = 1 - moistureDecimal;

    if (dryMatter <= 0) return 'N/A';
    
    const dmb = (nutrient / dryMatter) * 100;
    
    return dmb.toFixed(1); // ส่งคืนเป็นตัวเลขที่ format แล้ว (ไม่ต้องใส่ %)
};

// ฟังก์ชัน formatKey
const formatKey = (key) => {
    return key.charAt(0).toUpperCase() + key.slice(1);
};


// --- FoodCard Component ---
const FoodCard = ({ food, isComparing, toggleComparison }) => {
    
    const cardClass = food.type === 'Dry' ? styles.dryType : styles.wetType;
    const isChecked = isComparing(food.id);

    return (
        <div 
            className={`${styles.foodCard} ${cardClass} ${isChecked ? styles.selectedForComparison : ''}`}
            // 🛑 ลบ onClick บน Card ออกไป เพื่อป้องกันการคลิกที่ปุ่มซ้ำ
        >
            
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
                {/* 🛑 ลบ style inline */}
                <p style={{ fontSize: '1.1em', color: '#555', fontWeight: 600 }}>
                    {food.brand}
                </p>
                <h2>{food.name}</h2>
                <p>ประเภท: {food.type} | อายุ: {food.age}</p>
                {/* 🛑 ลบ style inline */}
                <p style={{ fontSize: '0.8em', color: '#999' }}>
                    Code: {food.foodcode || '-'}
                </p>
            </div>
            
            <hr style={{ margin: '15px 0', borderTop: '1px solid #eee' }} />

            {/* 🛑 ลบ style inline */}
            <h3 style={{ fontSize: '1.1em', marginBottom: '10px', color: '#333' }}>
                อัตราส่วนโภชนาการ (DMB)
            </h3>
            <ul className={styles.nutritionList}>
                {/* 🛑 แก้ไข Logic การแสดงผลให้สวยงามขึ้น และเน้น DMB */}
                {Object.entries(food.nutrition).map(([key, value]) => {
                    const moisture = food.nutrition.moisture;
                    let displayValue = `${value}% (As Fed)`;
                    let colorStyle = {};

                    if (key === 'moisture') {
                        // ไม่ต้องคำนวณ DMB สำหรับความชื้น
                        colorStyle = { color: '#d32f2f' }; 
                    } else if (['protein', 'fat', 'fiber'].includes(key)) {
                        // แสดงค่า DMB สำหรับสารอาหารหลัก
                        const dmbValue = calculateDMB(value, moisture);
                        displayValue = `${dmbValue}% (DMB)`; // แสดงเฉพาะ DMB ใน Card
                        colorStyle = { color: styles['--primary-color'] || '#007bff' }; 
                    } else if (key === 'taurine') {
                         colorStyle = { color: styles['--primary-color'] || '#007bff' }; 
                    }

                    return (
                        <li key={key} className={styles.nutritionItem}>
                            <span>{formatKey(key)}</span>
                            <span style={colorStyle}>
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
                {isChecked ? '✅ เลือกแล้ว' : '➕ เลือกเปรียบเทียบ'}
            </button>
        </div>
    );
};
// --- สิ้นสุด FoodCard Component ---


// --- Comparison Modal Component ---
const ComparisonModal = ({ comparingItems, onClose, onClear }) => {
    
    // ฟังก์ชันสำหรับเน้นค่า DMB ในตาราง (เพื่อความสม่ำเสมอ)
    const getDMBValue = (item, key) => {
        const value = item.nutrition[key];
        if (key === 'protein' || key === 'fat' || key === 'fiber') {
            return calculateDMB(value, item.nutrition.moisture) + '%';
        }
        return value + (key !== 'taurine' ? '%' : ''); // Taurine ไม่จำเป็นต้องมี % เสมอไป (แล้วแต่หน่วยข้อมูล)
    };

    // แถวที่ต้องการแสดงในตาราง (เน้น DMB สำหรับสารอาหารหลัก)
    const tableKeys = ['protein', 'fat', 'fiber', 'moisture', 'taurine']; 

    return (
        <div className={styles.comparisonModalOverlay}> 
            <div className={styles.comparisonModal}>
                
                <button onClick={onClose} className={styles.closeModalX}>&times;</button> 

                <h2>📊 เปรียบเทียบสินค้า ({comparingItems.length} รายการ)</h2>
                
                <div className={styles.comparisonTableContainer}>
                    <table className={styles.comparisonTable}>
                        <thead>
                            <tr>
                                {/* 🛑 ปรับปรุง Th ให้แสดง DMB */}
                                <th className={styles.tableKey}>สารอาหาร</th>
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
                            {tableKeys.map(key => (
                                <tr key={key}>
                                    <td className={styles.tableKey}>
                                        {formatKey(key)} 
                                        {(key === 'protein' || key === 'fat' || key === 'fiber') && 
                                            <span className={styles.dmbLabel}>(Dry Matter Basis)</span>}
                                        {key === 'moisture' && <span className={styles.dmbLabel}>(As Fed)</span>}
                                    </td>
                                    {comparingItems.map(item => (
                                        <td key={item.id} className={styles.tableValue}>
                                            {getDMBValue(item, key)}
                                        </td>
                                    ))}
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
                
                <div className={styles.modalControlButtons}>
                    <button 
                        onClick={onClose} 
                        className={styles.continueCompareButton}
                    >
                        <span style={{ fontSize: '1.2em' }}>&laquo;</span> ปิดตาราง (เลือกต่อ)
                    </button>
                    <button 
                        onClick={onClear} 
                        className={styles.clearComparisonButton}
                    >
                        🗑️ ล้างรายการเปรียบเทียบทั้งหมด
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- สิ้นสุด Comparison Modal Component ---


// Component หลัก
const Home = () => {
    // 1. State สำหรับ Filter
    const [filterType, setFilterType] = useState('All');
    const [filterAge, setFilterAge] = useState('All');
    const [filterBrand, setFilterBrand] = useState('All'); 
    
    // 2. State สำหรับ Comparison
    const [comparisonList, setComparisonList] = useState([]); 
    const [isModalOpen, setIsModalOpen] = useState(false); 

    // ตัวเลือกสำหรับ Filter
    const typeOptions = ['All', 'Dry', 'Wet', 'Freeze-Dried', 'Prescription'];
    const ageOptions = ['All', 'Kitten', 'Adult', 'Senior', 'All Life Stages', 'Mother & Baby'];
    const brandOptions = ['All', ...new Set(catFoodData.map(f => f.brand))].sort(); 

    // 3. ฟังก์ชันจัดการการเลือกเปรียบเทียบ
    const toggleComparison = (id) => {
        setComparisonList(prevList => {
            if (prevList.includes(id)) {
                return prevList.filter(foodId => foodId !== id);
            } else if (prevList.length < 4) {
                return [...prevList, id];
            } else {
                alert('คุณสามารถเลือกเปรียบเทียบได้สูงสุด 4 รายการเท่านั้น');
                return prevList;
            }
        });
    };

    const isComparing = (id) => comparisonList.includes(id);

    // 4. useMemo เพื่อกรองข้อมูล
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
    
    // ฟังก์ชันสำหรับล้างรายการทั้งหมด และปิด Modal
    const handleClearComparison = () => {
        setComparisonList([]);
        setIsModalOpen(false);
    };


    // --- Main Render ---
    return (
        <div className={styles.container}>
            <Head>
                <title>Cat Food Comparator</title>
            </Head>
            
            {/* 🛑 แก้ไข: ใช้ Class CSS แทน style inline */}
            <h1 className={styles.pageTitle}>
                😻 เปรียบเทียบอาหารแมว
            </h1>
            
            {/* 🛑 ปรับปรุงส่วน Filter Controls ทั้งหมด */}
            <div className={styles.filterControls}>

                {/* Filter แบรนด์ (ใช้ Select) */}
                <div className={styles.filterGroup}>
                    <label>แบรนด์:</label>
                    <select 
                        value={filterBrand} 
                        onChange={(e) => setFilterBrand(e.target.value)}
                        className={styles.filterSelectBrand} 
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

                {/* แสดงปุ่ม "ดูตารางเปรียบเทียบ" เมื่อมีสินค้าถูกเลือก */}
                {comparingItems.length > 0 && (
                    <div className={styles.summaryButtonContainer}>
                        <button
                            onClick={() => setIsModalOpen(true)} 
                            className={styles.showCompareSummaryButton} 
                        >
                            ดูตารางเปรียบเทียบ ({comparingItems.length} / 4)
                        </button>
                    </div>
                )}
            </div>
            {/* --- สิ้นสุด Filter Controls --- */}

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

            {/* แสดง Comparison Modal เมื่อ isModalOpen เป็น true เท่านั้น */}
            {isModalOpen && comparingItems.length > 0 && (
                <ComparisonModal 
                    comparingItems={comparingItems}
                    onClose={() => setIsModalOpen(false)} 
                    onClear={handleClearComparison} 
                />
            )}
            
        </div>
    );
};


export default Home;