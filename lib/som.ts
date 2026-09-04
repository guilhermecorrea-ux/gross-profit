// Efeitos sonoros sintetizados via Web Audio API — sem arquivo de áudio
// externo, então não há asset pra carregar nem licença pra gerenciar.

function tocarNota(
  ctx: AudioContext,
  frequencia: number,
  inicio: number,
  duracao: number,
  volume: number
): void {
  const osc = ctx.createOscillator();
  const ganho = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = frequencia;

  const agora = ctx.currentTime;
  ganho.gain.setValueAtTime(0, agora + inicio);
  ganho.gain.linearRampToValueAtTime(volume, agora + inicio + 0.01);
  ganho.gain.exponentialRampToValueAtTime(0.0001, agora + inicio + duracao);

  osc.connect(ganho);
  ganho.connect(ctx.destination);
  osc.start(agora + inicio);
  osc.stop(agora + inicio + duracao + 0.05);
}

// "Cha-ching" de caixa registradora: duas notas curtas subindo.
export function tocarSomDinheiro(): void {
  if (typeof window === "undefined") return;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return;

  const ctx = new Ctor();
  tocarNota(ctx, 1046.5, 0, 0.12, 0.2); // C6
  tocarNota(ctx, 1568.0, 0.08, 0.28, 0.2); // G6

  setTimeout(() => ctx.close(), 500);
}
