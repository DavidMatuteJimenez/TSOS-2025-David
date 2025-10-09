

module TSOS {
    export class Pcb {
        constructor(
            public pid: number,
            public state: string = "resident",
            public pc: number = 0,
            public ir: number = 0,
            public acc: number = 0,
            public xReg: number = 0,
            public yReg: number = 0,
            public zFlag: number = 0,
            public priority: number = 0,
            public location: string = "memory"

        ) {
            
        }
    }
}