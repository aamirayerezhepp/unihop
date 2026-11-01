import { Public } from '../components/Shell.jsx';
import TestCard from '../components/TestCard.jsx';

export default function TestView(){
  return <Public hero={<section className="wrap hero" style={{justifyContent:'center'}}><div style={{width:'100%', maxWidth:640}}><TestCard /></div></section>} />;
}
