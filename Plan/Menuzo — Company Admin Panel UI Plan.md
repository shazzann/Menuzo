# 🏢 Menuzo — Master Admin Panel UI/UX Plan (Company Admin)

> **Goal:** A premium SaaS admin panel for the Menuzo team to manage the entire platform. The UI should follow the Menuzo Global Design System (orange primary brand, glassmorphism where appropriate, rounded components, modern cards, subtle animations, clean typography, mobile responsive, scalable architecture).

---

# Design Principles

## Visual Style

* Menuzo Global Design Language
* Premium SaaS appearance
* Minimal but information-rich
* Soft shadows
* Large border radius
* Frosted glass components where suitable
* Orange as primary accent
* Neutral backgrounds
* High accessibility
* Smooth micro interactions
* Consistent spacing system
* Card-based layouts

---

# Layout Structure

```
┌───────────────────────────────────────────────────────┐
│                 Top Navigation                        │
├───────────────┬───────────────────────────────────────┤
│               │                                       │
│               │                                       │
│ Left Sidebar  │           Main Content               │
│               │                                       │
│               │                                       │
├───────────────┴───────────────────────────────────────┤
│                 Footer / Status Bar                   │
└───────────────────────────────────────────────────────┘
```

---

# Global Components

## Top Navigation

Contains

* Menuzo Logo
* Workspace Name
* Global Search
* Notifications
* Messages
* Quick Actions (+)
* Theme Switch
* Profile Avatar
* Online Status
* Current Date & Time

---

### Profile Dropdown

* My Profile
* Account Settings
* Activity Log
* API Keys
* Help Center
* Keyboard Shortcuts
* Logout

---

# Left Sidebar

Collapsible

### Main Navigation

Dashboard

Business

* Shops
* Shop Verification
* Shop Requests

Plans

* Subscription Plans
* Coupons
* Promotions

Themes

* Theme Library
* Theme Marketplace
* Theme Requests

Marketing

* Campaigns
* Notifications
* Email Campaigns

Reports

* Revenue
* Shops
* Usage Analytics
* Growth

Support

* Tickets
* Live Chat
* Messages

Content

* Blog
* Help Center
* FAQ

Settings

* General
* Security
* Billing
* Integrations
* Email Templates
* SMS Templates
* Notification Settings

System

* Audit Logs
* Activity
* Server Status

---

# Login Page

## Layout

Left Side

* Large Hero Illustration
* Menuzo Branding
* Welcome Text
* Feature Highlights

Right Side

Glass Card

Contains

* Logo
* Welcome Back
* Email
* Password
* Remember Me
* Forgot Password
* Login Button
* Login with Google (Optional)
* Login with Microsoft
* Version Number

Footer

* Privacy Policy
* Terms
* Support

---

# Dashboard

## Welcome Section

Shows

Good Morning,

Today's Date

Current Active Users

Quick Summary

Quick Action Buttons

* Add Shop
* Send Notification
* Create Coupon
* Create Theme
* View Reports

---

# KPI Cards

Large Cards

* Total Shops
* Active Shops
* Inactive Shops
* Trial Users
* Expired Shops
* Monthly Revenue
* Annual Revenue
* New Registrations
* Pending Verifications
* Average Revenue Per Shop

Each card includes

* Icon
* Current Value
* Previous Value
* Growth %
* Trend Graph
* Clickable

---

# Revenue Analytics

Large Interactive Graph

Options

* Daily
* Weekly
* Monthly
* Yearly
* Custom

Metrics

* Revenue
* Renewals
* New Plans
* Upgrades
* Downgrades

---

# Shop Growth Analytics

Charts

* Registration Trend
* Active Shops
* Churn
* Conversion Rate
* Trial Conversion
* Country Distribution

---

# Interactive Map

World/Sri Lanka Map

Markers

Color coded

Green

Active

Yellow

Trial

Red

Expired

Gray

Inactive

Popup

Contains

Shop Logo

Shop Name

Owner

Location

Revenue

Plan

Renewal Date

Menu Items

Rating

View Shop

Message

Suspend

---

# Activity Timeline

Real-time feed

Examples

New Shop Registered

Payment Received

Subscription Renewed

Theme Purchased

Menu Updated

Account Suspended

---

# Leaderboards

Top Revenue Shops

Most Viewed Shops

Most Active Shops

Most Menu Views

Highest Rated Shops

Newest Shops

---

# Quick Insights

AI Insights Card

Examples

Revenue increased 15%

20 subscriptions expiring

5 inactive businesses

Popular plan

Best performing city

---

# Shop Management

## Header

Search

Filter

Export

Import

Bulk Actions

Refresh

View Toggle

---

## Filters

Status

Plan

Location

Owner

Revenue

Join Date

Renewal Date

Industry

Verification Status

---

## Shop Cards

Each Card

Logo

Cover

Shop Name

Owner

Phone

Email

Location

Plan

Expiry

Revenue

QR Code

Rating

Verification Badge

Status

Quick Actions

Buttons

View

Edit

Suspend

Renew

Delete

Message

---

## Table View

Columns

Logo

Name

Owner

Location

Revenue

Plan

Expiry

Status

Verification

Created Date

Actions

Resizable Columns

Sorting

Pagination

Column Visibility

---

# Shop Detail

## Header

Back

Logo

