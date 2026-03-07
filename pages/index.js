// pages/index.js
import Head from 'next/head';
import { useState, useMemo } from 'react';
import { catFoodData } from '../data/catFoodData';

// ── Helpers ──────────────────────────────────────────────────

// Nutrition values in catFoodData are strings — always parse before arithmetic
const n = (val) => parseFloat(val) || 0;

const calcDMB = (val, moisture) => {
  const dm = 1 - n(moisture) / 100;
  if (dm <= 0) return 'N/A';
  return ((n(val) / 100 / dm) * 100).toFixed(1);
};

// Generate a soft tint colour from food type (no color field in real data)
const typeColor = (type) => {
  if (!type) return '#f5f3ef';
  const t = type.toLowerCase();
  if (t.includes('wet'))         return '#e3f2fd';
  if (t.includes('freeze'))      return '#fff8e1';
  if (t.includes('prescription')) return '#fce4ec';
  return '#e8f4ea'; // dry default
};

const TYPES  = ['Dry', 'Wet', 'Freeze-Dried', 'Prescription'];
const BRANDS = [...new Set(catFoodData.map(f => f.brand))].sort();

// ── Certification config ──────────────────────────────────────
// Real data has no cert fields — we keep the seal component ready
// for when you add aafco/certifications to catFoodData later.
const CERT_CONFIG = {
  'AAFCO':     { abbr: 'AAFCO', full: 'Assoc. of American Feed Control Officials', shape: 'shield',  color: '#1B3A2D', accent: '#4ade80', bg: '#e8f4ea',  desc: 'Nutritionally complete & balanced' },
  'WSAVA':     { abbr: 'WSAVA', full: 'World Small Animal Veterinary Association',  shape: 'cross',   color: '#0c5c8a', accent: '#38bdf8', bg: '#e3f2fd',  desc: 'Veterinary nutrition guidelines' },
  'ISO 9001':  { abbr: 'ISO\n9001', full: 'ISO Quality Management System',          shape: 'ring',    color: '#5a3e8a', accent: '#c084fc', bg: '#f3e5f5',  desc: 'International quality standard' },
  'GMP':       { abbr: 'GMP',   full: 'Good Manufacturing Practice',               shape: 'hex',     color: '#7a4500', accent: '#fb923c', bg: '#fff3e0',  desc: 'Good manufacturing practice' },
  'Halal':     { abbr: 'HALAL', full: 'Halal Certified',                            shape: 'star',    color: '#166534', accent: '#86efac', bg: '#dcfce7',  desc: 'Certified Halal manufacturing' },
  'TÜV SÜD':  { abbr: 'TÜV',   full: 'TÜV SÜD Safety & Quality',                  shape: 'diamond', color: '#1e3a5f', accent: '#60a5fa', bg: '#eff6ff',  desc: 'International safety certification' },
};

