var TSOS;
(function (TSOS) {
    class Disk {
        static trackCount = 0x4; // 4 tracks
        static sectorCount = 0x8; // 8 sectors
        static blockCount = 0x8; // 8 blocks per sector
        static blockSize = 0x40; // 64 bytes per block
        static trackSize = Disk.sectorCount * Disk.blockCount * Disk.blockSize;
        static sectorSize = Disk.blockCount * Disk.blockSize;
        static nullChar = String.fromCharCode(0);
        static displayDirty = false; // For debugging purposes
        static lastDisplayUpdate = 0;
        constructor() {
            // Disk is ready but not automatically formatted
            // User must run 'format' command to initialize
        }
        getDiskSize() {
            return Disk.trackCount * Disk.sectorCount * Disk.blockCount * Disk.blockSize;
        }
        //Check if disk has been formatted
        isFormatted() {
            const mbr = sessionStorage.getItem("0:0:0");
            return mbr !== null && mbr !== undefined;
        }
        // Format the disk - write 0's to all blocks
        formatDisk(update = true) {
            try {
                for (let t = 0; t < Disk.trackCount; ++t) {
                    for (let s = 0; s < Disk.sectorCount; ++s) {
                        for (let b = 0; b < Disk.blockCount; ++b) {
                            this.writeDisk([t, s, b], "", false); // Always use update=false for formatting to avoid display issues
                        }
                    }
                }
                Disk.displayDirty = true;
                // Log completion
                if (_Kernel) {
                    _Kernel.krnTrace("Disk formatting completed - " +
                        (Disk.trackCount * Disk.sectorCount * Disk.blockCount) + " blocks initialized");
                }
            }
            catch (error) {
                if (_Kernel) {
                    _Kernel.krnTrace("Disk formatting error: " + error);
                }
                throw error;
            }
        }
        //Write data to disk at specified TSB address
        writeDisk(tsb, data, update = true) {
            if (tsb[0] < Disk.trackCount &&
                tsb[1] < Disk.sectorCount &&
                tsb[2] < Disk.blockCount) {
                // Pad data with null characters to block size
                if (data.length < Disk.blockSize) {
                    data += Array(Disk.blockSize - data.length + 1).join(Disk.nullChar);
                }
                const str = tsb[0] + ':' + tsb[1] + ':' + tsb[2];
                sessionStorage.setItem(str, data);
                Disk.displayDirty = true;
                return 0;
            }
            return 1; // Error
        }
        //Read data from disk at specified TSB address
        readDisk(tsb) {
            if (tsb[0] < Disk.trackCount &&
                tsb[1] < Disk.sectorCount &&
                tsb[2] < Disk.blockCount) {
                const str = sessionStorage.getItem(tsb[0] + ':' + tsb[1] + ':' + tsb[2]);
                return str;
            }
            return undefined;
        }
        //Read disk using string address format "t:s:b"
        stringReadDisk(str) {
            const arr = str.split(':');
            return this.readDisk([
                parseInt(arr[0]),
                parseInt(arr[1]),
                parseInt(arr[2])
            ]);
        }
    }
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=disk.js.map