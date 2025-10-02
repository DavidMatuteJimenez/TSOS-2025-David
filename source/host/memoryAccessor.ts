
module TSOS {
    export class MemoryAccessor {
        public read(address: number): number {
            return _Memory.read(address);
        }

        public write(address: number, value: number): void {
            _Memory.write(address, value);
        }

        // Helper function to read a two-byte address 
        public readAddress(lowByteAddr: number): number {
            const lowByte = this.read(lowByteAddr);
            const highByte = this.read(lowByteAddr + 1);
            return (highByte << 8) | lowByte;
        }
    }
}