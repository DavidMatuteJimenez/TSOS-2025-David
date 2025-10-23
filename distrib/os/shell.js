/* ------------
  Shell.ts


  The OS Shell - The "command line interface" (CLI) for the console.


   Note: While fun and learning are the primary goals of all enrichment center activities,
         serious injuries may occur when trying to write your own Operating System.
  ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
/*module TSOS {
  export class Shell {
    // Properties
    public promptStr = ">";
    public commandList = [];
    public curses =
      "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    public apologies = "[sorry]";

    constructor() {}

    public init() {
      var sc: ShellCommand;
      //
      // Load the command list.

      // ver
      sc = new ShellCommand(
        this.shellVer,
        "ver",
        "- Displays the current version data."
      );
      this.commandList[this.commandList.length] = sc;

      // help
      sc = new ShellCommand(
        this.shellHelp,
        "help",
        "- This is the help command. Seek help."
      );
      this.commandList[this.commandList.length] = sc;

      // shutdown
      sc = new ShellCommand(
        this.shellShutdown,
        "shutdown",
        "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running."
      );
      this.commandList[this.commandList.length] = sc;

      // cls
      sc = new ShellCommand(
        this.shellCls,
        "cls",
        "- Clears the screen and resets the cursor position."
      );
      this.commandList[this.commandList.length] = sc;

      // man <topic>
      sc = new ShellCommand(
        this.shellMan,
        "man",
        "<topic> - Displays the MANual page for <topic>."
      );
      this.commandList[this.commandList.length] = sc;

      // trace <on | off>
      sc = new ShellCommand(
        this.shellTrace,
        "trace",
        "<on | off> - Turns the OS trace on or off."
      );
      this.commandList[this.commandList.length] = sc;

      // rot13 <string>
      sc = new ShellCommand(
        this.shellRot13,
        "rot13",
        "<string> - Does rot13 obfuscation on <string>."
      );
      this.commandList[this.commandList.length] = sc;

      // prompt <string>
      sc = new ShellCommand(
        this.shellPrompt,
        "prompt",
        "<string> - Sets the prompt."
      );
      this.commandList[this.commandList.length] = sc;

      //Shows date and time
      sc = new ShellCommand(
        this.shellDate,
        "date",
        "- Displays the current date and time."
      );
      this.commandList[this.commandList.length] = sc;

      //whereami
      sc = new ShellCommand(
        this.shellWhereAmI,
        "whereami",
        "- Displays users current location"
      );
      this.commandList[this.commandList.length] = sc;

      //status
      sc = new ShellCommand(
        this.shellStatus,
        "status",
        "- Displays status message"
      );
      this.commandList[this.commandList.length] = sc;

      //load - validates program input
      sc = new ShellCommand(
        this.shellLoad,
        "load",
        "- Validates user program input from HTML textarea (hex digits and spaces only)"
      );
      this.commandList[this.commandList.length] = sc;

      //run
      sc = new ShellCommand(
        this.shellRun,
        "run",
        "<pid> - Runs a loaded program."
      );
      this.commandList[this.commandList.length] = sc;

      this.commandList[this.commandList.length] = new ShellCommand(
        this.shellBsod,
        "bsod",
        "- Triggers a kernel trap error for testing BSOD."
      );

      //clearmem
      sc = new ShellCommand(
        this.shellClearMem,
        "clearmem",
        "- clear	all	memory	segments."
      );
      this.commandList[this.commandList.length] = sc;

      //runall
      sc = new ShellCommand(
        this.shellAllRun,
        "runall",
        "- execute	all	programs	at	once."
      );
      this.commandList[this.commandList.length] = sc;

      //ps
      sc = new ShellCommand(
        this.shellPS,
        "ps",
        "- display	the	PID	and	state	of	all	processes."
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellKill,
        "Kill<pid>",
        "- kill	one	process."
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellKillAll,
        "killall",
        "- kill	all	process."
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellQ,
        "q",
        "- let the user set	the	Round	Robin	quantum	."
      );
      this.commandList[this.commandList.length] = sc;
      // Display the initial prompt.
// added this so the shell commands can show up on screen when i start the browser
      _StdOut.putText("Commands:");
      for (var i in this.commandList) {
        _StdOut.advanceLine();
        _StdOut.putText(
          "  " +
          this.commandList[i].command +
          " " +
          this.commandList[i].description
        );
      }
      _StdOut.advanceLine();
      _StdOut.advanceLine();
//ends here
      this.putPrompt();
    }

    public putPrompt() {
      _StdOut.putText(this.promptStr);
    }

    public handleInput(buffer) {
      _Kernel.krnTrace("Shell Command~" + buffer);
      //
      // Parse the input...
      //
      var userCommand = this.parseInput(buffer);
      // ... and assign the command and args to local variables.
      var cmd = userCommand.command;
      var args = userCommand.args;
      //
      // Determine the command and execute it.
      //
      // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
      // command list in attempt to find a match.
      // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
      var index: number = 0;
      var found: boolean = false;
      var fn = undefined;
      while (!found && index < this.commandList.length) {
        if (this.commandList[index].command === cmd) {
          found = true;
          fn = this.commandList[index].func;
        } else {
          ++index;
        }
      }
      if (found) {
        this.execute(fn, args); // Note that args is always supplied, though it might be empty.
      } else {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {
          // Check for curses.
          this.execute(this.shellCurse);
        } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
          // Check for apologies.
          this.execute(this.shellApology);
        } else {
          // It's just a bad command. {
          this.execute(this.shellInvalidCommand);
        }
      }
    }

    // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
    public execute(fn, args?) {
      // We just got a command, so advance the line...
      _StdOut.advanceLine();
      // ... call the command function passing in the args with some über-cool functional programming ...
      fn(args);
      // Check to see if we need to advance the line again
      if (_StdOut.currentXPosition > 0) {
        _StdOut.advanceLine();
      }
      // ... and finally write the prompt again.
      this.putPrompt();
    }

    public parseInput(buffer: string): UserCommand {
      var retVal = new UserCommand();

      // 1. Remove leading and trailing spaces.
      buffer = Utils.trim(buffer);

      // 3. Separate on spaces so we can determine the command and command-line args, if any.
      var tempList = buffer.split(" ");

      // 4. Take the first (zeroth) element and use that as the command.
      var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
      // 4.1 Remove any left-over spaces.
      cmd = Utils.trim(cmd);
      // 4.2 Record it in the return value.
      retVal.command = cmd;

      // 5. Now create the args array from what's left.
      for (var i in tempList) {
        var arg = Utils.trim(tempList[i]);
        if (arg != "") {
          retVal.args[retVal.args.length] = tempList[i];
        }
      }
      return retVal;
    }

    //
    // Shell Command Functions. Kinda not part of Shell() class exactly, but
    // called from here, so kept here to avoid violating the law of least astonishment.
    //
    public shellInvalidCommand() {
      _StdOut.putText("Invalid Command. ");
      if (_SarcasticMode) {
        _StdOut.putText("Unbelievable. You, [subject name here],");
        _StdOut.advanceLine();
        _StdOut.putText("must be the pride of [subject hometown here].");
      } else {
        _StdOut.putText("Type 'help' for, well... help.");
      }
    }

    public shellCurse() {
      _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
      _StdOut.advanceLine();
      _StdOut.putText("Bitch.");
      _SarcasticMode = true;
    }

    public shellApology() {
      if (_SarcasticMode) {
        _StdOut.putText("I think we can put our differences behind us.");
        _StdOut.advanceLine();
        _StdOut.putText("For science . . . You monster.");
        _SarcasticMode = false;
      } else {
        _StdOut.putText("For what?");
      }
    }

    // Although args is unused in some of these functions, it is always provided in the
    // actual parameter list when this function is called, so I feel like we need it.

    public shellVer(args: string[]) {
      _StdOut.putText(APP_NAME + " version " + APP_VERSION);
    }

    public shellHelp(args: string[]) {
      _StdOut.putText("Commands:");
      for (var i in _OsShell.commandList) {
        _StdOut.advanceLine();
        _StdOut.putText(
          "  " +
            _OsShell.commandList[i].command +
            " " +
            _OsShell.commandList[i].description
        );
      }
    }

    public shellShutdown(args: string[]) {
      _StdOut.putText("Shutting down...");
      // Call Kernel shutdown routine.
      _Kernel.krnShutdown();
      // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
    }

    public shellCls(args: string[]) {
      _StdOut.clearScreen();
      _StdOut.resetXY();
    }

    public shellMan(args: string[]) {
      if (args.length > 0) {
        var topic = args[0];
        switch (topic) {
          case "help":
            _StdOut.putText(
              "Help displays a list of (hopefully) valid commands."
            );
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
          // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
          default:
            _StdOut.putText("No manual entry for " + args[0] + ".");
        }
      } else {
        _StdOut.putText("Usage: man <topic>  Please supply a topic.");
      }
    }

    public shellTrace(args: string[]) {
      if (args.length > 0) {
        var setting = args[0];
        switch (setting) {
          case "on":
            if (_Trace && _SarcasticMode) {
              _StdOut.putText("Trace is already on, doofus.");
            } else {
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
      } else {
        _StdOut.putText("Usage: trace <on | off>");
      }
    }

    public shellRot13(args: string[]) {
      if (args.length > 0) {
        // Requires Utils.ts for rot13() function.
        _StdOut.putText(
          args.join(" ") + " = '" + Utils.rot13(args.join(" ")) + "'"
        );
      } else {
        _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
      }
    }

    public shellPrompt(args: string[]) {
      if (args.length > 0) {
        _OsShell.promptStr = args[0];
      } else {
        _StdOut.putText("Usage: prompt <string>  Please supply a string.");
      }
    }

    //function to tell date and time
    public shellDate(args: string[]) {
      const now: Date = new Date();
      _StdOut.putText(now.toLocaleString());
    }

    // fuction that displays a message on where the user is at
    public shellWhereAmI(args: string[]) {
      _StdOut.putText("You are here. ");
    }

    public shellStatus(args: string[]) {
      Control.setTaskbarMessage(args.join(" "));
      _StdOut.putText("Status bar updated. ");
    }

    /*public shellLoad(args: string[]) {
      const inputElement = <HTMLTextAreaElement>(
        document.getElementById("taProgramInput")
      );

      if (!inputElement) {
        _StdOut.putText("Error: Program input area not found.");
        return;
      }

      const userInput = inputElement.value.trim();
      if (userInput.length === 0) {
        _StdOut.putText("Error: No input to load.");
        return;
      }

      const hexRegex = /^[0-9A-Fa-f\s]+$/;
      if (!hexRegex.test(userInput)) {
        _StdOut.putText(
          "Error: Invalid input. Only hex digits (0-9, A-F) and spaces are allowed."
        );
        return;
      }

      const normalizedInput = userInput
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();
      _StdOut.putText("Program loaded successfully:");
      _StdOut.advanceLine();
      _StdOut.putText(normalizedInput);
    }*/
