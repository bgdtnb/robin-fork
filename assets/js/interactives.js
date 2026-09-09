document.addEventListener('DOMContentLoaded', () => {
  const gravity = document.querySelector('#gravity-tool');
  gravity?.addEventListener('input', () => {
    const mass = Number(gravity.elements.mass.value), planet = Number(gravity.elements.planet.value);
    gravity.querySelector('.result').textContent = `Your weight force is ${(mass * planet).toFixed(1)} newtons.`;
  });
  const velocity = document.querySelector('#velocity-tool');
  velocity?.addEventListener('input', () => {
    const d = Number(velocity.elements.distance.value), t = Number(velocity.elements.time.value);
    velocity.querySelector('.result').textContent = t > 0 ? `Average velocity: ${(d/t).toFixed(2)} m/s` : 'Time must be greater than zero.';
  });
  const molar = document.querySelector('#molar-tool');
  molar?.addEventListener('input', () => {
    const m = Number(molar.elements.mass.value), mm = Number(molar.elements.molarMass.value);
    molar.querySelector('.result').textContent = mm > 0 ? `Amount: ${(m/mm).toFixed(3)} mol` : 'Molar mass must be greater than zero.';
  });
  const ohm = document.querySelector('#ohm-tool');
  ohm?.addEventListener('input', () => {
    const v = Number(ohm.elements.voltage.value), r = Number(ohm.elements.resistance.value);
    ohm.querySelector('.result').textContent = r > 0 ? `Current: ${(v/r).toFixed(3)} A` : 'Resistance must be greater than zero.';
  });
});
