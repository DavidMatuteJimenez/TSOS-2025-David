var TSOS;
(function (TSOS) {
    class Scheduler {
        residentList = [];
        readyQueue = [];
        quantum = 6;
        cyclesSinceLastSwitch = 0;
        terminatedPcbs = [];
        // Track the last state of each process for accurate timing
        lastProcessStates = new Map();
        addToReadyQueue(pcb) {
            if (pcb.state !== TSOS.pcbState.ready) {
                pcb.state = TSOS.pcbState.ready;
            }
            this.readyQueue.push(pcb);
            _Kernel.krnTrace(`Scheduler: Process ${pcb.pid} moved to Ready queue. Queue size: ${this.readyQueue.length}`);
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
        // NEW: Update wait times for processes not currently running
        updateWaitTimes() {
            const runningPid = _Kernel.runningPcb ? _Kernel.runningPcb.pid : -1;
            // Update wait time for processes in ready queue
            for (const pcb of this.readyQueue) {
                if (pcb.pid !== runningPid) {
                    pcb.totalWaitTime++;
                }
            }
            // Update wait time for processes in resident list
            for (const pcb of this.residentList) {
                if (pcb.pid !== runningPid) {
                    pcb.totalWaitTime++;
                }
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map