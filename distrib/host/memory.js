// in file: host/memory.ts
var TSOS;
(function (TSOS) {
    class Memory {
        // Main memory is an array of 256 bytes.
        memory;
        constructor() {
            this.memory = new Array(256).fill(0x00);
        }
        init() {
            // Initialize all memory locations to 0.
            this.memory.fill(0x00);
        }
        read(address) {
            if (address < 0 || address >= this.memory.length) {
                // Handle out-of-bounds access
                _Kernel.krnTrapError("Memory access violation: Address out of bounds.");
                return 0;
            }
            return this.memory[address];
        }
        write(address, value) {
            if (address < 0 || address >= this.memory.length) {
                // Handle out-of-bounds access
                _Kernel.krnTrapError("Memory access violation: Address out of bounds.");
                return;
            }
            this.memory[address] = value & 0xFF;
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map