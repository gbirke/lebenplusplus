
## Date and Time Formats in JavaScript
The talk introduced some delightful WTFs from the date handling of JavaScript: Rollover of dates (`Date(2017,1,31)` is the 3nd of March), 0-based month handling, dates always in the local time zones, etc. Historically, the JavaScript `Date` class was modeled after the `Date` class of Java 1.0, which was deprecated shortly after Netscape standardized ECMAScript. Matt Johnson then presented four JavaScript libraries that make date handling, date math and time zones a bit less painful: [moment](TODO), [Sugar](TODO), [date-fns](TODO) and [js-joda](TODO), a port from [Joda Time Java library](TODO)
He announced that there are [early stages of a proposal](TODO) for date/time handling in future versions of ECMAScript.

## Gender forms
This talk was more an account of the experiences of Tilde Ann Thurium at Pinterest than a general "how to present gender in forms". None the less, the description of the journey and the design examples were helpful. It's the little things:

* When people were presented with the option to leave the "Male/Female" fields blank, signups increased.
* Displaying symbols of nonbinary sexual preference is illegal in Russia.
* Hover vs. click interactions matter.
* Sometimes a good way out is to use gender-neutral language.

I was happy that the feedback she got for the changes was overall positive. I liked the sentence "You don't do gender neutral forms because it'll improve your core metrics, but because it's the right thing to do."

## The ethics of IoT
Lots of fascinating ideas:

This was a timely reminder that even when the security of your IoT devices is not abysimal, the data they collect may have unintended consequences. Institutions trust technology more than people, even when the sensors are not infallible. My take on this: "Everything you track can and will be used against you." German "Datensparsamkeit" is a good thing.
While the trolley problem is a synthetic dilemma that is wrongly applied to self-dribing cars and AI, the question of who's liable for the actions of self-correcting/learning (semi-)autonomous systems is not answered yet. Is the owner of the system liable? The provider? The programmer? No-one, because no one could reasonable foresee the system behavior? Great inspiration for a dystopic novel/short story where companies can skirt any liability whatsoever by making everything "smart" and unpredictable.

Emily Gorcenski also gave practical advice to developers:
* Talk to your boss
* Talk to your coworkers what they would and wouldn't do.
* Prepare to say no
* Know your values and lines you'd never cross. Know them before you come into a situation where you might be required to cross them.

## Short notes from other talks
