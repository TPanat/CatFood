// pages/index.js (หรือ pages/index.tsx)
import { catFoodData } from '../data/catFoodData';

const Home = () => {
  // หัวข้อโภชนาการที่ต้องการเปรียบเทียบ
  const nutritionKeys = ['protein', 'fat', 'fiber', 'moisture', 'taurine'];

  return (
    <div style={{ padding: '20px' }}>
      <h1>🐱 ตารางเปรียบเทียบอาหารแมว (แห้ง vs. เปียก)</h1>
      <p>ข้อมูลส่วนผสมและอัตราส่วนโภชนาการ</p>
      
      {/* ตารางเปรียบเทียบหลัก */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={styles.th}>รายละเอียด</th>
            {catFoodData.map((food) => (
              <th key={food.id} style={styles.th}>
                {food.name} ({food.type})
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* แถวส่วนผสม */}
          <tr>
            <td style={styles.tdTitle}>**ส่วนผสมหลัก**</td>
            {catFoodData.map((food) => (
              <td key={food.id} style={styles.td}>
                {food.ingredients.join(', ')}
              </td>
            ))}
          </tr>
          
          {/* แถวข้อมูลโภชนาการ */}
          <tr style={{ backgroundColor: '#e6f7ff' }}>
            <td colSpan={catFoodData.length + 1} style={styles.tdHeader}>
              **อัตราส่วนโภชนาการ (Guaranteed Analysis)**
            </td>
          </tr>
          
          {nutritionKeys.map((key) => (
            <tr key={key}>
              <td style={styles.tdTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
              {catFoodData.map((food) => (
                <td key={food.id} style={styles.td}>
                  {food.nutrition[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;

// สไตล์แบบง่ายๆ (สามารถย้ายไปที่ไฟล์ CSS เช่น styles/globals.css ได้)
const styles = {
  th: { border: '1px solid #ddd', padding: '10px', textAlign: 'left', backgroundColor: '#add8e6' },
  td: { border: '1px solid #ddd', padding: '10px', verticalAlign: 'top' },
  tdTitle: { border: '1px solid #ddd', padding: '10px', fontWeight: 'bold', backgroundColor: '#f9f9f9' },
  tdHeader: { border: '1px solid #ddd', padding: '10px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ccedff' },
};