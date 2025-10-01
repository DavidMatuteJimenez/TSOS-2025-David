/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        currentFont;
        currentFontSize;
        currentXPosition;
        currentYPosition;
        buffer;
        commandHistory = [];
        historyIndex = -1;
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "") {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // Save command to history if it's not empty    
                    if (this.buffer.trim() !== "") {
                        this.commandHistory.push(this.buffer);
                        this.historyIndex = this.commandHistory.length;
                    }
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                    //backspace
                }
                else if ((chr === String.fromCharCode(8))) { // backspace
                    if (this.buffer.length > 0) {
                        // Remove from the screen
                        this.deleteChar();
                        // Remove last char from the buffer
                        this.buffer = this.buffer.slice(0, -1);
                    }
                }
                else if (chr === String.fromCharCode(9)) { // Tab
                    this.handleTabCompletion();
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }
        // Handle command history recall
        recallHistory(direction) {
            if (this.commandHistory.length === 0) {
                return; // No history to recall
            }
            // Clear the current buffer from the screen
            this.clearCurrentLine();
            if (direction === "up") {
                // Move backward in history
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                }
                this.buffer = this.commandHistory[this.historyIndex];
            }
            else if (direction === "down") {
                // Move forward in history
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex++;
                    this.buffer = this.commandHistory[this.historyIndex];
                }
                else {
                    // At the end of history, clear the buffer
                    this.historyIndex = this.commandHistory.length;
                    this.buffer = "";
                }
            }
            // Display the recalled command
            this.putText(this.buffer);
        }
        // Clear the current line (everything after the prompt)
        clearCurrentLine() {
            // Measure the current buffer width
            var bufferWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
            // Clear the area where the buffer is displayed
            _DrawingContext.clearRect(this.currentXPosition - bufferWidth, this.currentYPosition - this.currentFontSize, bufferWidth, this.currentFontSize + _FontHeightMargin);
            // Reset X position to where the prompt ends
            this.currentXPosition -= bufferWidth;
        }
        //function to delete character 
        deleteChar() {
            if (this.currentXPosition > 0) {
                // Move cursor back
                var charWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer[this.buffer.length - 1]);
                this.currentXPosition -= charWidth;
                _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize, charWidth, this.currentFontSize + _FontHeightMargin);
            }
        }
        //function for tab completion
        // Handle command completion for Tab key
        handleTabCompletion() {
            // Get all command names from the shell
            const commands = _OsShell.commandList.map(cmd => cmd.command);
            // Find matches starting with current buffer
            const matches = commands.filter(c => c.startsWith(this.buffer));
            if (matches.length === 1) {
                // Only one match: auto-complete
                while (this.buffer.length > 0) {
                    this.deleteChar();
                    this.buffer = this.buffer.slice(0, -1);
                }
                this.buffer = matches[0];
                this.putText(this.buffer);
            }
            else if (matches.length > 1) {
                // Multiple matches: display options
                this.advanceLine();
                this.putText(matches.join("    "));
                this.advanceLine();
                this.putText(">"); // reprint prompt
                this.putText(this.buffer); // reprint current buffer
            }
        }
        putText(text) {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text === "") {
                return;
            }
            let lines = [""];
            let cursePosition = this.currentXPosition;
            for (const char of text) {
                if (char === "/r" || char === "/n") {
                    lines.push("");
                    cursePosition = 0;
                    continue;
                }
                var width = _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
                if (cursePosition + width >= _Canvas.width) {
                    lines.push(char);
                    cursePosition = width;
                }
                else {
                    lines[lines.length - 1] += char;
                    cursePosition += width;
                }
            }
            for (let i = 0; i < lines.length - 1; i++) {
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, lines[i]);
                this.currentXPosition = 0;
                this.advanceLine();
            }
            _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, lines[lines.length - 1]);
            this.currentXPosition = cursePosition;
            /*if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            } */
        }
        advanceLine() {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            if (this.currentYPosition >= _Canvas.height) {
                let screenshotData = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                this.clearScreen();
                _DrawingContext.putImageData(screenshotData, 0, 0 - (_DefaultFontSize * 1.5));
                this.currentYPosition = _Canvas.height - _DefaultFontSize;
            }
            // TODO: Handle scrolling. (iProject 1)
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map