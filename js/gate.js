/* ═══════════════════════════════════════════════════════════════
   EP COMMAND CENTER — PASSCODE GATE
   Stopgap access control until a Netlify plan with real password
   protection is enabled.
   IMPORTANT: this is obscurity, not security. The dashboard markup and
   data still live in the page for anyone technical enough to inspect it.
   Replace with Netlify access control / auth as soon as possible.
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var CODE = '251';
  var KEY = 'epcc-unlocked';           // sessionStorage: clears when tab closes
  var gate = document.getElementById('gate');
  if (!gate) return;

  // Already unlocked this browser session? skip the gate.
  if (sessionStorage.getItem(KEY) === '1') { removeGate(true); return; }

  document.documentElement.style.overflow = 'hidden'; // lock scroll while gated
  var input = document.getElementById('gate-input');
  var dots = document.querySelectorAll('#gate-dots .gate-dot');
  var hint = document.getElementById('gate-hint');

  function focusInput() { if (input) input.focus(); }
  gate.addEventListener('click', focusInput);
  setTimeout(focusInput, 60);

  input.addEventListener('input', function () {
    var v = input.value.replace(/\D/g, '').slice(0, 3);
    input.value = v;
    dots.forEach(function (d, i) { d.classList.toggle('on', i < v.length); });
    hint.textContent = 'Enter your 3-digit code';
    hint.classList.remove('err');

    if (v.length === 3) {
      if (v === CODE) {
        sessionStorage.setItem(KEY, '1');
        gate.classList.add('granted');
        hint.textContent = 'Access granted';
        setTimeout(function () { removeGate(false); }, 620);
      } else {
        gate.classList.add('deny');
        hint.textContent = 'Access denied';
        hint.classList.add('err');
        setTimeout(function () {
          gate.classList.remove('deny');
          input.value = '';
          dots.forEach(function (d) { d.classList.remove('on'); });
          hint.textContent = 'Enter your 3-digit code';
          hint.classList.remove('err');
          focusInput();
        }, 850);
      }
    }
  });

  function removeGate(instant) {
    document.documentElement.style.overflow = '';
    if (instant) { gate.parentNode && gate.parentNode.removeChild(gate); return; }
    gate.classList.add('open');
    setTimeout(function () { gate.parentNode && gate.parentNode.removeChild(gate); }, 700);
  }
}());
