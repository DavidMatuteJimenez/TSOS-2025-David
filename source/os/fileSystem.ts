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


        //Create a new file
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

            // Create directory entry: [T][S][B][filename...]
            const data = String.fromCharCode(blockTsb[0]) +
                         String.fromCharCode(blockTsb[1]) +
                         String.fromCharCode(blockTsb[2]) +
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


        //List all files
        public ls(): string {
            if (!this.disk.isFormatted()) {
                return "Error: Disk not formatted. Please run 'format' first.";
            }

            let output = "";
            let fileCount = 0;

            // Search directory blocks (0:0:1 to 0:7:7)
            for (let s = 0; s < Disk.sectorCount; ++s) {
                for (let b = 0; b < Disk.blockCount; ++b) {
                    // Skip MBR (0:0:0)
                    if (s === 0 && b === 0) continue;

                    const dirData = this.disk.readDisk([0, s, b]);
                    if (dirData && dirData.charCodeAt(0) !== 0) {
                        // Extract filename (skip first 3 bytes which are TSB)
                        const filename = this.trimFilename(dirData.substring(3));
                        if (filename.length > 0) {
                            output += filename + "\n";
                            fileCount++;
                        }
                    }
                }
            }

            if (fileCount === 0) {
                return "Disk is empty.";
            }
            return output;
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

        
        //Rename a file
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

            // Read the directory entry to get the data block TSB
            const dirData = this.disk.readDisk(dirTsb);
            const blockTsb = dirData.substring(0, 3);

            // Write new directory entry with new name
            const newDirData = blockTsb + newFilename;
            this.disk.writeDisk(dirTsb, newDirData);

            return `File "${oldFilename}" renamed to "${newFilename}" successfully.`;
        }


        //helper methods
        private validateFilename(filename: string): boolean {
            if (!filename || filename.length === 0 || filename.length > 28) {
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
                    if (dirData && this.trimFilename(dirData.substring(3)) === filename) {
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

