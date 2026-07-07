"use client";

import type { ComponentPropsWithoutRef } from "react";

type Tone = "low" | "mid" | "accent";

type AudioLinkProps = ComponentPropsWithoutRef<"a"> & {
  tone?: Tone;
};

const toneBanks: Record<Tone, number[]> = {
  low: [118, 130, 145],
  mid: [145, 160, 175],
  accent: [175, 195, 215],
};

let audioContext: AudioContext | null = null;
let popNoiseBuffer: AudioBuffer | null = null;
let toneCursor = 0;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  audioContext ??= new AudioContextClass();
  return audioContext;
}

function getPopNoiseBuffer(context: AudioContext) {
  if (popNoiseBuffer) {
    return popNoiseBuffer;
  }

  const duration = 0.038;
  const frameCount = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    const progress = index / frameCount;
    const envelope = (1 - progress) ** 2.4;

    data[index] = (Math.random() * 2 - 1) * envelope;
  }

  popNoiseBuffer = buffer;
  return popNoiseBuffer;
}

export function playHoverTone(tone: Tone) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    void context.resume();
  }

  const now = context.currentTime;
  const bank = toneBanks[tone];
  const baseFrequency = bank[toneCursor % bank.length];
  toneCursor += 1;

  const mainOscillator = context.createOscillator();
  const softOscillator = context.createOscillator();
  const bodyGain = context.createGain();
  const marbleOscillator = context.createOscillator();
  const marbleGain = context.createGain();
  const popSource = context.createBufferSource();
  const popFilter = context.createBiquadFilter();
  const popGain = context.createGain();
  const highpass = context.createBiquadFilter();
  const filter = context.createBiquadFilter();
  const softGain = context.createGain();
  const gain = context.createGain();
  const panner = context.createStereoPanner();

  mainOscillator.type = "sine";
  mainOscillator.frequency.setValueAtTime(baseFrequency, now);
  mainOscillator.frequency.exponentialRampToValueAtTime(baseFrequency * 0.96, now + 0.055);
  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.32, now + 0.01);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

  softOscillator.type = "sine";
  softOscillator.frequency.setValueAtTime(baseFrequency * 0.78, now);
  softOscillator.frequency.exponentialRampToValueAtTime(
    baseFrequency * 0.72,
    now + 0.085,
  );
  softGain.gain.setValueAtTime(0.18, now);

  marbleOscillator.type = "sine";
  marbleOscillator.frequency.setValueAtTime(baseFrequency * 2.05, now);
  marbleOscillator.frequency.exponentialRampToValueAtTime(
    baseFrequency * 1.92,
    now + 0.065,
  );
  marbleGain.gain.setValueAtTime(0.0001, now);
  marbleGain.gain.exponentialRampToValueAtTime(0.024, now + 0.01);
  marbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

  popSource.buffer = getPopNoiseBuffer(context);
  popFilter.type = "bandpass";
  popFilter.frequency.setValueAtTime(760, now);
  popFilter.Q.setValueAtTime(0.48, now);
  popGain.gain.setValueAtTime(0.0001, now);
  popGain.gain.exponentialRampToValueAtTime(0.2, now + 0.004);
  popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

  highpass.type = "highpass";
  highpass.frequency.setValueAtTime(145, now);
  highpass.Q.setValueAtTime(0.5, now);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1180, now);
  filter.frequency.exponentialRampToValueAtTime(720, now + 0.08);
  filter.Q.setValueAtTime(0.42, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.125, now + 0.009);
  gain.gain.exponentialRampToValueAtTime(0.031, now + 0.058);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.125);

  panner.pan.setValueAtTime(tone === "accent" ? 0.07 : -0.03, now);

  mainOscillator.connect(bodyGain);
  bodyGain.connect(highpass);
  softOscillator.connect(softGain);
  softGain.connect(highpass);
  highpass.connect(filter);
  marbleOscillator.connect(marbleGain);
  marbleGain.connect(highpass);
  popSource.connect(popFilter);
  popFilter.connect(popGain);
  popGain.connect(highpass);
  filter.connect(gain);
  gain.connect(panner);
  panner.connect(context.destination);

  mainOscillator.start(now);
  softOscillator.start(now);
  marbleOscillator.start(now);
  popSource.start(now);
  mainOscillator.stop(now + 0.09);
  softOscillator.stop(now + 0.135);
  marbleOscillator.stop(now + 0.135);
  popSource.stop(now + 0.034);

  mainOscillator.onended = () => {
    mainOscillator.disconnect();
    bodyGain.disconnect();
    softOscillator.disconnect();
    marbleOscillator.disconnect();
    marbleGain.disconnect();
    popSource.disconnect();
    popFilter.disconnect();
    popGain.disconnect();
    softGain.disconnect();
    highpass.disconnect();
    filter.disconnect();
    gain.disconnect();
    panner.disconnect();
  };
}

