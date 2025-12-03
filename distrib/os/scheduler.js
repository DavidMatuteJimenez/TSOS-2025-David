var TSOS;
(function (TSOS) {
    class Scheduler {
        residentList = [];
        readyQueue = [];
        quantum = 6;
        cyclesSinceLastSwitch = 0;
        terminatedPcbs = [];
        addToReadyQueue(pcb) {
            if (pcb.state !== TSOS.pcbState.ready) {
                pcb.state = TSOS.pcbState.ready;
            }
            this.readyQueue.push(pcb);
            _Kernel.krnTrace(`Scheduler: Process ${pcb.pid} moved to Ready queue. Queue size: ${this.readyQueue.length}`);
            // Update disk display when processes are swapped
            /*if (typeof (window as any).TSOS !== 'undefined' && (window as any).TSOS.Control) {
                (window as any).TSOS.Control.updateDiskDisplay();
            }*/
        }
        getNextProcess() {
            if (this.readyQueue.length > 0) {
                return this.readyQueue[0];
            }
            return null;
        }
        removeNextProcess() {
            if (this.readyQueue.length > 0) {
                const pcb = this.readyQueue.shift();
                _Kernel.krnTrace(`Scheduler: Process ${pcb.pid} removed from Ready queue. Queue size: ${this.readyQueue.length}`);
                return pcb;
            }
            return null;
        }
        setQuantum(newQuantum) {
            if (newQuantum > 0) {
                this.quantum = newQuantum;
                _Kernel.krnTrace(`Scheduler: Quantum updated to ${this.quantum} cycles`);
            }
        }
        isQuantumExpired() {
            return this.cyclesSinceLastSwitch >= this.quantum;
        }
        incrementCycle() {
            this.cyclesSinceLastSwitch++;
        }
        resetCycleCount() {
            this.cyclesSinceLastSwitch = 0;
        }
        hasReadyProcesses() {
            return this.readyQueue.length > 0;
        }
        displayQueue() {
            let result = "Ready Queue: [";
            for (let i = 0; i < this.readyQueue.length; i++) {
                result += `PID${this.readyQueue[i].pid}`;
                if (i < this.readyQueue.length - 1)
                    result += ", ";
            }
            result += "]";
            return result;
        }
        swapProcessToReady(pcb) {
            if (pcb.location !== TSOS.pcbLocation.disk) {
                _Kernel.krnTrace(`Scheduler: Process ${pcb.pid} is not on disk`);
                return false;
            }
            // Use the Swapper to ensure process is in memory
            if (_Swapper.ensureInMemory(pcb)) {
                this.addToReadyQueue(pcb);
                _Kernel.krnTrace(`Scheduler: Process ${pcb.pid} swapped in and added to ready queue`);
                return true;
            }
            _Kernel.krnTrace(`Scheduler: Failed to swap in Process ${pcb.pid}`);
            return false;
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map