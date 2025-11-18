var TSOS;
(function (TSOS) {
    class Shell {
        promptStr = ">";
        commandList = [];
        curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        apologies = "[sorry]";
        constructor() { }
        init() {
            var sc;
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Displays users current location");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- Displays status message");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Validates user program input from HTML textarea (hex digits and spaces only)");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - Runs a loaded program.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellBsod, "bsod", "- Triggers a kernel trap error for testing BSOD.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- clear all memory segments.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- execute all programs at once.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "- display the PID and state of all processes.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - kill one process.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "- kill all processes.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellQ, "q", "<int> - set the Round Robin quantum (measured in CPU cycles).");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- Initialize the disk.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "<filename> - Create a file.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "<filename> \"data\" - Write data to a file.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRead, "read", "<filename> - Read and display file contents.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "<filename> - Delete a file.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCopy, "copy", "<source> <dest> - Copy a file.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRename, "rename", "<oldname> <newname> - Rename a file.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellLs, "ls", "- List all files on disk.");
            this.commandList[this.commandList.length] = sc;
            _StdOut.putText("Commands:");
            for (var i in this.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + this.commandList[i].command + " " + this.commandList[i].description);
            }
            _StdOut.advanceLine();
            _StdOut.advanceLine();
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            var userCommand = this.parseInput(buffer);
            var cmd = userCommand.command;
            var args = userCommand.args;
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }
        execute(fn, args) {
            _StdOut.advanceLine();
            fn(args);
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            this.putPrompt();
        }
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            buffer = TSOS.Utils.trim(buffer);
            var tempList = buffer.split(" ");
            var cmd = tempList.shift();
            cmd = TSOS.Utils.trim(cmd);
            retVal.command = cmd;
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            _Kernel.krnShutdown();
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("ver - Shows the current version of the OS.");
                        break;
                    case "shutdown":
                        _StdOut.putText("shutdown - Turns off the OS.");
                        break;
                    case "cls":
                        _StdOut.putText("cls - Clears the screen.");
                        break;
                    case "trace":
                        _StdOut.putText("trace - Turns the OS trace on or off.");
                        break;
                    case "rot13":
                        _StdOut.putText("rot13 - Does rot13 obfuscation on string.");
                        break;
                    case "prompt":
                        _StdOut.putText("prompt - sets the prompt.");
                        break;
                    case "run":
                        _StdOut.putText("run <pid> - Executes a program that has been loaded into memory.");
                        break;
                    case "load":
                        _StdOut.putText("load - Loads a program from the textarea into memory and assigns a PID.");
                        break;
                    case "runall":
                        _StdOut.putText("runall - Runs all loaded programs with Round Robin scheduling.");
                        break;
                    case "ps":
                        _StdOut.putText("ps - Displays all processes and their states.");
                        break;
                    case "kill":
                        _StdOut.putText("kill <pid> - Terminates a specific process.");
                        break;
                    case "killall":
                        _StdOut.putText("killall - Terminates all processes.");
                        break;
                    case "q":
                        _StdOut.putText("q <int> - Sets the Round Robin quantum in CPU cycles.");
                        break;
                    case "clearmem":
                        _StdOut.putText("clearmem - Clears all memory and resets all partitions.");
                        break;
                    case "format":
                        _StdOut.putText("format - Initializes all disk blocks.");
                        break;
                    case "create":
                        _StdOut.putText("create <filename> - Creates a new file on disk.");
                        break;
                    case "write":
                        _StdOut.putText("write <filename> \"data\" - Writes data to a file.");
                        break;
                    case "read":
                        _StdOut.putText("read <filename> - Reads and displays file contents.");
                        break;
                    case "delete":
                        _StdOut.putText("delete <filename> - Deletes a file from disk.");
                        break;
                    case "copy":
                        _StdOut.putText("copy <source> <dest> - Copies a file.");
                        break;
                    case "rename":
                        _StdOut.putText("rename <oldname> <newname> - Renames a file.");
                        break;
                    case "ls":
                        _StdOut.putText("ls - Lists all files currently on disk.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            if (args.length > 0) {
                _StdOut.putText(args.join(" ") + " = '" + TSOS.Utils.rot13(args.join(" ")) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellDate(args) {
            const now = new Date();
            _StdOut.putText(now.toLocaleString());
        }
        shellWhereAmI(args) {
            _StdOut.putText("You are here.");
        }
        shellStatus(args) {
            TSOS.Control.setTaskbarMessage(args.join(" "));
            _StdOut.putText("Status bar updated.");
        }
        shellLoad(args) {
            const inputElement = (document.getElementById("taProgramInput"));
            const userInput = inputElement.value.trim();
            if (userInput.length === 0) {
                _StdOut.putText("Error: No input to load.");
                return;
            }
            const hexRegex = /^[0-9A-Fa-f\s]+$/i;
            if (!hexRegex.test(userInput)) {
                _StdOut.putText("Error: Invalid input. Only hex digits (0-9, A-F) and spaces allowed.");
                return;
            }
            const opCodes = userInput.toUpperCase().split(/\s+/);
            const result = _MemoryManager.allocatePartition(opCodes);
            if (result.success) {
                const newPid = _Kernel.pidCounter++;
                const newPcb = new TSOS.Pcb(newPid);
                newPcb.base = result.base;
                newPcb.limit = result.limit;
                newPcb.segment = result.segment;
                newPcb.location = TSOS.pcbLocation.memory;
                _Scheduler.residentList.push(newPcb);
                _StdOut.putText(`Program loaded with PID ${newPid} in memory`);
            }
            else {
                // Memory full - store process on disk
                const newPid = _Kernel.pidCounter++;
                const newPcb = new TSOS.Pcb(newPid);
                // Convert opCodes to byte array for swapping
                const processData = [];
                for (let i = 0; i < opCodes.length; i++) {
                    processData.push(parseInt(opCodes[i], 16));
                }
                // Save to disk as swap file
                const swapResult = _FileSystem.rollOutProcess(newPid, processData);
                if (swapResult === 0) { // Success
                    newPcb.location = TSOS.pcbLocation.disk;
                    newPcb.segment = -1; // No memory segment
                    _Scheduler.residentList.push(newPcb);
                    _StdOut.putText(`Program loaded with PID ${newPid} on disk (will swap in when needed)`);
                }
                else {
                    _StdOut.putText("Error: Could not store program - disk may be full.");
                }
            }
        }
        shellRun(args) {
            if (args.length === 0) {
                _StdOut.putText("Usage: run <pid>");
                return;
            }
            const pid = parseInt(args[0]);
            const index = _Scheduler.residentList.findIndex(p => p.pid === pid && p.state === TSOS.pcbState.resident);
            if (index < 0) {
                _StdOut.putText(`Error: Process ${pid} not found or not in Resident state.`);
                return;
            }
            const pcb = _Scheduler.residentList.splice(index, 1)[0];
            // Check if process is on disk and needs to be swapped in
            if (pcb.location === TSOS.pcbLocation.disk) {
                const swapSuccess = _Scheduler.swapProcessToReady(pcb);
                if (_Swapper.ensureInMemory(pcb)) {
                    _Scheduler.addToReadyQueue(pcb);
                    _StdOut.putText(`Process ${pid} swapped in from disk and added to ready queue.`);
                }
                else {
                    _StdOut.putText(`Error: Could not swap in process ${pid} from disk.`);
                    _Scheduler.residentList.push(pcb); // Put it back
                    return;
                }
            }
            else {
                // Process already in memory
                _Scheduler.addToReadyQueue(pcb);
                _StdOut.putText(`Process ${pid} added to ready queue.`);
            }
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH, null));
            _CPU.isExecuting = true;
        }
        shellBsod(args) {
            _Kernel.krnTrapError("Test BSOD triggered by user.");
        }
        shellClearMem(args) {
            if (_Kernel.runningPcb) {
                _StdOut.putText("Error: Cannot clear memory while processes are running.");
                return;
            }
            _MemoryManager.clearMemory();
            _Scheduler.residentList = [];
            _Scheduler.readyQueue = [];
            _StdOut.putText("All memory segments cleared.");
        }
        shellRunAll(args) {
            if (_Scheduler.residentList.length === 0) {
                _StdOut.putText("Error: No resident processes to execute.");
                return;
            }
            const numProcesses = _Scheduler.residentList.length;
            let swappedCount = 0;
            // Add all processes to ready queue, swapping in if needed
            while (_Scheduler.residentList.length > 0) {
                const pcb = _Scheduler.residentList.shift();
                if (pcb.location === TSOS.pcbLocation.disk) {
                    if (_Swapper.ensureInMemory(pcb)) {
                        _Scheduler.addToReadyQueue(pcb);
                        swappedCount++;
                    }
                    else {
                        _StdOut.putText(`Warning: Could not load Process ${pcb.pid}.`);
                    }
                }
                else {
                    _Scheduler.addToReadyQueue(pcb);
                }
            }
            _Dispatcher.contextSwitch();
            _CPU.isExecuting = true;
            let msg = `Executing ${numProcesses} processes with Round Robin scheduling (Quantum: ${_Scheduler.quantum} cycles).`;
            if (swappedCount > 0) {
                msg += ` ${swappedCount} process(es) swapped in from disk.`;
            }
            _StdOut.putText(msg);
        }
        shellPS(args) {
            _StdOut.putText("PID  | State       | Location");
            _StdOut.advanceLine();
            _StdOut.putText("-----|-----------|-----------");
            for (const pcb of _Scheduler.residentList) {
                _StdOut.advanceLine();
                _StdOut.putText(`${pcb.pid.toString().padEnd(4)} | ${pcb.state.toString()} | ${pcb.location}`);
            }
            if (_Kernel.runningPcb) {
                _StdOut.advanceLine();
                _StdOut.putText(`${_Kernel.runningPcb.pid.toString().padEnd(4)} | ${_Kernel.runningPcb.state.toString()} | ${_Kernel.runningPcb.location}`);
            }
            for (const pcb of _Scheduler.readyQueue) {
                _StdOut.advanceLine();
                _StdOut.putText(`${pcb.pid.toString().padEnd(4)} | ${pcb.state.toString()} | ${pcb.location}`);
            }
        }
        shellKill(args) {
            if (args.length === 0) {
                _StdOut.putText("Usage: kill <pid>");
                return;
            }
            const pidToKill = parseInt(args[0]);
            if (_Kernel.runningPcb && _Kernel.runningPcb.pid === pidToKill) {
                if (_Kernel.runningPcb.location === TSOS.pcbLocation.disk) {
                    _Swapper.cleanupSwapFile(pidToKill);
                }
                _Kernel.runningPcb.state = TSOS.pcbState.terminated;
                _MemoryManager.deallocatePartition(_Kernel.runningPcb.segment);
                _Kernel.runningPcb = null;
                _CPU.isExecuting = false;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH, null));
                _StdOut.putText(`Process ${pidToKill} killed.`);
                return;
            }
            for (let i = 0; i < _Scheduler.residentList.length; i++) {
                if (_Scheduler.residentList[i].pid === pidToKill) {
                    const pcb = _Scheduler.residentList[i];
                    if (pcb.location === TSOS.pcbLocation.disk) {
                        _Swapper.cleanupSwapFile(pidToKill);
                    }
                    _MemoryManager.deallocatePartition(pcb.segment);
                    _Scheduler.residentList.splice(i, 1);
                    _StdOut.putText(`Process ${pidToKill} killed.`);
                    return;
                }
            }
            for (let i = 0; i < _Scheduler.readyQueue.length; i++) {
                if (_Scheduler.readyQueue[i].pid === pidToKill) {
                    const pcb = _Scheduler.readyQueue[i];
                    if (pcb.location === TSOS.pcbLocation.disk) {
                        _Swapper.cleanupSwapFile(pidToKill);
                    }
                    _MemoryManager.deallocatePartition(pcb.segment);
                    _Scheduler.readyQueue.splice(i, 1);
                    _StdOut.putText(`Process ${pidToKill} killed.`);
                    return;
                }
            }
            _StdOut.putText(`Error: Process ${pidToKill} not found.`);
        }
        shellKillAll(args) {
            if (_Kernel.runningPcb) {
                if (_Kernel.runningPcb.location === TSOS.pcbLocation.disk) {
                    _Swapper.cleanupSwapFile(_Kernel.runningPcb.pid);
                }
                _MemoryManager.deallocatePartition(_Kernel.runningPcb.segment);
                _Kernel.runningPcb = null;
                _CPU.isExecuting = false;
            }
            for (const pcb of _Scheduler.residentList) {
                if (pcb.location === TSOS.pcbLocation.disk) {
                    _Swapper.cleanupSwapFile(pcb.pid);
                }
                _MemoryManager.deallocatePartition(pcb.segment);
            }
            for (const pcb of _Scheduler.readyQueue) {
                if (pcb.location === TSOS.pcbLocation.disk) {
                    _Swapper.cleanupSwapFile(pcb.pid);
                }
            }
            _Scheduler.residentList = [];
            _Scheduler.readyQueue = [];
            _StdOut.putText("All processes killed.");
        }
        shellQ(args) {
            if (args.length === 0) {
                _StdOut.putText(`Current quantum: ${_Scheduler.quantum} cycles`);
                return;
            }
            const newQuantum = parseInt(args[0]);
            if (isNaN(newQuantum) || newQuantum <= 0) {
                _StdOut.putText("Error: Quantum must be a positive integer.");
                return;
            }
            document.getElementById('quantumDisplay').innerHTML = "Quantum is: " + newQuantum;
            _Scheduler.setQuantum(newQuantum);
            _StdOut.putText(`Quantum set to ${newQuantum} cycles.`);
        }
        shellFormat(args) {
            // Use direct FileSystem call for now to diagnose issue
            const result = _FileSystem.format();
            _StdOut.putText(result);
            // Update disk display if available
            if (typeof TSOS !== 'undefined' && TSOS.Control && TSOS.Control.updateDiskDisplay) {
                TSOS.Control.updateDiskDisplay();
            }
        }
        shellCreate(args) {
            if (args.length === 0) {
                _StdOut.putText("Usage: create <filename>");
                return;
            }
            const filename = args[0];
            const result = _krnDiskDriver.createFile(filename);
            _StdOut.putText(result);
            // Update disk display if available
            if (typeof TSOS !== 'undefined' && TSOS.Control && TSOS.Control.updateDiskDisplay) {
                TSOS.Control.updateDiskDisplay();
            }
        }
        shellWrite(args) {
            if (args.length < 2) {
                _StdOut.putText("Usage: write <filename> \"data\"");
                return;
            }
            const filename = args[0];
            // Join remaining args and remove quotes if present
            let data = args.slice(1).join(" ");
            // Remove surrounding quotes if present
            if ((data.startsWith('"') && data.endsWith('"')) ||
                (data.startsWith("'") && data.endsWith("'"))) {
                data = data.slice(1, -1);
            }
            const result = _krnDiskDriver.writeFile(filename, data);
            _StdOut.putText(result);
            // Update disk display if available
            if (typeof TSOS !== 'undefined' && TSOS.Control && TSOS.Control.updateDiskDisplay) {
                TSOS.Control.updateDiskDisplay();
            }
        }
        shellRead(args) {
            if (args.length === 0) {
                _StdOut.putText("Usage: read <filename>");
                return;
            }
            const filename = args[0];
            const result = _krnDiskDriver.readFile(filename);
            if (result.success) {
                _StdOut.putText(`Contents of "${filename}":`);
                _StdOut.advanceLine();
                _StdOut.putText(result.data);
            }
            else {
                _StdOut.putText(result.message);
            }
        }
        shellDelete(args) {
            if (args.length === 0) {
                _StdOut.putText("Usage: delete <filename>");
                return;
            }
            const filename = args[0];
            const result = _krnDiskDriver.deleteFile(filename);
            _StdOut.putText(result);
            // Update disk display if available
            if (typeof TSOS !== 'undefined' && TSOS.Control && TSOS.Control.updateDiskDisplay) {
                TSOS.Control.updateDiskDisplay();
            }
        }
        shellCopy(args) {
            if (args.length < 2) {
                _StdOut.putText("Usage: copy <source> <dest>");
                return;
            }
            const source = args[0];
            const dest = args[1];
            const result = _krnDiskDriver.copyFile(source, dest);
            _StdOut.putText(result);
            // Update disk display if available
            if (typeof TSOS !== 'undefined' && TSOS.Control && TSOS.Control.updateDiskDisplay) {
                TSOS.Control.updateDiskDisplay();
            }
        }
        shellRename(args) {
            if (args.length < 2) {
                _StdOut.putText("Usage: rename <oldname> <newname>");
                return;
            }
            const oldname = args[0];
            const newname = args[1];
            const result = _krnDiskDriver.renameFile(oldname, newname);
            _StdOut.putText(result);
            // Update disk display if available
            if (typeof TSOS !== 'undefined' && TSOS.Control && TSOS.Control.updateDiskDisplay) {
                TSOS.Control.updateDiskDisplay();
            }
        }
        shellLs(args) {
            const result = _krnDiskDriver.listFiles();
            _StdOut.putText(result);
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map