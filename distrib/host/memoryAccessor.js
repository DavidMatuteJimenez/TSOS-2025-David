var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        read(address) {
            return _Memory.read(address);
        }
        write(address, value) {
            _Memory.write(address, value);
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