# Story
An interactive story I'm writing.

[script.js](script.js) is code for interpreting a custom .story file and displaying it as a webpage. It basically works like html with shortcuts and e-book formatting.

[story.story](story.story) is the custom .story file I'm writing. Feel free to replace this with your own, either in a fork of this repo or just on your local cloned version. To get the gist of the syntax, either compare what I wrote with what is displayed on the final page, or look at the following documentation. If you're interested in writing your own story, I personally try to keep a healthy balance between linear storytelling and branching decisions. For ease of writing, many storylines will probably join together again at some point. But the .story interpreter does not need this, you're basically free to write a story however you want, branching, looping, linking, skipping, changing, images, whatever you want.

## .story file syntax
### chapters
everything displayed on a page is part of a chapter.
mark chapters beginning using

    ´´chapterID;

that's the accent sign that goes to the top right, twice, followed by the chapter id that will appear in the URL (query parameters) and a semicolon. Make sure the chapterID is unique to each chapter (duplicate chapterIDs will cause only the last defined one to be used as that chapter) and also make sure the chapterID is URI-encoded, so it can appear in the query parameters without issues.

Everything up until end of file or the next chapter marker will be counted as inside this chapter, which you can have displayed by adding ?c=chapterID to the URL the page is hosted on. The script will try to display chapter "0000" if no chapterID is given. This should be either the book title or whatever you want the reader to see first.

### elements
Inside a chapter, you **need** to define which element should be used to display the content you want to display:

mark an html element using:

    ^^element;

and replace "element" with "span", "h1" or whatever html element you want.

everything after the semicolon (until the next element is defined or end of file) will be displayed as that element with the content as its innerHTML:

    ^^h1;This is a header
    
will display

    <h1>This is a header</h1>

just as

    ^^span;This is a span
    
will display

    <span>This is a span</span>

you can create multiple of the same element by seperating the content with semicolons:

    ^^span;Text1;Text2;

will display

    <span>Text1</span><span>Text2</span>

newlines directly after semicolons will be ignored, so the same could be written as

    ^^span;
    Text1;
    Text2;

(this is what you mainly see in my writing)

If you **do** want a newline directly after having to place a semicolon (maybe because of flags applying to an element you don't want to contain a newline at the end of), you can use ```<br>``` or ```\n``` inside your text content. They will be converted into ```<br>``` elements inside your main element's innerHTML.<br>
Newlines in the middle of text will also count as actual newlines and be converted into ```<br>```:

    ^^span;
    line 1, ;
    line 1 still,
    but this is line 2.;

will read like this:

    line 1, line 1 still,
    but this is line 2.

This way, you may write long linear chapters easily.

### Flags
To change an element you placed, you can use flags:

    This text has the class "flagged".;
    -class flagged;

    This text has a custom style and will appear blue.;
    -style "color:blue;";

For a list of all usable flags, look inside script.js and ctrl+f search ```switch (flag)``` to see all cases currently available. You may also add your own custom flags there.

# incomplete
Just like my writing, this documentation is incomplete, as no one has yet cared to inquire about how to write in my .story syntax. If you do, write an issue on github and in the meantime try to help yourself by reading the [interpreter source code](script.js), which I try to keep easily readable.
