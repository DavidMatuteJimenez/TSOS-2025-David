
module TSOS {
    export class MemoryAccessor {
        public read(address: number): number {
            if (address < 0 || address >= _Memory.memory.length) {
                // Handle out-of-bounds access
                _Kernel.krnTrapError("Memory access violation: Address out of bounds.");
                return 0;
            }
            return _Memory.memory[address];
        }

        public write(address: number, value: number): void {
            if (address < 0 || address >= _Memory.memory.length) {
                // Handle out-of-bounds access
                _Kernel.krnTrapError("Memory access violation: Address out of bounds.");
                return;
            }
            _Memory.memory[address] = value & 0xFF;
        }

        // Helper function to read a two-byte address 
        public readAddress(lowByteAddr: number): number {
            const lowByte = this.read(lowByteAddr);
            const highByte = this.read(lowByteAddr + 1);
            return (highByte << 8) | lowByte;
        }
    }
}