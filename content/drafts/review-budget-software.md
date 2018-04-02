---
title: I need a budget (software)!
tags: []
date: 2018-3-27
draft: true
---
Since I was introduced to the software and method of "You Need A Budget (YNAB)" I was hooked. YNAB is so called "[envelope-based budgeting](https://en.wikipedia.org/wiki/Envelope_system)" which means that you assign all your money (wheter it's in cash or in a bank account) to virtual "envelopes". You divide each income in your envelopes as you see fit and whenever you buy something, you "take" the money from the envelope. The small time investment of this system gave me incredible peace of mind: I can save for expensive long-term goals (6 months until I can buy that huge TV), I'm not surprised by big yearly expenses (e.g. insurances), I have a "rainy day fund" for sudden expenses (medical bills, repairs, etc) and I can scale back on eating out.

I did not know how well YNAB worked, until I looked for alternatives. The results of my research will be in the 2nd part of this article, first some information on why I want to stop using YNAB in the first place.

In 2016 YNAB introduced a new version of their software, which was entirely web-based. While it was slick, it had a shortcoming that made upgrading unacceptable: The data is stored on YNABs servers. Sure, they say it's "encrypted", but to serve it to me in their web app, they have to have a key to decrypt it (at least in the way they programmed it). This makes them a super-attractive target for hackers and governments. There was a well-formulated post that expressed exactly how I felt: https://plus.google.com/114920412757292417494/posts/JZS8ZtEkxMU



TODO: Mention [BudgetFirst](https://github.com/BudgetFirst/BudgetFirst)

Not much credit card and check use.

TODO Criteria:
- Envelope-based Budgeting
- iOS app for expense tracking
- Web/Mac app for budgeting and reporting
- Keyboard-friendly for fast entry

Nice to have:
- some kind of import, preferrably CSV


## [Budgetease](http://budgetease.com/)

Pro
- Very helpful tutorial
- Envelopes and envelope groups

Con
- Only Dollars as currency
- Budgets can't be easily adjusted during a month
- No table view for easy editing

## [Goodbudget](https://goodbudget.com/)
Pro
- Import bank transactions, with provisions for date formats and decimal separators

Con
- No fine-grained envelope hierarchies when entering expenses, you have your envelopes as as big list.
- Envelope selection via drop-down instead of combo box.
- Data is stored on GoodBudget servers.
- Feels a bit US-centric: Check numbers, must use decimal point instead of comma when entering amounts, special chars break on CSV import.
- No table view where you can change entries rapidly with only the keyboard

## [Moneydance](http://infinitekind.com/moneydance)
Pro
- Dropbox sync
- Fast, keyboard-friendly expense entry
- Very professional-looking

Con
- Budgeting is not really envelope-based. See http://help.infinitekind.com/discussions/budgeting/8-envelope-budgeting

## Moneywell

TODO test further, first test was bit confusing

## [Mvelopes](https://www.mvelopes.com/)

Pro
- Very professional and full of features. The heavyweight of budgeting apps.

Con
- Flash-based web app, very slow, clunky and confusing
- Data is stored on Mvelopes server

## [Toshl](toshl.com/)

Pro
- Very slick design. I really like the color scheme and the monster theme.
- iOS app

Con
- Budgets are not envelope-based. Budgets are assigned as "fixed numbers" or in direct relation to income: "Income + X", "Income - X", "Percentage of Income". The YNAB method of shuffling around your income until "Every Dollar has a job" works better for my budgeting needs.
- No fine-grained categories, instead you have categories and tags. If you want to use Toshl like YNAB you'd have to use tag budgets and be disciplined to use not more than one tag per expense because each expense shows up in each tag budget.
- No tag/category search or list, instead you have to swipe. This goes against the flow of iOS applications that have superb scrolling lists where you can scroll very fast.
- No payees, only locations. It tries to be slick and display maps, but I'd prefer just location names. Also, the location names come from Google maps, which is bad from a data protection standpoint and you can't add your own locations. If the payee is not in the list, you must either add the address/part of the city or you're out of luck.
- Adding a location to expenses is possible, but can't be
- Data is stored on Toshl servers and they have unencrypted access.
- No tabular view

## TODO: [Money Manager EX](http://www.moneymanagerex.org/)
## TODO: [PocketSmith](https://www.pocketsmith.com/)

Both are not budgeting software but more "personal finance" software with some budgeting options.

# Conclusion
Most Promising: Goodbudget. But no replacement for the ease and user-friendlyness of YNAB.


TODO
Until I wrote my own replacement or BudgetFirst is finished, I will probably use Wally as an expense tracker and a Spreadsheet

