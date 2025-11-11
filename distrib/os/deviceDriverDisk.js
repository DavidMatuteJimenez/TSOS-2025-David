/* ----------------------------------
   DeviceDriverDisk.ts

   The Kernel Disk System Device Driver (dsDD).
   Insulates kernel-level I/O operations from byte-level block details.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    class DeviceDriverDisk extends TSOS.DeviceDriver {
        constructor() {
            super();
            this.driverEntry = this.krnDiskDriverEntry;
            this.isr = this.krnDiskDispatchCommand;
        }
        krnDiskDriverEntry() {
            // Initialization routine for the kernel-mode Disk System Device Driver
            this.status = "loaded";
            _Kernel.krnTrace("Disk System Device Driver loaded and ready.");
        }
        // ISR for disk operations - handles all kernel-level I/O operations
        krnDiskDispatchCommand(params) {
            _Kernel.krnTrace(`dsDD: Processing ${params.operation} operation`);
            let result = { success: false, message: "", data: "" };
            try {
                switch (params.operation) {
                    case "format":
                        result = this.formatDisk();
                        break;
                    case "create":
                        result = this.createFile(params.filename);
                        break;
                    case "read":
                        result = this.readFile(params.filename);
                        break;
                    case "write":
                        result = this.writeFile(params.filename, params.data);
                        break;
                    case "delete":
                        result = this.deleteFile(params.filename);
                        break;
                    case "copy":
                        result = this.copyFile(params.sourceFilename, params.destFilename);
                        break;
                    case "rename":
                        result = this.renameFile(params.oldFilename, params.newFilename);
                        break;
                    case "ls":
                        result = this.listFiles();
                        break;
                    default:
                        result = {
                            success: false,
                            message: `dsDD: Unknown disk operation: ${params.operation}`,
                            data: ""
                        };
                }
                _Kernel.krnTrace(`dsDD: ${params.operation} operation ${result.success ? 'completed successfully' : 'failed'}`);
            }
            catch (error) {
                result = {
                    success: false,
                    message: `dsDD: Error during ${params.operation}: ${error.message}`,
                    data: ""
                };
                _Kernel.krnTrace(`dsDD: Exception during ${params.operation}: ${error.message}`);
            }
            return result;
        }
        // ===== DISK OPERATION IMPLEMENTATIONS =====
        // These methods encapsulate kernel-level I/O operations and insulate from byte-level details
        formatDisk() {
            const result = _FileSystem.format();
            return {
                success: true,
                message: result,
                data: ""
            };
        }
        createFile(filename) {
            const result = _FileSystem.create(filename);
            const success = !result.includes("Error");
            return {
                success: success,
                message: result,
                data: ""
            };
        }
        readFile(filename) {
            const result = _FileSystem.read(filename);
            return {
                success: result.success,
                message: result.message,
                data: result.data
            };
        }
        writeFile(filename, data) {
            const result = _FileSystem.write(filename, data);
            const success = !result.includes("Error");
            return {
                success: success,
                message: result,
                data: ""
            };
        }
        deleteFile(filename) {
            const result = _FileSystem.delete(filename);
            const success = !result.includes("Error");
            return {
                success: success,
                message: result,
                data: ""
            };
        }
        copyFile(sourceFilename, destFilename) {
            const result = _FileSystem.copy(sourceFilename, destFilename);
            const success = !result.includes("Error");
            return {
                success: success,
                message: result,
                data: ""
            };
        }
        renameFile(oldFilename, newFilename) {
            const result = _FileSystem.rename(oldFilename, newFilename);
            const success = !result.includes("Error");
            return {
                success: success,
                message: result,
                data: ""
            };
        }
        listFiles() {
            const result = _FileSystem.ls();
            return {
                success: true,
                message: result,
                data: ""
            };
        }
    }
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map