/* public shellLoad(args: string[]) { // Modified load command [cite: 7]
   const inputElement = <HTMLTextAreaElement>(
     document.getElementById("taProgramInput")
   );
   const userInput = inputElement.value.trim();

   if (userInput.length === 0) {
     _StdOut.putText("Error: No input to load.");
     return;
   }

   const hexRegex = /^[0-9A-Fa-f\s]+$/i;
   if (!hexRegex.test(userInput)) {
     _StdOut.putText(
       "Error: Invalid input. Only hex digits (0-9, A-F) and spaces are allowed."
     );
     return;
   }

   const opCodes = userInput.toUpperCase().split(/\s+/);

   const success = _MemoryManager.loadProgram(opCodes);

   if (success) {
     const newPid = _Kernel.pidCounter++; // assign a Process ID (PID)
     const newPcb = new TSOS.Pcb(newPid); // create a Process Control Block (PCB)
     newPcb.state = "Resident";
     _Kernel.residentList.push(newPcb);
     _StdOut.putText(`Program loaded. PID: ${newPid}`); // return the PID to the console and display it [cite: 11]
   } else {
       _StdOut.putText("Error: Memory is full. Cannot load program.");
   }
 }

public shellRun(args: string[]) {
 if (args.length === 0) {
     _StdOut.putText("Usage: run <pid>. Please provide a Process ID.");
     return;
 }

 const pidToRun = parseInt(args[0]);
 const pcbToRun = _Kernel.residentList.find(p => p.pid === pidToRun && p.state === "Resident");

 if (!pcbToRun) {
     _StdOut.putText(`Error: Process with PID ${pidToRun} not found or is not ready to run.`);
     return;
 }
 
  // Load PCB state into CPU
_CPU.PC = pcbToRun.pc;
_CPU.IR = pcbToRun.ir;
_CPU.Acc = pcbToRun.acc;
_CPU.Xreg = pcbToRun.xReg;
_CPU.Yreg = pcbToRun.yReg;
_CPU.Zflag = pcbToRun.zFlag;
 
 pcbToRun.state = "Running";
 _Kernel.runningPcb = pcbToRun;
 _CPU.isExecuting = true;
}

public shellBsod(args: string[]): void {
 _Kernel.krnTrapError("Test BSOD triggered by user.");
}
}
}*/
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
                _Scheduler.residentList.push(newPcb);
                _StdOut.putText(`Program loaded with PID ${newPid}`);
            }
            else {
                _StdOut.putText("Error: Memory is full - no partitions available.");
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
            _Scheduler.addToReadyQueue(pcb);
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
            const residentProcesses = _Scheduler.residentList.filter(p => p.state === TSOS.pcbState.resident);
            if (residentProcesses.length === 0) {
                _StdOut.putText("Error: No resident processes to execute.");
                return;
            }
            for (const pcb of residentProcesses) {
                _Scheduler.addToReadyQueue(pcb);
            }
            _Scheduler.residentList = _Scheduler.residentList.filter(p => p.state !== TSOS.pcbState.resident);
            _Dispatcher.contextSwitch();
            _CPU.isExecuting = true;
            _StdOut.putText(`Executing ${residentProcesses.length} processes with Round Robin scheduling (Quantum: ${_Scheduler.quantum} cycles).`);
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
                    _MemoryManager.deallocatePartition(pcb.segment);
                    _Scheduler.residentList.splice(i, 1);
                    _StdOut.putText(`Process ${pidToKill} killed.`);
                    return;
                }
            }
            for (let i = 0; i < _Scheduler.readyQueue.length; i++) {
                if (_Scheduler.readyQueue[i].pid === pidToKill) {
                    const pcb = _Scheduler.readyQueue[i];
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
                _MemoryManager.deallocatePartition(_Kernel.runningPcb.segment);
                _Kernel.runningPcb = null;
                _CPU.isExecuting = false;
            }
            for (const pcb of _Scheduler.residentList) {
                _MemoryManager.deallocatePartition(pcb.segment);
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
            _Scheduler.setQuantum(newQuantum);
            _StdOut.putText(`Quantum set to ${newQuantum} cycles.`);
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map