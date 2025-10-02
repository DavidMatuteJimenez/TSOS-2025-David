var TSOS;
(function (TSOS) {
    class MemoryManager {
        // For this project, we only have one memory block starting at 0x0000.
        isMemoryFree = true;
        loadProgram(opCodes) {
            if (!this.isMemoryFree) {
                return false;
            }
            // Write the op codes to memory starting at address 0. [cite: 8]
            for (let i = 0; i < opCodes.length; i++) {
                const value = parseInt(opCodes[i], 16);
                _MemoryAccessor.write(i, value);
            }
            this.isMemoryFree = false;
            return true;
        }
        // To be used later for unloading a program
        clearMemory() {
            for (let i = 0; i < 256; i++) {
                _MemoryAccessor.write(i, 0x00);
            }
            this.isMemoryFree = true;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManagers.js.map