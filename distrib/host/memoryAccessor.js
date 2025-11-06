var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        read(address) {
            const physicalAddress = _Kernel.kernelMode ? address : _Kernel.runningPcb.base + address;
            if (!_Kernel.kernelMode) {
                if (!_Kernel.runningPcb) {
                    _Kernel.krnTrapError("Memory access violation: Address out of bounds.");
                    return 0;
                }
                if (address < 0 || address >= (_Kernel.runningPcb.limit - _Kernel.runningPcb.base)) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PSKILL, ["Memory access violation: Address out of bounds."]));
                    return 0;
                }
                if (physicalAddress < 0 || physicalAddress >= _Memory.memory.length) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PSKILL, ["Memory access violation: Address out of bounds."]));
                    return 0;
                }
            }
            return _Memory.memory[physicalAddress];
        }
        write(address, value) {
            const physicalAddress = _Kernel.kernelMode ? address : _Kernel.runningPcb.base + address;
            if (!_Kernel.kernelMode) {
                if (!_Kernel.runningPcb) {
                    _Kernel.krnTrapError("Memory access violation: Address out of bounds.");
                    return;
                }
                if (address < 0 || address >= (_Kernel.runningPcb.limit - _Kernel.runningPcb.base)) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PSKILL, ["Memory access violation: Address out of bounds."]));
                    return;
                }
                if (physicalAddress < 0 || physicalAddress >= _Memory.memory.length) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PSKILL, ["Memory access violation: Address out of bounds."]));
                    return;
                }
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