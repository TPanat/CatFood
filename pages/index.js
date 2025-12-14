// pages/index.js (FINALIZED CODE WITH DMB & AS FED IN ONE LINE)
import Head from 'next/head';
import { useState, useMemo } from 'react';
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
    อัตราส่วนโภชนาการ
   </h3>
   <ul className={styles.nutritionList}>
    {Object.entries(food.nutrition).map(([key, value]) => {
     const moisture = food.nutrition.moisture;
     let displayValue = `${value}% (As Fed)`;
     let colorStyle = {};

     if (key === 'moisture') {
      // สำหรับความชื้น: แสดงเฉพาะค่า As Fed
      colorStyle = { color: '#d32f2f' };
      displayValue = `${value}% (As Fed)`;
     } else if (['protein', 'fat', 'fiber'].includes(key)) {
      // สำหรับ Protein, Fat, Fiber: แสดงทั้ง DMB และ As Fed
      const dmbValue = calculateDMB(value, moisture);
      colorStyle = { color: styles['--primary-color'] || '#007bff' };
     
            // การแสดงผล: DMB ตัวหนา + As Fed ในวงเล็บ
      displayValue = (
              <>
                <strong style={{color: '#333'}}>{dmbValue}% (DMB)</strong>
                <span style={{fontSize: '0.85em', color: '#888', marginLeft: '8px'}}>| {value}% (As Fed)</span>
              </>
            );
     } else if (key === 'taurine') {
            // สำหรับ Taurine: แสดงเฉพาะค่า As Fed
      colorStyle = { color: styles['--primary-color'] || '#007bff' };
     }

     return (
      <li key={key} className={styles.nutritionItem}>
       <span>{formatKey(key)}</span>
              {/* ใช้เงื่อนไขเพื่อแสดง String หรือ React Fragment */}
       <span style={colorStyle}>
                {typeof displayValue === 'string' ? displayValue : displayValue}
       </span>
      </li>
     );
    })}
   </ul>

   <button
    className={`${styles.compareButton} ${isChecked ? styles.selectedForComparison : ''}`} // 🛑 แก้ไขตรงนี้
    onClick={() => toggleComparison(food.id)}
   >
    {isChecked ? '✅ เลือกแล้ว' : '➕ เลือกเปรียบเทียบ'}
   </button>
  </div>
 );
};
// --- สิ้นสุด FoodCard Component ---


