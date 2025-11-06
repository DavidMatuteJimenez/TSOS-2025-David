var TSOS;
(function (TSOS) {
    // Disk structure: 4 tracks × 8 sectors × 8 blocks per sector
    // Each block = 64 bytes
    class Disk {
        static TRACKS = 4;
        static SECTORS = 8;
        static BLOCKS_PER_SECTOR = 8;
        static BLOCK_SIZE = 64;
        static TOTAL_BLOCKS = this.TRACKS * this.SECTORS * this.BLOCKS_PER_SECTOR;
        data;
        constructor() {
            // Initialize disk with zeross
            this.data = new Uint8Array(this.TOTAL_BLOCsKS * this.BLOCK_SIZE);
            this.data.fill(0x00);
        }
        // Get linear block number from track/sector/block
        getBlockIndex(track, sector, block) {
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
        readBlock(track, sector, block) {
            const blockIdx = this.getBlockIndex(track, sector, block);
            const startByte = blockIdx * Disk.BLOCK_SIZE;
            return this.data.slice(startByte, startByte + Disk.BLOCK_SIZE);
        }
        // Write entire block to disk
        writeBlock(track, sector, block, data) {
            if (data.length > Disk.BLOCK_SIZE) {
                throw new Error(`Data too large for block (${data.length} > ${Disk.BLOCK_SIZE})`);
            }
            const blockIdx = this.getBlockIndex(track, sector, block);
            const startByte = blockIdx * Disk.BLOCK_SIZE;
            this.data.set(data, startByte);
        }
        // Read single byte from disk
        readByte(track, sector, block, offset) {
            if (offset < 0 || offset >= Disk.BLOCK_SIZE) {
                throw new Error(`Byte offset out of range: ${offset}`);
            }
            const blockIdx = this.getBlockIndex(track, sector, block);
            return this.data[blockIdx * Disk.BLOCK_SIZE + offset];
        }
        // Write single byte to disk
        writeByte(track, sector, block, offset, byte) {
            if (offset < 0 || offset >= Disk.BLOCK_SIZE) {
                throw new Error(`Byte offset out of range: ${offset}`);
            }
            const blockIdx = this.getBlockIndex(track, sector, block);
            this.data[blockIdx * Disk.BLOCK_SIZE + offset] = byte & 0xFF;
        }
        // Clear entire disk
        format() {
            this.data.fill(0x00);
            _Kernel.krnTrace("Disk formatted successfully");
        }
        // Get entire disk data for serialization
        getDiskData() {
            return new Uint8Array(this.data);
        }
        // Load disk data from serialization
        loadDiskData(data) {
            if (data.length !== this.data.length) {
                throw new Error(`Invalid disk data size: ${data.length}`);
            }
            this.data.set(data);
        }
    }
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=disk.js.map