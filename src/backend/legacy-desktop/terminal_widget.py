#!/usr/bin/env python3
"""
Embedded Terminal Widget for WiFi Penetration Testing Radar
Provides an integrated terminal for running commands within the application
"""

import os
import subprocess
import threading
import queue
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QTextEdit, QLineEdit, 
    QPushButton, QLabel, QComboBox, QSplitter
)
from PyQt5.QtCore import QProcess, QThread, pyqtSignal, QTimer, Qt
from PyQt5.QtGui import QFont, QTextCursor, QColor

class TerminalOutput(QTextEdit):
    """Enhanced text widget for terminal output"""
    
    def __init__(self):
        super().__init__()
        self.setReadOnly(True)
        self.setStyleSheet("""
            QTextEdit {
                background-color: #0c0c0c;
                color: #00ff00;
                font-family: 'Consolas', 'Monaco', 'Liberation Mono', monospace;
                font-size: 11px;
                border: 1px solid #333333;
                padding: 8px;
            }
        """)
        self.setFont(QFont("Consolas", 11))
        
    def append_output(self, text: str, color: str = "#00ff00"):
        """Append colored output to terminal"""
        cursor = self.textCursor()
        cursor.movePosition(QTextCursor.End)
        cursor.insertHtml(f'<span style="color: {color};">{text}</span>')
        self.setTextCursor(cursor)
        self.ensureCursorVisible()

class TerminalWorker(QThread):
    """Worker thread for executing terminal commands"""
    output_ready = pyqtSignal(str, str)  # text, color
    command_finished = pyqtSignal(int)   # exit code
    
    def __init__(self, command: str, working_dir: str = None):
        super().__init__()
        self.command = command
        self.working_dir = working_dir or os.getcwd()
        self.process = None
        
    def run(self):
        """Execute the command and emit output"""
        try:
            self.process = subprocess.Popen(
                self.command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                cwd=self.working_dir,
                bufsize=1
            )
            
            # Read output line by line
            for line in iter(self.process.stdout.readline, ''):
                if line:
                    self.output_ready.emit(line.rstrip(), "#00ff00")
                    
            self.process.wait()
            self.command_finished.emit(self.process.returncode)
            
        except Exception as e:
            self.output_ready.emit(f"Error: {str(e)}", "#ff0000")
            self.command_finished.emit(-1)
    
    def terminate_process(self):
        """Terminate the running process"""
        if self.process and self.process.poll() is None:
            self.process.terminate()

