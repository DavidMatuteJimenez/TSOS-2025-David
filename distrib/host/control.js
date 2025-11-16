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
var TSOS;
(function (TSOS) {
    class Control {
        static paused = false;
        // sets task bar 
        static setTaskbarMessage(message) {
            document.getElementById("taskbarStatus").innerHTML = message;
        }
        static setDateAndTime() {
            document.getElementById("dateAndTime").innerHTML = new Date().toLocaleString();
        }
        static hostInit() {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
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
        static hostLog(msg, source = "?") {
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }
        //
        // Host Events
        //
        static hostBtnStartOS_click(btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            // ... Create and initialize Memory and its Accessor ...
            _Memory = new TSOS.Memory();
            _Memory.init();
            _MemoryAccessor = new TSOS.MemoryAccessor();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
            // Initialize the displays.
            Control.createMemoryDisplay();
            Control.updateDiskDisplay();
            Control.setDateAndTime();
            //Control.setTaskbarMessage("System Running");
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }
        static hostBtnReset_click(btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
        }
        static onPauseClick(btn) {
            Control.paused = !Control.paused;
            let button = document.getElementById("btnStepOS");
            btn.value = Control.paused ? "continue" : "pause";
            button.disabled = !Control.paused;
        }
        static onStepClick(btn) {
            _CPU.cycle();
        }
        // GUI Display Update Routines
        //
        static updateCpuDisplay() {
            if (_CPU) {
                document.getElementById('cpu-pc').innerText = _CPU.PC.toString(16).toUpperCase().padStart(4, '0');
                document.getElementById('cpu-ir').innerText = _CPU.IR.toString(16).toUpperCase().padStart(2, '0');
                document.getElementById('cpu-acc').innerText = _CPU.Acc.toString(16).toUpperCase().padStart(2, '0');
                document.getElementById('cpu-x').innerText = _CPU.Xreg.toString(16).toUpperCase().padStart(2, '0');
                document.getElementById('cpu-y').innerText = _CPU.Yreg.toString(16).toUpperCase().padStart(2, '0');
                document.getElementById('cpu-z').innerText = _CPU.Zflag.toString();
            }
            else {
                // clear if no CPU
                document.getElementById('cpu-pc').innerText = "0000";
                document.getElementById('cpu-ir').innerText = "00";
                document.getElementById('cpu-acc').innerText = "00";
                document.getElementById('cpu-x').innerText = "00";
                document.getElementById('cpu-y').innerText = "00";
                document.getElementById('cpu-z').innerText = "0";
            }
        }
        static updateMemoryDisplay() {
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
            let tBody = document.getElementById("memoryDisplayTbody");
            let maxAddress = Math.floor((_Memory.memory.length - 1) / 0x10);
            let content = "";
            for (let a = 0; a <= maxAddress; a++) {
                let address = a * 0x10;
                let rowAddress = address.toString(16).toUpperCase().padStart(4, '0');
                content += `<tr><td class="address">${rowAddress}</td>`;
                for (let i = 0; i <= 0xF; i++) {
                    let memValue = _Memory.memory[address + i].toString(16).toUpperCase().padStart(2, '0');
                    content += `<td>${memValue}</td>`;
                }
                content += `</tr>`;
            }
            tBody.innerHTML = content;
        }
        static updatePcbDisplay() {
            let pcbs = [];
            if (_Kernel.runningPcb != null) {
                pcbs.push(_Kernel.runningPcb);
            }
            pcbs.push(..._Scheduler.readyQueue);
            pcbs.push(..._Scheduler.residentList);
            pcbs.push(..._Scheduler.terminatedPcbs);
            let pcbDisplayContent = "";
            for (const pcb of pcbs) {
                pcbDisplayContent +=
                    `<tr>
         <td >${pcb.pid.toString()}</td>
         <td >${pcb.pc.toString(16).toUpperCase().padStart(4, '0')}</td>
         <td >${pcb.ir.toString(16).toUpperCase().padStart(2, '0')}</td>
         <td >${pcb.acc.toString(16).toUpperCase().padStart(2, '0')}</td>
         <td >${pcb.xReg.toString(16).toUpperCase().padStart(2, '0')}</td>
         <td >${pcb.yReg.toString(16).toUpperCase().padStart(2, '0')}</td>
         <td >${pcb.zFlag.toString()}</td>
         <td >${pcb.priority.toString()}</td>
         <td >${pcb.state.toString()}</td>
         <td >${pcb.location.toString()}</td>
         <td >${pcb.base.toString()}</td>
         <td >${pcb.limit.toString()}</td>
         <td >${pcb.segment.toString()}</td></tr>`;
            }
            document.getElementById("pcbDisplayBody").innerHTML = pcbDisplayContent;
        }
        static createMemoryDisplay() {
            let tBody = document.getElementById("memoryDisplayTbody");
            let maxAddress = 0xF;
            let content = "";
            for (let a = 0; a <= maxAddress; a++) {
                let rowAddress = (a * 0x10).toString(16).toUpperCase().padStart(4, '0');
                content += `<tr>
           <td class="address">${rowAddress}</td>
           <td>00</td><td>00</td><td>00</td><td>00</td>
           <td>00</td><td>00</td><td>00</td><td>00</td>
           <td>00</td><td>00</td><td>00</td><td>00</td>
           <td>00</td><td>00</td><td>00</td><td>00</td>
         </tr>`;
            }
            tBody.innerHTML = content;
        }
        static updateDiskDisplay() {
            if (!_Disk || !document.getElementById("diskDisplayBody")) {
                return;
            }
            let diskDisplayContent = "";
            // Show some key disk blocks (directory entries and some data blocks)
            const keySectors = [
                { t: 0, s: 0, b: 0, label: "MBR" }, // Master Boot Record
                { t: 0, s: 0, b: 1, label: "DIR" }, // First directory block
                { t: 0, s: 0, b: 2, label: "DIR" }, // Second directory block
                { t: 0, s: 1, b: 0, label: "DIR" }, // Third directory block
                { t: 1, s: 0, b: 0, label: "DATA" }, // First data block
                { t: 1, s: 0, b: 1, label: "DATA" }, // Second data block
                { t: 1, s: 1, b: 0, label: "DATA" }, // Third data block
            ];
            for (const sector of keySectors) {
                const tsb = `${sector.t}:${sector.s}:${sector.b}`;
                const data = _Disk.readDisk([sector.t, sector.s, sector.b]);
                let used = "No";
                let next = "---";
                let displayData = "Empty";
                if (data && data.length > 0 && data.charCodeAt(0) !== 0) {
                    used = "Yes";
                    if (sector.t === 0 && sector.s === 0 && sector.b === 0) {
                        // MBR
                        displayData = data.substring(0, 20) + "...";
                    }
                    else if (sector.t === 0) {
                        // Directory entry
                        if (data.length >= 3) {
                            const nextTsb = `${data.charCodeAt(0)}:${data.charCodeAt(1)}:${data.charCodeAt(2)}`;
                            next = nextTsb;
                            const filename = data.substring(3).replace(/\0.*$/, ''); // Remove null chars
                            displayData = filename || "Empty";
                        }
                    }
                    else {
                        // Data block
                        const flag = data.charCodeAt(0);
                        if (flag === 1) { // next flag
                            const nextTsb = `${data.charCodeAt(1)}:${data.charCodeAt(2)}:${data.charCodeAt(3)}`;
                            next = nextTsb;
                        }
                        const content = data.substring(4);
                        displayData = content.length > 20 ? content.substring(0, 20) + "..." : content;
                    }
                }
                diskDisplayContent += `<tr>
                    <td>${tsb}</td>
                    <td>${used}</td>
                    <td>${next}</td>
                    <td>${displayData}</td>
                </tr>`;
            }
            document.getElementById("diskDisplayBody").innerHTML = diskDisplayContent;
        }
    }
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=control.js.map