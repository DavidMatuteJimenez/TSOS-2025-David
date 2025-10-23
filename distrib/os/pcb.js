var TSOS;
(function (TSOS) {
    class Pcb {
        pid;
        state;
        pc;
        ir;
        acc;
        xReg;
        yReg;
        zFlag;
        priority;
        location;
        base;
        limit;
        segment;
        modebit;
        turnaroundTime;
        waitTime;
        creationTime;
        constructor(pid, state = pcbState.resident, pc = 0, ir = 0, acc = 0, xReg = 0, yReg = 0, zFlag = 0, priority = 0, location = pcbLocation.memory, base = 0, limit = 0, segment = -1, modebit = 0, turnaroundTime = 0, waitTime = 0, creationTime = 0) {
            this.pid = pid;
            this.state = state;
            this.pc = pc;
            this.ir = ir;
            this.acc = acc;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
            this.priority = priority;
            this.location = location;
            this.base = base;
            this.limit = limit;
            this.segment = segment;
            this.modebit = modebit;
            this.turnaroundTime = turnaroundTime;
            this.waitTime = waitTime;
            this.creationTime = creationTime;
            this.creationTime = _OSclock; //added
        }
        toString() {
            return `PID: ${this.pid} | State: ${this.state} | PC: 0x${this.pc.toString(16).toUpperCase().padStart(2, '0')} | Base: ${this.base} | Limit: ${this.limit} | Segment: ${this.segment}`;
        }
    }
    TSOS.Pcb = Pcb;
    let pcbState;
    (function (pcbState) {
        pcbState[pcbState["resident"] = 0] = "resident";
        pcbState[pcbState["ready"] = 1] = "ready";
        pcbState[pcbState["running"] = 2] = "running";
        pcbState[pcbState["terminated"] = 3] = "terminated";
    })(pcbState = TSOS.pcbState || (TSOS.pcbState = {}));
    let pcbLocation;
    (function (pcbLocation) {
        pcbLocation[pcbLocation["memory"] = 0] = "memory";
        pcbLocation[pcbLocation["disk"] = 1] = "disk";
    })(pcbLocation = TSOS.pcbLocation || (TSOS.pcbLocation = {}));
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map