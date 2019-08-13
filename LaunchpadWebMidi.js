/*
 * This Class is intended to be availble for all to use
 * Written By: Colin Kinzel (Colink02)
 */
class LaunchpadMK2 {
    midi = null;
    output = null;
    Layout = {
        SESSION: 0x00,
        USER1: 0x01,
        USER2: 0x02,
        VOLUME: 0x04,
        PAN: 0x05
    };
    Channel = {
        CHANNEL1: 0,
        CHANNEL2: 1,
        CHANNEL3: 2,
        CHANNEL4: 3,
        CHANNEL5: 4,
        CHANNEL6: 5,
        CHANNEL7: 6,
        CHANNEL8: 7,
        CHANNEL9: 8,
        CHANNEL10: 9,
        CHANNEL11: A,
        CHANNEL12: B,
        CHANNEL13: C,
        CHANNEL14: D,
        CHANNEL15: E,
        CHANNEL16: F
    }
    Status = {
        NOTEOFF: 8,
        NOTEON: 9,
        POLYPHONIC_AFTERTOUCH: A,
        CONTROLLER: B,
        PROGRAM_CHANGE: C,
        CHANNEL_AFTERTOUCH: D,
        PITCH_BEND_CHANGE: E,
        SYSEX: F
    }
    constructor(useSysex = true) {
        if (useSysex) {
            navigator.requestMIDIAccess({
                sysex: true
            }).then(SuccessfulConnection, FailedConnection);
        } else {
            navigator.requestMIDIAccess({
                sysex: false
            }).then(SuccessfulConnection, FailedConnection);
        }
    }
    SuccessfulConnnection() {
        midi = midiAccess;

    }
    FailedConnection() {
        alert("Failed to connect to MIDI device!", "Try Again", "Cancel");
    }
    setButtonLayout(layout) {
        0xF0,
        0x00,
        0x20,
        0x29,
        0x02,
        0x18,
        0x22,
        layout,
        0xF7
    }
}