Cover Image

Shop Name

Verified Badge

Status Badge

Favorite

Share

More Menu

---

# Overview Tab

Business Information

Owner

Business Registration

Tax ID

Location

Coordinates

Website

Social Links

Languages

Business Hours

Timezone

---

# Subscription Tab

Plan

Start

Expiry

Renewal

Auto Renew

Payment Method

Invoices

Transactions

Coupons Used

Upgrade History

---

# Analytics Tab

Revenue

Visitors

QR Scans

Popular Categories

Popular Items

Daily Views

Conversion

Peak Hours

---

# Menu Statistics

Categories

Items

Offers

Hidden Items

Unavailable Items

Images Uploaded

Videos Uploaded

PDF Menus

---

# Media

Gallery

Videos

Logos

Banners

Storage Usage

---

# Staff

Employees

Managers

Roles

Permissions

Last Login

---

# Devices

Logged Devices

Browser

OS

Location

Last Active

Logout Device

---

# Customer Feedback

Ratings

Reviews

Complaints

Suggestions

Response Status

---

# Communication

Chat

Email

SMS

Push Notifications

Broadcast Message

---

# Activity Log

Everything performed by shop

Login

Menu Update

Plan Change

QR Generated

Theme Changed

Payments

---

# Themes Management

Theme Library

Installed Themes

Marketplace

Featured Themes

Premium Themes

Draft Themes

Theme Categories

Theme Approval

Theme Analytics

Theme Reviews

Theme Downloads

---

# Subscription Plans

Plans List

Pricing

Features

Limits

Popular Badge

Coupons

Discounts

Free Trial

Plan Comparison

Plan Analytics

---

# Marketing

Campaign Dashboard

Email Campaign

SMS Campaign

Push Notification

Scheduled Campaigns

Coupons

Referral Program

Banner Manager

Announcement Bar

---

# Reports

Revenue

Subscriptions

Growth

Usage

Storage

Traffic

Most Active Shops

Inactive Shops

Plan Distribution

Regional Reports

Download

PDF

Excel

CSV

---

# Support Center

Support Dashboard

Open Tickets

Closed Tickets

Live Chat

Knowledge Base

FAQ

Bug Reports

Feature Requests

Priority Queue

---

# Notifications Center

Subscription Expiry

Payment Failure

Server Issues

Support Messages

Theme Requests

New Registrations

Verification Pending

System Alerts

---

# Settings

## Company

Company Logo

Company Name

Brand Colors

Favicon

Support Email

Phone

Address

Timezone

Currency

Language

---

## Authentication

Password Policy

2FA

Session Timeout

Device Management

Login History

---

## Email

SMTP

Templates

Sender Name

Signature

Preview

Test Email

---

## SMS

Gateway

Templates

Credits

Test SMS

---

## Notification Settings

Email

SMS

Push

Desktop

In-app

Slack

Webhook

---

## Integrations

Payment Gateways

Google Maps

Analytics

Cloud Storage

Firebase

WhatsApp

Mail Services

AI Services

---

## Security

API Keys

Access Tokens

Audit Logs

IP Whitelist

Permissions

Roles

Encryption

---

## Backup

Automatic Backup

Manual Backup

Restore

Download Backup

Backup Schedule

---

## Appearance

Theme

Accent Color

Dark Mode

Sidebar Style

Card Style

Density

Animation Level

---

# Audit Logs

Searchable Logs

Date

Admin

Action

Affected Shop

Device

Browser

IP Address

Status

Export

---

# System Health

Server Status

Database Status

API Status

Storage

CPU

RAM

Background Jobs

Error Logs

Maintenance Mode

---

# Footer

Version Number

Environment

Server Status

Last Backup Time

Copyright

Documentation

Support

---

# Global Search

Search Everything

* Shops
* Owners
* Plans
* Themes
* Tickets
* Reports
* Settings
* Activities

Keyboard Shortcut:

```
Ctrl + K
```

---

# Global Quick Actions

Floating "+" Button

Quick Menu

* Add Shop
* Create Plan
* Send Broadcast
* Generate Report
* Add Theme
* Create Coupon
* Open Support Ticket

---

# Responsive Behavior

### Desktop

* Persistent sidebar
* Multi-column analytics
* Rich data tables

### Tablet

* Collapsible sidebar
* Two-column layout
* Condensed navigation

### Mobile

* Bottom navigation for core actions
* Swipeable cards
* Full-screen sheets for filters and details
* Priority metrics shown first

---

# Future Expansion (Already Planned for Menuzo)

The information architecture is designed to accommodate future modules without restructuring the platform:

* Online Booking Management
* Reservations Dashboard
* Event Scheduling
* Customer CRM
* Loyalty & Rewards
* Marketplace for Themes and Add-ons
* AI-powered Business Insights
* QR Scan Analytics
* Multi-location Business Management
* White-label Partner Management
* Multi-language Content Management
* Advanced Permission & Team Management
* Financial Accounting & Payouts
* Inventory Integration
* POS Integration
* Public API & Developer Portal
* Automation Workflows
* Webhook Management
* Custom Domain Management
* Franchise Management
* Enterprise Multi-tenant Administration

This structure keeps the Menuzo Master Admin Panel scalable, consistent with your design system, and ready for the long-term roadmap you've outlined for Menuzo.
