---
layout: post
title: jEdit Syntax highlighting for Asterisk AEL files
tags: [ael, asterisk, github, jEdit, xml]
---

These days I'm doing some Asterisk work, creating AEL dial plan scripts
for call center agents: Logging in and out, checking if the hotlines are
staffed before allowing a pause, logging agent events to a separate
logfile. For the scripts I'm using my favourite cross-platform editor
jEdit. At the moment, jEdit has no syntax highlighting for AEL files, so
I put one together myself. I've created [a Gist](https://gist.github.com/gbirke/534422) on GitHub so everyone can  download and modify it.

Here it is:

<script src="http://gist.github.com/534422.js?file=ael.xml"></script>
<noscript>
<pre>
    <!DOCTYPE MODE SYSTEM "xmode.dtd">

    <MODE>
        <PROPS>
            <PROPERTY NAME="lineComment" VALUE="//" />
        </PROPS>

        <RULES>
            <EOL_SPAN TYPE="COMMENT1">//</EOL_SPAN>
            <SPAN TYPE="KEYWORD3" NO_LINE_BREAK="TRUE">
              <BEGIN>${</BEGIN>
              <END>}</END>
            </SPAN>
            <MARK_FOLLOWING TYPE="KEYWORD2">&amp;</MARK_FOLLOWING>
            <MARK_FOLLOWING TYPE="LABEL" MATCH_TYPE="KEYWORD1">case </MARK_FOLLOWING>
            <MARK_PREVIOUS TYPE="LABEL">:</MARK_PREVIOUS>
            <MARK_PREVIOUS TYPE="FUNCTION" MATCH_TYPE="OPERATOR">(</MARK_PREVIOUS>
            <SPAN TYPE="LITERAL1" NO_LINE_BREAK="TRUE">
              <BEGIN>"</BEGIN>
              <END>"</END>
            </SPAN>
            <KEYWORDS>
              <KEYWORD1>if</KEYWORD1>
              <KEYWORD1>else</KEYWORD1>
              <KEYWORD1>while</KEYWORD1>
              <KEYWORD1>case</KEYWORD1>
              <KEYWORD1>switch</KEYWORD1>
              <KEYWORD1>break</KEYWORD1>
              <KEYWORD1>jump</KEYWORD1>
              <KEYWORD1>goto</KEYWORD1>
              <KEYWORD4>context</KEYWORD4>
              <KEYWORD4>macro</KEYWORD4>
            </KEYWORDS>
        </RULES>
    </MODE>
</pre>
</noscript>

How to install:

1.  Locate your jEdit settings folder. On Mac OS X and Linux it's
    usually a folder called `.jedit` inside your home folder. On Windows
    it's a folder also called `.jedit` in your home folder . It can be
    a hidden folder, so you may have to adjust the view settings of your
    file manager.
2.  Save the `ael.xml` file.
3.  Put the file in the folder `.jedit/modes`.
4.  Edit the file `.jedit/modes/catalog` and add the following line:

    ``` {.xml}
     <MODE NAME="AEL" FILE="ael.xml" FILE_NAME_GLOB="*.ael" />
    ```

jEdit will automatically detect all changes and refresh the snytax
highlighting.

At the moment, handling of nested braces, for example in an expression
like `Set(MyExten=${EXTEN:0:${MyLength}})` is not highlighted properly.
If you'd like to contribute here or do other changes, feel free to do
so.
