var TSOS;
(function (TSOS) {
    class Dispatcher {
        contextSwitch() {
            _Kernel.krnTrace("========== CONTEXT SWITCH ==========");
            if (_Kernel.runningPcb) {
                _Kernel.runningPcb.pc = _CPU.PC;
                _Kernel.runningPcb.ir = _CPU.IR;
                _Kernel.runningPcb.acc = _CPU.Acc;
                _Kernel.runningPcb.xReg = _CPU.Xreg;
                _Kernel.runningPcb.yReg = _CPU.Yreg;
                _Kernel.runningPcb.zFlag = _CPU.Zflag;
                _Kernel.krnTrace(`Dispatcher: Context switch OUT - Process ${_Kernel.runningPcb.pid} (State: ${_Kernel.runningPcb.state}, PC: 0x${_Kernel.runningPcb.pc.toString(16).toUpperCase().padStart(2, '0')})`);
                if (_Kernel.runningPcb.state !== TSOS.pcbState.terminated) {
                    _Kernel.runningPcb.state = TSOS.pcbState.ready;
                    _Scheduler.addToReadyQueue(_Kernel.runningPcb);
                }
                else {
                    _MemoryManager.deallocatePartition(_Kernel.runningPcb.segment);
                    _Kernel.krnTrace(`Dispatcher: Process ${_Kernel.runningPcb.pid} terminated and deallocated`);
                }
            }
            const nextPcb = _Scheduler.removeNextProcess();
            if (nextPcb) {
                _Kernel.runningPcb = nextPcb;
                nextPcb.state = TSOS.pcbState.running;
                nextPcb.modebit = 1;
                _CPU.PC = nextPcb.pc;
                _CPU.IR = nextPcb.ir;
                _CPU.Acc = nextPcb.acc;
                _CPU.Xreg = nextPcb.xReg;
                _CPU.Yreg = nextPcb.yReg;
                _CPU.Zflag = nextPcb.zFlag;
                _CPU.isExecuting = true;
                _Kernel.krnTrace(`Dispatcher: Context switch IN - Process ${nextPcb.pid} (Base: ${nextPcb.base}, Limit: ${nextPcb.limit}, PC: 0x${nextPcb.pc.toString(16).toUpperCase().padStart(2, '0')})`);
            }
            else {
                _Kernel.runningPcb = null;
                _CPU.isExecuting = false;
                _Kernel.krnTrace("Dispatcher: No processes in Ready queue. CPU idle.");
            }
            _Scheduler.resetCycleCount();
            _Kernel.krnTrace("====================================");
        }
        checkAndSwitchIfNeeded() {
            if (_Kernel.runningPcb && _Scheduler.hasReadyProcesses() && _Scheduler.isQuantumExpired()) {
                _Kernel.krnTrace(`Dispatcher: Quantum (${_Scheduler.quantum} cycles) expired for Process ${_Kernel.runningPcb.pid}`);
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH, null));
            }
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map