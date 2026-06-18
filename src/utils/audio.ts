/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a cute beep tone for the countdown
 */
export function playCountdownBeep(highPitch = false) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = highPitch ? 1200 : 800; // Cheese final beep is higher pitch!
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (err) {
    console.warn('Audio feedback failed or was blocked by browser policies:', err);
  }
}

/**
 * Play a satisfying mechanical camera shutter click
 */
export function playShutterSnap() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // 1. Shutter metal click (high pass noise)
    const bufferSize = ctx.sampleRate * 0.15; // 0.15 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'highpass';
    filterNode.frequency.value = 1000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    noiseNode.connect(filterNode);
    filterNode.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // 2. Added mirror slap sound (low pitch thump)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.4, now + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    // Start everything
    noiseNode.start(now);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (err) {
    console.warn('Audio shutter failed to play:', err);
  }
}
