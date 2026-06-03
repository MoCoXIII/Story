_0000;  // Chapter 0000 //
!1; +Normal Text+  // The first +...+ in a chapter is used for its display in the chapter finder 404 error page //
!span;

This is normal text. ;
This is still the same line,
but this is a new line.

;
There was an empty line before this one.
; Text is rendered as if the semicolon wasn't even there.;
 The semicolons are for telling the program what parts of the text to modify when -flags are used:\n;
This is a green new line.\n;
-style "color:green;";
This is a blue new line.<br>;
-style "color:blue;";
This is a link to chapter 1.;
-clink 1;
 This is the same line as the link, but the space before this seperates the dot from the first word of this sentence.
This is another new line.
; The text after this should be just a newline, not multiple below:\n;


This is text that will swap the words ;
one and two;
-ID A;
-style "color:green;";
-replace [
two and one;
-style "color:red;";
-replace A;
];
 when you click on them.;
!; // terminate element //

_1; // Chapter 1 //
// comments can span
multiple lines //
!span;
Chapter 1;
!;

_!error;
!span;
Oopsie, something went wrong with your chapter. Pick one from below:;

// these end of file markers are needed for proper parsing! //
! // terminate element //
_ // terminate the chapter //