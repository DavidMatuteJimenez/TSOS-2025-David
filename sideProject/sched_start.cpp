//
// CPU Scheduling Permutation Evaluator
//

// g++ -std=c++20 -Wall -o schedSim sched_start.cpp

#include <iostream>     // cout, endl
using std::cout;
using std::endl;

#include <iomanip>      // setprecision, ios
using std::setprecision;
using std::ios;         // I/O base class

#include <string>       // string, to_string
using std::string;
using std::to_string;

#include <vector>       // vector
using std::vector;

#include <algorithm>    // next_permutation
#include <cmath>        // tgamma (for factorial)
#include <iterator>     // size for arrays

#include <cstring>      // strcmp// added 
//
// Global structures, constants, and variables
//

// Declare a structure to represent a process.
struct Process
{
   char id;
   int  cycles;
   int  arrivalTime;
};

  // TODO (bonus): Remove this and make it dynamic, from the command line.
bool _DEBUG = false;
bool CSV   = false;


//
// Support Routines
//
bool checkTimelineValidity(Process* processes,
                           int size,
                           string  timeline)
{
   // A timeline is valid if it never tries to schedule a process into a time slot before it has arrived.
   //bool isValid = true;

   //This is for each time slot in the timeline
   for (size_t time = 0; time < timeline.length(); time++) {
      char processId = timeline[time];


      //finds the corresponding process in the process arrray
      for (int i = 0; i < size; i++){
         if (processes[i].id == processId) {
            if (static_cast<int>(time) < processes[i].arrivalTime) {
               return false;  // Invalid - process runs before arrival
         }
         break;
         }
      }
   }
   // . . .
   return true; // replaced isValid with true
}

float calcAverageTurnaroundTime(Process* processes,
                           int size,
                                const string& timeline) {
   u_long ttSum = 0;
   // . . .

   //calculates turnaround time fro each process
   for (int i = 0; i < size; i++) {
      int completionTime = 0;
      
      // Find the last occurrence of this process in the timeline
      for (size_t time = 0; time < timeline.length(); time++) {
         if (timeline[time] == processes[i].id) {
            completionTime = time + 1;  // +1 because time is 0-indexed
         }
      }
      
      // Turnaround time = completion time - arrival time
      int turnaroundTime = completionTime - processes[i].arrivalTime;
      ttSum += turnaroundTime;
   }
   return (static_cast<float>(ttSum) / size);
}

float calcAverageWaitTime(Process* processes,
                           int size,
                          string  timeline) {
   u_long wtSum = 0;
   // . . .

   for (int i = 0; i < size; i++) {
      int completionTime = 0;
      
      // Find the last occurrence of this process in the timeline

      //calculated wait time for each process
      for (size_t time = 0; time < timeline.length(); time++) {
         if (timeline[time] == processes[i].id) {
            completionTime = time + 1;  // +1 because time is 0-indexed
         }
      }
      
      // Wait time = turnaround time - burst time
      // Wait time = (completion time - arrival time) - cycles
      int waitTime = (completionTime - processes[i].arrivalTime) - processes[i].cycles;
      wtSum += waitTime;
   }
   return (static_cast<float>(wtSum) / size);
}


//
// Main entry point for this program.
//
int main(int argc, char* argv[])
{
   int retCode = 0;

   cout.setf(ios::fixed);  // Set floating point precision.

   // Check the command line args.
   // Note: argv[0] is the executable name. The parameters begin with index 1.
   if (argc >= 2) {
      if (strcmp(argv[1],"debug") == 0) {  // Needing strcmp() here instead of just == is why people hate C++.
         _DEBUG = true;
         cout << "Running in DEBUG mode." << endl;
      } else if (strcmp(argv[1],"csv") == 0) {
         CSV = true;
         cout << "Running in CSV output mode." << endl;
      } else {
         cout << "Bad argument [" << argv[1] << "] ignored." << endl;
      }
   } // end if

   // Define processes. TODO (bonus): Make dynamic. Read from a file.
  #include "./experiment3.txt"

   // Other initializations
   string timeline = "";
   double denominator = 1;
   vector<string> validTimelines;

   // Display the processes.
   cout << "Processes:" << endl;
   for (auto & process : processes) {
      cout << process.id << " of length " << process.cycles << " arriving at time " << process.arrivalTime << endl;
      for (int j = 0; j < process.cycles; j++) {
         timeline += process.id;
      }
      denominator =  denominator * tgamma( process.cycles+1 );
   }
   cout << endl;

   cout << "Execution timeline ingredients: " << timeline << endl;

   // How many unique TOTAL permutations are there?
   double numerator = tgamma( timeline.length()+1 );  // denominator declared and computed above.
   cout << numerator << " / " << denominator << " = " << (numerator/denominator) << " total permutations:" << endl;
   bool timelineIsValid = true;
   bool thereAreMorePermutations = true;
   while (thereAreMorePermutations) {
      // Is this timeline possibility valid? I.e., Does it use a process BEFORE it arrives? If so, it's not valid.
      timelineIsValid = checkTimelineValidity(processes_ptr, size, timeline);
      cout << timeline << " ";
      if (timelineIsValid) {
         cout << "valid";
         validTimelines.push_back(timeline);
      } else {
         cout << "NOT valid";
      }
      cout << endl;
      // Rearrange the timeline into its next permutation. Returns false if there are no more.
      thereAreMorePermutations = next_permutation(timeline.begin(),timeline.end());
   }
   cout << endl;

   // Output the results.
   vector<string> CSVdata;
   CSVdata.emplace_back("timeline,avg_tt,avg_wt");

   float avgTurnaroundTime = 0.0;
   float avgWaitTime       = 0.0;
   cout << validTimelines.size() << " Valid Timelines:" << endl;
   for (auto & validTimeline : validTimelines) {
      avgTurnaroundTime = calcAverageTurnaroundTime(processes_ptr, size, validTimeline);
      avgWaitTime       = calcAverageWaitTime(processes_ptr, size, validTimeline);
      cout << validTimeline << ": avgTT = " << setprecision(3) << avgTurnaroundTime
           << "  avgWT = " << avgWaitTime << endl;
      if (CSV) {
         CSVdata.push_back( validTimeline + "," + to_string(avgTurnaroundTime) + "," + to_string(avgWaitTime) );
      }
   }

   // Output the CSV results if necessary.
   if (CSV) {
      cout << endl << endl;
      for (auto & line : CSVdata) {
         cout << line << endl;
      }
   }

   return retCode;
}
