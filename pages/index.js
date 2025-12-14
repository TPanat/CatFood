// pages/index.js (FINALIZED CODE WITH MULTI-SELECT FILTERS & MAX VALUE HIGHLIGHT)
import Head from 'next/head';
import { useState, useMemo } from 'react';
// 🟢 การเรียกใช้ Data จากไฟล์ภายนอก
import { catFoodData } from '../data/catFoodData';
import styles from '../styles/Home.module.css';

// --- ฟังก์ชันช่วยเหลือ (Helpers) ---

// ฟังก์ชันสำหรับคำนวณ Dry Matter Basis (DMB)
const calculateDMB = (nutrientValue, moisture) => {
  const nutrient = parseFloat(nutrientValue) / 100;
  const moistureDecimal = parseFloat(moisture) / 100;
  const dryMatter = 1 - moistureDecimal;

  if (dryMatter <= 0) return 'N/A';
 
  const dmb = (nutrient / dryMatter) * 100;
 
  return dmb.toFixed(1); // ส่งคืนเป็นค่าตัวเลขที่ format แล้ว
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
        อัตราส่วนโภชนาการ (DMB)
      </h3>
      <ul className={styles.nutritionList}>
        {Object.entries(food.nutrition).map(([key, value]) => {
          const moisture = food.nutrition.moisture;
          let displayValue = `${value}% (As Fed)`;
          let colorStyle = {};

          if (key === 'moisture') {
            colorStyle = { color: '#d32f2f' };
          } else if (['protein', 'fat', 'fiber'].includes(key)) {
            const dmbValue = calculateDMB(value, moisture);
            displayValue = `${dmbValue}% (DMB)`;
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
    // เพิ่ม % ให้ค่าอื่นที่ไม่ใช่ DMB
    return value + (key !== 'taurine' ? '%' : '');
  };

  // แถวที่ต้องการแสดงในตาราง
  const tableKeys = ['protein', 'fat', 'fiber', 'moisture', 'taurine'];

    // 🟢 NEW: useMemo เพื่อหาค่าสูงสุดของแต่ละสารอาหารที่เลือกมาเปรียบเทียบ
    const maxValues = useMemo(() => {
        const maxMap = {};
        tableKeys.forEach(key => {
            // ดึงค่า DMB (หรือ As Fed) ของทุกคนมาเปรียบเทียบ
            const values = comparingItems.map(item => {
                const rawValue = getDMBValue(item, key).replace('%', '');
                return parseFloat(rawValue);
            }).filter(val => !isNaN(val)); // กรองค่าที่คำนวณไม่ได้
            
            if (values.length > 0) {
                // เราเน้นค่าสูงสุดสำหรับทุกคีย์
                maxMap[key] = Math.max(...values);
            }
        });
        return maxMap;
    }, [comparingItems]);
    
    // 🟢 NEW: ฟังก์ชันเช็คว่าค่านั้นคือค่าสูงสุด (และไม่ซ้ำกับค่าอื่น)
    const isMaxValue = (item, key) => {
        const currentValueString = getDMBValue(item, key).replace('%', '');
        const currentValue = parseFloat(currentValueString);
        
        if (maxValues[key] !== undefined && currentValue === maxValues[key] && maxValues[key] > 0) {
            // นับจำนวนรายการที่มีค่าเท่ากับค่าสูงสุด (เพื่อไม่ให้ highlight เมื่อค่าซ้ำ)
            const count = comparingItems.filter(i => {
                const val = parseFloat(getDMBValue(i, key).replace('%', ''));
                return val === maxValues[key];
            }).length;

            return count === 1; // เน้นเมื่อมีค่าสูงสุด "เดียว" เท่านั้น
        }
        return false;
    };


  return (
    <div className={styles.comparisonModalOverlay}>
      <div className={styles.comparisonModal}>
       
        <button onClick={onClose} className={styles.closeModalX}>&times;</button>

        <h2>📊 เปรียบเทียบสินค้า ({comparingItems.length} รายการ)</h2>
       
        <div className={styles.comparisonTableContainer}>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
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
                  {comparingItems.map(item => {
                                        const isHighlighted = isMaxValue(item, key); 
                                        return (
                        <td 
                                                key={item.id} 
                                                // 🟢 ใช้คลาส Highlight
                                                className={`${styles.tableValue} ${isHighlighted ? styles.highlightMaxValue : ''}`}
                                            >
                      {getDMBValue(item, key)}
                    </td>
                                        );
                                    })}
                </tr>
              ))}
              {/* Age และ Type */}
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
  // 1. 🛑 State สำหรับ Filter เปลี่ยนเป็น Array สำหรับ Multi-Select
  const [filterType, setFilterType] = useState([]);
  const [filterAge, setFilterAge] = useState([]);
  const [filterBrand, setFilterBrand] = useState([]);
 
  // 2. State สำหรับ Comparison (เหมือนเดิม)
  const [comparisonList, setComparisonList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ตัวเลือกสำหรับ Filter (ลบ 'All' ออก เพราะตอนนี้การไม่เลือกอะไรเลย = All)
  const typeOptions = ['Dry', 'Wet', 'Freeze-Dried', 'Prescription'];
  const ageOptions = ['Kitten', 'Adult', 'Senior', 'All Life Stages', 'Mother & Baby'];
  const brandOptions = [...new Set(catFoodData.map(f => f.brand))].sort();

    // 🟢 ฟังก์ชันใหม่: จัดการการเลือก/ยกเลิกการเลือกใน Array
    const toggleFilter = (currentFilters, setFilterFunction, value) => {
        if (currentFilters.includes(value)) {
            // ยกเลิกการเลือก
            setFilterFunction(currentFilters.filter(item => item !== value));
        } else {
            // เลือกเพิ่ม
            setFilterFunction([...currentFilters, value]);
        }
    };

  // 3. ฟังก์ชันจัดการการเลือกเปรียบเทียบ (เหมือนเดิม)
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

  // 4. 🛑 useMemo แก้ไขให้รองรับ Multi-Select
  const filteredFood = useMemo(() => {
    return catFoodData.filter(food => {
      // ถ้า Array ว่าง (filter.length === 0) ถือว่า Match ทั้งหมด
            // ถ้า Array ไม่ว่าง (filter.length > 0) ต้องมีอย่างน้อย 1 ตัวเลือกที่ถูกเลือก ตรงกับข้อมูลอาหาร (use .some)
      const typeMatch = filterType.length === 0 || filterType.some(ft => food.type.includes(ft));
      const ageMatch = filterAge.length === 0 || filterAge.some(fa => food.age.includes(fa));
      const brandMatch = filterBrand.length === 0 || filterBrand.some(fb => food.brand === fb);
     
      return typeMatch && ageMatch && brandMatch;
    });
  }, [filterType, filterAge, filterBrand]);

  // 5. ดึงข้อมูลสินค้าที่ถูกเลือกสำหรับ Comparison Modal (เหมือนเดิม)
  const comparingItems = useMemo(() => {
    return catFoodData.filter(food => comparisonList.includes(food.id));
  }, [comparisonList]);
 
  // ฟังก์ชันสำหรับล้างรายการทั้งหมด และปิด Modal (เหมือนเดิม)
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
     
      <h1 className={styles.pageTitle}>
        😻 เปรียบเทียบอาหารแมว
      </h1>
     
      {/* --- Filter Controls --- */}
      <div className={styles.filterControls}>

        {/* 🛑 Filter แบรนด์ (Button Group, ใช้ toggleFilter) */}
        <div className={styles.filterGroup}>
          <label>แบรนด์:</label>
          <div className={styles.buttonGroup}>
            {brandOptions.map(option => (
              <button
                key={option}
                className={`${styles.filterButton} ${filterBrand.includes(option) ? styles.active : ''}`}
                onClick={() => toggleFilter(filterBrand, setFilterBrand, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* 🛑 Filter ประเภทอาหาร (Button Group, ใช้ toggleFilter) */}
        <div className={styles.filterGroup}>
          <label>ประเภท:</label>
          <div className={styles.buttonGroup}>
            {typeOptions.map(option => (
              <button
                key={option}
                className={`${styles.filterButton} ${filterType.includes(option) ? styles.active : ''}`}
                onClick={() => toggleFilter(filterType, setFilterType, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* 🛑 Filter อายุแมว (Button Group, ใช้ toggleFilter) */}
        <div className={styles.filterGroup}>
          <label>อายุแมว:</label>
          <div className={styles.buttonGroup}>
            {ageOptions.map(option => (
              <button
                key={option}
                className={`${styles.filterButton} ${filterAge.includes(option) ? styles.active : ''}`}
                onClick={() => toggleFilter(filterAge, setFilterAge, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* --- สิ้นสุด Filter Controls --- */}

      {/* Floating Button Wrapper (เหมือนเดิม) */}
      {comparingItems.length > 0 && (
        <div className={styles.floatingCompareWrapper}>
          <button
            onClick={() => setIsModalOpen(true)}
            className={styles.showCompareSummaryButton}
          >
            ดูตารางเปรียบเทียบ ({comparingItems.length} / 4)
          </button>
        </div>
      )}


      {/* ส่วน Grid แสดง Card อาหารที่ถูกกรอง (เหมือนเดิม) */}
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

      {/* แสดง Comparison Modal (เหมือนเดิม) */}
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