var TSOS;
(function (TSOS) {
    class MemoryManager {
        partitions = [];
        constructor() {
            // Calculate partitions dynamically based on constants
            this.partitions = [];
            for (let i = 0; i < MEMORY_NUM_PARTITIONS; i++) {
                const base = i * MEMORY_PARTITION_SIZE;
                this.partitions.push({
                    free: true,
                    base: base,
                    limit: base + MEMORY_PARTITION_SIZE // limit = base + size
                });
            }
        }
        allocatePartition(opCodes) {
            for (let i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].free && opCodes.length <= MEMORY_PARTITION_SIZE) {
                    const base = this.partitions[i].base;
                    for (let j = 0; j < opCodes.length; j++) {
                        const value = parseInt(opCodes[j], 16);
                        _Memory.memory[base + j] = value & 0xFF;
                    }
                    this.partitions[i].free = false;
                    _Kernel.krnTrace(`MMU: Allocated partition ${i} (base: ${base}, limit: ${this.partitions[i].limit}, size: ${opCodes.length})`);
                    return {
                        success: true,
                        segment: i,
                        base: base,
                        limit: this.partitions[i].limit
                    };
                }
            }
            _Kernel.krnTrace("MMU: Memory allocation failed - no free partitions available");
            return { success: false, segment: -1, base: 0, limit: 0 };
        }
        deallocatePartition(segment) {
            if (segment >= 0 && segment < this.partitions.length) {
                for (let i = 0; i < MEMORY_PARTITION_SIZE; i++) {
                    _Memory.memory[this.partitions[segment].base + i] = 0x00;
                }
                this.partitions[segment].free = true;
                _Kernel.krnTrace(`MMU: Deallocated partition ${segment}`);
            }
        }
        clearMemory() {
            _Kernel.kernelMode = true;
            for (let i = 0; i < _Memory.memory.length; i++) {
                _Memory.memory[i] = 0x00;
            }
            for (let i = 0; i < this.partitions.length; i++) {
                this.partitions[i].free = true;
            }
            _Kernel.kernelMode = false;
            _Kernel.krnTrace("MMU: All memory cleared");
        }
        getPartitionInfo(segment) {
            if (segment >= 0 && segment < this.partitions.length) {
                return {
                    base: this.partitions[segment].base,
                    limit: this.partitions[segment].limit
                };
            }
            return null;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManagers.js.map