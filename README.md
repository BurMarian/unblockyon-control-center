# UnblockyOn Control Center

Design & UX Specification — unblockyOn Admin Dashboard

Role

You are a senior product designer and frontend UI engineer.

Your task is to design and implement the complete unblockyOn Admin Dashboard / Admin Panel UI.

This task is DESIGN/UI ONLY.

Do NOT implement:

backend logic

database logic

Supabase queries

real authentication

API integrations

Telegram integrations

payment integrations

real QR generation

real permissions enforcement

real business logic

Use realistic static/mock data only to make the interface look complete and production-ready.

The result should look like a polished SaaS administration platform that could later be connected to a NestJS API.

1. Product Context

unblockyOn is a decentralized vehicle identity and communication platform.

The Admin Dashboard is the internal control center for managing:

users

roles

permissions

QR codes

QR batches

QR activations

Telegram communication

notifications

payments

system health

activity logs

error logs

platform settings

The dashboard should feel like a serious production SaaS administration system.

It should NOT look like a generic template with random cards.

The interface must communicate:

reliability

clarity

operational control

security

scalability

modern SaaS aesthetics

2. Design Direction

Create a modern, clean, professional admin interface.

Visual references:

modern SaaS dashboards

Linear

Vercel

Stripe Dashboard

modern versions of Metronic / Apex-style dashboards

Do NOT copy any specific product.

Use the references only for UX quality and information hierarchy.

Visual characteristics

clean layouts

strong typography hierarchy

compact but readable tables

subtle borders

restrained shadows

rounded cards

consistent spacing

clear status indicators

excellent empty/loading/error states

professional data visualization

minimal visual noise

Avoid:

excessive gradients

excessive glassmorphism

huge cards

unnecessary animations

excessive rounded UI

oversized typography

decorative elements without purpose

fake futuristic interfaces

The UI should feel like a real internal production tool.

3. Theme

Primary theme:

Light mode

Create the complete UI in light mode first.

Also prepare the design system so dark mode could be added later.

Use a neutral SaaS palette.

Use color primarily for:

success

warning

error

informational states

active navigation

important actions

Do not make the entire interface colorful.

4. Global Application Layout

Create a persistent application shell.

Structure:

┌─────────────────────────────────────────────────────────────┐
│ Sidebar │ Topbar                                            │
│         ├────────────────────────────────────────────────────┤
│         │                                                    │
│         │                    PAGE CONTENT                    │
│         │                                                    │
│         │                                                    │
│         │                                                    │
│         └────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘


Sidebar

Create grouped navigation.

MAIN

Overview

MANAGEMENT

Users

Roles & Permissions

Sessions

QR MANAGEMENT

QR Codes

Generate QR

Activations

QR Batches

COMMUNICATION

Telegram

Notifications

Templates

BUSINESS

Payments

Plans & Pricing

Revenue

SYSTEM

System Health

Activity Logs

Error Logs

Services

SETTINGS

General

Security

Administration

Sidebar requirements:

active page indicator

icons

collapsible desktop sidebar

compact collapsed mode

responsive mobile drawer

tooltips in collapsed mode

optional notification/status badges

clear section grouping

5. Topbar

Create a reusable top navigation bar.

Include:

page breadcrumb

global search

notifications

system status indicator

user avatar

user dropdown

User dropdown:

Profile
Preferences
Security
Sign out


Global search should have a polished command-palette style UI.

Example:

Search anything...

Users
QR Codes
Batches
Transactions
Logs
Settings


6. Overview Page

Create a complete admin overview dashboard.

Header:

Overview
Monitor and manage your unblockyOn platform.


Add date range selector:

Today
7 days
30 days
Custom


KPI cards

Create:

Total Users

Active QR Codes

QR Activations

Revenue

Each card should contain:

value

label

percentage change

comparison period

small visual trend

Example:

Total Users

1,248
+12.4%

vs previous period


System Health

Create a prominent system health card.

Services:

API

Database

Redis

Telegram Bot

QR Bridge

Email

Each service:

● Operational


Use realistic latency/status information.

Activity chart

Create a clean chart showing:

users

QR activations

notifications

Allow switching metric.

Recent Activity

Create a compact activity feed.

Example:

Admin generated QR batch
Manager activated QR
New user created
Telegram notification delivered
System warning detected


Recent Errors

Create a small error summary.

Include:

severity

error

service

timestamp

Add:

View all errors


7. Users Page

Create a production-quality users management page.

Header:

Users
Manage platform users and access.


Actions:

Export
Add User


Table:

Columns:

User

Email

Role

Status

Last Login

Created

Actions

Add:

search

role filter

status filter

date filter

pagination

column sorting

row selection

bulk actions

Statuses:

Active

Invited

Suspended

Disabled

Create realistic mock users.

8. User Details

Create a detailed user profile page.

Sections:

Profile

avatar

name

email

role

status

Account Information

created

last login

last activity

account status

