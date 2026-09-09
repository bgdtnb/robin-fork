(() => {
  const button = document.querySelector('#music-toggle');
  if (!button) return;
  let context, master, song, loopTimer, playing = false, starting = false;
  let muted = localStorage.getItem('aths-midi-muted') === 'true';

  const setButton = on => {
    button.textContent = on ? '🔊' : '🔇';
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', on ? 'Mute background music' : 'Play background music');
    button.title = on ? 'Mute background music' : 'Play background music';
  };
  const readVar = (bytes, state) => {
    let value = 0, byte = 0;
    do { byte = bytes[state.i++]; value = (value << 7) | (byte & 0x7f); } while (byte & 0x80);
    return value;
  };
  function parseMidi(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (String.fromCharCode(...bytes.slice(0, 4)) !== 'MThd') throw new Error('Invalid MIDI header');
    const tracks = view.getUint16(10), division = view.getUint16(12);
    let pos = 8 + view.getUint32(4), tempo = 500000, maxTick = 0;
    const rawNotes = [];
    for (let track = 0; track < tracks && pos + 8 <= bytes.length; track++) {
      if (String.fromCharCode(...bytes.slice(pos, pos + 4)) !== 'MTrk') throw new Error('Invalid MIDI track');
      const end = pos + 8 + view.getUint32(pos + 4);
      const state = { i: pos + 8 }, active = new Map(), programs = new Array(16).fill(0);
      let tick = 0, runningStatus = 0;
      while (state.i < end) {
        tick += readVar(bytes, state);
        let status = bytes[state.i++];
        if (status < 0x80) { state.i--; status = runningStatus; }
        else if (status < 0xf0) runningStatus = status;
        if (!status) throw new Error('Missing MIDI running status');
        if (status === 0xff) {
          const type = bytes[state.i++], length = readVar(bytes, state);
          if (type === 0x51 && length === 3 && tempo === 500000) tempo = (bytes[state.i] << 16) | (bytes[state.i + 1] << 8) | bytes[state.i + 2];
          state.i += length; continue;
        }
        if (status === 0xf0 || status === 0xf7) { state.i += readVar(bytes, state); continue; }
        const kind = status & 0xf0, channel = status & 15;
        if (kind === 0xc0) { programs[channel] = bytes[state.i++]; continue; }
        if (kind === 0xd0) { state.i++; continue; }
        const note = bytes[state.i++], value = bytes[state.i++];
        const key = `${channel}:${note}`;
        if (kind === 0x90 && value > 0) active.set(key, { tick, note, velocity: value, channel, program: programs[channel] });
        else if (kind === 0x80 || (kind === 0x90 && value === 0)) {
          const event = active.get(key);
          if (event) { event.end = tick; rawNotes.push(event); active.delete(key); }
        }
      }
      maxTick = Math.max(maxTick, tick); pos = end;
    }
    const tickSeconds = tempo / 1000000 / division;
    const notes = rawNotes.map(n => ({ ...n, start: n.tick * tickSeconds, duration: Math.max(.07, (n.end - n.tick) * tickSeconds) }));
    if (!notes.length) throw new Error('MIDI contains no playable notes');
    return { notes, duration: maxTick * tickSeconds + .75 };
  }
  function loadSong() {
    if (song) return song;
    if (!window.ATHS_MIDI_BASE64) throw new Error('Embedded MIDI missing');
    const binary = atob(window.ATHS_MIDI_BASE64), bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    song = parseMidi(bytes); return song;
  }
  function wave(program) {
    if (program >= 40 && program < 56) return 'sawtooth';
    if (program >= 80) return 'square';
    return program < 16 ? 'triangle' : 'sine';
  }
  async function start() {
    if (playing || starting || muted) return;
    starting = true;
    try {
      context ||= new (window.AudioContext || window.webkitAudioContext)();
      await context.resume();
      const data = loadSong(), startAt = context.currentTime + .06;
      master = context.createGain(); master.gain.value = .18; master.connect(context.destination);
      data.notes.forEach(note => {
        if (note.channel === 9) return;
        const oscillator = context.createOscillator(), gain = context.createGain();
        oscillator.type = wave(note.program);
        oscillator.frequency.value = 440 * Math.pow(2, (note.note - 69) / 12);
        const at = startAt + note.start, level = Math.max(.004, note.velocity / 127 * .045);
        gain.gain.setValueAtTime(.0001, at);
        gain.gain.exponentialRampToValueAtTime(level, at + .012);
        gain.gain.setValueAtTime(level * .8, at + note.duration * .75);
        gain.gain.exponentialRampToValueAtTime(.0001, at + note.duration);
        oscillator.connect(gain); gain.connect(master); oscillator.start(at); oscillator.stop(at + note.duration + .02);
      });
      playing = true; setButton(true);
      clearTimeout(loopTimer);
      loopTimer = setTimeout(() => { playing = false; if (!muted) start(); }, data.duration * 1000);
    } finally { starting = false; }
  }
  function stop() {
    muted = true; playing = false; clearTimeout(loopTimer);
    if (master && context) { master.gain.cancelScheduledValues(context.currentTime); master.gain.setTargetAtTime(.0001, context.currentTime, .025); }
    setButton(false);
  }
  button.addEventListener('click', event => {
    event.stopPropagation();
    if (playing || starting) { localStorage.setItem('aths-midi-muted', 'true'); stop(); }
    else { muted = false; localStorage.setItem('aths-midi-muted', 'false'); start().catch(() => setButton(false)); }
  });
  const autoplayAfterGesture = event => {
    if (button.contains(event.target)) return;
    if (!muted) start().catch(() => setButton(false));
  };
  document.addEventListener('pointerdown', autoplayAfterGesture, { once: true });
  document.addEventListener('keydown', autoplayAfterGesture, { once: true });
  setButton(false);
})();
