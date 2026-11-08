import { KOYAN_IMG } from '../data/koyanImages.js';

/* The mascot Қоян. Poses: idle, joy, question, graduate, support, laptop, travel, celebrate, love, backpack.
   Pictures are built into the code (KOYAN_IMG), so the site needs no image folder. */
export default function Koyan({ pose = 'idle', size = 120, alt = '' }){
  return <img className="koyan" src={KOYAN_IMG[pose] || KOYAN_IMG.idle} width={size} height={size} alt={alt} />;
}
