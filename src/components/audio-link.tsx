"use client";

import type { ComponentPropsWithoutRef } from "react";

type Tone = "low" | "mid" | "accent";

type AudioLinkProps = ComponentPropsWithoutRef<"a"> & {
  tone?: Tone;
};

const toneBanks: Record<Tone, number[]> = {
  low: [92.5, 98, 110],
  mid: [110, 123.47, 130.81],
  accent: [130.81, 146.83, 164.81],
};

let audioContext: AudioContext | null = null;
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
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const panner = context.createStereoPanner();

  mainOscillator.type = "sine";
  mainOscillator.frequency.setValueAtTime(baseFrequency * 1.08, now);
  mainOscillator.frequency.exponentialRampToValueAtTime(
    baseFrequency,
    now + 0.11,
  );

  softOscillator.type = "triangle";
  softOscillator.frequency.setValueAtTime(baseFrequency / 2, now);
  softOscillator.frequency.exponentialRampToValueAtTime(
    baseFrequency * 0.47,
    now + 0.11,
  );

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(880, now);
  filter.frequency.exponentialRampToValueAtTime(420, now + 0.12);
  filter.Q.setValueAtTime(1.1, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.042, now + 0.009);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  panner.pan.setValueAtTime(tone === "accent" ? 0.07 : -0.03, now);

  mainOscillator.connect(filter);
  softOscillator.connect(filter);
  filter.connect(gain);
  gain.connect(panner);
  panner.connect(context.destination);

  mainOscillator.start(now);
  softOscillator.start(now);
  mainOscillator.stop(now + 0.13);
  softOscillator.stop(now + 0.13);

  mainOscillator.onended = () => {
    mainOscillator.disconnect();
    softOscillator.disconnect();
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

  const phrase = [92.5, 98, 103.83, 110, 116.54, 123.47, 130.81, 138.59, 146.83];
  const now = context.currentTime;
  const progress = totalSteps <= 1 ? 0 : step / (totalSteps - 1);
  const phraseIndex = Math.min(
    phrase.length - 1,
    Math.floor(progress * phrase.length),
  );
  const frequency = phrase[phraseIndex] * (1 + (step % 3) * 0.004);
  const oscillator = context.createOscillator();
  const subOscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  const panner = context.createStereoPanner();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency * 0.995, now);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.012, now + 0.075);

  subOscillator.type = "triangle";
  subOscillator.frequency.setValueAtTime(frequency / 2, now);
  subOscillator.frequency.exponentialRampToValueAtTime(frequency * 0.505, now + 0.075);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(540 + progress * 260, now);
  filter.Q.setValueAtTime(0.72, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.018, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

  panner.pan.setValueAtTime(Math.sin(step * 0.72) * 0.075, now);

  oscillator.connect(filter);
  subOscillator.connect(filter);
  filter.connect(gain);
  gain.connect(panner);
  panner.connect(context.destination);

  oscillator.start(now);
  subOscillator.start(now);
  oscillator.stop(now + 0.12);
  subOscillator.stop(now + 0.12);

  oscillator.onended = () => {
    oscillator.disconnect();
    subOscillator.disconnect();
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
