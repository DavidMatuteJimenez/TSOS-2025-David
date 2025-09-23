/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverKeyboard extends TSOS.DeviceDriver {
        constructor() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        //Accept and display punctuation characters	and	symbols.
        //used chatgpt to gather Ascii codes
        krnKbdDispatchKeyPress(params) {
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Letters (A–Z)
            if ((keyCode >= 65) && (keyCode <= 90)) {
                chr = isShifted ? String.fromCharCode(keyCode) : String.fromCharCode(keyCode + 32);
                _KernelInputQueue.enqueue(chr);
            }
            // Digits 0–9 (with shift -> symbols)
            else if ((keyCode >= 48) && (keyCode <= 57)) {
                if (isShifted) {
                    // Shifted number row symbols
                    var shiftedSymbols = {
                        48: ")", 49: "!", 50: "@", 51: "#", 52: "$",
                        53: "%", 54: "^", 55: "&", 56: "*", 57: "("
                    };
                    chr = shiftedSymbols[keyCode];
                }
                else {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            }
            // Space or Enter
            else if (keyCode == 32 || keyCode == 13) {
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            // Punctuation and symbols
            else {
                var symbolMap = {
                    186: isShifted ? ":" : ";",
                    187: isShifted ? "+" : "=",
                    188: isShifted ? "<" : ",",
                    189: isShifted ? "_" : "-",
                    190: isShifted ? ">" : ".",
                    191: isShifted ? "?" : "/",
                    192: isShifted ? "~" : "`",
                    219: isShifted ? "{" : "[",
                    220: isShifted ? "|" : "\\",
                    221: isShifted ? "}" : "]",
                    222: isShifted ? "\"" : "'",
                    8: String.fromCharCode(8),
                    9: String.fromCharCode(9)
                };
                if (symbolMap[keyCode] !== undefined) {
                    chr = symbolMap[keyCode];
                    _KernelInputQueue.enqueue(chr);
                }
            }
        }
    }
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map