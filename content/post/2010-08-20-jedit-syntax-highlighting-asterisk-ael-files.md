---
title: jEdit Syntax highlighting for Asterisk AEL files
tags:
  - ael
  - asterisk
  - jEdit
  - xml
date: '2010-08-20'
---
These days I'm doing some Asterisk work, creating AEL dial plan scripts
for call center agents: Logging in and out, checking if the hotlines are
staffed before allowing a pause, logging agent events to a separate
logfile. For the scripts I'm using my favourite cross-platform editor
jEdit. At the moment, jEdit has no syntax highlighting for AEL files, so
I put one together myself. For a while, the file was hosted on
snippets.dzone.com but since I improved on it, I'd rather host it on
GitHub for easier download and modification.

Here it is:

<script src="https://gist.github.com/gbirke/534422.js"></script>
<noscript><pre>
&lt;?xml version="1.0"?&gt;

&lt;!DOCTYPE MODE SYSTEM &quot;xmode.dtd&quot;&gt;

&lt;MODE&gt;
    &lt;PROPS&gt;
        &lt;PROPERTY NAME=&quot;lineComment&quot; VALUE=&quot;//&quot; /&gt;
    &lt;/PROPS&gt;

    &lt;RULES&gt;
        &lt;EOL_SPAN TYPE=&quot;COMMENT1&quot;&gt;//&lt;/EOL_SPAN&gt;
        &lt;SPAN TYPE=&quot;KEYWORD3&quot; NO_LINE_BREAK=&quot;TRUE&quot;&gt;
          &lt;BEGIN&gt;${&lt;/BEGIN&gt;
          &lt;END&gt;}&lt;/END&gt;
        &lt;/SPAN&gt;
        &lt;MARK_FOLLOWING TYPE=&quot;KEYWORD2&quot;&gt;&amp;amp;&lt;/MARK_FOLLOWING&gt;
        &lt;MARK_FOLLOWING TYPE=&quot;LABEL&quot; MATCH_TYPE=&quot;KEYWORD1&quot;&gt;case &lt;/MARK_FOLLOWING&gt;
        &lt;MARK_PREVIOUS TYPE=&quot;LABEL&quot;&gt;:&lt;/MARK_PREVIOUS&gt;
        &lt;MARK_PREVIOUS TYPE=&quot;FUNCTION&quot; MATCH_TYPE=&quot;OPERATOR&quot;&gt;(&lt;/MARK_PREVIOUS&gt;
        &lt;SPAN TYPE=&quot;LITERAL1&quot; NO_LINE_BREAK=&quot;TRUE&quot;&gt;
          &lt;BEGIN&gt;&quot;&lt;/BEGIN&gt;
          &lt;END&gt;&quot;&lt;/END&gt;
        &lt;/SPAN&gt;
        &lt;KEYWORDS&gt;
          &lt;KEYWORD1&gt;if&lt;/KEYWORD1&gt;
          &lt;KEYWORD1&gt;else&lt;/KEYWORD1&gt;
          &lt;KEYWORD1&gt;while&lt;/KEYWORD1&gt;
          &lt;KEYWORD1&gt;case&lt;/KEYWORD1&gt;
          &lt;KEYWORD1&gt;switch&lt;/KEYWORD1&gt;
          &lt;KEYWORD1&gt;break&lt;/KEYWORD1&gt;
          &lt;KEYWORD1&gt;jump&lt;/KEYWORD1&gt;
          &lt;KEYWORD1&gt;goto&lt;/KEYWORD1&gt;
          &lt;KEYWORD4&gt;context&lt;/KEYWORD4&gt;
          &lt;KEYWORD4&gt;macro&lt;/KEYWORD4&gt;
        &lt;/KEYWORDS&gt;
    &lt;/RULES&gt;
&lt;/MODE&gt;
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

```xml
 <MODE NAME="AEL" FILE="ael.xml" FILE_NAME_GLOB="*.ael" />
```

jEdit will automatically detect all changes and refresh the syntax
highlighting.

At the moment, handling of nested braces, for example in an expression
like `Set(MyExten=${EXTEN:0:${MyLength}})` is not highlighted properly.
If you'd like to contribute here or do other changes, feel free to do
so.

