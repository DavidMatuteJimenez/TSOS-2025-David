module TSOS {
    export class DeviceDriverDisk extends DeviceDriver {
        constructor() {
            super();
            this.driverEntry = this.krnDskDriverEntry;
        }

        public krnDskDriverEntry(): void {
            this.status = "loaded";
        }


        //Trim filename of trailing null characters
        public static trimFilename(str: string): string {
            let lastIndex = str.length;
            for (let i = 0; i < str.length; ++i) {
                if (str.charCodeAt(i) === 0) {
                    lastIndex = i;
                    break;
                }
            }
            return str.slice(0, lastIndex);
        }

        //Convert string TSB to array
        public static stringToTSB(str: string): number[] {
            if (str.length < 3) {
                return undefined;
            }
            return [
                str.charCodeAt(0),
                str.charCodeAt(1),
                str.charCodeAt(2)
            ];
        }

        public formatDisk(): void {
            _FileSystem.format();
        }

        public createFile(filename: string): string {
            return _FileSystem.create(filename);
        }

        public deleteFile(filename: string): string {
            return _FileSystem.delete(filename);
        }

        public writeFile(filename: string, data: string): string {
            return _FileSystem.write(filename, data);
        }

        public readFile(filename: string): string {
            const result = _FileSystem.read(filename);
            if (result.success) {
                return result.data;
            }
            return undefined;
        }

        public getFilenames(): string[] {
            const lsOutput = _FileSystem.ls();
            if (lsOutput === "Disk is empty.") {
                return [];
            }
            return lsOutput.trim().split("\n");
        }

        public copyFile(source: string, dest: string): string {
            return _FileSystem.copy(source, dest);
        }

        public renameFile(oldName: string, newName: string): string {
            return _FileSystem.rename(oldName, newName);
        }

        public rollOutProcess(pid: number, bytes: number[]): number {
            return _FileSystem.rollOutProcess(pid, bytes);
        }

        public rollInProcess(pid: number): number[] {
            return _FileSystem.rollInProcess(pid);
        }
    }
}