---
layout: post
title:
tags: [] # finances,reviews,budgeting
draft: true
description: A review of various budgeting software apps, in search of an alternative to "You need a budget (YNAB)"
---
TODO: Introduction why I want switch away from YNAB. See also https://plus.google.com/114920412757292417494/posts/JZS8ZtEkxMU
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
- Budgets are not envenlope-based. Budgets are assigned as "fixed numbers" or in direct relation to income: "Income + X", "Income - X", "Percentage of Income". The YNAB method of shuffling around your income until "Every Dollar has a job" works better for my budgeting needs.
- No fine-grained categories, instead you have categories and tags. If you want to use Toshl like YNAB you'd have to use tag budgets and be disciplined to use not more than one tag per expense because each expense shows up in each tag budget.
- No tag/category search or list, instead you have to swipe. This goes against the flow of iOS applications that have superb scrolling lists where you can scroll very fast.
- No payees, only locations. It tries to be slick and display maps, but I'd prefer just location names. Also, the location names come from Google maps, which is bad from a data protection standpoint and you can't add your own locations. If the payee is not in the list, you must either add the address/part of the city or you're out of luck.
- Adding a location to expenses is possible, but can't be
- Data is stored on Toshl servers and they have unencrypted access.
- No tabular view

# Conclusion
Most Promising: Goodbudget. But no replacement for the ease and user-friendlyness of YNAB.


TODO
Until I wrote my own replacement or BudgetFirst is finished, I will probably use Wally as an expense tracker and a Spreadsheet