Security

active sessions

failed login attempts

password status

Activity

Show recent actions performed by the user.

Add contextual actions:

Edit User
Change Role
Suspend User
Revoke Sessions


Use confirmation dialogs for destructive actions.

9. Roles & Permissions

Create a complete RBAC management interface.

Roles:

Superadmin

Admin

Manager

Support

Main page:

Roles & Permissions
Manage administrative access and permissions.


Create a roles list/table.

For each role show:

role name

description

users count

permissions count

status

actions

10. Role Details

Create a permission matrix.

Example:

                         View   Create   Update   Delete
Users                     ✓       ✓        ✓        -
QR Codes                  ✓       ✓        ✓        -
QR Batches                ✓       ✓        ✓        -
Activations               ✓       -        ✓        -
Payments                  ✓       -        -        -
System Logs               ✓       -        -        -
Settings                  ✓       -        ✓        -


Use grouped permission sections.

Create:

checkbox states

inherited permissions indicator

permission descriptions

save changes button

reset button

This is UI only.

11. Sessions Page

Create a session management interface.

Table:

User

Device

Browser

Location

IP

Last Active

Created

Status

Actions:

View
Revoke
Revoke all sessions


Add filters and search.

12. QR Codes Page

This is one of the most important sections.

Header:

QR Codes
Manage all unblockyOn QR identifiers.


Top metrics:

Total QR Codes

Active

Unused

Disabled

Table:

QR ID

Batch

Status

Activation

Created

Last Activity

Actions

Statuses:

Unused

Active

Disabled

Expired

Create QR detail drawer/page.

13. QR Detail Page

Show:

QR Preview

Large QR visual placeholder.

Information

QR ID

Batch

Status

Created

Activated

Activation code status

Activity

Timeline:

Created
Generated
Activated
Used
Updated


Actions:

Disable
Enable
View Batch
Download


14. Generate QR Page

Create a complete QR generation interface.

Form:

Quantity
[ 1000 ]

Batch Name
[ August 2026 ]

Format
[ PNG ]

Include activation codes
[ ON ]

Include logo
[ ON ]


Add a live configuration summary.

Show estimated output:

1,000 QR codes
1 batch
1,000 activation codes


Primary CTA:

Generate QR Codes


After submission show a polished generation progress state:

Preparing batch...
Generating QR codes...
Creating activation codes...
Finalizing package...


Then success state:

Generation completed

1,000 QR codes created successfully.

[Download ZIP]
[View Batch]


This is visual simulation only.

15. QR Activations

Create an activation management page.

Metrics:

Total Activations

Today

Pending

Failed

Table:

QR ID

Activation Code

Status

Activated At

Activated By

Source

Actions

Statuses:

Pending

Activated

Failed

Revoked

16. QR Batches

Create batch management.

Table:

Batch

Quantity

Active

Unused

Disabled

Created

Status

Batch details should include:

Total
Activated
Unused
Disabled
Activation Rate


Add a progress visualization.

Actions:

View
Download
Export
Disable Batch


17. Telegram Page

Create Telegram operational dashboard.

Header:

Telegram
Monitor Telegram Bot communication.


Show:

Bot status

Bot username

Messages today

Delivered

Failed

Pending

Create:

Message Delivery Chart

Successful vs failed deliveries.

Recent Events

Timeline of Telegram events.

Example:

Message delivered
Notification sent
Delivery failed
Retry scheduled


18. Notifications Page

Create notification management.

Tabs:

All

Sent

Pending

Failed

Table:

Type

Recipient

Channel

Status

Sent At

Actions

Notification detail drawer:

message

recipient

channel

delivery status

timestamps

retry information

19. Templates Page

Create notification template management.

Templates:

Driver blocked

QR activated

Welcome

Activation successful

Payment successful

System alert

Template editor UI:

Template Name
Title
Message
Variables
Preview


Include variable chips:

{{plate}}
{{location}}
{{time}}


20. Payments Page

Create a modern payment administration interface.

Header:

Payments
Monitor platform transactions and payment activity.


Metrics:

Revenue

Successful payments

Pending

Failed

Refunds

Transaction table:

Transaction ID

User

Amount

Currency

Status

Payment Method

Created

Actions

Statuses:

Paid

Pending

Failed

Refunded

Cancelled

21. Plans & Pricing

Create pricing management UI.

Example plans:

Starter

€10

100 QR codes

Business

€49

1,000 QR codes

Enterprise

Custom

Unlimited / custom

Show:

price

limits

active subscriptions

status

edit action

This is design only.

22. Revenue Page

Create analytics page.

Show:

total revenue

monthly revenue

revenue growth

average transaction

successful payment rate

Charts:

revenue over time

transactions

plan distribution

Use clean, professional charts.

23. System Health

Create a detailed system monitoring page.

Services:

API
Database
Redis
Telegram Bot
QR Bridge
SMTP


Each service card:

status

uptime

response time

