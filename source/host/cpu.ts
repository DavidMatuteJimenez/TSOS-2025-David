/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

     module TSOS {

        export class Cpu {
    
            constructor(public PC: number = 0,
                        public IR: number = 0,
                        public Acc: number = 0,
                        public Xreg: number = 0,
                        public Yreg: number = 0,
                        public Zflag: number = 0,
                        public isExecuting: boolean = false) {
    
            }
    
            public init(): void {
                this.PC = 0;
                this.IR = 0;
                this.Acc = 0;
                this.Xreg = 0;
                this.Yreg = 0;
                this.Zflag = 0;
                this.isExecuting = false;
            }
    
            public cycle(): void {
                // _Kernel.krnTrace('CPU cycle'); // Commented out - causes performance issues with multiple processes
    
                // 1. FETCH
                this.IR = _MemoryAccessor.read(this.PC);
                this.PC++;
    
                let tempAddress = 0;
                let tempValue = 0;
    
                // 2. DECODE & 3. EXECUTE
                switch (this.IR) {
                    case 0xA9: // LDA - Load Accumulator with constant
                        this.Acc = _MemoryAccessor.read(this.PC);
                        this.PC++;
                        break;
                    
                    case 0xAD: // LDA - Load Accumulator from memory
                        tempAddress = _MemoryAccessor.readAddress(this.PC);
                        this.PC += 2;
                        this.Acc = _MemoryAccessor.read(tempAddress);
                        break;
                    
                    case 0x8D: // STA - Store Accumulator in memory
                        tempAddress = _MemoryAccessor.readAddress(this.PC);
                        this.PC += 2;
                        _MemoryAccessor.write(tempAddress, this.Acc);
                        break;
    
                    case 0x6D: // ADC - Add with Carry (add content of address to Acc)
                        tempAddress = _MemoryAccessor.readAddress(this.PC);
                        this.PC += 2;
                        tempValue = _MemoryAccessor.read(tempAddress);
                        this.Acc += tempValue;
                        break;
    
                    case 0xA2: // LDX - Load X register with constant
                        this.Xreg = _MemoryAccessor.read(this.PC);
                        this.PC++;
                        break;
                    
                    case 0xAE: // LDX - Load X register from memory
                        tempAddress = _MemoryAccessor.readAddress(this.PC);
                        this.PC += 2;
                        this.Xreg = _MemoryAccessor.read(tempAddress);
                        break;
    
                    case 0xA0: // LDY - Load Y register with constant
                        this.Yreg = _MemoryAccessor.read(this.PC);
                        this.PC++;
                        break;
    
                    case 0xAC: // LDY - Load Y register from memory
                        tempAddress = _MemoryAccessor.readAddress(this.PC);
                        this.PC += 2;
                        this.Yreg = _MemoryAccessor.read(tempAddress);
                        break;
                    
                    case 0xEA: // NOP - No operation
                        // Does nothing.
                        break;
                    
                    case 0x00: // BRK - Break
                        _Kernel.endProgram(_Kernel.runningPcb.pid);
                        break;
    
                    case 0xEC: // CPX - Compare byte in memory to X register
                        tempAddress = _MemoryAccessor.readAddress(this.PC);
                        this.PC += 2;
                        tempValue = _MemoryAccessor.read(tempAddress);
                        this.Zflag = (this.Xreg === tempValue) ? 1 : 0;
                        break;
                    
                    case 0xD0: // BNE - Branch if Z flag is 0
                        const jump = _MemoryAccessor.read(this.PC);
                        this.PC++;
                        if (this.Zflag === 0) {
                            this.PC += jump;
                            if (this.PC >= MEMORY_PARTITION_SIZE) {
                                this.PC -= MEMORY_PARTITION_SIZE; // Wrap around
                            }
                        }
                        break;
    
                    case 0xEE: // INC - Increment value of a byte in memory
                        tempAddress = _MemoryAccessor.readAddress(this.PC);
                        this.PC += 2;
                        tempValue = _MemoryAccessor.read(tempAddress);
                        tempValue++;
                        _MemoryAccessor.write(tempAddress, tempValue);
                        break;
    
                    case 0xFF: // SYS - System Call
                        // If Xreg is 1, print the integer in Yreg.
                        if (this.Xreg === 1) {
                            _StdOut.putText(this.Yreg.toString());
                        }
                        // If Xreg is 2, print the null-terminated string at the address in Yreg.
                        else if (this.Xreg === 2) {
                            tempAddress = this.Yreg;
                            let charCode = _MemoryAccessor.read(tempAddress);
                            while (charCode !== 0) {
                                _StdOut.putText(String.fromCharCode(charCode));
                                tempAddress++;
                                charCode = _MemoryAccessor.read(tempAddress);
                            }
                        }
                        break;
                    
                    default:
                        _KernelInterruptQueue.enqueue(new Interrupt(PSKILL,["illegal instruction, terminated"]));
                        return;
                }
                if (this.isExecuting) {
                    if (_Kernel.runningPcb) {
                        _Kernel.runningPcb.totalExecutionTime++;
                    }// added this
                    _Scheduler.incrementCycle();
                    _Dispatcher.checkAndSwitchIfNeeded();
                }
            
            }
        }
    }
