(() => {
  const button = document.querySelector('#music-toggle');
  if (!button) return;
  let context, master, song, timers = [], playing = false, userMuted = localStorage.getItem('aths-midi-muted') === 'true';
  const readVar = (bytes, state) => { let value=0, b; do { b=bytes[state.i++]; value=(value<<7)|(b&127); } while(b&128); return value; };
  function parseMidi(buffer){
    const b=new Uint8Array(buffer), view=new DataView(buffer); let pos=8;
    const tracks=view.getUint16(10), division=view.getUint16(12); pos=14;
    let tempo=500000, maxTick=0, notes=[];
    for(let t=0;t<tracks;t++){
      if(String.fromCharCode(...b.slice(pos,pos+4))!=='MTrk') break;
      const length=view.getUint32(pos+4), end=pos+8+length; let state={i:pos+8}, tick=0, running=0, active=new Map(), program=new Array(16).fill(0);
      while(state.i<end){
        tick+=readVar(b,state); let status=b[state.i++];
        if(status<128){state.i--;status=running}else running=status;
        if(status===0xff){const type=b[state.i++],len=readVar(b,state);if(type===0x51&&len===3)tempo=(b[state.i]<<16)|(b[state.i+1]<<8)|b[state.i+2];state.i+=len;continue}
        if(status===0xf0||status===0xf7){state.i+=readVar(b,state);continue}
        const kind=status&0xf0,ch=status&15;
        if(kind===0xc0){program[ch]=b[state.i++];continue}
        if(kind===0xd0){state.i++;continue}
        const a=b[state.i++],c=b[state.i++];
        if(kind===0x90&&c>0){active.set(`${ch}:${a}`,{tick,note:a,velocity:c,channel:ch,program:program[ch]})}
        else if(kind===0x80||(kind===0x90&&c===0)){const n=active.get(`${ch}:${a}`);if(n){n.end=tick;notes.push(n);active.delete(`${ch}:${a}`)}}
      }
      maxTick=Math.max(maxTick,tick);pos=end;
    }
    const tickSeconds=tempo/1000000/division;
    return {notes:notes.map(n=>({...n,start:n.tick*tickSeconds,duration:Math.max(.06,(n.end-n.tick)*tickSeconds)})),duration:maxTick*tickSeconds+1};
  }
  async function load(){if(song)return song;const r=await fetch('assets/audio/cp-stng.mid');song=parseMidi(await r.arrayBuffer());return song}
  function stop(){timers.forEach(clearTimeout);timers=[];if(master)master.gain.cancelScheduledValues(context.currentTime);if(master)master.gain.setTargetAtTime(0,context.currentTime,.03);playing=false;button.textContent='🔇 MUSIC MUTED — PLAY';button.setAttribute('aria-pressed','false')}
  function waveform(program,channel){if(channel===9)return'square';if(program>=40&&program<56)return'sawtooth';if(program>=80)return'square';return program<8?'triangle':'sine'}
  async function play(){
    if(userMuted)return; if(!context)context=new(window.AudioContext||window.webkitAudioContext)();await context.resume();const data=await load();
    master=context.createGain();master.gain.value=.12;master.connect(context.destination);const start=context.currentTime+.08;playing=true;button.textContent='🔊 MUSIC ON — MUTE';button.setAttribute('aria-pressed','true');
    data.notes.forEach(n=>{if(n.channel===9)return;const osc=context.createOscillator(),gain=context.createGain();osc.type=waveform(n.program,n.channel);osc.frequency.value=440*Math.pow(2,(n.note-69)/12);gain.gain.setValueAtTime(0,start+n.start);gain.gain.linearRampToValueAtTime(Math.min(.08,n.velocity/127*.065),start+n.start+.015);gain.gain.setValueAtTime(Math.min(.08,n.velocity/127*.055),start+n.start+n.duration*.82);gain.gain.exponentialRampToValueAtTime(.0001,start+n.start+n.duration);osc.connect(gain);gain.connect(master);osc.start(start+n.start);osc.stop(start+n.start+n.duration+.03)});
    timers.push(setTimeout(()=>{playing=false;if(!userMuted)play()},data.duration*1000));
  }
  button.addEventListener('click',()=>{if(playing){userMuted=true;localStorage.setItem('aths-midi-muted','true');stop()}else{userMuted=false;localStorage.setItem('aths-midi-muted','false');play().catch(()=>{button.textContent='♫ MIDI UNAVAILABLE'})}});
  const unlock=()=>{if(!userMuted&&!playing)play().catch(()=>{});window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock)};
  window.addEventListener('pointerdown',unlock,{once:true});window.addEventListener('keydown',unlock,{once:true});
  button.textContent=userMuted?'🔇 MUSIC MUTED — PLAY':'♫ CLICK ANYWHERE FOR MIDI';
})();
