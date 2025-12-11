module TSOS {
    export class FileSystem {
        private disk: Disk;
        private swapPrefix = "swap";
        private emptyFlag = String.fromCharCode(0);
        private nextFlag = String.fromCharCode(1);
        private finalFlag = String.fromCharCode(2);

        constructor(disk: Disk) {
            this.disk = disk;
        }

        //Format the file system
        public format(quickFormat: boolean = false): string {
            this.disk.formatDisk(quickFormat, true);
            // Write MBR to mark disk as formatted
            this.disk.writeDisk([0, 0, 0], "MBR_FORMATTED", false);
            return quickFormat ? "Disk quick formatted." : "Disk formatted.";
        }

        //Create a new file with timestamp
        public create(filename: string): string {
            if (!this.disk.isFormatted()) {
                return "Error: Disk not formatted. Please run 'format' first.";
            }

            if (!this.validateFilename(filename)) {
                return "Error: Invalid filename.";
            }

            // Check if file already exists
            if (this.fileExists(filename)) {
                return "Error: File already exists.";
            }

            // Find next open directory entry
            const dirTsb = this.nextOpenDirEntry();
            if (!dirTsb) {
                return "Error: Directory is full.";
            }

            // Find next open data block
            const blockTsb = this.nextOpenBlock();
            if (!blockTsb) {
                return "Error: Disk is full.";
            }

            // Get current timestamp (in seconds since epoch, stored as 4 bytes)
            const timestamp = Math.floor(Date.now() / 1000);
            const timestampBytes = [
                (timestamp >> 24) & 0xFF,
                (timestamp >> 16) & 0xFF,
                (timestamp >> 8) & 0xFF,
                timestamp & 0xFF
            ];

            // Directory entry format: [T][S][B][timestamp(4 bytes)][filename...]
            // This gives us 64 - 3 - 4 = 57 bytes for filename
            const data = String.fromCharCode(blockTsb[0]) +
                         String.fromCharCode(blockTsb[1]) +
                         String.fromCharCode(blockTsb[2]) +
                         String.fromCharCode(timestampBytes[0]) +
                         String.fromCharCode(timestampBytes[1]) +
                         String.fromCharCode(timestampBytes[2]) +
                         String.fromCharCode(timestampBytes[3]) +
                         filename;

            this.disk.writeDisk(dirTsb, data);

            // Initialize the data block with finalFlag (empty file, no more blocks)
            this.disk.writeDisk(blockTsb, this.finalFlag);

            return `File "${filename}" created successfully.`;
        }

        //Write data to a file
        public write(filename: string, data: string): string {
            if (!this.disk.isFormatted()) {
                return "Error: Disk not formatted. Please run 'format' first.";
            }

            // Find the file's directory entry
            const dirTsb = this.findDirectoryEntry(filename);
            if (!dirTsb) {
                return "Error: File does not exist.";
            }

            // Read directory entry to get first data block
            const dirData = this.disk.readDisk(dirTsb);
            const blockTsb = [
                dirData.charCodeAt(0),
                dirData.charCodeAt(1),
                dirData.charCodeAt(2)
            ];

            let currentTsb = blockTsb;
            let dataIndex = 0;

            while (dataIndex < data.length) {
                // block size - 4 for metadata
                const spaceInBlock = Disk.blockSize - 4;
                const dataToWrite = data.substring(dataIndex, dataIndex + spaceInBlock);
                
                let blockData = "";
                let nextTsb: number[] = undefined;

                // Determine block status and next block
                if (dataIndex + spaceInBlock < data.length) {
                    // More data to write - find next block
                    nextTsb = this.nextOpenBlock(currentTsb);
                    if (!nextTsb) {
                        // No more space
                        blockData = this.finalFlag +
                                   String.fromCharCode(0xFF) +
                                   String.fromCharCode(0xFF) +
                                   String.fromCharCode(0xFF) +
                                   dataToWrite;
                        this.disk.writeDisk(currentTsb, blockData);
                        return "Warning: File truncated due to insufficient space.";
                    }
                    blockData = this.nextFlag +
                               String.fromCharCode(nextTsb[0]) +
                               String.fromCharCode(nextTsb[1]) +
                               String.fromCharCode(nextTsb[2]) +
                               dataToWrite;
                } else {
                    // Last block
                    blockData = this.finalFlag +
                               String.fromCharCode(0xFF) +
                               String.fromCharCode(0xFF) +
                               String.fromCharCode(0xFF) +
                               dataToWrite;
                }

                this.disk.writeDisk(currentTsb, blockData);
                dataIndex += spaceInBlock;

                if (nextTsb) {
                    currentTsb = nextTsb;
                }
            }

            return `Data written to "${filename}" successfully.`;
        }

        //Read data from a file
        public read(filename: string): { success: boolean; data: string; message: string } {
            if (!this.disk.isFormatted()) {
                return { success: false, data: "", message: "Error: Disk not formatted. Please run 'format' first." };
            }

            // Find the file's directory entry
            const dirTsb = this.findDirectoryEntry(filename);
            if (!dirTsb) {
                return { success: false, data: "", message: `Error: File "${filename}" does not exist.` };
            }

            // Read directory entry to get first data block
            const dirData = this.disk.readDisk(dirTsb);
            const blockTsb = [
                dirData.charCodeAt(0),
                dirData.charCodeAt(1),
                dirData.charCodeAt(2)
            ];

            let fileData = "";
            let currentTsb = blockTsb;
            let blockStatus = 0;

            do {
                const blockData = this.disk.readDisk(currentTsb);
                blockStatus = blockData.charCodeAt(0);

                // Extract data (skip first 4 bytes of metadata)
                fileData += blockData.substring(4);

                if (blockStatus === this.nextFlag.charCodeAt(0)) {
                    // Move to next block
                    currentTsb = [
                        blockData.charCodeAt(1),
                        blockData.charCodeAt(2),
                        blockData.charCodeAt(3)
                    ];
                }
            } while (blockStatus === this.nextFlag.charCodeAt(0));

            // Trim null characters
            fileData = fileData.replace(/\0+$/, "");

            return { success: true, data: fileData, message: `Read "${filename}" successfully.` };
        }

        //Delete a file
        public delete(filename: string): string {
            if (!this.disk.isFormatted()) {
                return "Error: Disk not formatted. Please run 'format' first.";
            }

            // Find the file's directory entry
            const dirTsb = this.findDirectoryEntry(filename);
            if (!dirTsb) {
                return `Error: File "${filename}" does not exist.`;
            }

            // Read directory entry to get data blocks TSB
            const dirData = this.disk.readDisk(dirTsb);
            const dataTsb = [
                dirData.charCodeAt(0),
                dirData.charCodeAt(1),
                dirData.charCodeAt(2)
            ];

            // Check if any other file links to the same data blocks
            const linkCount = this.countLinksToData(dataTsb);

            // Clear the directory entry (always do this)
            this.disk.writeDisk(dirTsb, "");

            // Only free data blocks if other files still point to them (links exist)
            // If no links, leave data blocks intact for potential recovery
            if (linkCount > 1) {
                // Other links exist, just remove this directory entry
                return `File "${filename}" removed. Data preserved (${linkCount - 1} link(s) remain).`;
            } else {
                // No other links - data blocks are now orphaned but recoverable
                // Data is NOT cleared - can be recovered with chkdsk -recover
                // Use chkdsk -reclaim to permanently free the blocks
                return `File "${filename}" deleted. Data blocks can be recovered with 'chkdsk -recover'.`;
            }
        }

        //Create a hard link - make file2 point to the same data as file1
        public link(file1: string, file2: string): string {
            if (!this.disk.isFormatted()) {
                return "Error: Disk not formatted. Please run 'format' first.";
            }

            // Validate the new filename
            if (!this.validateFilename(file2)) {
                return "Error: Invalid filename for link.";
            }

            // Check if file1 exists
            const dirTsb1 = this.findDirectoryEntry(file1);
            if (!dirTsb1) {
                return `Error: File "${file1}" does not exist.`;
            }

            // Check if file2 already exists
            if (this.fileExists(file2)) {
                return `Error: File "${file2}" already exists.`;
            }

            // Find next open directory entry for file2
            const dirTsb2 = this.nextOpenDirEntry();
            if (!dirTsb2) {
                return "Error: Directory is full.";
            }

            // Read file1's directory entry to get its data block TSB
            const dirData1 = this.disk.readDisk(dirTsb1);
            const dataTsb = dirData1.substring(0, 3); // First 3 bytes are the TSB

            // Get current timestamp for the link
            const timestamp = Math.floor(Date.now() / 1000);
            const timestampBytes = [
                (timestamp >> 24) & 0xFF,
                (timestamp >> 16) & 0xFF,
                (timestamp >> 8) & 0xFF,
                timestamp & 0xFF
            ];

            // Create directory entry for file2 pointing to same data blocks
            const data = dataTsb +
                         String.fromCharCode(timestampBytes[0]) +
                         String.fromCharCode(timestampBytes[1]) +
                         String.fromCharCode(timestampBytes[2]) +
                         String.fromCharCode(timestampBytes[3]) +
                         file2;

            this.disk.writeDisk(dirTsb2, data);

            return `Link created: "${file1}" -> "${file2}" (both point to same data).`;
        }

        //Count how many directory entries point to the same data blocks
        private countLinksToData(dataTsb: number[]): number {
            let count = 0;

            // Search all directory blocks (0:0:1 to 0:7:7)
            for (let s = 0; s < Disk.sectorCount; ++s) {
                for (let b = 0; b < Disk.blockCount; ++b) {
                    // Skip MBR (0:0:0)
                    if (s === 0 && b === 0) continue;

                    const dirData = this.disk.readDisk([0, s, b]);
                    if (dirData && dirData.charCodeAt(0) !== 0) {
                        // Check if this entry points to the same data TSB
                        if (dirData.charCodeAt(0) === dataTsb[0] &&
                            dirData.charCodeAt(1) === dataTsb[1] &&
                            dirData.charCodeAt(2) === dataTsb[2]) {
                            count++;
                        }
                    }
                }
            }

            return count;
        }

        //List all files with optional detailed view
        public ls(showAll: boolean = false): string {
            if (!this.disk.isFormatted()) {
                return "Error: Disk not formatted. Please run 'format' first.";
            }

            let output = "";
            let fileCount = 0;
            const fileList: Array<{name: string, size: number, date: Date}> = [];

            // Search directory blocks (0:0:1 to 0:7:7)
            for (let s = 0; s < Disk.sectorCount; ++s) {
                for (let b = 0; b < Disk.blockCount; ++b) {
                    // Skip MBR (0:0:0)
                    if (s === 0 && b === 0) continue;

                    const dirData = this.disk.readDisk([0, s, b]);
                    if (dirData && dirData.charCodeAt(0) !== 0) {
                        // Extract filename (skip first 7 bytes: 3 for TSB, 4 for timestamp)
                        const filename = this.trimFilename(dirData.substring(7));
                        
                        if (filename.length > 0) {
                            // Skip swap files unless showAll is true
                            if (!showAll && filename.startsWith(this.swapPrefix)) {
                                continue;
                            }

                            // Skip hidden files unless showAll is true
                            if (!showAll && this.isHiddenFile(filename)) {
                                continue;
                            }

                            const size = this.getFileSize([0, s, b]);
                            const date = this.getFileTimestamp(dirData);
                            
                            fileList.push({name: filename, size: size, date: date});
                            fileCount++;
                        }
                    }
                }
            }

            if (fileCount === 0) {
                return "Disk is empty.";
            }

            // Format output based on showAll flag
            if (showAll) {
                output = "Filename                     Size (bytes)  Created\n";
                output += "-----------------------------------------------------------\n";
                for (const file of fileList) {
                    const name = file.name.padEnd(28);
                    const size = file.size.toString().padStart(12);
                    const dateStr = file.date.toLocaleString();
                    output += `${name} ${size}  ${dateStr}\n`;
                }
            } else {
                // Simple listing (backward compatible)
                for (const file of fileList) {
                    output += file.name + "\n";
                }
            }

            return output.trim();
        }

        //Copy a file
        public copy(sourceFilename: string, destFilename: string): string {
            if (!this.disk.isFormatted()) {
                return "Error: Disk not formatted. Please run 'format' first.";
            }

            // Read source file
            const readResult = this.read(sourceFilename);
            if (!readResult.success) {
                return `Error: Source file "${sourceFilename}" does not exist.`;
            }

            // Create destination file
            const createResult = this.create(destFilename);
            if (createResult.includes("Error")) {
                return createResult;
            }

            // Write data to destination
            const writeResult = this.write(destFilename, readResult.data);
            if (writeResult.includes("Error")) {
                return writeResult;
            }

            return `File "${sourceFilename}" copied to "${destFilename}" successfully.`;
        }

        //Rename a file (preserves timestamp)
        public rename(oldFilename: string, newFilename: string): string {
            if (!this.disk.isFormatted()) {
                return "Error: Disk not formatted. Please run 'format' first.";
            }

            if (!this.validateFilename(newFilename)) {
                return "Error: Invalid filename.";
            }

            if (this.fileExists(newFilename)) {
                return `Error: File "${newFilename}" already exists.`;
            }

            // Find old file's directory entry
            const dirTsb = this.findDirectoryEntry(oldFilename);
            if (!dirTsb) {
                return `Error: File "${oldFilename}" does not exist.`;
            }

            // Read the directory entry to get the data block TSB and timestamp
            const dirData = this.disk.readDisk(dirTsb);
            const blockTsb = dirData.substring(0, 3);
            const timestamp = dirData.substring(3, 7);

            // Write new directory entry with preserved timestamp and new name
            const newDirData = blockTsb + timestamp + newFilename;
            this.disk.writeDisk(dirTsb, newDirData);

            return `File "${oldFilename}" renamed to "${newFilename}" successfully.`;
        }

        // ===== HELPER METHODS =====

        private validateFilename(filename: string): boolean {
            // Max filename length is now 57 bytes (64 - 3 TSB - 4 timestamp)
            if (!filename || filename.length === 0 || filename.length > 57) {
                return false;
            }
            return true;
        }

        private trimFilename(str: string): string {
            let lastIndex = str.length;
            for (let i = 0; i < str.length; ++i) {
                if (str.charCodeAt(i) === 0) {
                    lastIndex = i;
                    break;
                }
            }
            return str.slice(0, lastIndex);
        }

        private isHiddenFile(filename: string): boolean {
            return filename.startsWith('.');
        }

        private fileExists(filename: string): boolean {
            return this.findDirectoryEntry(filename) !== null;
        }

        private findDirectoryEntry(filename: string): number[] {
            // Search directory blocks (0:0:1 to 0:7:7)
            for (let s = 0; s < Disk.sectorCount; ++s) {
                for (let b = 0; b < Disk.blockCount; ++b) {
                    // Skip MBR (0:0:0)
                    if (s === 0 && b === 0) continue;

                    const dirData = this.disk.readDisk([0, s, b]);
                    // Updated to skip 7 bytes (3 for TSB, 4 for timestamp)
                    if (dirData && this.trimFilename(dirData.substring(7)) === filename) {
                        return [0, s, b];
                    }
                }
            }
            return null;
        }

        private nextOpenDirEntry(): number[] {
            // Search directory blocks (0:0:1 to 0:7:7)
            for (let s = 0; s < Disk.sectorCount; ++s) {
                for (let b = 0; b < Disk.blockCount; ++b) {
                    // Skip MBR (0:0:0)
                    if (s === 0 && b === 0) continue;

                    const dirData = this.disk.readDisk([0, s, b]);
                    if (!dirData || dirData.charCodeAt(0) === 0) {
                        return [0, s, b];
                    }
                }
            }
            return null;
        }

        private nextOpenBlock(exclude: number[] = [-1, -1, -1]): number[] {
            // Search data blocks (tracks 1-3)
            for (let t = 1; t < Disk.trackCount; ++t) {
                for (let s = 0; s < Disk.sectorCount; ++s) {
                    for (let b = 0; b < Disk.blockCount; ++b) {
                        if (exclude[0] === t && exclude[1] === s && exclude[2] === b) {
                            continue;
                        }

                        const blockData = this.disk.readDisk([t, s, b]);
                        if (!blockData || blockData.charCodeAt(0) === 0) {
                            return [t, s, b];
                        }
                    }
                }
            }
            return null;
        }

        private getFileSize(dirTsb: number[]): number {
            const dirData = this.disk.readDisk(dirTsb);
            let blockTsb = [
                dirData.charCodeAt(0),
                dirData.charCodeAt(1),
                dirData.charCodeAt(2)
            ];

            let totalSize = 0;
            let blockStatus = 0;

            do {
                const blockData = this.disk.readDisk(blockTsb);
                blockStatus = blockData.charCodeAt(0);

                // Count actual data (skip first 4 bytes of metadata)
                const dataInBlock = blockData.substring(4);
                // Count non-null characters
                for (let i = 0; i < dataInBlock.length; i++) {
                    if (dataInBlock.charCodeAt(i) !== 0) {
                        totalSize++;
                    }
                }

                if (blockStatus === this.nextFlag.charCodeAt(0)) {
                    blockTsb = [
                        blockData.charCodeAt(1),
                        blockData.charCodeAt(2),
                        blockData.charCodeAt(3)
                    ];
                }
            } while (blockStatus === this.nextFlag.charCodeAt(0));

            return totalSize;
        }

        private getFileTimestamp(dirData: string): Date {
            const byte0 = dirData.charCodeAt(3);
            const byte1 = dirData.charCodeAt(4);
            const byte2 = dirData.charCodeAt(5);
            const byte3 = dirData.charCodeAt(6);
            
            const timestamp = (byte0 << 24) | (byte1 << 16) | (byte2 << 8) | byte3;
            return new Date(timestamp * 1000);
        }

        // ===== CHKDSK METHODS =====

        //Main chkdsk function - scan, recover, reclaim, defrag
        public chkdsk(mode: string): string {
            if (!this.disk.isFormatted()) {
                return "Error: Disk not formatted. Please run 'format' first.";
            }

            let output = "";

            // Always scan first
            const scanResult = this.scanDisk();
            output += "=== DISK SCAN RESULTS ===\n";
            output += `Files found: ${scanResult.fileCount}\n`;
            output += `Orphaned blocks: ${scanResult.orphanedBlocks.length}\n`;
            output += `Recoverable files: ${scanResult.recoverableChains.length}\n`;
            output += `Fragmented files: ${scanResult.fragmentedFiles.length}\n`;

            if (mode === "scan") {
                return output;
            }

            if (mode === "recover" || mode === "all") {
                output += "\n=== RECOVERING FILES ===\n";
                output += this.recoverFiles(scanResult.recoverableChains);
            }

            if (mode === "reclaim" || mode === "all") {
                output += "\n=== RECLAIMING BLOCKS ===\n";
                output += this.reclaimBlocks(scanResult.orphanedBlocks);
            }

            if (mode === "defrag" || mode === "all") {
                output += "\n=== DEFRAGMENTING ===\n";
                output += this.defragment();
            }

            return output;
        }

        //Scan disk and return status
        private scanDisk(): {
            fileCount: number;
            orphanedBlocks: number[][];
            recoverableChains: number[][];
            fragmentedFiles: string[];
        } {
            const result = {
                fileCount: 0,
                orphanedBlocks: [] as number[][],
                recoverableChains: [] as number[][],
                fragmentedFiles: [] as string[]
            };

            // Get all TSBs that directory entries point to
            const usedDataTsbs = new Set<string>();
            const fileStartBlocks = new Map<string, string>(); // TSB string -> filename

            // Scan directory entries
            for (let s = 0; s < Disk.sectorCount; ++s) {
                for (let b = 0; b < Disk.blockCount; ++b) {
                    if (s === 0 && b === 0) continue; // Skip MBR

                    const dirData = this.disk.readDisk([0, s, b]);
                    if (dirData && dirData.charCodeAt(0) !== 0) {
                        result.fileCount++;
                        const filename = this.trimFilename(dirData.substring(7));
                        const dataTsb = [
                            dirData.charCodeAt(0),
                            dirData.charCodeAt(1),
                            dirData.charCodeAt(2)
                        ];
                        const tsbKey = `${dataTsb[0]}:${dataTsb[1]}:${dataTsb[2]}`;
                        fileStartBlocks.set(tsbKey, filename);

                        // Follow the chain and mark all blocks as used
                        let currentTsb = dataTsb;
                        let prevTsb: number[] = null;
                        let isFragmented = false;

                        while (currentTsb) {
                            const blockKey = `${currentTsb[0]}:${currentTsb[1]}:${currentTsb[2]}`;
                            usedDataTsbs.add(blockKey);

                            // Check for fragmentation (non-contiguous blocks)
                            if (prevTsb) {
                                const expectedNext = [prevTsb[0], prevTsb[1], prevTsb[2] + 1];
                                if (expectedNext[2] >= Disk.blockCount) {
                                    expectedNext[2] = 0;
                                    expectedNext[1]++;
                                    if (expectedNext[1] >= Disk.sectorCount) {
                                        expectedNext[1] = 0;
                                        expectedNext[0]++;
                                    }
                                }
                                if (currentTsb[0] !== expectedNext[0] ||
                                    currentTsb[1] !== expectedNext[1] ||
                                    currentTsb[2] !== expectedNext[2]) {
                                    isFragmented = true;
                                }
                            }

                            const blockData = this.disk.readDisk(currentTsb);
                            if (blockData && blockData.charCodeAt(0) === this.nextFlag.charCodeAt(0)) {
                                prevTsb = currentTsb;
                                currentTsb = [
                                    blockData.charCodeAt(1),
                                    blockData.charCodeAt(2),
                                    blockData.charCodeAt(3)
                                ];
                            } else {
                                currentTsb = null;
                            }
                        }

                        if (isFragmented) {
                            result.fragmentedFiles.push(filename);
                        }
                    }
                }
            }

            // Scan data blocks for orphaned/recoverable blocks
            for (let t = 1; t < Disk.trackCount; ++t) {
                for (let s = 0; s < Disk.sectorCount; ++s) {
                    for (let b = 0; b < Disk.blockCount; ++b) {
                        const blockData = this.disk.readDisk([t, s, b]);
                        const tsbKey = `${t}:${s}:${b}`;

                        if (blockData && blockData.charCodeAt(0) !== 0) {
                            // Block has data
                            if (!usedDataTsbs.has(tsbKey)) {
                                // Not referenced by any directory entry
                                const status = blockData.charCodeAt(0);
                                if (status === this.finalFlag.charCodeAt(0) ||
                                    status === this.nextFlag.charCodeAt(0)) {
                                    // This looks like a valid file block - recoverable
                                    result.recoverableChains.push([t, s, b]);
                                } else {
                                    // Just orphaned data
                                    result.orphanedBlocks.push([t, s, b]);
                                }
                            }
                        }
                    }
                }
            }

            return result;
        }

        //Recover deleted files by creating new directory entries
        private recoverFiles(recoverableChains: number[][]): string {
            if (recoverableChains.length === 0) {
                return "No files to recover.\n";
            }

            let output = "";
            let recoveredCount = 0;

            for (const startTsb of recoverableChains) {
                // Find an open directory entry
                const dirTsb = this.nextOpenDirEntry();
                if (!dirTsb) {
                    output += "Directory full - cannot recover more files.\n";
                    break;
                }

                // Generate recovery filename
                const recoveryName = `recovered_${recoveredCount + 1}`;

                // Get current timestamp
                const timestamp = Math.floor(Date.now() / 1000);
                const timestampBytes = [
                    (timestamp >> 24) & 0xFF,
                    (timestamp >> 16) & 0xFF,
                    (timestamp >> 8) & 0xFF,
                    timestamp & 0xFF
                ];

                // Create directory entry
                const dirData = String.fromCharCode(startTsb[0]) +
                               String.fromCharCode(startTsb[1]) +
                               String.fromCharCode(startTsb[2]) +
                               String.fromCharCode(timestampBytes[0]) +
                               String.fromCharCode(timestampBytes[1]) +
                               String.fromCharCode(timestampBytes[2]) +
                               String.fromCharCode(timestampBytes[3]) +
                               recoveryName;

                this.disk.writeDisk(dirTsb, dirData);
                output += `Recovered file as "${recoveryName}" from block ${startTsb[0]}:${startTsb[1]}:${startTsb[2]}\n`;
                recoveredCount++;
            }

            output += `Total recovered: ${recoveredCount} file(s).\n`;
            return output;
        }

        //Reclaim orphaned data blocks
        private reclaimBlocks(orphanedBlocks: number[][]): string {
            if (orphanedBlocks.length === 0) {
                return "No orphaned blocks to reclaim.\n";
            }

            let reclaimedCount = 0;

            for (const tsb of orphanedBlocks) {
                this.disk.writeDisk(tsb, "");
                reclaimedCount++;
            }

            return `Reclaimed ${reclaimedCount} orphaned block(s).\n`;
        }

        //Defragment the disk - make files contiguous
        private defragment(): string {
            // Step 1: Read all files into memory
            const files: Array<{
                filename: string;
                dirTsb: number[];
                timestamp: string;
                data: string;
            }> = [];

            // Scan directory and read all file data
            for (let s = 0; s < Disk.sectorCount; ++s) {
                for (let b = 0; b < Disk.blockCount; ++b) {
                    if (s === 0 && b === 0) continue; // Skip MBR

                    const dirData = this.disk.readDisk([0, s, b]);
                    if (dirData && dirData.charCodeAt(0) !== 0) {
                        const filename = this.trimFilename(dirData.substring(7));
                        const timestamp = dirData.substring(3, 7);

                        // Read file data
                        const readResult = this.read(filename);
                        if (readResult.success) {
                            files.push({
                                filename: filename,
                                dirTsb: [0, s, b],
                                timestamp: timestamp,
                                data: readResult.data
                            });
                        }
                    }
                }
            }

            if (files.length === 0) {
                return "No files to defragment.\n";
            }

            // Step 2: Clear all data blocks (tracks 1-3)
            for (let t = 1; t < Disk.trackCount; ++t) {
                for (let s = 0; s < Disk.sectorCount; ++s) {
                    for (let b = 0; b < Disk.blockCount; ++b) {
                        this.disk.writeDisk([t, s, b], "");
                    }
                }
            }

            // Step 3: Rewrite files contiguously
            let currentTrack = 1;
            let currentSector = 0;
            let currentBlock = 0;
            let defraggedCount = 0;

            for (const file of files) {
                const startTsb = [currentTrack, currentSector, currentBlock];

                // Write file data
                let dataIndex = 0;
                let prevTsb: number[] = null;

                while (dataIndex < file.data.length || dataIndex === 0) {
                    const currentTsb = [currentTrack, currentSector, currentBlock];
                    const spaceInBlock = Disk.blockSize - 4;
                    const dataToWrite = file.data.substring(dataIndex, dataIndex + spaceInBlock);

                    // Move to next block position
                    currentBlock++;
                    if (currentBlock >= Disk.blockCount) {
                        currentBlock = 0;
                        currentSector++;
                        if (currentSector >= Disk.sectorCount) {
                            currentSector = 0;
                            currentTrack++;
                            if (currentTrack >= Disk.trackCount) {
                                return `Error: Disk full during defragmentation. ${defraggedCount} file(s) defragmented.\n`;
                            }
                        }
                    }

                    let blockData: string;
                    if (dataIndex + spaceInBlock < file.data.length) {
                        // More data to write - link to next block
                        const nextTsb = [currentTrack, currentSector, currentBlock];
                        blockData = this.nextFlag +
                                   String.fromCharCode(nextTsb[0]) +
                                   String.fromCharCode(nextTsb[1]) +
                                   String.fromCharCode(nextTsb[2]) +
                                   dataToWrite;
                    } else {
                        // Last block
                        blockData = this.finalFlag +
                                   String.fromCharCode(0xFF) +
                                   String.fromCharCode(0xFF) +
                                   String.fromCharCode(0xFF) +
                                   dataToWrite;
                    }

                    this.disk.writeDisk(currentTsb, blockData);
                    dataIndex += spaceInBlock;

                    // Handle empty files
                    if (file.data.length === 0) {
                        break;
                    }
                }

                // Update directory entry with new start TSB
                const newDirData = String.fromCharCode(startTsb[0]) +
                                  String.fromCharCode(startTsb[1]) +
                                  String.fromCharCode(startTsb[2]) +
                                  file.timestamp +
                                  file.filename;

                this.disk.writeDisk(file.dirTsb, newDirData);
                defraggedCount++;
            }

            return `Defragmentation complete. ${defraggedCount} file(s) reorganized.\n`;
        }

        // ===== SWAPPING METHODS =====

        //For swapping: save process to disk
        public rollOutProcess(pid: number, bytes: number[]): number {
            const filename = this.swapPrefix + pid;
            
            // Convert byte array to string
            let byteString = "";
            for (let i = 0; i < bytes.length; ++i) {
                byteString += String.fromCharCode(bytes[i]);
            }

            // Create and write the swap file
            const createResult = this.create(filename);
            if (createResult.includes("Error")) {
                return 1; // Error
            }

            const writeResult = this.write(filename, byteString);
            if (writeResult.includes("Error") || writeResult.includes("truncated")) {
                return 3; // No space
            }

            return 0; // Success
        }

        //For swapping: load process from disk
        public rollInProcess(pid: number): number[] {
            const filename = this.swapPrefix + pid;
            const readResult = this.read(filename);

            if (!readResult.success) {
                return undefined;
            }

            // Convert string back to byte array
            const bytes: number[] = [];
            for (let i = 0; i < readResult.data.length; ++i) {
                bytes.push(readResult.data.charCodeAt(i));
            }

            // Delete the swap file
            this.delete(filename);

            return bytes;
        }
    }
}