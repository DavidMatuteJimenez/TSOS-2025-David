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
        constructor(pid, state = "new", pc = 0, ir = 0, acc = 0, xReg = 0, yReg = 0, zFlag = 0, priority = "new", location = 0) {
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
        }
    }
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map