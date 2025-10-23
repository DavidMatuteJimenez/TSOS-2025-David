var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        read(address) {
            if (!_Kernel.runningPcb) {
                if (address < 0 || address >= _Memory.memory.length) {
                    // Handle out-of-bounds access
                    _Kernel.krnTrapError("Memory access violation: Address out of bounds.");
                    return 0;
                }
                return _Memory.memory[address];
            }
            const physicalAddress = _Kernel.runningPcb.base + address;
            if (address < 0 || address >= _Kernel.runningPcb.limit) {
                _Kernel.krnTrapError(`Memory access violation: Process ${_Kernel.runningPcb.pid} attempted to read address 0x${address.toString(16).toUpperCase().padStart(2, '0')} ` +
                    `(physical: 0x${physicalAddress.toString(16).toUpperCase().padStart(3, '0')}). Base: ${_Kernel.runningPcb.base}, Limit: ${_Kernel.runningPcb.limit}`);
                return 0;
            }
            if (physicalAddress < 0 || physicalAddress >= _Memory.memory.length) {
                _Kernel.krnTrapError(`Memory access violation: Physical address ${physicalAddress} out of bounds.`);
                return 0;
            }
            return _Memory.memory[physicalAddress];
        }
        write(address, value) {
            if (!_Kernel.runningPcb) {
                if (address < 0 || address >= _Memory.memory.length) {
                    // Handle out-of-bounds access
                    _Kernel.krnTrapError("Memory access violation: Address out of bounds.");
                    return;
                }
                _Memory.memory[address] = value & 0xFF;
                return;
            }
            const physicalAddress = _Kernel.runningPcb.base + address;
            if (address < 0 || address >= _Kernel.runningPcb.limit) {
                _Kernel.krnTrapError(`Memory access violation: Process ${_Kernel.runningPcb.pid} attempted to write address 0x${address.toString(16).toUpperCase().padStart(2, '0')} ` +
                    `(physical: 0x${physicalAddress.toString(16).toUpperCase().padStart(3, '0')}). Base: ${_Kernel.runningPcb.base}, Limit: ${_Kernel.runningPcb.limit}`);
                return;
            }
            if (physicalAddress < 0 || physicalAddress >= _Memory.memory.length) {
                _Kernel.krnTrapError(`Memory access violation: Physical address ${physicalAddress} out of bounds.`);
                return;
            }
            _Memory.memory[physicalAddress] = value & 0xFF;
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