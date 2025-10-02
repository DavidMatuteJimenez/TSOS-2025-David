// in file: host/memory.ts

module TSOS {
    export class Memory {
        // Main memory is an array of 256 bytes.
        private memory: number[];

        constructor() {
            this.memory = new Array(256).fill(0);
        }

        public init(): void {
            // Initialize all memory locations to 0.
            this.memory.fill(0);
        }

        public read(address: number): number {
            if (address < 0 || address >= this.memory.length) {
                // Handle out-of-bounds access
                _Kernel.krnTrapError("Memory access violation: Address out of bounds.");
                return 0;
            }
            return this.memory[address];
        }

        public write(address: number, value: number): void {
            if (address < 0 || address >= this.memory.length) {
                // Handle out-of-bounds access
                _Kernel.krnTrapError("Memory access violation: Address out of bounds.");
                return;
            }
            this.memory[address] = value & 0xFF;
        }
    }
}