export function playScaleTone(step: number, totalSteps = 1) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    void context.resume();
  }

  const phrase = [
    118,
    130,
    145,
    160,
    175,
    195,
    215,
    235,
    255,
  ];
  const now = context.currentTime;
  const progress = totalSteps <= 1 ? 0 : step / (totalSteps - 1);
  const phraseIndex = Math.min(
    phrase.length - 1,
    Math.floor(progress * phrase.length),
  );
  const frequency = phrase[phraseIndex] * (1 + (step % 3) * 0.004);
  const oscillator = context.createOscillator();
  const subOscillator = context.createOscillator();
  const bodyGain = context.createGain();
  const marbleOscillator = context.createOscillator();
  const marbleGain = context.createGain();
  const popSource = context.createBufferSource();
  const popFilter = context.createBiquadFilter();
  const popGain = context.createGain();
  const highpass = context.createBiquadFilter();
  const subGain = context.createGain();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  const panner = context.createStereoPanner();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.96, now + 0.052);
  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.26, now + 0.01);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.068);

  subOscillator.type = "sine";
  subOscillator.frequency.setValueAtTime(frequency * 0.76, now);
  subOscillator.frequency.exponentialRampToValueAtTime(
    frequency * 0.7,
    now + 0.08,
  );
  subGain.gain.setValueAtTime(0.14, now);

  marbleOscillator.type = "sine";
  marbleOscillator.frequency.setValueAtTime(
    frequency * (1.95 + progress * 0.08),
    now,
  );
  marbleOscillator.frequency.exponentialRampToValueAtTime(
    frequency * (1.84 + progress * 0.06),
    now + 0.06,
  );
  marbleGain.gain.setValueAtTime(0.0001, now);
  marbleGain.gain.exponentialRampToValueAtTime(0.017, now + 0.01);
  marbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

  popSource.buffer = getPopNoiseBuffer(context);
  popFilter.type = "bandpass";
  popFilter.frequency.setValueAtTime(700 + progress * 110, now);
  popFilter.Q.setValueAtTime(0.45, now);
  popGain.gain.setValueAtTime(0.0001, now);
  popGain.gain.exponentialRampToValueAtTime(0.12, now + 0.004);
  popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

  highpass.type = "highpass";
  highpass.frequency.setValueAtTime(145, now);
  highpass.Q.setValueAtTime(0.5, now);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1050 + progress * 180, now);
  filter.frequency.exponentialRampToValueAtTime(
    680 + progress * 120,
    now + 0.075,
  );
  filter.Q.setValueAtTime(0.42, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.078, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.022, now + 0.052);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.115);

  panner.pan.setValueAtTime(Math.sin(step * 0.72) * 0.075, now);

  oscillator.connect(bodyGain);
  bodyGain.connect(highpass);
  subOscillator.connect(subGain);
  subGain.connect(highpass);
  highpass.connect(filter);
  marbleOscillator.connect(marbleGain);
  marbleGain.connect(highpass);
  popSource.connect(popFilter);
  popFilter.connect(popGain);
  popGain.connect(highpass);
  filter.connect(gain);
  gain.connect(panner);
  panner.connect(context.destination);

  oscillator.start(now);
  subOscillator.start(now);
  marbleOscillator.start(now);
  popSource.start(now);
  oscillator.stop(now + 0.082);
  subOscillator.stop(now + 0.122);
  marbleOscillator.stop(now + 0.122);
  popSource.stop(now + 0.034);

  oscillator.onended = () => {
    oscillator.disconnect();
    bodyGain.disconnect();
    subOscillator.disconnect();
    marbleOscillator.disconnect();
    marbleGain.disconnect();
    popSource.disconnect();
    popFilter.disconnect();
    popGain.disconnect();
    subGain.disconnect();
    highpass.disconnect();
    filter.disconnect();
    gain.disconnect();
    panner.disconnect();
  };
}

export function AudioLink({
  tone = "low",
  onPointerEnter,
  onFocus,
  ...props
}: AudioLinkProps) {
  return (
    <a
      onPointerEnter={(event) => {
        playHoverTone(tone);
        onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        playHoverTone(tone);
        onFocus?.(event);
      }}
      {...props}
    />
  );
}
