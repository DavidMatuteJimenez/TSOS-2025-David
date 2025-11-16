module TSOS {
    export class Scheduler {
        public residentList: Pcb[] = [];
        public readyQueue: Pcb[] = [];
        public quantum: number = 6;
        public cyclesSinceLastSwitch: number = 0;

       public terminatedPcbs = [];

        public addToReadyQueue(pcb: Pcb): void {
            if (pcb.state !== pcbState.ready) {
                pcb.state = pcbState.ready;
            }
            this.readyQueue.push(pcb);
            _Kernel.krnTrace(`Scheduler: Process ${pcb.pid} moved to Ready queue. Queue size: ${this.readyQueue.length}`);
            
            // Update disk display when processes are swapped
            if (typeof (window as any).TSOS !== 'undefined' && (window as any).TSOS.Control) {
                (window as any).TSOS.Control.updateDiskDisplay();
            }
        }

        public getNextProcess(): Pcb {
            if (this.readyQueue.length > 0) {
                return this.readyQueue[0];
            }
            return null;
        }

        public removeNextProcess(): Pcb {
            if (this.readyQueue.length > 0) {
                const pcb = this.readyQueue.shift();
                _Kernel.krnTrace(`Scheduler: Process ${pcb.pid} removed from Ready queue. Queue size: ${this.readyQueue.length}`);
                return pcb;
            }
            return null;
        }

        public setQuantum(newQuantum: number): void {
            if (newQuantum > 0) {
                this.quantum = newQuantum;
                _Kernel.krnTrace(`Scheduler: Quantum updated to ${this.quantum} cycles`);
            }
        }

        public isQuantumExpired(): boolean {
            return this.cyclesSinceLastSwitch >= this.quantum;
        }

        public incrementCycle(): void {
            this.cyclesSinceLastSwitch++;
        }

        public resetCycleCount(): void {
            this.cyclesSinceLastSwitch = 0;
        }

        public hasReadyProcesses(): boolean {
            return this.readyQueue.length > 0;
        }

        public displayQueue(): string {
            let result = "Ready Queue: [";
            for (let i = 0; i < this.readyQueue.length; i++) {
                result += `PID${this.readyQueue[i].pid}`;
                if (i < this.readyQueue.length - 1) result += ", ";
            }
            result += "]";
            return result;
        }

        public swapProcessToReady(pcb: Pcb): boolean {
            if (pcb.location !== pcbLocation.disk) {
                _Kernel.krnTrace(`Scheduler: Process ${pcb.pid} is not on disk`);
                return false;
            }

            // Try to load process from disk
            const processData = _FileSystem.rollInProcess(pcb.pid);
            if (!processData) {
                _Kernel.krnTrace(`Scheduler: Failed to read process ${pcb.pid} from disk`);
                return false;
            }

            // Convert process data back to hex strings for memory allocation
            const hexData: string[] = [];
            for (let i = 0; i < processData.length; i++) {
                hexData.push(processData[i].toString(16).padStart(2, '0').toUpperCase());
            }

            const allocation = _MemoryManager.allocatePartition(hexData);
            if (allocation.success) {
                pcb.base = allocation.base;
                pcb.limit = allocation.limit;
                pcb.segment = allocation.segment;
                pcb.location = pcbLocation.memory;
                
                this.addToReadyQueue(pcb);
                _Kernel.krnTrace(`Scheduler: Process ${pcb.pid} swapped in from disk to memory`);
                return true;
            } else {
                // Need to swap out a process first
                return this.swapOutProcessForSwapIn(pcb, processData);
            }
        }

        private swapOutProcessForSwapIn(swapInPcb: Pcb, swapInData: number[]): boolean {
            // Find a ready process in memory to swap out
            let swapOutPcb: Pcb = null;
            for (let i = 0; i < this.readyQueue.length; i++) {
                if (this.readyQueue[i].location === pcbLocation.memory) {
                    swapOutPcb = this.readyQueue[i];
                    break;
                }
            }

            if (!swapOutPcb) {
                _Kernel.krnTrace("Scheduler: No process in memory to swap out");
                return false;
            }

            // Read process data from memory
            const memoryData: number[] = [];
            for (let i = swapOutPcb.base; i < swapOutPcb.limit; i++) {
                memoryData.push(_Memory.memory[i]);
            }

            // Save to disk
            const rollOutResult = _FileSystem.rollOutProcess(swapOutPcb.pid, memoryData);
            if (rollOutResult === 0) { // Success
                // Update swapped out process
                _MemoryManager.deallocatePartition(swapOutPcb.segment);
                swapOutPcb.location = pcbLocation.disk;
                swapOutPcb.segment = -1;
                
                // Remove from ready queue
                const index = this.readyQueue.indexOf(swapOutPcb);
                if (index > -1) {
                    this.readyQueue.splice(index, 1);
                }

                // Convert swap-in data back to hex strings
                const hexData: string[] = [];
                for (let i = 0; i < swapInData.length; i++) {
                    hexData.push(swapInData[i].toString(16).padStart(2, '0').toUpperCase());
                }

                // Now allocate memory for the swap-in process
                const allocation = _MemoryManager.allocatePartition(hexData);
                if (allocation.success) {
                    swapInPcb.base = allocation.base;
                    swapInPcb.limit = allocation.limit;
                    swapInPcb.segment = allocation.segment;
                    swapInPcb.location = pcbLocation.memory;
                    
                    this.addToReadyQueue(swapInPcb);
                    _Kernel.krnTrace(`Scheduler: Process ${swapOutPcb.pid} swapped out, Process ${swapInPcb.pid} swapped in`);
                    return true;
                }
            }

            _Kernel.krnTrace("Scheduler: Process swapping failed");
            return false;
        }
    }
}