/* UniHop wordmark: a dotted jump from the dot of "i" over to "o". From the "Логотип 2 · Прыжок" design. */
export default function Logo({ height = 30, onYellow = false }){
  return (
    <svg width={Math.round(height * 460 / 170)} height={height} viewBox="0 0 460 170" role="img" aria-label="UniHop">
      <path d="M198 64 Q262 -14 318 88" fill="none" stroke="#111318" strokeWidth="8" strokeLinecap="round" strokeDasharray="1 14" />
      <path d="M306 80 L318 90 L324 74" fill="none" stroke="#111318" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="198" cy="64" r="11" fill={onYellow ? '#FFFFFF' : '#FFD23F'} stroke="#111318" strokeWidth="5" />
      <text x="40" y="152" textLength="380" lengthAdjust="spacingAndGlyphs" style={{fontFamily:'Unbounded, sans-serif', fontWeight:800, fontSize:84}}>
        <tspan fill="#111318">Uni</tspan><tspan fill="#2340E0">Hop</tspan>
      </text>
    </svg>
  );
}