// --- Comparison Modal Component (โค้ดเดิม) ---
const ComparisonModal = ({ comparingItems, onClose, onClear }) => {

 // ฟังก์ชันสำหรับคำนวณ DMB หรือ As Fed (เพื่อความสม่ำเสมอ)
 const getDMBValue = (item, key) => {
  const value = item.nutrition[key];
  if (key === 'protein' || key === 'fat' || key === 'fiber') {
   return calculateDMB(value, item.nutrition.moisture) + '%';
  }
  return value + (key !== 'taurine' ? '%' : '');
 };

 // แถวที่ต้องการแสดงในตาราง
 const tableKeys = ['protein', 'fat', 'fiber', 'moisture', 'taurine'];

  // useMemo เพื่อหาค่าสูงสุดของแต่ละสารอาหาร
  const maxValues = useMemo(() => {
    const maxMap = {};
    tableKeys.forEach(key => {
      const values = comparingItems.map(item => {
        const rawValue = getDMBValue(item, key).replace('%', '');
        return parseFloat(rawValue);
      }).filter(val => !isNaN(val));
     
      if (values.length > 0) {
        maxMap[key] = Math.max(...values);
      }
    });
    return maxMap;
  }, [comparingItems]);
 
  // ฟังก์ชันเช็คว่าค่านั้นคือค่าสูงสุด (และไม่ซ้ำกับค่าอื่น)
  const isMaxValue = (item, key) => {
    const currentValueString = getDMBValue(item, key).replace('%', '');
    const currentValue = parseFloat(currentValueString);
   
    if (maxValues[key] !== undefined && currentValue === maxValues[key] && maxValues[key] > 0) {
      const count = comparingItems.filter(i => {
        const val = parseFloat(getDMBValue(i, key).replace('%', ''));
        return val === maxValues[key];
      }).length;

      // เน้นเมื่อมีค่าสูงสุด "เดียว" สำหรับ protein, fat, taurine
      // และค่าต่ำสุด "เดียว" สำหรับ moisture (ความชื้น)
      if (key === 'moisture') {
        const minMoisture = Math.min(...comparingItems.map(i => parseFloat(getDMBValue(i, 'moisture').replace('%', ''))));
        return currentValue === minMoisture; // เน้นความชื้นที่ต่ำที่สุด
      }
     
      return count === 1; // เน้นค่าสูงสุดเดียว สำหรับ Protein, Fat, Fiber, Taurine
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
 // 1. State สำหรับ Filter
 const [filterType, setFilterType] = useState([]);
 const [filterAge, setFilterAge] = useState([]);
 const [filterBrand, setFilterBrand] = useState([]);

 // 🛑 Brand Dropdown State
 const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  // 🛑 Sorting State
  const [sortBy, setSortBy] = useState('none');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' หรือ 'desc'

 // 2. State สำหรับ Comparison
 const [comparisonList, setComparisonList] = useState([]);
 const [isModalOpen, setIsModalOpen] = useState(false);

 // ตัวเลือกสำหรับ Filter
 const typeOptions = ['Dry', 'Wet', 'Freeze-Dried', 'Prescription'];
 const ageOptions = ['Kitten', 'Adult', 'Senior', 'All Life Stages', 'Mother & Baby'];
 const brandOptions = [...new Set(catFoodData.map(f => f.brand))].sort();

  // ฟังก์ชัน: จัดการการเลือก/ยกเลิกการเลือกใน Array
  const toggleFilter = (currentFilters, setFilterFunction, value) => {
    setFilterFunction(prevFilters => {
      if (prevFilters.includes(value)) {
        return prevFilters.filter(item => item !== value);
      } else {
        return [...prevFilters, value];
      }
    });
  };

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

  // 4. useMemo เพื่อกรองและจัดเรียงข้อมูล
  const sortedAndFilteredFood = useMemo(() => {
    // ขั้นตอนที่ 1: การกรอง (Filtering)
    let currentData = catFoodData.filter(food => {
      const typeMatch = filterType.length === 0 || filterType.some(ft => food.type.includes(ft));
      const ageMatch = filterAge.length === 0 || filterAge.some(fa => food.age.includes(fa));
      const brandMatch = filterBrand.length === 0 || filterBrand.some(fb => food.brand === fb);
     
      return typeMatch && ageMatch && brandMatch;
    });

    // ขั้นตอนที่ 2: การจัดเรียง (Sorting)
    if (sortBy !== 'none') {
      currentData = [...currentData].sort((a, b) => {
        let valA, valB;
       
        if (sortBy === 'name') {
          // จัดเรียงตามชื่อ (A-Z)
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          const comparison = valA.localeCompare(valB);
          return sortDirection === 'asc' ? comparison : -comparison;
        }
       
        // จัดเรียงตามสารอาหาร (DMB / As Fed)
        const moistureA = parseFloat(a.nutrition.moisture);
        const moistureB = parseFloat(b.nutrition.moisture);

        if (sortBy === 'proteinDMB') {
          valA = parseFloat(calculateDMB(a.nutrition.protein, moistureA));
          valB = parseFloat(calculateDMB(b.nutrition.protein, moistureB));
        } else if (sortBy === 'moisture') {
          valA = moistureA;
          valB = moistureB;
        } else {
          return 0;
        }
       
        const comparison = valA - valB;
        // 'desc' คือ มากไปน้อย (valA - valB) -> -comparison
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return currentData;
  }, [filterType, filterAge, filterBrand, sortBy, sortDirection]);

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
  
   <h1 className={styles.pageTitle}>
    😻 เปรียบเทียบอาหารแมว
   </h1>

    <div className={styles.infoSection}>
     <h2>📚 ข้อมูลสำหรับการเปรียบเทียบและการอ่านค่าโภชนาการ</h2>
     <div className={styles.infoContent}>
      <p>
    เพื่อให้การเปรียบเทียบระหว่างอาหารเม็ด (Dry) และอาหารเปียก (Wet) เป็นไปอย่างเที่ยงตรง ตารางเปรียบเทียบจะใช้ค่า **Dry Matter Basis (DMB)** สำหรับสารอาหารหลัก (โปรตีน ไขมัน และใยอาหาร)
      </p>
      <h3>🔬 Dry Matter Basis (DMB) คืออะไร?</h3>
      <ul>
    <li>ค่า **As Fed** (ค่าที่ระบุบนฉลาก) คือสัดส่วนสารอาหารในอาหาร "ตามที่เห็น" ซึ่งรวมน้ำเข้าไปด้วย</li>
    <li>ค่า **DMB** คือสัดส่วนสารอาหาร **หลังจากที่เอาน้ำออกไปหมดแล้ว** ซึ่งทำให้เราสามารถเปรียบเทียบโภชนาการที่แมวได้รับจริงจากอาหารต่างประเภทกันได้อย่างยุติธรรม</li>
      </ul>
      <h3>📊 สารอาหารหลักที่ใช้ดู:</h3>
      <ul>
    <li>
     <strong>โปรตีน (Protein):</strong> ใช้ค่า DMB เป็นหลัก เพราะแมวต้องการโปรตีนสูง โดยเฉพาะโปรตีนจากสัตว์เป็นหลัก
    </li>
    <li>
     <strong>ความชื้น (Moisture):</strong> ใช้ค่า As Fed เนื่องจากเป็นตัวบอกปริมาณน้ำที่แมวจะได้รับ (อาหารเปียกมีประโยชน์ด้านความชื้นสูงกว่า)
    </li>
    <li>
     <strong>ทอรีน (Taurine):</strong> ใช้ค่า As Fed เพราะเป็นกรดอะมิโนจำเป็นที่แมวสร้างเองไม่ได้
    </li>
      </ul>
      <p style={{ marginTop: '15px', fontSize: '0.9em', color: '#888' }}>
    **หมายเหตุ:** ในตารางเปรียบเทียบ จะมีการไฮไลต์ค่าที่ดีที่สุด (โปรตีน/ไขมัน/ทอรีนสูงสุด และความชื้นต่ำสุด) เพื่อช่วยในการตัดสินใจ
      </p>
     </div>
    </div>

  
   {/* --- Filter Controls --- */}
   <div className={styles.filterControls}>

    {/* Filter แบรนด์ (Multi-select Dropdown) */}
    <div className={styles.filterGroup}>
     <label>แบรนด์:</label>
    
     <div className={styles.brandDropdownContainer}>
      {/* ปุ่มสำหรับเปิด/ปิด Dropdown */}
      <button
       className={`${styles.dropdownToggle} ${isBrandDropdownOpen ? styles.dropdownActive : ''}`}
       onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
      >
       เลือกแบรนด์ ({filterBrand.length} รายการ) {isBrandDropdownOpen ? '▲' : '▼'}
      </button>

      {/* Dropdown List */}
      {isBrandDropdownOpen && (
       <div className={styles.dropdownMenu}>
        {brandOptions.map(option => (
         <div
          key={option}
          className={`${styles.dropdownItem} ${filterBrand.includes(option) ? styles.dropdownActiveItem : ''}`}
          onClick={() => toggleFilter(filterBrand, setFilterBrand, option)}
         >
          {filterBrand.includes(option) ? '✅' : '⬜'} {option}
         </div>
        ))}
       </div>
      )}

      {/* แสดง Brand ที่ถูกเลือกเป็น Tag */}
      {filterBrand.length > 0 && (
       <div className={styles.selectedTags}>
        {filterBrand.map(brand => (
         <span
          key={brand}
          className={styles.brandTag}
          onClick={(e) => {
           e.stopPropagation();
           toggleFilter(filterBrand, setFilterBrand, brand);
          }}
         >
          {brand} &times;
         </span>
        ))}
       </div>
      )}
     </div>
    </div>

    {/* Filter ประเภทอาหาร (Button Group) */}
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

    {/* Filter อายุแมว (Button Group) */}
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
       
        {/* 🛑 Filter การจัดเรียง (Sorting Dropdown) */}
        <div className={styles.filterGroup}>
          <label>จัดเรียงตาม:</label>
          <div className={styles.buttonGroup}>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                // ตั้งค่าทิศทางเริ่มต้นตามความเหมาะสม
                if (e.target.value === 'name') {
                  setSortDirection('asc');
                } else if (e.target.value !== 'none') {
                  setSortDirection('desc');
                } else {
                  setSortDirection('desc'); // รีเซ็ตเป็นค่าเริ่มต้น
                }
              }}
              className={styles.sortSelect}
            >
              <option value="none">-- ไม่จัดเรียง --</option>
              <option value="proteinDMB">โปรตีน (DMB) สูงสุด</option>
              <option value="moisture">ความชื้น (As Fed) สูงสุด</option>
              <option value="name">ชื่อ</option>
            </select>
           
            {/* ปุ่มสลับทิศทาง (แสดงเมื่อไม่ได้เลือก 'none') */}
            {sortBy !== 'none' && (
              <button
                onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
                className={`${styles.filterButton} ${styles.sortDirectionButton} ${sortDirection === 'desc' ? styles.active : ''}`}
              >
                {sortBy === 'name'
                  ? (sortDirection === 'asc' ? 'A-Z' : 'Z-A')
                  : (sortDirection === 'desc' ? '⬇️ สูงไปต่ำ' : '⬆️ ต่ำไปสูง')}
              </button>
            )}
          </div>
        </div>
       
   </div>
   {/* --- สิ้นสุด Filter Controls --- */}

   {/* Floating Button Wrapper */}
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


   {/* ส่วน Grid แสดง Card อาหารที่ถูกกรองและจัดเรียงแล้ว */}
   <div className={styles.foodGrid}>
    {sortedAndFilteredFood.length > 0 ? (
     sortedAndFilteredFood.map((food) => (
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