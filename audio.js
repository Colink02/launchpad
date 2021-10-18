let audioContext = new (AudioContext || webkitAudioContext)();

function playKey(freq) {
    var sine = audioContext.createOscillator();
    var sinehalf = audioContext.createOscillator();
    var sinefourth = audioContext.createOscillator();
    var gain = audioContext.createGain();
    gain.gain.linearRampToValueAtTime(-0.5, 50);
    sine.frequency.value = freq;
    sinehalf.frequency.value = freq/0.5;
    sinefourth.frequency.value = freq/0.25;
    sine.start(0);
    sinehalf.start(0);
    sinefourth.start(0);
    sine.connect(audioContext.destination);
    sinehalf.connect(audioContext.destination);
    sinefourth.connect(audioContext.destination);
    gain.connect(audioContext.destination);

    setTimeout(() => {
        sine.disconnect();
        sinehalf.disconnect();
        sinefourth.disconnect();
        gain.disconnect();
    }, 1000);
}