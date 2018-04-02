---
title: Pádraic Brady kündigt neue HTML-Filter-Bibliothek für PHP 5.3 an.
tags:
  - csrf
  - php
  - security
  - whitelist
  - xss
date: '2010-07-09'
---
Was tun, wenn der Kunde auf einen WYSIWYG Editor für die Benutzereingaben besteht? Der leidgeprüfte  Webentwickler denkt hier sofort an das, was nicht nur für Fox Mulder gilt: "Vertraue niemandem!" Von Benutzern eingegebenes HTML zerschießt das schöne Layout oder enthält sogar `<script>`-Tags und präparierte Bilder, die Malware auf dem Rechner des nichtsahneden Besuchers installieren. Also greift er zu `strip_tags` und ein paar regulären Ausdrücken und das Unheil nimmt seinen Lauf. Denn `strip_tags` und reguläre Ausdrücke können einfach nicht die gesamte Bandbreite an Boshaftigkeit des Internet filtern.

Eingegebenes HTML semantisch zu parsen und mit einer Whitelist zu arbeiten, ist die beste Möglichkeit, den eigenen Webauftritt vor [Cross Site Scripting](http://de.wikipedia.org/wiki/Cross-Site_Scripting) und [Cross Site Request Forgery (CSRF)](http://de.wikipedia.org/wiki/Cross-Site_Request_Forgery) zu schützen. Die beste PHP Bibliothek dafür ist derzeit der **[HTML Purifier](http://htmlpurifier.org/)**. Der hat allerdings einen Nachteil: gerade weil er so mächtig ist und das HTML parst, kostet er viel Rechenzeit und Speicherplatz. Deshalb hat sich jetzt Pádraic Brady, ein aktiver Mitentwickler des Zend Frameworks,  dazu entschlossen, eine neue Bibliothek zu schreiben, die genauso mächtig sein soll wie HTML Purifier. Sie heißt [Wibble](http://blog.astrumfutura.com/archives/430-html-Sanitisation-Benchmarking-With-Wibble-ZF-Proposal.html), ist ebenfalls Whitelist-basiert, aber mit spürbar besserer Performance.

Wie die neue Bibliothek funktioniert? Statt einen eigenen Parser für HTML zu schreiben, benutzt Padraics Bibliothek  den vorhandenen [DOM Parser von PHP](http://de.php.net/DOM) und wendet dann die Whitelist-Regeln auf die vom Parser gelieferte Datenstruktur an. Am Ende des Vorgangs wird das HTML mit der [tidy](http://de.php.net/tidy)-Erweiterung standardkonform gemacht. Wibble ist zwar noch nicht fertig, aber die [Benchmarks](http://gist.github.com/468426), die Brady veröffentlicht hat, sehen vielversprechend aus.

