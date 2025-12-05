module TSOS {
    export enum SchedulingAlgorithm {
        RR,
        FCFS,
        PRIORITY
    }
    export class Scheduler {
        public residentList: Pcb[] = [];
        public readyQueue: Pcb[] = [];
        public quantum: number = 6;
        public cyclesSinceLastSwitch: number = 0;
        public schedulingAlgorithm: SchedulingAlgorithm = SchedulingAlgorithm.RR;

       public terminatedPcbs = [];

       public scheduleAlgDisplay(): string {
            switch (this.schedulingAlgorithm) {
                case SchedulingAlgorithm.RR:
                    return "Round Robin";
                case SchedulingAlgorithm.FCFS:
                    return "First-Come, First-Served";
                case SchedulingAlgorithm.PRIORITY:
                    return "Nonpremptive Priority Scheduling";
            }
        }

        public addToReadyQueue(pcb: Pcb): void {
            if (pcb.state !== pcbState.ready) {
                pcb.state = pcbState.ready;
            }
            this.readyQueue.push(pcb);
            _Kernel.krnTrace(`Scheduler: Process ${pcb.pid} moved to Ready queue. Queue size: ${this.readyQueue.length}`);
            
            // Update disk display when processes are swapped
            /*if (typeof (window as any).TSOS !== 'undefined' && (window as any).TSOS.Control) {
                (window as any).TSOS.Control.updateDiskDisplay();
            }*/
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
}