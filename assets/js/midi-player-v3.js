(() => {
  const button = document.querySelector('#music-toggle');
  if (!button || !window.ATHS_MIDI_BASE64) return;
  let context, master, song, loopTimer, muted = false, scheduled = false;
  const setButton = () => {
    button.textContent = muted ? '🔇' : '🔊';
    button.setAttribute('aria-pressed', String(!muted));
    button.setAttribute('aria-label', muted ? 'Unmute background music' : 'Mute background music');
    button.title = muted ? 'Unmute background music' : 'Mute background music';
  };
  const readVar = (b,s) => { let v=0,n; do{n=b[s.i++];v=(v<<7)|(n&127)}while(n&128);return v };
  function parse(){
    const raw=atob(window.ATHS_MIDI_BASE64),b=Uint8Array.from(raw,c=>c.charCodeAt(0)),v=new DataView(b.buffer);
    const tracks=v.getUint16(10),division=v.getUint16(12);let pos=8+v.getUint32(4),tempo=500000,maxTick=0,notes=[];
    for(let t=0;t<tracks;t++){
      const end=pos+8+v.getUint32(pos+4),s={i:pos+8},active=new Map(),program=Array(16).fill(0);let tick=0,running=0;
      while(s.i<end){tick+=readVar(b,s);let status=b[s.i++];if(status<128){s.i--;status=running}else if(status<240)running=status;
        if(status===255){const type=b[s.i++],len=readVar(b,s);if(type===81&&len===3&&tempo===500000)tempo=(b[s.i]<<16)|(b[s.i+1]<<8)|b[s.i+2];s.i+=len;continue}
        if(status===240||status===247){s.i+=readVar(b,s);continue}const kind=status&240,ch=status&15;
        if(kind===192){program[ch]=b[s.i++];continue}if(kind===208){s.i++;continue}const note=b[s.i++],value=b[s.i++],key=`${ch}:${note}`;
        if(kind===144&&value>0)active.set(key,{tick,note,velocity:value,channel:ch,program:program[ch]});
        else if(kind===128||(kind===144&&value===0)){const n=active.get(key);if(n){n.end=tick;notes.push(n);active.delete(key)}}
      }pos=end;
    }maxTick=notes.reduce((m,n)=>Math.max(m,n.end||n.tick),0);const unit=tempo/1e6/division;return{notes:notes.map(n=>({...n,start:n.tick*unit,duration:Math.max(.07,(n.end-n.tick)*unit)})),duration:maxTick*unit+.75}
  }
  const wave=p=>p>=40&&p<56?'sawtooth':p>=80?'square':p<16?'triangle':'sine';
  function schedule(){
    context ||= new(window.AudioContext||window.webkitAudioContext)(); song ||= parse();
    master ||= context.createGain(); if(!master.connected){master.connect(context.destination);master.connected=true}
    master.gain.setValueAtTime(muted?0:.18,context.currentTime);
    const start=context.currentTime+.06; song.notes.forEach(n=>{if(n.channel===9)return;const o=context.createOscillator(),g=context.createGain(),at=start+n.start,level=Math.max(.003,n.velocity/127*.045);o.type=wave(n.program);o.frequency.value=440*Math.pow(2,(n.note-69)/12);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(level,at+.012);g.gain.setValueAtTime(level*.8,at+n.duration*.75);g.gain.exponentialRampToValueAtTime(.0001,at+n.duration);o.connect(g);g.connect(master);o.start(at);o.stop(at+n.duration+.02)});
    scheduled=true;clearTimeout(loopTimer);loopTimer=setTimeout(schedule,song.duration*1000);
    context.resume().catch(()=>{});setButton();
  }
  function toggle(){
    if(!scheduled)schedule();
    muted=!muted;
    if(!muted)context?.resume().catch(()=>{});
    master.gain.setTargetAtTime(muted?.0001:.18,context.currentTime,.03);
    setButton();
  }
  button.addEventListener('click',e=>{e.stopPropagation();toggle()});
  const unlock=()=>{if(!scheduled)schedule();if(!muted)context?.resume().catch(()=>{})};
  document.addEventListener('pointerdown',unlock,{once:true});document.addEventListener('keydown',unlock,{once:true});
  setButton();
  try{schedule()}catch{muted=true;setButton()}
  setInterval(()=>{if(!muted&&context?.state==='suspended'&&navigator.userActivation?.hasBeenActive)context.resume().catch(()=>{})},350)
})();