class EmbeddedTerminal(QWidget):
    """Embedded terminal widget for the WiFi radar application"""
    
    def __init__(self):
        super().__init__()
        self.current_dir = os.getcwd()
        self.command_history = []
        self.history_index = -1
        self.current_worker = None
        self._setup_ui()
        
    def _setup_ui(self):
        """Setup the terminal UI"""
        layout = QVBoxLayout()
        layout.setContentsMargins(5, 5, 5, 5)
        
        # Terminal header
        header_layout = QHBoxLayout()
        
        terminal_label = QLabel("🖥️ Integrated Terminal")
        terminal_label.setStyleSheet("color: #00d4aa; font-weight: bold; font-size: 12px;")
        header_layout.addWidget(terminal_label)
        
        header_layout.addStretch()
        
        # Quick commands
        quick_commands = QComboBox()
        quick_commands.addItems([
            "Quick Commands...",
            "iwconfig",
            "ip link show", 
            "lsusb | grep -i wireless",
            "sudo airmon-ng",
            "sudo airodump-ng --help",
            "ps aux | grep aircrack",
            "sudo pkill airodump-ng"
        ])
        quick_commands.currentTextChanged.connect(self._on_quick_command)
        header_layout.addWidget(quick_commands)
        
        # Clear button
        clear_btn = QPushButton("🗑️ Clear")
        clear_btn.clicked.connect(self._clear_terminal)
        clear_btn.setMaximumWidth(80)
        header_layout.addWidget(clear_btn)
        
        layout.addLayout(header_layout)
        
        # Output area
        self.output = TerminalOutput()
        layout.addWidget(self.output)
        
        # Input area
        input_layout = QHBoxLayout()
        
        # Current directory indicator
        self.dir_label = QLabel(f"📁 {os.path.basename(self.current_dir)}")
        self.dir_label.setStyleSheet("color: #00d4aa; font-weight: bold; min-width: 100px;")
        input_layout.addWidget(self.dir_label)
        
        # Command input
        self.command_input = QLineEdit()
        self.command_input.setPlaceholderText("Enter command... (Try: iwconfig, ip link show, etc.)")
        self.command_input.returnPressed.connect(self._execute_command)
        self.command_input.setStyleSheet("""
            QLineEdit {
                background-color: #2b2b2b;
                color: #ffffff;
                border: 1px solid #404040;
                padding: 8px;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 11px;
            }
        """)
        input_layout.addWidget(self.command_input)
        
        # Execute button
        execute_btn = QPushButton("▶️ Run")
        execute_btn.clicked.connect(self._execute_command)
        execute_btn.setMaximumWidth(80)
        input_layout.addWidget(execute_btn)
        
        # Stop button
        self.stop_btn = QPushButton("⏹️ Stop")
        self.stop_btn.clicked.connect(self._stop_command)
        self.stop_btn.setEnabled(False)
        self.stop_btn.setMaximumWidth(80)
        input_layout.addWidget(self.stop_btn)
        
        layout.addLayout(input_layout)
        
        self.setLayout(layout)
        
        # Setup keyboard shortcuts
        self.command_input.keyPressEvent = self._handle_key_press
        
        # Welcome message
        self._show_welcome()
        
    def _show_welcome(self):
        """Show welcome message"""
        welcome_msg = f"""
<span style="color: #00d4aa; font-weight: bold;">🖥️ WiFi Radar Integrated Terminal</span><br>
<span style="color: #ffffff;">Working Directory: {self.current_dir}</span><br>
<span style="color: #888888;">Type commands or use Quick Commands dropdown</span><br>
<span style="color: #888888;">Useful commands: iwconfig, ip link show, sudo airmon-ng</span><br>
<span style="color: #00d4aa;">─────────────────────────────────────────────────────</span><br>
"""
        self.output.append(welcome_msg)
        
    def _on_quick_command(self, command: str):
        """Handle quick command selection"""
        if command != "Quick Commands...":
            self.command_input.setText(command)
            self.command_input.setFocus()
            
    def _execute_command(self):
        """Execute the entered command"""
        command = self.command_input.text().strip()
        if not command:
            return
            
        # Add to history
        if command not in self.command_history:
            self.command_history.append(command)
        self.history_index = len(self.command_history)
        
        # Display command
        self.output.append_output(f"\n💻 {os.path.basename(self.current_dir)}$ {command}\n", "#00d4aa")
        
        # Handle special commands
        if command.startswith('cd '):
            self._handle_cd_command(command)
            return
        elif command == 'clear':
            self._clear_terminal()
            return
        elif command == 'pwd':
            self.output.append_output(f"{self.current_dir}\n", "#ffffff")
            return
            
        # Execute command in worker thread
        self.current_worker = TerminalWorker(command, self.current_dir)
        self.current_worker.output_ready.connect(self._on_output_ready)
        self.current_worker.command_finished.connect(self._on_command_finished)
        self.current_worker.start()
        
        # Update UI state
        self.command_input.clear()
        self.stop_btn.setEnabled(True)
        self.command_input.setEnabled(False)
        
    def _handle_cd_command(self, command: str):
        """Handle directory change command"""
        try:
            path = command[3:].strip()
            if not path:
                path = os.path.expanduser("~")
            elif path.startswith("~"):
                path = os.path.expanduser(path)
            elif not os.path.isabs(path):
                path = os.path.join(self.current_dir, path)
                
            path = os.path.normpath(path)
            
            if os.path.isdir(path):
                self.current_dir = path
                self.dir_label.setText(f"📁 {os.path.basename(self.current_dir)}")
                self.output.append_output(f"Changed directory to: {self.current_dir}\n", "#00ff00")
            else:
                self.output.append_output(f"Directory not found: {path}\n", "#ff0000")
                
        except Exception as e:
            self.output.append_output(f"Error changing directory: {str(e)}\n", "#ff0000")
            
    def _on_output_ready(self, text: str, color: str):
        """Handle command output"""
        self.output.append_output(text + "\n", color)
        
    def _on_command_finished(self, exit_code: int):
        """Handle command completion"""
        if exit_code == 0:
            self.output.append_output("✅ Command completed successfully\n", "#00ff00")
        else:
            self.output.append_output(f"❌ Command failed with exit code: {exit_code}\n", "#ff0000")
            
        # Reset UI state
        self.stop_btn.setEnabled(False)
        self.command_input.setEnabled(True)
        self.command_input.setFocus()
        
    def _stop_command(self):
        """Stop the currently running command"""
        if self.current_worker:
            self.current_worker.terminate_process()
            self.output.append_output("⏹️ Command terminated by user\n", "#ffaa00")
            
    def _clear_terminal(self):
        """Clear the terminal output"""
        self.output.clear()
        self._show_welcome()
        
    def _handle_key_press(self, event):
        """Handle special key presses in command input"""
        if event.key() == Qt.Key_Up:
            # Previous command in history
            if self.history_index > 0:
                self.history_index -= 1
                self.command_input.setText(self.command_history[self.history_index])
        elif event.key() == Qt.Key_Down:
            # Next command in history
            if self.history_index < len(self.command_history) - 1:
                self.history_index += 1
                self.command_input.setText(self.command_history[self.history_index])
            else:
                self.history_index = len(self.command_history)
                self.command_input.clear()
        else:
            # Default behavior
            QLineEdit.keyPressEvent(self.command_input, event)
            
    def execute_command_programmatically(self, command: str):
        """Execute a command programmatically (called from main app)"""
        self.command_input.setText(command)
        self._execute_command()
