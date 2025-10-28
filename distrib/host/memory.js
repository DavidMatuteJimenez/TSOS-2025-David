// in file: host/memory.ts
var TSOS;
(function (TSOS) {
    class Memory {
        // Main memory is an array of 256 bytes.
        memory;
        constructor() {
            this.memory = new Array(768).fill(0x00);
        }
        init() {
            // Initialize all memory locations to 0.
            this.memory.fill(0x00);
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map