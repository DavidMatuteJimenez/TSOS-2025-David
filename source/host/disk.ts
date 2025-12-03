module TSOS {
    export class Disk {
        public static readonly trackCount = 0x4;      // 4 tracks
        public static readonly sectorCount = 0x8;     // 8 sectors
        public static readonly blockCount = 0x8;      // 8 blocks per sector
        public static readonly blockSize = 0x40;      // 64 bytes per block
        public static readonly trackSize = Disk.sectorCount * Disk.blockCount * Disk.blockSize;
        public static readonly sectorSize = Disk.blockCount * Disk.blockSize;
        public static readonly nullChar = String.fromCharCode(0);

        
        public static displayDirty: boolean = false; // For debugging purposes
        public static lastDisplayUpdate: number = 0;

        constructor() {
            // Disk is ready but not automatically formatted
            // User must run 'format' command to initialize
        }

        public getDiskSize(): number {
            return Disk.trackCount * Disk.sectorCount * Disk.blockCount * Disk.blockSize;
        }

        //Check if disk has been formatted
        public isFormatted(): boolean {
            const mbr = sessionStorage.getItem("0:0:0");
            return mbr !== null && mbr !== undefined;
        }

        // Format the disk - write 0's to all blocks
        public formatDisk(update: boolean = true): void {
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
            } catch (error) {
                if (_Kernel) {
                    _Kernel.krnTrace("Disk formatting error: " + error);
                }
                throw error;
            }
        }

        //Write data to disk at specified TSB address
        public writeDisk(tsb: number[], data: string, update: boolean = true): number {
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
        public readDisk(tsb: number[]): string {
            if (tsb[0] < Disk.trackCount &&
                tsb[1] < Disk.sectorCount &&
                tsb[2] < Disk.blockCount) {
                
                const str = sessionStorage.getItem(tsb[0] + ':' + tsb[1] + ':' + tsb[2]);
                return str;
            }
            return undefined;
        }


        //Read disk using string address format "t:s:b"
        public stringReadDisk(str: string): string {
            const arr = str.split(':');
            return this.readDisk([
                parseInt(arr[0]),
                parseInt(arr[1]),
                parseInt(arr[2])
            ]);
        }
    }
}