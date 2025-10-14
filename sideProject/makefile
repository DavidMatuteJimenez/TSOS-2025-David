CC=clang++
CPPARGS=-std=c++20 -Wall
CPPDEBUGARGS=-g -O0
BIN=schedSim
SRC=sched_start.cpp

build:
	$(CC) $(CPPARGS) -o $(BIN) $(SRC)

run: build
	./$(BIN)