module TSOS {
    // Disk structure: 4 tracks × 8 sectors × 8 blocks per sector
    // Each block = 64 bytes
    export class Disk {
        public static readonly TRACKS = 4;
        public static readonly SECTORS = 8;
        public static readonly BLOCKS_PER_SECTOR = 8;
        public static readonly BLOCK_SIZE = 64;
        public static readonly TOTAL_BLOCKS = this.TRACKS * this.SECTORS * this.BLOCKS_PER_SECTOR;

        private data: Uint8Array;

        constructor() {
            // Initialize disk with zeross
            this.data = new Uint8Array(Disk.TOTAL_BLOCKS * Disk.BLOCK_SIZE);
            this.data.fill(0x00);
        }

        // Get linear block number from track/sector/block
        private getBlockIndex(track: number, sector: number, block: number): number {
            if (track < 0 || track >= Disk.TRACKS ||
                sector < 0 || sector >= Disk.SECTORS ||
                block < 0 || block >= Disk.BLOCKS_PER_SECTOR) {
                throw new Error(`Invalid disk address: T${track}S${sector}B${block}`);
            }
            return (track * Disk.SECTORS * Disk.BLOCKS_PER_SECTOR) +
                   (sector * Disk.BLOCKS_PER_SECTOR) +
                   block;
        }

        // Read entire block from disk
        public readBlock(track: number, sector: number, block: number): Uint8Array {
            const blockIdx = this.getBlockIndex(track, sector, block);
            const startByte = blockIdx * Disk.BLOCK_SIZE;
            return this.data.slice(startByte, startByte + Disk.BLOCK_SIZE);
        }

        // Write entire block to disk
        public writeBlock(track: number, sector: number, block: number, data: Uint8Array): void {
            if (data.length > Disk.BLOCK_SIZE) {
                throw new Error(`Data too large for block (${data.length} > ${Disk.BLOCK_SIZE})`);
            }
            const blockIdx = this.getBlockIndex(track, sector, block);
            const startByte = blockIdx * Disk.BLOCK_SIZE;
            this.data.set(data, startByte);
        }

        // Read single byte from disk
        public readByte(track: number, sector: number, block: number, offset: number): number {
            if (offset < 0 || offset >= Disk.BLOCK_SIZE) {
                throw new Error(`Byte offset out of range: ${offset}`);
            }
            const blockIdx = this.getBlockIndex(track, sector, block);
            return this.data[blockIdx * Disk.BLOCK_SIZE + offset];
        }

        // Write single byte to disk
        public writeByte(track: number, sector: number, block: number, offset: number, byte: number): void {
            if (offset < 0 || offset >= Disk.BLOCK_SIZE) {
                throw new Error(`Byte offset out of range: ${offset}`);
            }
            const blockIdx = this.getBlockIndex(track, sector, block);
            this.data[blockIdx * Disk.BLOCK_SIZE + offset] = byte & 0xFF;
        }

        // Clear entire disk
        public format(): void {
            this.data.fill(0x00);
            _Kernel.krnTrace("Disk formatted successfully");
        }

        // Get entire disk data for serialization
        public getDiskData(): Uint8Array {
            return new Uint8Array(this.data);
        }

        // Load disk data from serialization
        public loadDiskData(data: Uint8Array): void {
            if (data.length !== this.data.length) {
                throw new Error(`Invalid disk data size: ${data.length}`);
            }
            this.data.set(data);
        }
    }
}