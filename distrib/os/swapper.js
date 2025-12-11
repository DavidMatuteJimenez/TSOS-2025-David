var TSOS;
(function (TSOS) {
    class Swapper {
        swapPrefix = "swap"; // change this to global variable
        constructor() {
            if (_Kernel) {
                _Kernel.krnTrace("Swapper initialized.");
            }
        }
        //Roll out a process from memory to disk
        rollOut(pcb) {
            if (pcb.location !== TSOS.pcbLocation.memory) {
                _Kernel.krnTrace(`Swapper: Process ${pcb.pid} is not in memory, cannot roll out.`);
                return false;
            }
            if (pcb.segment < 0) {
                _Kernel.krnTrace(`Swapper: Process ${pcb.pid} has invalid segment.`);
                return false;
            }
            _Kernel.krnTrace(`Swapper: Rolling out Process ${pcb.pid} from memory to disk...`);
            // Read process data from memory
            const processData = [];
            for (let i = pcb.base; i < pcb.limit; i++) {
                processData.push(_Memory.memory[i]);
            }
            // Write to disk using the file system
            const rollOutResult = _FileSystem.rollOutProcess(pcb.pid, processData);
            if (rollOutResult === 0) {
                // Success
                // Deallocate memory partition
                _MemoryManager.deallocatePartition(pcb.segment);
                // Update PCB
                pcb.location = TSOS.pcbLocation.disk;
                const oldSegment = pcb.segment;
                pcb.segment = -1;
                pcb.base = 0;
                pcb.limit = 0;
                _Kernel.krnTrace(`Swapper: Process ${pcb.pid} rolled out successfully (freed segment ${oldSegment}).`);
                return true;
            }
            else if (rollOutResult === 3) {
                _Kernel.krnTrace(`Swapper: Failed to roll out Process ${pcb.pid} - disk full.`);
                return false;
            }
            else {
                _Kernel.krnTrace(`Swapper: Failed to roll out Process ${pcb.pid} - error ${rollOutResult}.`);
                return false;
            }
        }
        //Roll in a process from disk to memory
        rollIn(pcb) {
            if (pcb.location !== TSOS.pcbLocation.disk) {
                _Kernel.krnTrace(`Swapper: Process ${pcb.pid} is not on disk, cannot roll in.`);
                return false;
            }
            _Kernel.krnTrace(`Swapper: Rolling in Process ${pcb.pid} from disk to memory...`);
            // Read process data from disk
            const processData = _FileSystem.rollInProcess(pcb.pid);
            if (!processData) {
                _Kernel.krnTrace(`Swapper: Failed to read Process ${pcb.pid} from disk.`);
                return false;
            }
            // Convert process data to hex strings for memory allocation
            const hexData = [];
            for (let i = 0; i < processData.length; i++) {
                hexData.push(processData[i].toString(16).padStart(2, "0").toUpperCase());
            }
            // Try to allocate memory
            const allocation = _MemoryManager.allocatePartition(hexData);
            if (allocation.success) {
                // Update PCB
                pcb.base = allocation.base;
                pcb.limit = allocation.limit;
                pcb.segment = allocation.segment;
                pcb.location = TSOS.pcbLocation.memory;
                _Kernel.krnTrace(`Swapper: Process ${pcb.pid} rolled in successfully to segment ${pcb.segment}.`);
                return true;
            }
            else {
                if (_Kernel.runningPcb) {
                    this.rollOut(_Kernel.runningPcb);
                }
                else {
                    let memoryFreed = false;
                    for (let i = 0; i < _Scheduler.residentList.length; i++) {
                        if (_Scheduler.residentList[i].location === TSOS.pcbLocation.memory) {
                            this.rollOut(_Scheduler.residentList[i]);
                            memoryFreed = true;
                            break;
                        }
                    }
                    if (!memoryFreed) {
                        for (let i = 0; i < _Scheduler.readyQueue.length; i++) {
                            if (_Scheduler.readyQueue[i].location === TSOS.pcbLocation.memory) {
                                this.rollOut(_Scheduler.readyQueue[i]);
                                break;
                            }
                        }
                    }
                }
                const allocation = _MemoryManager.allocatePartition(hexData);
                if (allocation.success) {
                    // Update PCB
                    pcb.base = allocation.base;
                    pcb.limit = allocation.limit;
                    pcb.segment = allocation.segment;
                    pcb.location = TSOS.pcbLocation.memory;
                    _Kernel.krnTrace(`Swapper: Process ${pcb.pid} rolled in successfully to segment ${pcb.segment}.`);
                    return true;
                }
            }
            return false;
        }
        //Swap out a process to make room for another
        swapProcesses(swapInPcb) {
            if (swapInPcb.location !== TSOS.pcbLocation.disk) {
                _Kernel.krnTrace(`Swapper: Process ${swapInPcb.pid} is not on disk.`);
                return false;
            }
            _Kernel.krnTrace(`Swapper: Need to swap out a process to make room for Process ${swapInPcb.pid}.`);
            // Find a ready process in memory to swap out (not the running process)
            let swapOutPcb = null;
            for (let i = 0; i < _Scheduler.readyQueue.length; i++) {
                if (_Scheduler.readyQueue[i].location === TSOS.pcbLocation.memory) {
                    swapOutPcb = _Scheduler.readyQueue[i];
                    break;
                }
            }
            if (!swapOutPcb) {
                _Kernel.krnTrace("Swapper: No suitable process in ready queue to swap out.");
                return false;
            }
            _Kernel.krnTrace(`Swapper: Selected Process ${swapOutPcb.pid} to swap out.`);
            // Roll out the selected process
            if (!this.rollOut(swapOutPcb)) {
                _Kernel.krnTrace("Swapper: Failed to roll out process.");
                return false;
            }
            // Roll in the new process
            if (!this.rollIn(swapInPcb)) {
                _Kernel.krnTrace("Swapper: Failed to roll in process.");
                return false;
            }
            _Kernel.krnTrace(`Swapper: Successfully swapped Process ${swapOutPcb.pid} out and Process ${swapInPcb.pid} in.`);
            return true;
        }
        //Ensure a process is in memory, swapping if necessary
        ensureInMemory(pcb) {
            // Already in memory
            if (pcb.location === TSOS.pcbLocation.memory) {
                return true;
            }
            _Kernel.krnTrace(`Swapper: Process ${pcb.pid} needs to be swapped in.`);
            // Try to roll in directly
            if (this.rollIn(pcb)) {
                return true;
            }
            // Need to swap out another process first
            return this.swapProcesses(pcb);
        }
        //Get all processes currently on disk
        getSwappedProcesses() {
            const swappedPids = [];
            // Check resident list
            for (const pcb of _Scheduler.residentList) {
                if (pcb.location === TSOS.pcbLocation.disk) {
                    swappedPids.push(pcb.pid);
                }
            }
            // Check ready queue
            for (const pcb of _Scheduler.readyQueue) {
                if (pcb.location === TSOS.pcbLocation.disk) {
                    swappedPids.push(pcb.pid);
                }
            }
            return swappedPids;
        }
        //Clean up swap files for terminated processes
        cleanupSwapFile(pid) {
            const filename = this.swapPrefix + pid;
            // Use deleteSwapFile to properly clear data blocks
            _FileSystem.deleteSwapFile(filename);
            _Kernel.krnTrace(`Swapper: Cleaned up swap file for Process ${pid}.`);
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map