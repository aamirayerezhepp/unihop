/* The mascot Қоян. Poses: idle, joy, question, graduate, support, laptop, travel, celebrate, love, backpack. */
export default function Koyan({ pose = 'idle', size = 120, alt = '' }){
  return <img className="koyan" src={`orientir-assets/koyan-${pose}.png`} width={size} height={size} alt={alt} />;
}
