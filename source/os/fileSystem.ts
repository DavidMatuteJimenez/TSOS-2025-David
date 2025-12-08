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
        public format(): string {
            this.disk.formatDisk(true);
            // Write MBR to mark disk as formatted
            this.disk.writeDisk([0, 0, 0], "MBR_FORMATTED", false);
            return "Disk formatted.";
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

            // Read directory entry to get data blocks
            const dirData = this.disk.readDisk(dirTsb);
            let blockTsb = [
                dirData.charCodeAt(0),
                dirData.charCodeAt(1),
                dirData.charCodeAt(2)
            ];

            // Free all data blocks
            let blockStatus = 0;
            do {
                const blockData = this.disk.readDisk(blockTsb);
                blockStatus = blockData.charCodeAt(0);

                // Clear the block
                this.disk.writeDisk(blockTsb, "");

                if (blockStatus === this.nextFlag.charCodeAt(0)) {
                    blockTsb = [
                        blockData.charCodeAt(1),
                        blockData.charCodeAt(2),
                        blockData.charCodeAt(3)
                    ];
                }
            } while (blockStatus === this.nextFlag.charCodeAt(0));

            // Clear the directory entry
            this.disk.writeDisk(dirTsb, "");

            return `File "${filename}" deleted successfully.`;
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