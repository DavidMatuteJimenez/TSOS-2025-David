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
        startExecutionTime;
        totalExecutionTime;
        totalWaitTime;
        constructor(pid, state = pcbState.resident, pc = 0, ir = 0, acc = 0, xReg = 0, yReg = 0, zFlag = 0, priority = 0, location = pcbLocation.memory, base = 0, limit = 0, segment = -1, modebit = 0, turnaroundTime = 0, waitTime = 0, creationTime = 0, 
        // NEW TIMING PROPERTIES
        startExecutionTime = -1, // When first moved to running
        totalExecutionTime = 0, // Total cycles spent executing
        totalWaitTime = 0 // Total cycles spent waiting
        ) {
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
            this.startExecutionTime = startExecutionTime;
            this.totalExecutionTime = totalExecutionTime;
            this.totalWaitTime = totalWaitTime;
            this.creationTime = _OSclock; //added
        }
        toString() {
            return `PID: ${this.pid} | State: ${this.state} | PC: 0x${this.pc.toString(16).toUpperCase().padStart(2, '0')} | Base: ${this.base} | Limit: ${this.limit} | Segment: ${this.segment}`;
        }
    }
    TSOS.Pcb = Pcb;
    let pcbState;
    (function (pcbState) {
        pcbState["resident"] = "resident";
        pcbState["ready"] = "ready";
        pcbState["running"] = "running";
        pcbState["terminated"] = "terminated";
    })(pcbState = TSOS.pcbState || (TSOS.pcbState = {}));
    let pcbLocation;
    (function (pcbLocation) {
        pcbLocation["memory"] = "memory";
        pcbLocation["disk"] = "disk";
    })(pcbLocation = TSOS.pcbLocation || (TSOS.pcbLocation = {}));
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map