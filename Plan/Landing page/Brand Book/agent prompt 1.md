Below is a production-quality agent prompt you can give to Claude Code, Cursor, Codex, or any AI coding agent.

---

```text
# Task

Create a fully responsive Brand Book page for the Menuzo Landing Website.

I will attach a Brand Book outline document containing all sections that should appear.

Your job is to transform that document into a premium interactive web experience—not a PDF or simple document viewer.

The page should feel like the Brand Guidelines pages of companies such as Stripe, Linear, Notion, Apple, Framer, Airbnb, Vercel or Figma.

The result must look like an official design system website.

------------------------------------------------------------

# Tech Stack

Use the existing landing page stack.

- React
- TypeScript
- TailwindCSS
- Framer Motion (if already installed)
- Existing design system/components
- Existing color variables
- Existing typography

Do NOT introduce another UI framework.

------------------------------------------------------------

# Goal

This page should become the official Menuzo Brand Book.

It should be suitable for

• Designers
• Developers
• Marketing Team
• Investors
• Future Employees

Everything should feel premium.

------------------------------------------------------------

# Data Source

The attached document contains the Brand Book content.

Read the document completely.

Generate the page directly from that content.

Whenever content is missing:

DO NOT invent information.

Instead create elegant placeholders.

Examples:

Mission
"Coming soon..."

Brand Values
"To be defined"

Logo Usage
Placeholder

Photography
Placeholder Gallery

Color Palette
Placeholder Colors

Brand Applications
Placeholder Cards

Images
Use elegant image placeholders.

Illustrations
Placeholder.

Icons
Placeholder.

Mockups
Placeholder.

Videos
Placeholder.

------------------------------------------------------------

# Design Direction

Modern

Minimal

Premium

Luxury SaaS

Lots of whitespace

Excellent typography

Large section spacing

Smooth scrolling

Subtle animations

Soft shadows

Rounded corners

Beautiful gradients

Sticky navigation

Reading focused

Should feel like reading a high-end design system.

------------------------------------------------------------

# Page Structure

Create a long-form documentation page.

Sections should automatically be generated from the document.

Example sections:

Hero

Introduction

Brand DNA

Mission

Vision

Purpose

Tagline

Brand Promise

Brand Personality

Brand Values

Target Audience

Customer Personas

Positioning

USP

Brand Voice

Messaging

Elevator Pitch

Logo

Logo Rules

Color Palette

Typography

Icons

Illustration Style

Photography

UI Components

Design Principles

Motion

Marketing Guidelines

Social Media

Applications

Accessibility

Future Vision

Appendix

------------------------------------------------------------

# Hero Section

Large title

MENUZO

Brand Book

Small subtitle

"The complete identity system for Menuzo."

Include:

Version

Last Updated

Status

Buttons

Download PDF (disabled placeholder)

Figma Assets (disabled placeholder)

Brand Assets (disabled placeholder)

------------------------------------------------------------

# Navigation

Sticky left sidebar (desktop)

OR

Sticky top navigation

Navigation should highlight the active section.

Smooth scrolling.

Scroll spy.

------------------------------------------------------------

# Every Section

Every section should include

Large heading

Description

Divider

Content Cards

Proper spacing

If there is no content:

Display elegant placeholder components.

Example:

━━━━━━━━━━━━━━━━━━━━━━

Mission

Content coming soon...

━━━━━━━━━━━━━━━━━━━━━━

------------------------------------------------------------

# Cards

Use beautiful cards for

Values

Personality

Audience

Applications

Principles

Each card should have

Icon placeholder

Title

Description

------------------------------------------------------------

# Color Palette Section

Create beautiful color swatches.

If colors exist

Use them.

If not

Generate placeholder swatches labelled

Primary

Secondary

Accent

Surface

Background

Success

Warning

Danger

Neutral

------------------------------------------------------------

# Typography Section

Show

Heading

Subheading

Body

Caption

Button

If font data doesn't exist

Use placeholders.

------------------------------------------------------------

# Logo Section

Display placeholder logo boxes.

Primary Logo

Secondary Logo

Icon

Monochrome

Dark

Light

Incorrect Usage

Minimum Size

Safe Area

------------------------------------------------------------

# Photography Section

Responsive image grid.

Use elegant placeholders.

------------------------------------------------------------

# UI Section

Display component previews

Buttons

Cards

Forms

Badges

Inputs

Navigation

Tables

Charts

If components don't exist

Render placeholder skeleton cards.

------------------------------------------------------------

# Brand Applications

Responsive grid

Business Card

Website

Dashboard

QR Card

Sticker

Poster

Invoice

Packaging

Email Signature

Each should have a placeholder mockup.

------------------------------------------------------------

# Accessibility

Beautiful checklist cards.

------------------------------------------------------------

# Appendix

Asset Downloads

Documentation

Version History

Contact

All placeholder.

------------------------------------------------------------

# Motion

Use subtle animations.

Fade in

Slide up

Section reveal

Hover effects

Card lift

Nothing excessive.

------------------------------------------------------------

# Responsive

Desktop

Laptop

Tablet

Mobile

Everything should adapt beautifully.

------------------------------------------------------------

# Components

Reuse existing components whenever possible.

If a reusable component doesn't exist,

create one.

Examples:

SectionTitle

BrandCard

ColorSwatch

PlaceholderImage

PlaceholderLogo

TypographyPreview

SidebarNavigation

BrandGrid

Timeline

QuoteBlock

InfoCard

------------------------------------------------------------

# Code Quality

Clean architecture.

Small reusable components.

Proper folder structure.

Strong typing.

No duplicated code.

Readable.

------------------------------------------------------------

# Performance

Lazy load images.

No unnecessary rerenders.

Optimized animations.

------------------------------------------------------------

# SEO

Proper title

Meta description

Open Graph tags

Semantic HTML

Heading hierarchy

------------------------------------------------------------

# Accessibility

ARIA labels

Keyboard navigation

Good color contrast

Focusable navigation

------------------------------------------------------------

# Deliverables

1. Complete Brand Book page

2. All reusable components

3. Navigation

4. Responsive layout

5. Placeholder assets

6. Beautiful animations

7. Production-ready code

------------------------------------------------------------

# Important

- Do NOT simplify the page into plain markdown.
- Do NOT render the attached document as raw text.
- Convert it into a polished documentation experience.
- Respect the existing Menuzo design language.
- Maintain consistency with the landing page.
- Every missing asset must use a premium placeholder rather than fake content.
- The page should look complete even when some content is not yet available.
- Ensure the page is easy to extend later by simply replacing placeholders with real assets.
```

This prompt instructs the agent to build a **living Brand Book website** rather than a static page, making it easy to replace placeholders with final assets as Menuzo's branding evolves.
