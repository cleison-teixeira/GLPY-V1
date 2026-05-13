export const playSound = (tipo: 'concluir' | 'xp' | 'checkin' | 'badge') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const sons: Record<typeof tipo, { freq: number; dur: number }[]> = {
      concluir: [
        { freq: 523, dur: 0.1 },
        { freq: 659, dur: 0.1 },
        { freq: 784, dur: 0.2 },
      ],
      xp: [
        { freq: 880, dur: 0.05 },
        { freq: 1047, dur: 0.1 },
      ],
      checkin: [
        { freq: 440, dur: 0.1 },
        { freq: 554, dur: 0.15 },
      ],
      badge: [
        { freq: 523, dur: 0.1 },
        { freq: 659, dur: 0.1 },
        { freq: 784, dur: 0.1 },
        { freq: 1047, dur: 0.3 },
      ],
    };

    let tempo = ctx.currentTime;
    sons[tipo].forEach(({ freq, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, tempo);
      gain.gain.exponentialRampToValueAtTime(0.001, tempo + dur);
      osc.start(tempo);
      osc.stop(tempo + dur);
      tempo += dur;
    });
  } catch (_) {}
};
