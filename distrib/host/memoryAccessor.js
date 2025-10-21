var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        read(address) {
            if (address < 0 || address >= _Memory.memory.length) {
                // Handle out-of-bounds access
                _Kernel.krnTrapError("Memory access violation: Address out of bounds.");
                return 0;
            }
            return _Memory.memory[address];
        }
        write(address, value) {
            if (address < 0 || address >= _Memory.memory.length) {
                // Handle out-of-bounds access
                _Kernel.krnTrapError("Memory access violation: Address out of bounds.");
                return;
            }
            _Memory.memory[address] = value & 0xFF;
        }
        // Helper function to read a two-byte address 
        readAddress(lowByteAddr) {
            const lowByte = this.read(lowByteAddr);
            const highByte = this.read(lowByteAddr + 1);
            return (highByte << 8) | lowByte;
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map