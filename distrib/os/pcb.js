var TSOS;
(function (TSOS) {
    class Pcb {
        pid;
        state;
        pc;
        acc;
        xReg;
        yReg;
        zFlag;
        constructor(pid, state = "new", pc = 0, acc = 0, xReg = 0, yReg = 0, zFlag = 0) {
            this.pid = pid;
            this.state = state;
            this.pc = pc;
            this.acc = acc;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
        }
    }
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map