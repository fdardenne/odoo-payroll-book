# Payroll, from Theory to Odoo Localization

**Read it online: https://fdardenne.github.io/odoo-payroll-book/**
(or download the [PDF](https://fdardenne.github.io/odoo-payroll-book/payroll_book.pdf))

Most people who work on Odoo payroll learn it backwards. They start from a salary rule that looks wrong, then work their way up to the law that explains it. This book goes the other way. It starts with what a payslip is, explains why every country does it a little differently, and ends with how to build and review a payroll localization for a new country.

It is written for product owners and developers working on Odoo payroll, in any country. You don't need to know payroll beforehand, and you don't need to know Belgian law, even though one Belgian company follows you through the whole book.

## What you will learn

**Part I · Payroll theory.** Gross and net pay, and why "the salary" means three different numbers to HR, social security and the tax office. Social contributions with their floors and caps. How withholding tax works in different countries. Proration, holiday pay, bonuses, leavers and corrections. What employers have to file, and how a pay run ends up in the accounts.

**Part II · Localization theory.** What changes from one country to the next, and what never does. How to research a country you don't know: which sources to trust, what to ask a local payroll expert, how to prove your numbers. How laws change over time, and how to keep an old payslip correct when they do.

**Part III · Odoo payroll, hands-on.** Employees and contracts, time off and worked days, pay runs, corrections, accounting, bank payment and declarations. Every chapter ends with missions you play yourself on a fresh Odoo database on runbot, so you set up a company's payroll from scratch and run its year month by month.

**Part IV · How the payroll engine works.** The engine in one picture. What a salary rule can read and what it can do, how categories let rules talk to each other, how structures group rules, and why legal numbers live in dated parameters. You can step through a real payslip one rule at a time.

**Part V · Building a localization.** The pieces every country module has, with real code from the Dutch, Mexican and Belgian modules and an explanation of why each piece is needed. Warnings, tests, the yearly update, and a checklist to review a localization before it ships.

## How it is written

- One company, **MyVidangeCompany**, and five employees run through every chapter: a standard salary, a low wage, a manager with a company car, someone who joins in March and someone who leaves in October.
- Every concept starts with a plain definition and a picture, then a real example, then a short look at how other countries handle it (the US, India, Mexico, the UAE, Australia, Hong Kong and others).
- The case-study numbers come from real payslips computed by Odoo and from an independent calculation based on the law. Where the two disagree, the book says so and explains why.
- Some figures on the website are interactive: move the sliders to see where a salary goes, or run a payslip rule by rule.

The book covers Odoo master as of October 2026.
