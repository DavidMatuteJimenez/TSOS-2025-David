module TSOS {
    // File metadata structure (stored at start of each file entry)
    interface FileEntry {
        name: string;           // filename
        size: number;           // file size in bytes
        startTrack: number;     // starting track
        startSector: number;    // starting sector
        startBlock: number;     // starting block
        used: boolean;          // is entry used
        createdDate: string;    // creation date
    }

    export class FileSystem {
        private disk: Disk;
        private files: Map<string, FileEntry> = new Map();
        private maxFilesPerDirectory: number = 8; // Simple limit for directory
        private sessionStorageKey: string = "TSOS_DISK_DATA";

        constructor(disk: Disk) {
            this.disk = disk;
            this.loadFromSessionStorage();
        }

        // ===== PUBLIC INTERFACE =====

        public format(): string {
            this.disk.format();
            this.files.clear();
            this.saveToSessionStorage();
            return "Disk formatted successfully.";
        }

        public create(filename: string): string {
            // Validate filename
            if (!this.validateFilename(filename)) {
                return `Error: Invalid filename "${filename}". Use alphanumeric, hyphens, underscores only.`;
            }

            if (this.files.has(filename)) {
                return `Error: File "${filename}" already exists.`;
            }

            if (this.files.size >= this.maxFilesPerDirectory) {
                return `Error: Directory full. Cannot create "${filename}".`;
            }

            const entry: FileEntry = {
                name: filename,
                size: 0,
                startTrack: 0,
                startSector: 0,
                startBlock: 0,
                used: true,
                createdDate: new Date().toLocaleString()
            };

            this.files.set(filename, entry);
            this.saveToSessionStorage();
            return `File "${filename}" created successfully.`;
        }

        public write(filename: string, data: string): string {
            if (!this.files.has(filename)) {
                return `Error: File "${filename}" does not exist.`;
            }

            const entry = this.files.get(filename);
            const bytes = this.stringToBytes(data);

            if (bytes.length > this.calculateMaxFileSize()) {
                return `Error: Data too large for file. Maximum: ${this.calculateMaxFileSize()} bytes.`;
            }

            // Store data in disk starting at track 1 (track 0 is metadata)
            const blockAddress = this.allocateBlocks(bytes.length);
            if (!blockAddress) {
                return `Error: Not enough disk space.`;
            }

            entry.startTrack = blockAddress.track;
            entry.startSector = blockAddress.sector;
            entry.startBlock = blockAddress.block;
            entry.size = bytes.length;

            // Write data to disk
            let currentTrack = blockAddress.track;
            let currentSector = blockAddress.sector;
            let currentBlock = blockAddress.block;
            let byteOffset = 0;

            while (byteOffset < bytes.length) {
                const blockData = new Uint8Array(Disk.BLOCK_SIZE);
                const bytesToWrite = Math.min(Disk.BLOCK_SIZE, bytes.length - byteOffset);
                blockData.set(bytes.slice(byteOffset, byteOffset + bytesToWrite));
                
                this.disk.writeBlock(currentTrack, currentSector, currentBlock, blockData);

                byteOffset += bytesToWrite;
                this.advanceBlockAddress(currentTrack, currentSector, currentBlock);
            }

            this.files.set(filename, entry);
            this.saveToSessionStorage();
            return `Data written to "${filename}" successfully (${bytes.length} bytes).`;
        }

        public read(filename: string): { success: boolean; data: string; message: string } {
            if (!this.files.has(filename)) {
                return { success: false, data: "", message: `Error: File "${filename}" does not exist.` };
            }

            const entry = this.files.get(filename);
            if (entry.size === 0) {
                return { success: true, data: "", message: `File "${filename}" is empty.` };
            }

            // Read data from disk
            let data = new Uint8Array(entry.size);
            let currentTrack = entry.startTrack;
            let currentSector = entry.startSector;
            let currentBlock = entry.startBlock;
            let byteOffset = 0;

            while (byteOffset < entry.size) {
                const blockData = this.disk.readBlock(currentTrack, currentSector, currentBlock);
                const bytesToRead = Math.min(Disk.BLOCK_SIZE, entry.size - byteOffset);
                data.set(blockData.slice(0, bytesToRead), byteOffset);

                byteOffset += bytesToRead;
                this.advanceBlockAddress(currentTrack, currentSector, currentBlock);
            }

            const content = this.bytesToString(data);
            return { success: true, data: content, message: `Read "${filename}" (${entry.size} bytes).` };
        }

        public delete(filename: string): string {
            if (!this.files.has(filename)) {
                return `Error: File "${filename}" does not exist.`;
            }

            this.files.delete(filename);
            this.saveToSessionStorage();
            return `File "${filename}" deleted successfully.`;
        }

        public copy(sourceFilename: string, destFilename: string): string {
            if (!this.files.has(sourceFilename)) {
                return `Error: Source file "${sourceFilename}" does not exist.`;
            }

            if (this.files.has(destFilename)) {
                return `Error: Destination file "${destFilename}" already exists.`;
            }

            // Read source
            const readResult = this.read(sourceFilename);
            if (!readResult.success) {
                return readResult.message;
            }

            // Create destination
            const createResult = this.create(destFilename);
            if (createResult.includes("Error")) {
                return createResult;
            }

            // Write to destination
            const writeResult = this.write(destFilename, readResult.data);
            return writeResult;
        }

        public rename(oldFilename: string, newFilename: string): string {
            if (!this.files.has(oldFilename)) {
                return `Error: File "${oldFilename}" does not exist.`;
            }

            if (this.files.has(newFilename)) {
                return `Error: File "${newFilename}" already exists.`;
            }

            const entry = this.files.get(oldFilename);
            entry.name = newFilename;
            this.files.delete(oldFilename);
            this.files.set(newFilename, entry);
            this.saveToSessionStorage();
            return `File "${oldFilename}" renamed to "${newFilename}" successfully.`;
        }

        public ls(): string {
            if (this.files.size === 0) {
                return "Disk is empty.";
            }

            let output = "Files on disk:\n";
            let index = 1;
            for (const [filename, entry] of this.files) {
                output += `${index}. ${filename} (${entry.size} bytes, created: ${entry.createdDate})\n`;
                index++;
            }
            return output;
        }

        // ===== PRIVATE HELPER METHODS =====

        private validateFilename(filename: string): boolean {
            if (!filename || filename.length === 0 || filename.length > 32) {
                return false;
            }
            // Allow alphanumeric, hyphens, underscores, dots
            return /^[a-zA-Z0-9._-]+$/.test(filename);
        }

        private stringToBytes(str: string): Uint8Array {
            const bytes = new Uint8Array(str.length);
            for (let i = 0; i < str.length; i++) {
                bytes[i] = str.charCodeAt(i) & 0xFF;
            }
            return bytes;
        }

        private bytesToString(bytes: Uint8Array): string {
            let str = "";
            for (let i = 0; i < bytes.length; i++) {
                if (bytes[i] === 0) break; // Stop at null terminator
                str += String.fromCharCode(bytes[i]);
            }
            return str;
        }

        private calculateMaxFileSize(): number {
            // Available blocks: all except track 0 (metadata track)
            const availableBlocks = (Disk.TRACKS - 1) * Disk.SECTORS * Disk.BLOCKS_PER_SECTOR;
            return availableBlocks * Disk.BLOCK_SIZE;
        }

        private allocateBlocks(size: number): { track: number; sector: number; block: number } | null {
            // Simple allocation: find first available space starting from track 1, sector 0, block 0
            // For now, just use track 1 sequentially
            return { track: 1, sector: 0, block: 0 };
        }

        private advanceBlockAddress(track: number, sector: number, block: number): void {
            // This is a placeholder - in actual use, you'd track position differently
            // For sequential reads/writes, increment block, then sector, then track
        }

        private saveToSessionStorage(): void {
            try {
                // Serialize disk data
                const diskData = this.disk.getDiskData();
                const diskDataB64 = this.uint8ArrayToBase64(diskData);

                // Serialize file metadata
                const filesData = Array.from(this.files.entries()).map(([name, entry]) => ({
                    name,
                    ...entry
                }));

                const storageData = {
                    diskData: diskDataB64,
                    files: filesData,
                    timestamp: Date.now()
                };

                sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(storageData));
                _Kernel.krnTrace("FileSystem: Data saved to sessionStorage");
            } catch (e) {
                _Kernel.krnTrace(`FileSystem: Error saving to sessionStorage: ${e}`);
            }
        }

        private loadFromSessionStorage(): void {
            try {
                const stored = sessionStorage.getItem(this.sessionStorageKey);
                if (!stored) {
                    _Kernel.krnTrace("FileSystem: No saved data in sessionStorage");
                    return;
                }

                const storageData = JSON.parse(stored);
                
                // Restore disk data
                const diskData = this.base64ToUint8Array(storageData.diskData);
                this.disk.loadDiskData(diskData);

                // Restore file metadata
                this.files.clear();
                for (const fileEntry of storageData.files) {
                    this.files.set(fileEntry.name, {
                        name: fileEntry.name,
                        size: fileEntry.size,
                        startTrack: fileEntry.startTrack,
                        startSector: fileEntry.startSector,
                        startBlock: fileEntry.startBlock,
                        used: fileEntry.used,
                        createdDate: fileEntry.createdDate
                    });
                }

                _Kernel.krnTrace("FileSystem: Data restored from sessionStorage");
            } catch (e) {
                _Kernel.krnTrace(`FileSystem: Error loading from sessionStorage: ${e}`);
            }
        }

        private uint8ArrayToBase64(arr: Uint8Array): string {
            let binary = "";
            for (let i = 0; i < arr.length; i++) {
                binary += String.fromCharCode(arr[i]);
            }
            return btoa(binary);
        }

        private base64ToUint8Array(str: string): Uint8Array {
            const binary = atob(str);
            const arr = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                arr[i] = binary.charCodeAt(i);
            }
            return arr;
        }
    }
}