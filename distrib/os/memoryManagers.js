/*module TSOS {
    export class MemoryManager {
        // For this project, we only have one memory block starting at 0x0000.
        private isMemoryFree: boolean = true;

        public loadProgram(opCodes: string[]): boolean {
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
        public clearMemory(): void {
            for (let i = 0; i < 256; i++) {
                _MemoryAccessor.write(i, 0x00);
            }
            this.isMemoryFree = true;
        }
    }
}*/
var TSOS;
(function (TSOS) {
    class MemoryManager {
        partitions = [];
        constructor() {
            this.partitions = [
                { free: true, base: 0, limit: 256 },
                { free: true, base: 256, limit: 256 },
                { free: true, base: 512, limit: 256 }
            ];
        }
        allocatePartition(opCodes) {
            for (let i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].free && opCodes.length <= this.partitions[i].limit) {
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
                for (let i = 0; i < this.partitions[segment].limit; i++) {
                    _Memory.memory[this.partitions[segment].base + i] = 0x00;
                }
                this.partitions[segment].free = true;
                _Kernel.krnTrace(`MMU: Deallocated partition ${segment}`);
            }
        }
        clearMemory() {
            for (let i = 0; i < _Memory.memory.length; i++) {
                _Memory.memory[i] = 0x00;
            }
            for (let i = 0; i < this.partitions.length; i++) {
                this.partitions[i].free = true;
            }
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