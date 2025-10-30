module TSOS {
    export class Pcb {
        constructor(
            public pid: number,
            public state: pcbState = pcbState.resident,
            public pc: number = 0,
            public ir: number = 0,
            public acc: number = 0,
            public xReg: number = 0,
            public yReg: number = 0,
            public zFlag: number = 0,
            public priority: number = 0,
            public location: pcbLocation = pcbLocation.memory,
            public base: number = 0,
            public limit: number = 0,
            public segment: number = -1,
            public modebit: number = 0,
            public turnaroundTime: number = 0,
            public waitTime: number = 0,
            public creationTime: number = 0,
            public totalExecutionTime: number = 0
        ) {
            this.creationTime = _OSclock; //added
        }
        public toString(): string { // added
            return `PID: ${this.pid} | State: ${this.state} | PC: 0x${this.pc.toString(16).toUpperCase().padStart(2, '0')} | Base: ${this.base} | Limit: ${this.limit} | Segment: ${this.segment}`;
    }

}
export enum pcbState {
    resident = "resident",
    ready = "ready",
    running = "running",
    terminated = "terminated"
}
export enum pcbLocation {
    memory = "memory",
    disk = "disk"
}
}