last checked

incidents

Statuses:

Operational

Degraded

Unavailable

Create a system health timeline.

24. Activity Logs

Create an audit log page.

Table:

Timestamp

User

Action

Resource

Resource ID

IP

Status

Filters:

User

Action

Resource

Date

Status

Example events:

User updated
Role changed
QR batch generated
QR activated
Payment refunded
Settings updated


25. Error Logs

Create a professional error monitoring interface.

Severity:

Info

Warning

Error

Critical

Table:

Error ID

Severity

Service

Message

Endpoint

Timestamp

Status

Error detail view:

Error ID
Service
Endpoint
HTTP Status
Timestamp
Request ID

Error message

Metadata


Create tabs:

Overview
Request
Metadata
Stack Trace


Stack trace should visually look like a developer tool.

26. Services Page

Create service overview.

Cards:

API
Database
Redis
Telegram
QR Bridge
SMTP


Each card shows:

status

version

uptime

latency

last health check

27. Settings

Create settings with a clean tabbed layout.

Tabs:

General

Platform name

Default timezone

Default language

Date format

Security

Session duration

Password policy

Login attempt limits

Security notifications

Administration

Maintenance mode

Audit logging

System notifications

Use save bars and confirmation states.

28. Global Components

Build a reusable design system.

Components should include:

Button

IconButton

Input

Select

MultiSelect

Search

DatePicker

Tabs

Card

StatCard

Badge

StatusIndicator

Avatar

Tooltip

Dropdown

Modal

Drawer

DataTable

Pagination

Breadcrumb

PageHeader

EmptyState

LoadingState

ErrorState

Skeleton

Alert

Toast

Timeline

Chart

Progress

ConfirmationDialog

Do not create duplicate components for individual pages.

29. Page States

Every data-driven page must visually support:

Loading

Use skeleton loaders.

Empty

Example:

No QR codes yet

Generate your first QR batch to get started.

[Generate QR]


Error

Example:

Unable to load QR codes

Something went wrong while loading this data.

[Retry]


Permission denied

Access denied

You don't have permission to access this page.


Success

Show the actual content.

Destructive confirmation

For:

delete

disable

revoke

refund

role changes

Always use confirmation dialogs.

30. Responsive Design

The dashboard must work on:

desktop

laptop

tablet

mobile

Desktop:

persistent sidebar

Tablet:

compact sidebar

Mobile:

drawer navigation

stacked cards

horizontally scrollable data tables

mobile-friendly filters

bottom-safe action areas

Do not simply shrink the desktop UI.

Adapt layouts properly.

31. Accessibility

Follow good accessibility practices.

Include:

visible focus states

keyboard navigation

proper contrast

semantic buttons

accessible labels

tooltips for icon-only buttons

accessible dialogs

accessible tables

32. Motion

Use subtle animations only.

Examples:

sidebar transitions

dropdown animation

modal animation

page transition

skeleton shimmer

chart entrance

toast animation

Do not over-animate the dashboard.

33. Mock Data

Use realistic mock data.

Do NOT use:

User 1
User 2
Test User
Lorem ipsum
123456


Instead use realistic examples such as:

Alex Morgan
Maria Wilson
Daniel Carter
Sophie Brown


Use realistic:

dates

transaction amounts

QR IDs

batch IDs

statuses

service metrics

activity events

The UI should look like a real operating platform.

34. Navigation

Every sidebar item must lead to a real designed page.

Do not create dead navigation links.

All pages should be visually connected through the same application shell.

Implement realistic navigation between:

list

detail

edit

create

settings

Use drawers/modals where appropriate instead of creating unnecessary pages.

35. Design Consistency

All pages must share:

same spacing system

same typography

same border radius

same cards

same table style

same status colors

same buttons

same form controls

same page headers

same responsive behavior

Do not design each page as a separate visual product.

The entire dashboard must feel like one cohesive system.

36. Important Scope Rule

This is a design and UI implementation task only.

Do NOT:

connect Supabase

create database tables

implement backend

create NestJS endpoints

implement real authentication

implement real RBAC

implement real Telegram

implement real payments

implement real QR generation

modify production infrastructure

create production secrets

require external APIs

Mock the data and interactions.

The goal is to produce a complete, polished Admin Dashboard prototype that can later be connected to the real unblockyOn backend.

37. Final Quality Bar

Before considering the task complete, verify that:

every sidebar item has a designed page

every page has realistic content

tables look production-ready

forms look production-ready

loading states exist

empty states exist

error states exist

permission-denied states exist

modals and drawers exist where appropriate

responsive layouts work

navigation works

no placeholder Lorem Ipsum exists

no broken pages exist

no dead navigation links exist

visual language is consistent

the result feels like a serious SaaS admin platform

The final result should feel like:

"This is the real unblockyOn administration platform."

Not:

"This is a dashboard template demo."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/82152077-9dae-4ddf-aa44-a11e0bce9cbc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
