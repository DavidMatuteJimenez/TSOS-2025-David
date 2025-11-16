var TSOS;
(function (TSOS) {
    class DeviceDriverDisk extends TSOS.DeviceDriver {
        constructor() {
            super();
            this.driverEntry = this.krnDskDriverEntry;
            this.isr = this.krnDskDispatchInterrupt;
        }
        krnDskDriverEntry() {
            this.status = "loaded";
            _Kernel.krnTrace("Disk System Device Driver loaded and ready.");
        }
        krnDskDispatchInterrupt(params) {
            // Handle disk-related interrupts here if needed
            _Kernel.krnTrace("Disk System Device Driver interrupt received.");
        }
        //Trim filename of trailing null characters
        static trimFilename(str) {
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
        static stringToTSB(str) {
            if (str.length < 3) {
                return undefined;
            }
            return [
                str.charCodeAt(0),
                str.charCodeAt(1),
                str.charCodeAt(2)
            ];
        }
        formatDisk() {
            return _FileSystem.format();
        }
        createFile(filename) {
            return _FileSystem.create(filename);
        }
        deleteFile(filename) {
            return _FileSystem.delete(filename);
        }
        writeFile(filename, data) {
            return _FileSystem.write(filename, data);
        }
        readFile(filename) {
            return _FileSystem.read(filename);
        }
        getFilenames() {
            const lsOutput = _FileSystem.ls();
            if (lsOutput === "Disk is empty.") {
                return [];
            }
            return lsOutput.trim().split("\n");
        }
        copyFile(source, dest) {
            return _FileSystem.copy(source, dest);
        }
        renameFile(oldName, newName) {
            return _FileSystem.rename(oldName, newName);
        }
        listFiles() {
            return _FileSystem.ls();
        }
        rollOutProcess(pid, bytes) {
            return _FileSystem.rollOutProcess(pid, bytes);
        }
        rollInProcess(pid) {
            return _FileSystem.rollInProcess(pid);
        }
    }
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=DeviceDriverDisk.js.map