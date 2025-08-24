//
// glados.js - It's for testing. And enrichment.
//

function Glados() {
   this.version = 5150;

   this.init = function() {
      var msg = "Hello [subject name here]. It's time for EXTREME swapping!\n";
      alert(msg);
   };

   this.afterStartup = function() {

      // Test the 'ver' command.
      _KernelInputQueue.enqueue('v');
      _KernelInputQueue.enqueue('e');
      _KernelInputQueue.enqueue('r');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

      // Format the hard drive so we can load LOTS of programs.
      _KernelInputQueue.enqueue('f');
      _KernelInputQueue.enqueue('o');
      _KernelInputQueue.enqueue('r');
      _KernelInputQueue.enqueue('m');
      _KernelInputQueue.enqueue('a');
      _KernelInputQueue.enqueue('t');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

      // Load TWENTY different valid user programs code and run them.
      var codeA = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 61 00 61 64 6F 6E 65 00";
      var codeB = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 62 00 62 64 6F 6E 65 00";
      var codeC = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 63 00 63 64 6F 6E 65 00";
      var codeD = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 64 00 64 64 6F 6E 65 00";
      var codeE = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 65 00 65 64 6F 6E 65 00";
      var codeF = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 66 00 66 64 6F 6E 65 00";
      var codeG = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 67 00 67 64 6F 6E 65 00";
      var codeH = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 68 00 68 64 6F 6E 65 00";
      var codeI = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 69 00 69 64 6F 6E 65 00";
      var codeJ = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 6A 00 6A 64 6F 6E 65 00";
      var codeK = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 6B 00 6B 64 6F 6E 65 00";
      var codeL = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 6C 00 6C 64 6F 6E 65 00";
      var codeM = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 6D 00 6D 64 6F 6E 65 00";
      var codeN = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 6E 00 6E 64 6F 6E 65 00";
      var codeO = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 6F 00 6F 64 6F 6E 65 00";
      var codeP = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 70 00 70 64 6F 6E 65 00";
      var codeQ = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 71 00 71 64 6F 6E 65 00";
      var codeR = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 72 00 72 64 6F 6E 65 00";
      var codeS = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 73 00 73 64 6F 6E 65 00";
      var codeT = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 74 00 74 64 6F 6E 65 00";


      setTimeout(function(){ document.getElementById("taProgramInput").value = codeA;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 1000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeB;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 2000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeC;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 3000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeD;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 3000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeE;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 3000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeF;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 1000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeG;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 2000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeH;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 3000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeI;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 3000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeJ;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 3000);


      setTimeout(function(){ document.getElementById("taProgramInput").value = codeK;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 1000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeL;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 2000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeM;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 3000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeN;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 3000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeO;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 3000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeP;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 1000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeQ;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 2000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeR;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 3000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeS;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 3000);

      setTimeout(function(){ document.getElementById("taProgramInput").value = codeT;
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('o');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('d');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 3000);

      setTimeout(function(){ _KernelInputQueue.enqueue('r');
                             _KernelInputQueue.enqueue('u');
                             _KernelInputQueue.enqueue('n');
                             _KernelInputQueue.enqueue('a');
                             _KernelInputQueue.enqueue('l');
                             _KernelInputQueue.enqueue('l');
                             TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
                           }, 4000);

   };

}
