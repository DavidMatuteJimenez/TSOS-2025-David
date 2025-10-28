// in file: host/memory.ts

module TSOS {
    export class Memory {
        // Main memory is an array of 256 bytes.
        public memory: number[];

        constructor() {
            this.memory = new Array(768).fill(0x00);
        }

        public init(): void {
            // Initialize all memory locations to 0.
            this.memory.fill(0x00);
        }

    
    }
}