/* ------------
    Control.ts


    Routines for the hardware simulation, NOT for our client OS itself.
    These are static because we are never going to instantiate them, because they represent the hardware.
    In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
    is the "bare metal" (so to speak) for which we write code that hosts our client OS.
    But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
    in both the host and client environments.


    This (and other host/simulation scripts) is the only place that we should see "web" code, such as
    DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)


    This code references page numbers in the text book:
    Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
    ------------ */


//
// Control Services
//
module TSOS {


    export class Control {
 
        // sets task bar 
        public static setTaskbarMessage(message: string) {
            document.getElementById("taskbarStatus").innerHTML = message
        }
        public static setDateAndTime() {
            document.getElementById("dateAndTime").innerHTML = new Date().toLocaleString();
        }

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
 
 
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');
 
 
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
 
 
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
 
 
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";
 
 
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();
 
            // In Control.ts, inside the Control class

            //this.updateCpuDisplay();
            //this.updateMemoryDisplay();
            //this.updatePcbDisplay();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
 
 
        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;
 
 
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();
 
 
            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";
 
 
            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
 
 
            // TODO in the future: Optionally update a log database or some streaming service.
        }
 
 
 
 
        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;
 
 
            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
 
 
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
 
 
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

             // ... Create and initialize Memory and its Accessor ...
            _Memory = new Memory();
            _Memory.init();
            _MemoryAccessor = new MemoryAccessor();
 
 
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
            Control.createMemoryDisplay()
        }
 
 
        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }
 
 
        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
        }

        // GUI Display Update Routines
        //
        public static updateCpuDisplay(): void {
            if (_CPU) {
                document.getElementById('cpu-pc').innerText = _CPU.PC.toString(16).toUpperCase().padStart(4, '0');
                document.getElementById('cpu-ir').innerText = _CPU.IR.toString(16).toUpperCase().padStart(2, '0');
                document.getElementById('cpu-acc').innerText = _CPU.Acc.toString(16).toUpperCase().padStart(2, '0');
                document.getElementById('cpu-x').innerText = _CPU.Xreg.toString(16).toUpperCase().padStart(2, '0');
                document.getElementById('cpu-y').innerText = _CPU.Yreg.toString(16).toUpperCase().padStart(2, '0');
                document.getElementById('cpu-z').innerText = _CPU.Zflag.toString();
            } else {
                 // clear if no CPU
                document.getElementById('cpu-pc').innerText = "0000";
                document.getElementById('cpu-ir').innerText = "00";
                document.getElementById('cpu-acc').innerText = "00";
                document.getElementById('cpu-x').innerText = "00";
                document.getElementById('cpu-y').innerText = "00";
                document.getElementById('cpu-z').innerText = "0";
            }
        }

        public static updateMemoryDisplay(): void {
            /*const memoryTableBody = <HTMLTableSectionElement>document.getElementById('memory-table-body');
            memoryTableBody.innerHTML = '';
            if (_MemoryAccessor) {
                for (let i = 0; i < 256; i += 8) {
                    const row = memoryTableBody.insertRow();
                    const rowHeader = `0x${i.toString(16).toUpperCase().padStart(3, '0')}`;
                    row.insertCell(0).innerText = rowHeader;
                    for (let j = 0; j < 8; j++) {
                        const address = i + j;
                        const value = _MemoryAccessor.read(address);
                        row.insertCell(j + 1).innerText = value.toString(16).toUpperCase().padStart(2, '0');
                    }
                }
            }*/
                let tBody = document.getElementById("memoryDisplayTbody")
                let maxAddress = 0xF;
                let content = "";
                
                for (let a = 0; a <= maxAddress; a++){
                    let address = a * 0x10;
                    let rowAddress = address.toString(16).toUpperCase().padStart(4, '0');
                    content += `<tr><td class="address">${rowAddress}</td>`

                    for (let i = 0; i<= maxAddress; i++){
                        let memValue = _MemoryAccessor.read(address + i).toString(16).toUpperCase().padStart(2, '0');
                        content+= `<td>${memValue}</td>`

                    } 
                    content += `</tr>`
                }
                tBody.innerHTML = content;
    
        }

        public static updatePcbDisplay(): void {
            /*const pcbTableBody = <HTMLTableSectionElement>document.getElementById('pcb-table-body');
            pcbTableBody.innerHTML = ''; // Clear existing table
            if (_Kernel && _Kernel.residentList.length > 0) {
                for (const pcb of _Kernel.residentList) {
                    const row = pcbTableBody.insertRow();
                    row.insertCell(0).innerText = pcb.pid.toString();
                    row.insertCell(1).innerText = pcb.state;
                    row.insertCell(2).innerText = pcb.pc.toString(16).toUpperCase();
                    row.insertCell(3).innerText = pcb.acc.toString(16).toUpperCase();
                    row.insertCell(4).innerText = pcb.xReg.toString(16).toUpperCase();
                    row.insertCell(5).innerText = pcb.yReg.toString(16).toUpperCase();
                    row.insertCell(6).innerText = pcb.zFlag.toString();
                }
            }*/
                if (_Kernel.runningPcb) {
                    document.getElementById('pcb-PID').innerText = _Kernel.runningPcb.pid.toString();
                    document.getElementById('pcb-PC').innerText = _Kernel.runningPcb.pc.toString(16).toUpperCase().padStart(4, '0');
                    document.getElementById('pcb-IR').innerText = _Kernel.runningPcb.ir.toString(16).toUpperCase().padStart(2, '0');
                    document.getElementById('pcb-ACC').innerText = _Kernel.runningPcb.acc.toString(16).toUpperCase().padStart(2, '0');
                    document.getElementById('pcb-X').innerText = _Kernel.runningPcb.xReg.toString(16).toUpperCase().padStart(2, '0');
                    document.getElementById('pcb-Y').innerText = _Kernel.runningPcb.yReg.toString(16).toUpperCase().padStart(2, '0');
                    document.getElementById('pcb-Z').innerText = _Kernel.runningPcb.zFlag.toString();
                    document.getElementById('pcb-Priority').innerText = _Kernel.runningPcb.priority.toString();
                    document.getElementById('pcb-State').innerText = _Kernel.runningPcb.state;
                    document.getElementById('pcb-Location').innerText = _Kernel.runningPcb.location.toString();
                } else {
                     // clear if no CPU
                    document.getElementById('pcb-PID').innerText = "0";
                    document.getElementById('pcb-PC').innerText = "00";
                    document.getElementById('pcb-IR').innerText = "00";
                    document.getElementById('pcb-ACC').innerText = "00";
                    document.getElementById('pcb-X').innerText = "00";
                    document.getElementById('pcb-Y').innerText = "00";
                    document.getElementById('pcb-Z').innerText = "0";
                    document.getElementById('pcb-Priority').innerText = "n/a";
                    document.getElementById('pcb-State').innerText = "n/a";
                    document.getElementById('pcb-Location').innerText = "n/a";
                }
        }

        public static createMemoryDisplay() {
            let tBody = document.getElementById("memoryDisplayTbody")
            let maxAddress = 0xF;
            let content = "";
            for (let a = 0; a <= maxAddress; a++){
                let rowAddress = (a * 0x10).toString(16).toUpperCase().padStart(4, '0');
                content += `<tr>
           <td class="address">${rowAddress}</td>
           <td>00</td><td>00</td><td>00</td><td>00</td>
           <td>00</td><td>00</td><td>00</td><td>00</td>
           <td>00</td><td>00</td><td>00</td><td>00</td>
           <td>00</td><td>00</td><td>00</td><td>00</td>
         </tr>`
            }
            tBody.innerHTML = content;

        }
    }
 }
 