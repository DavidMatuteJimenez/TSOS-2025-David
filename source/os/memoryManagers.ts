module TSOS {
    export class MemoryManager {
        private partitions: {free: boolean, base: number, limit: number}[] = [];
        
        constructor() {
            this.partitions = [
                { free: true, base: 0, limit: 256 },
                { free: true, base: 256, limit: 256 },
                { free: true, base: 512, limit: 256 }
            ];
        }

        public allocatePartition(opCodes: string[]): {success: boolean, segment: number, base: number, limit: number} {
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

        public deallocatePartition(segment: number): void {
            if (segment >= 0 && segment < this.partitions.length) {
                for (let i = 0; i < this.partitions[segment].limit; i++) {
                    _Memory.memory[this.partitions[segment].base + i] = 0x00;
                }
                this.partitions[segment].free = true;
                _Kernel.krnTrace(`MMU: Deallocated partition ${segment}`);
            }
        }

        public clearMemory(): void {
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

        public getPartitionInfo(segment: number): {base: number, limit: number} | null {
            if (segment >= 0 && segment < this.partitions.length) {
                return {
                    base: this.partitions[segment].base,
                    limit: this.partitions[segment].limit
                };
            }
            return null;
        }
    }
}