// ── SVG Seal Badge ────────────────────────────────────────────
const SealBadge = ({ certKey, size = 72 }) => {
  const cfg = CERT_CONFIG[certKey] || {
    abbr: certKey?.slice(0, 4) ?? '?', full: certKey, shape: 'ring',
    color: '#555', accent: '#aaa', bg: '#f5f5f5', desc: '',
  };
  const cx = size / 2, cy = size / 2, r = size * 0.41;
  const outerR = r + size * 0.065;
  const lines = cfg.abbr.split('\n');
  const fontSize = lines.length > 1 ? size * 0.142 : size * 0.162;
  const lineH = fontSize * 1.18;
  const uid = (certKey ?? 'x').replace(/[\s&]/g, '_');

  const ShapeAccent = () => {
    const o = 0.45, sw = size * 0.028;
    if (cfg.shape === 'shield') {
      const w = size*0.36, h = size*0.42, sy = cy - h*0.46;
      return <path d={`M${cx} ${sy} L${cx+w/2} ${sy+h*0.22} L${cx+w/2} ${sy+h*0.62} Q${cx+w/2} ${sy+h} ${cx} ${sy+h} Q${cx-w/2} ${sy+h} ${cx-w/2} ${sy+h*0.62} L${cx-w/2} ${sy+h*0.22} Z`} fill="none" stroke={cfg.accent} strokeWidth={sw} opacity={o}/>;
    }
    if (cfg.shape === 'cross') {
      const a = size*0.11, l = size*0.21;
      return <g opacity={o}><rect x={cx-a/2} y={cy-l} width={a} height={l*2} rx={a/3} fill={cfg.accent}/><rect x={cx-l} y={cy-a/2} width={l*2} height={a} rx={a/3} fill={cfg.accent}/></g>;
    }
    if (cfg.shape === 'star') {
      const pts = Array.from({length:6},(_,i)=>{ const a=(i*60-90)*Math.PI/180, rr=size*0.155; return `${cx+rr*Math.cos(a)},${cy+rr*Math.sin(a)}`; }).join(' ');
      return <polygon points={pts} fill="none" stroke={cfg.accent} strokeWidth={sw} opacity={o}/>;
    }
    if (cfg.shape === 'diamond') {
      const d = size*0.16;
      return <polygon points={`${cx},${cy-d} ${cx+d},${cy} ${cx},${cy+d} ${cx-d},${cy}`} fill="none" stroke={cfg.accent} strokeWidth={sw} opacity={o}/>;
    }
    if (cfg.shape === 'leaf') {
      const d = size*0.16;
      return <path d={`M${cx} ${cy-d} Q${cx+d} ${cy} ${cx} ${cy+d} Q${cx-d} ${cy} ${cx} ${cy-d}`} fill="none" stroke={cfg.accent} strokeWidth={sw} opacity={o}/>;
    }
    const pts = Array.from({length:6},(_,i)=>{ const a=(i*60)*Math.PI/180, rr=size*0.155; return `${cx+rr*Math.cos(a)},${cy+rr*Math.sin(a)}`; }).join(' ');
    return <polygon points={pts} fill="none" stroke={cfg.accent} strokeWidth={sw} opacity={o}/>;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <radialGradient id={`g_${uid}`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={cfg.bg}/>
          <stop offset="100%" stopColor={cfg.color} stopOpacity="0.07"/>
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={cfg.color} strokeWidth={size*0.02} strokeDasharray="3,3" opacity="0.25"/>
      <circle cx={cx} cy={cy} r={r} fill={`url(#g_${uid})`} stroke={cfg.color} strokeWidth={size*0.032}/>
      <circle cx={cx} cy={cy} r={r*0.80} fill="none" stroke={cfg.accent} strokeWidth={size*0.016} opacity="0.38"/>
      <ShapeAccent/>
      {lines.map((line, i) => (
        <text key={i} x={cx} y={cy + (i - (lines.length-1)/2)*lineH + fontSize*0.36}
          textAnchor="middle" fontFamily="'Outfit',sans-serif" fontWeight="800"
          fontSize={fontSize} fill={cfg.color} letterSpacing="0.03em">
          {line}
        </text>
      ))}
      <path id={`arc_${uid}`} d={`M${cx-r*0.68} ${cy+r*0.70} A${r*0.70} ${r*0.70} 0 0 1 ${cx+r*0.68} ${cy+r*0.70}`} fill="none"/>
      <text fontFamily="'Outfit',sans-serif" fontWeight="700" fontSize={size*0.09} fill={cfg.color} opacity="0.55" letterSpacing="0.07em">
        <textPath href={`#arc_${uid}`} startOffset="50%" textAnchor="middle">CERTIFIED</textPath>
      </text>
    </svg>
  );
};

const MiniSeal = ({ certKey }) => {
  const cfg = CERT_CONFIG[certKey] || { abbr: '?', color: '#555', bg: '#eee' };
  const lines = cfg.abbr.split('\n');
  return (
    <div title={cfg.full} style={{ width: 34, height: 34, borderRadius: '50%', background: cfg.bg, border: `2px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.10)', flexShrink: 0 }}>
      <span style={{ fontSize: lines.length > 1 ? 7.5 : 8.5, fontWeight: 800, color: cfg.color, textAlign: 'center', lineHeight: 1.1, whiteSpace: 'pre' }}>{cfg.abbr}</span>
    </div>
  );
};

// ── Nutrient Bar ──────────────────────────────────────────────
const NutrientBar = ({ label, value, max, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#5a6a5e', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#1B3A2D' }}>{value}%</span>
    </div>
    <div style={{ height: 6, background: '#E8EDE9', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 99, transition: 'width 0.6s cubic-bezier(.34,1.56,.64,1)' }}/>
    </div>
  </div>
);

const Badge = ({ children, color = '#1B3A2D', bg = '#e8f4ea' }) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{children}</span>
);

// ── Food Card ─────────────────────────────────────────────────
const FoodCard = ({ food, selected, onSelect, onDetail, compareCount }) => {
  const canSelect = selected || compareCount < 3;
  const dmbProtein = calcDMB(food.nutrition.protein, food.nutrition.moisture);
  const color = typeColor(food.type);
  const certs = food.certifications || [];

  return (
    <div onClick={() => onDetail(food)} style={{
      background: 'white', borderRadius: 20,
      border: selected ? '2.5px solid #2D6A4F' : '1.5px solid #E8EDE9',
      boxShadow: selected ? '0 0 0 4px rgba(45,106,79,0.12),0 8px 24px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.05)',
      cursor: 'pointer', transition: 'all 0.22s ease', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', position: 'relative',
      transform: selected ? 'translateY(-2px)' : 'none',
    }}>
      {/* Image hero */}
      <div style={{ background: color, aspectRatio: '3/4', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {food.imageUrl ? (
          <img
            src={food.imageUrl}
            alt={food.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12, transition: 'transform 0.3s ease' }}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        {/* Fallback placeholder shown if image missing */}
        <div style={{ display: food.imageUrl ? 'none' : 'flex', position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', fontSize: 52, opacity: 0.3 }}>🐱</div>

        {/* Type pill — top left */}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge
            color={food.type?.includes('Wet') ? '#0c5c8a' : food.type?.includes('Freeze') ? '#6b3fa0' : food.type?.includes('Prescription') ? '#9a1515' : '#1B3A2D'}
            bg={food.type?.includes('Wet') ? '#e3f2fd' : food.type?.includes('Freeze') ? '#f3e5f5' : food.type?.includes('Prescription') ? '#fce4ec' : '#e8f4ea'}>
            {food.type}
          </Badge>
        </div>

        {/* Primary cert mini seal — top right (if data has certifications) */}
        {certs[0] && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <MiniSeal certKey={certs[0]}/>
          </div>
        )}

        {/* AAFCO indicator — top right when no full cert list */}
        {food.aafco && !certs[0] && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <MiniSeal certKey="AAFCO"/>
          </div>
        )}

        {/* Compare toggle — bottom right */}
        <button
          onClick={e => { e.stopPropagation(); if (canSelect) onSelect(food.id); }}
          style={{
            position: 'absolute', bottom: 10, right: 10,
            background: selected ? '#2D6A4F' : canSelect ? 'white' : '#f0f0f0',
            color: selected ? 'white' : canSelect ? '#2D6A4F' : '#aaa',
            border: `2px solid ${selected ? '#2D6A4F' : canSelect ? '#2D6A4F' : '#ddd'}`,
            borderRadius: 99, width: 34, height: 34, fontSize: 16,
            cursor: canSelect ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.18s', boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
          title={selected ? 'ยกเลิกเปรียบเทียบ' : canSelect ? 'เพิ่มเปรียบเทียบ' : 'เลือกได้สูงสุด 3 รายการ'}
        >
          {selected ? '✓' : '+'}
        </button>
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8a9e8f', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 3 }}>{food.brand}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1B3A2D', lineHeight: 1.3, fontFamily: 'Georgia, serif' }}>{food.name}</div>
        </div>

        {/* Protein DMB highlight */}
        <div style={{ background: '#f5faf6', borderRadius: 10, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#5a7a60', fontWeight: 600 }}>Protein (DMB)</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#2D6A4F' }}>{dmbProtein}%</span>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'Fat',   val: food.nutrition.fat },
            { label: 'Fiber', val: food.nutrition.fiber },
            { label: 'H₂O',  val: food.nutrition.moisture },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#fafafa', borderRadius: 8, padding: '5px 4px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{s.val}%</div>
              <div style={{ fontSize: 10, color: '#999', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Age */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
          <Badge color="#5a6a5e" bg="#f0f4f1">{food.age}</Badge>
          {food.foodcode && <span style={{ fontSize: 10, color: '#ddd', fontWeight: 500 }}>{food.foodcode}</span>}
        </div>
      </div>
    </div>
  );
};

// ── Detail Drawer ─────────────────────────────────────────────
const DetailDrawer = ({ food, onClose, selected, onSelect, compareCount }) => {
  const [tab, setTab] = useState('nutrition');
  if (!food) return null;
  const canSelect = selected || compareCount < 3;
  const color = typeColor(food.type);
  const certs = food.certifications || [];
  const hasAafco = food.aafco || certs.includes('AAFCO');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }} onClick={onClose}>
      <div style={{ flex: 1, background: 'rgba(10,20,15,0.5)', backdropFilter: 'blur(4px)' }}/>
      <div onClick={e => e.stopPropagation()} style={{
        width: 'min(480px,100vw)', background: 'white', overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.28s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
        {/* Hero */}
        <div style={{ background: color, padding: '40px 24px 24px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: 99, width: 36, height: 36, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>

          {/* Product image */}
          <div style={{ width: 140, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {food.imageUrl ? (
              <img src={food.imageUrl} alt={food.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 12, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))' }}/>
            ) : (
              <div style={{ fontSize: 72, opacity: 0.4 }}>🐱</div>
            )}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7e70', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{food.brand}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1B3A2D', textAlign: 'center', lineHeight: 1.25, fontFamily: 'Georgia, serif' }}>{food.name}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Badge>{food.type}</Badge>
            <Badge color="#5a6a00" bg="#f0f7e1">{food.age}</Badge>
            {food.foodcode && <Badge color="#888" bg="#f5f5f5">#{food.foodcode}</Badge>}
          </div>
        </div>

        {/* AAFCO banner */}
        <div style={{ padding: '18px 24px 4px' }}>
          {hasAafco ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg,#1B3A2D,#2D6A4F)', borderRadius: 16, padding: '14px 18px', marginBottom: 12 }}>
              <SealBadge certKey="AAFCO" size={60}/>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Certified</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'white', marginTop: 2 }}>{food.aafcoLabel || 'AAFCO Certified'}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>Association of American Feed Control Officials</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff8e1', border: '1.5px solid #f0c040', borderRadius: 12, padding: '11px 14px', marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#7a5a00' }}>ไม่มีข้อมูลการรับรอง AAFCO</div>
                <div style={{ fontSize: 11, color: '#a07820', marginTop: 2 }}>ควรปรึกษาสัตวแพทย์เพื่อความมั่นใจ</div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', display: 'flex' }}>
          {['nutrition', 'ingredients', certs.length > 0 ? 'certifications' : null].filter(Boolean).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '12px 4px', border: 'none', background: 'none',
              fontWeight: 700, fontSize: 11, cursor: 'pointer',
              textTransform: 'capitalize', letterSpacing: '0.04em',
              color: tab === t ? '#2D6A4F' : '#aaa',
              borderBottom: tab === t ? '2.5px solid #2D6A4F' : '2.5px solid transparent',
              transition: 'all 0.15s',
            }}>{t}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: 24, flex: 1 }}>

          {tab === 'nutrition' && (
            <div>
              <div style={{ fontSize: 11, color: '#8a9e8f', fontWeight: 700, marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>As Fed Values</div>
              <NutrientBar label="Protein"  value={n(food.nutrition.protein)}  max={50}  color="#2D6A4F"/>
              <NutrientBar label="Fat"      value={n(food.nutrition.fat)}      max={50}  color="#D97706"/>
              <NutrientBar label="Fiber"    value={n(food.nutrition.fiber)}    max={15}  color="#0891b2"/>
              <NutrientBar label="Moisture" value={n(food.nutrition.moisture)} max={100} color="#6366f1"/>
              {food.nutrition.ash    && <NutrientBar label="Ash"    value={n(food.nutrition.ash)}    max={15} color="#94a3b8"/>}
              {food.nutrition.taurine && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f0f0f0', marginTop: 4 }}>
                  <span style={{ fontSize: 13, color: '#5a7a60', fontWeight: 600 }}>Taurine</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1B3A2D' }}>{food.nutrition.taurine}%</span>
                </div>
              )}

              {/* DMB section */}
              <div style={{ background: '#f5faf6', borderRadius: 12, padding: 14, marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5a7a60', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Dry Matter Basis (DMB)</div>
                {['protein', 'fat', 'fiber'].map(k => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #dceadf' }}>
                    <span style={{ fontSize: 13, color: '#5a7a60', textTransform: 'capitalize' }}>{k}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1B3A2D' }}>{calcDMB(food.nutrition[k], food.nutrition.moisture)}%</span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 10, lineHeight: 1.5 }}>
                  DMB คือค่าหลังหักความชื้นออก ช่วยเปรียบเทียบอาหารเปียกและแห้งได้อย่างยุติธรรม
                </div>
              </div>
            </div>
          )}

          {tab === 'ingredients' && (
            <div>
              <div style={{ fontSize: 11, color: '#8a9e8f', fontWeight: 700, marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>ส่วนประกอบ</div>
              {food.ingredients && food.ingredients.length > 0 ? (
                <>
                  {food.ingredients.map((ing, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <div style={{ width: 24, height: 24, borderRadius: 99, background: i < 3 ? '#2D6A4F' : '#eee', color: i < 3 ? 'white' : '#888', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ fontSize: 14, color: '#2a3a2d', fontWeight: i < 3 ? 600 : 400, flex: 1 }}>{ing}</span>
                      {i < 3 && <span style={{ fontSize: 10, color: '#2D6A4F', fontWeight: 700, background: '#e8f4ea', padding: '2px 7px', borderRadius: 99, flexShrink: 0 }}>หลัก</span>}
                    </div>
                  ))}
                  <div style={{ marginTop: 14, background: '#fef3c7', borderRadius: 10, padding: 12, fontSize: 12, color: '#7a5a00', lineHeight: 1.6 }}>
                    💡 ส่วนประกอบเรียงตามน้ำหนัก 3 อันดับแรกมีปริมาณมากที่สุดในสูตร
                  </div>
                </>
              ) : (
                <div style={{ color: '#bbb', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>ไม่มีข้อมูลส่วนประกอบ</div>
              )}
            </div>
          )}

          {tab === 'certifications' && certs.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: '#8a9e8f', fontWeight: 700, marginBottom: 18, letterSpacing: '0.06em', textTransform: 'uppercase' }}>การรับรองมาตรฐาน</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(128px,1fr))', gap: 14 }}>
                {certs.map(cert => {
                  const cfg = CERT_CONFIG[cert] || { full: cert, bg: '#f5f5f5', color: '#555', desc: '' };
                  return (
                    <div key={cert} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 14, background: cfg.bg, borderRadius: 16, border: `1.5px solid ${cfg.color}20` }}>
                      <SealBadge certKey={cert} size={84}/>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cert}</div>
                        <div style={{ fontSize: 10, color: '#888', marginTop: 3, lineHeight: 1.4 }}>{cfg.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', background: 'white', position: 'sticky', bottom: 0 }}>
          <button
            onClick={() => { if (canSelect) onSelect(food.id); }}
            disabled={!canSelect}
            style={{
              width: '100%', padding: 14, borderRadius: 14, border: 'none',
              background: selected ? '#2D6A4F' : canSelect ? '#1B3A2D' : '#ccc',
              color: 'white', fontWeight: 700, fontSize: 15,
              cursor: canSelect ? 'pointer' : 'not-allowed', transition: 'background 0.18s',
            }}
          >
            {selected ? '✓ ยกเลิกการเปรียบเทียบ' : canSelect ? '+ เพิ่มในการเปรียบเทียบ' : 'เลือกได้สูงสุด 3 รายการ'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Comparison Tray ───────────────────────────────────────────
const ComparisonTray = ({ items, onRemove, onClear }) => {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const KEYS = ['protein', 'fat', 'fiber', 'moisture', 'taurine'];
  const LABELS = { protein: 'Protein (DMB)', fat: 'Fat (DMB)', fiber: 'Fiber (DMB)', moisture: 'Moisture (As Fed)', taurine: 'Taurine (As Fed)' };

  const getValue = (food, key) =>
    ['protein', 'fat', 'fiber'].includes(key)
      ? parseFloat(calcDMB(food.nutrition[key], food.nutrition.moisture))
      : n(food.nutrition[key]);

  const getBest = key => Math.max(...items.map(f => getValue(f, key)));

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 900, background: 'white', boxShadow: '0 -6px 30px rgba(0,0,0,0.10)', borderRadius: '20px 20px 0 0', maxHeight: expanded ? '85vh' : 'auto', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'max-height 0.3s ease' }}>

      {/* Handle + header */}
      <div style={{ padding: '10px 20px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderBottom: expanded ? '1px solid #f0f0f0' : 'none' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 36, height: 4, borderRadius: 99, background: '#e0e0e0' }}/>

        <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto', paddingTop: 6, paddingBottom: 2 }}>
          {items.map(food => (
            <div key={food.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: typeColor(food.type), borderRadius: 99, padding: '5px 10px 5px 8px', flexShrink: 0, border: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1B3A2D', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</span>
              <button onClick={e => { e.stopPropagation(); onRemove(food.id); }} style={{ background: 'rgba(0,0,0,0.10)', border: 'none', borderRadius: 99, width: 16, height: 16, fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>✕</button>
            </div>
          ))}
          {items.length < 3 && (
            <div style={{ flexShrink: 0, border: '2px dashed #ccc', borderRadius: 99, padding: '5px 14px', fontSize: 11, color: '#aaa', whiteSpace: 'nowrap' }}>
              + เพิ่มอีก {3 - items.length} รายการ
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); setExpanded(!expanded); }} style={{ background: '#1B3A2D', color: 'white', border: 'none', borderRadius: 99, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {expanded ? '▼ ปิด' : '📊 เปรียบเทียบ'}
          </button>
          <button onClick={e => { e.stopPropagation(); onClear(); setExpanded(false); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 99, padding: '8px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>ล้าง</button>
        </div>
      </div>

      {/* Comparison table */}
      {expanded && (
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
              <thead>
                <tr style={{ background: '#f5faf6' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#7a8a7e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 110 }}>สารอาหาร</th>
                  {items.map(food => (
                    <th key={food.id} style={{ padding: '12px 16px', textAlign: 'center', minWidth: 150 }}>
                      {food.imageUrl && (
                        <img src={food.imageUrl} alt={food.name} style={{ width: 48, height: 60, objectFit: 'contain', borderRadius: 8, marginBottom: 6, display: 'block', margin: '0 auto 6px' }}/>
                      )}
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#1B3A2D' }}>{food.name}</div>
                      <div style={{ fontSize: 10, color: '#8a9e8f', fontWeight: 600, marginBottom: 6 }}>{food.brand}</div>
                      {/* Cert seals if available */}
                      {(food.certifications || []).length > 0 && (
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          {(food.certifications || []).slice(0, 2).map(c => <MiniSeal key={c} certKey={c}/>)}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* AAFCO row */}
                <tr style={{ background: '#fafafa' }}>
                  <td style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#5a6a5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AAFCO</td>
                  {items.map(food => {
                    const hasAafco = food.aafco || (food.certifications || []).includes('AAFCO');
                    return (
                      <td key={food.id} style={{ padding: '10px 16px', textAlign: 'center' }}>
                        {hasAafco
                          ? <span style={{ fontSize: 12, fontWeight: 700, color: '#2D6A4F', background: '#e8f4ea', padding: '3px 10px', borderRadius: 99 }}>✅ Certified</span>
                          : <span style={{ fontSize: 12, color: '#aaa', background: '#f5f5f5', padding: '3px 10px', borderRadius: 99 }}>ไม่มีข้อมูล</span>
                        }
                      </td>
                    );
                  })}
                </tr>
                {/* Type */}
                <tr>
                  <td style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#5a6a5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</td>
                  {items.map(food => (
                    <td key={food.id} style={{ padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{food.type}</td>
                  ))}
                </tr>
                {/* Nutrition rows */}
                {KEYS.map((key, ri) => {
                  const best = getBest(key);
                  return (
                    <tr key={key} style={{ background: ri % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#5a6a5e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{key}</div>
                        <div style={{ fontSize: 10, color: '#c0c0c0', marginTop: 1 }}>{LABELS[key]}</div>
                      </td>
                      {items.map(food => {
                        const val = getValue(food, key);
                        const isBest = val === best && items.filter(f => getValue(f, key) === best).length === 1;
                        return (
                          <td key={food.id} style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <span style={{
                              fontSize: 16, fontWeight: isBest ? 800 : 500,
                              color: isBest ? '#2D6A4F' : '#333',
                              background: isBest ? '#e8f4ea' : 'transparent',
                              padding: isBest ? '3px 10px' : '3px 6px',
                              borderRadius: isBest ? 8 : 0,
                              display: 'inline-block',
                            }}>
                              {val}%{isBest && <span style={{ fontSize: 9, verticalAlign: 'super', marginLeft: 2 }}>★</span>}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', fontSize: 11, color: '#bbb', borderTop: '1px solid #f0f0f0' }}>
            ★ ค่าสูงสุดในหมวด &nbsp;·&nbsp; DMB = Dry Matter Basis &nbsp;·&nbsp; As Fed = ค่าบนฉลาก
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
export default function Home() {
  const [filterType, setFilterType]   = useState([]);
  const [filterBrand, setFilterBrand] = useState([]);
  const [compareIds, setCompareIds]   = useState([]);
  const [detailFood, setDetailFood]   = useState(null);
  const [search, setSearch]           = useState('');

  const toggleType   = t  => setFilterType(p  => p.includes(t)  ? p.filter(x => x !== t)  : [...p, t]);
  const toggleBrand  = b  => setFilterBrand(p => p.includes(b)  ? p.filter(x => x !== b)  : [...p, b]);
  const toggleCompare = id => setCompareIds(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 3 ? [...p, id] : p);

  const filtered = useMemo(() => catFoodData.filter(f => {
    const typeOk  = filterType.length  === 0 || filterType.some(t  => {
      if (t === 'Prescription') return f.type.toLowerCase().includes('prescription');
      return f.type.startsWith(t) && !f.type.toLowerCase().includes('prescription');
    });
    const brandOk = filterBrand.length === 0 || filterBrand.includes(f.brand);
    const searchOk = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.brand.toLowerCase().includes(search.toLowerCase());
    return typeOk && brandOk && searchOk;
  }), [filterType, filterBrand, search]);

  const compareItems = catFoodData.filter(f => compareIds.includes(f.id));

  return (
    <>
      <Head>
        <title>PawCompare — เปรียบเทียบอาหารแมว</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>

      <div style={{ fontFamily: "'Outfit','Sarabun',sans-serif", background: '#F7F5F0', minHeight: '100vh' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Sarabun:wght@400;500;600;700&display=swap');
          @keyframes slideInRight { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
          *{box-sizing:border-box;margin:0;padding:0}
          ::-webkit-scrollbar{width:4px;height:4px}
          ::-webkit-scrollbar-thumb{background:#d0d0d0;border-radius:99px}
          button{font-family:inherit}
          input::placeholder{color:rgba(255,255,255,0.4)}
        `}</style>

        {/* ── Header ── */}
        <div style={{ background: '#1B3A2D', color: 'white', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 800, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>😻 PawCompare</div>
              <div style={{ fontSize: 11, opacity: 0.5, marginTop: 1 }}>เปรียบเทียบอาหารแมว</div>
            </div>
            <div style={{ position: 'relative', flex: '1 1 180px', maxWidth: 280 }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 13, opacity: 0.4 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อ หรือแบรนด์..."
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 99, border: 'none', background: 'rgba(255,255,255,0.13)', color: 'white', fontSize: 13, outline: 'none' }}/>
            </div>
            {compareIds.length > 0 && (
              <div style={{ background: '#D97706', borderRadius: 99, padding: '7px 16px', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {compareIds.length}/3 เลือกแล้ว
              </div>
            )}
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '10px 20px', position: 'sticky', top: 57, zIndex: 700 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ประเภท</span>
            {TYPES.map(t => (
              <button key={t} onClick={() => toggleType(t)} style={{ padding: '5px 13px', borderRadius: 99, border: `1.5px solid ${filterType.includes(t) ? '#1B3A2D' : '#e5e5e5'}`, background: filterType.includes(t) ? '#1B3A2D' : 'white', color: filterType.includes(t) ? 'white' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                {t === 'Dry' ? '🟤' : t === 'Wet' ? '💧' : t === 'Freeze-Dried' ? '❄️' : '💊'} {t}
              </button>
            ))}
            <div style={{ width: 1, height: 18, background: '#eee', margin: '0 3px' }}/>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>แบรนด์</span>
            {BRANDS.map(b => (
              <button key={b} onClick={() => toggleBrand(b)} style={{ padding: '5px 13px', borderRadius: 99, border: `1.5px solid ${filterBrand.includes(b) ? '#D97706' : '#e5e5e5'}`, background: filterBrand.includes(b) ? '#fef3c7' : 'white', color: filterBrand.includes(b) ? '#7a5a00' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                {b}
              </button>
            ))}
            {(filterType.length > 0 || filterBrand.length > 0 || search) && (
              <button onClick={() => { setFilterType([]); setFilterBrand([]); setSearch(''); }} style={{ padding: '5px 11px', borderRadius: 99, border: '1.5px solid #fee2e2', background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✕ ล้างตัวกรอง</button>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#ccc' }}>{filtered.length} รายการ</span>
          </div>
        </div>

        {/* ── Grid ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 200px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#bbb' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🐱</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#aaa' }}>ไม่พบข้อมูล</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>ลองเปลี่ยนตัวกรองแล้วลองใหม่</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 16 }}>
              {filtered.map(food => (
                <FoodCard key={food.id} food={food}
                  selected={compareIds.includes(food.id)}
                  onSelect={toggleCompare}
                  onDetail={setDetailFood}
                  compareCount={compareIds.length}
                />
              ))}
            </div>
          )}
        </div>

        {detailFood && (
          <DetailDrawer food={detailFood} onClose={() => setDetailFood(null)}
            selected={compareIds.includes(detailFood.id)}
            onSelect={toggleCompare}
            compareCount={compareIds.length}
          />
        )}

        <ComparisonTray
          items={compareItems}
          onRemove={id => setCompareIds(p => p.filter(x => x !== id))}
          onClear={() => setCompareIds([])}
        />
      </div>
    </>
  );
}