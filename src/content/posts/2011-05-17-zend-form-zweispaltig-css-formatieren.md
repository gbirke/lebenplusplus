---
layout: post
title: Zend_Form zweispaltig mit CSS formatieren
tags: [CSS, Forms, Zend Framework, Zend_Form, webdesign]
lang: de
---
In der Standardeinstellung verpackt Zend_Form Eingabefelder und ihre
Beschriftungen in einer HTML-Definitionsliste. Ob das nun semantisch ist
oder nicht, darüber kann man sich so trefflich streiten wie darüber, was
der bessere Editor oder das bessere Betriebssystem ist. Viel
interessanter ist die Frage, wie man die `DT` und `DD` Elemente so mit
CSS formatiert, dass dabei ein zweispaltiges Formular herauskommt.

Der erste Versuch ist klassisch: das `dt` mit der Beschriftung bekommt
eine Breite und ein `float` verpasst, das bekommt `dd` 'zur
Sicherheit' noch einen Rand, der der Breite des `dt` entspricht.

```css
dt {
  float:left;
  width:120px;
}
```

![Formular mit kleinen Labels](/assets/images/posts/form_small.png)

Die meisten Tutorials im Netz hören an dieser Stelle auf, übersehen aber
ein Problem - Beschriftungen, die über mehrere Zeilen gehen. Dann sieht
das Formular plötzlich so aus:

![Formular mit verschobenen breiten
Labels](/assets/images/posts/form_big_wrong.png)

Heute habe ich mich so lange durch Suchergebnisse geklickt, bis ich die
[Lösung](http://aspnetresources.com/blog/styling_definition_lists)
gefunden hatte. Das `dd` Element wird ebenfalls ge`float`et, wird mit
einer Breite versehen und das `dt` bekommt die Eigenschaft `clear:left`,
damit jede Beschriftung in einer neuen Zeile anfängt.

```css
dt {
  float:left;
  clear:left;
  width:120px;
}

dd {
  float:left;
  width:200px;
}
```

So sieht das Formular in Firefox und Safari mit diesen Eigenschaften
aus:

![Formular mit positionierten breiten
Labels](/assets/images/posts/form_big_right.png)

Internet Explorer 6 mag anscheinend das `clear:left` nicht, aber auch
dem Monster aus Redmond kann geholfen werden: Wenn die Breite des
umgebende `dl` Elements genau der Gesamtbreite von `dt` und `dd`
entspricht wird, dann bricht auch der antike Browser korrekt um.
Internet Explorer 7 leider nicht, der braucht noch folgenden bedingten
Kommentar:

```html
<!--[if IE 7]>
<style type="text/css">
dd { float:none; }
</style>
 <![endif]-->
```

Der fertige Stil sieht so aus:

```css
dt {
  float:left;
  clear:left;
  width:120px;
  margin:0.25em 0;
}

dd {
  width:200px;
  float:left;
  margin:0.25em 0;
}

dl {
  width:320px;
  overflow:hidden;
}
```
