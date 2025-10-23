module TSOS {
    export class Scheduler {
        public readyQueue: Pcb[] = [];
        public quantum: number = 6;
        public cyclesSinceLastSwitch: number = 0;

        public addToReadyQueue(pcb: Pcb): void {
            if (pcb.state !== "Ready") {
                pcb.state = "Ready";
            }
            this.readyQueue.push(pcb);
            _Kernel.krnTrace(`Scheduler: Process ${pcb.pid} moved to Ready queue. Queue size: ${this.readyQueue.length}`);
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
    }
}