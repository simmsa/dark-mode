![Logo](/img/dark-mode-logo-w-text-dark-with-padding.svg)

![Version](https://img.shields.io/github/release/simmsa/dark-mode.svg)

### Making the web easier to read.

# Summary

Dark Mode is a customizable Chrome Extension that inverts the colors (white text on a black
background for most sites) of the web.

![Dark Mode Demo](/doc/popup-dark-mode-demo.gif)

# Features

* Invert the colors of any website.

* User configurable via the popup menu, right click menu, or by keyboard shortcut.

* Per site, per url and global settings of dark mode, "fix colors", and
  contrast settings.

* Attempts to solve inversion issues that other inversion extensions don't,
  including iframes within iframes, shadow dom elements, and urls with a dark
  theme.

# Installation

Download the latest crx from the [releases page](https://github.com/simmsa/dark-mode/releases/latest).
In the Chrome settings menu click on "More Tools" > "Extensions". Drag and
drop the downloaded crx file onto this window.

**Note**: Other dark mode/inversion plugins must be disabled for dark mode to
work correctly.

## A Note on Permissions

When installing dark mode the message "Read and change all your data on the websites you
visit" is displayed. We use these permissions for:

* Updating settings without reloading the page.

* Turning on/off dark mode for the current page depending on your settings.

# Usage

## Popup

By clicking on the Dark Mode icon ![Dark Mode Icon](/img/dark-mode-on-19.png)
in the Chrome extensions area the popup menu can be accessed. From here all
user configurable settings can be accessed.

### Current Url Settings

Customize the settings for the current site.

This setting overrides the current domain setting.

See [Dark Mode](#dark-mode), [Fix Colors](#fix-colors) and
[Contrast](#contrast) for info on each individual setting.

### Current Domain Settings

Customize the settings for the current domain. We use the complete top level
domain, meaning a google.com and a photos.google.com url have different domain
settings.

This setting overrides the global setting.

See [Dark Mode](#dark-mode), [Fix Colors](#fix-colors) and
[Contrast](#contrast) for info on each individual setting.

### Global Settings

Customize the settings for all of Dark Mode.

See [Dark Mode](#dark-mode), [Fix Colors](#fix-colors) and
[Contrast](#contrast) for info on each individual setting.

## Right Click Menu

By right clicking Dark Mode's on/off state can be toggled for the current
website and the current domain.

![Dark Mode Right Click Demo](/doc/popup-right-click-demo.gif)

## Keyboard Shortcut

### Toggle Dark Mode

Windows & Linux: `Ctrl+Shift+D`

Mac: `Command+Shift+D`

### Customizing Your Keyboard Shortcut

From the `chrome://extensions` page, scroll to the bottom and click "Keyboard
shortcuts". Click in the box next to "Toggle dark mode" and enter your
preferred keyboard shortcut.

![Dark Mode Change Keyboard Shortcut Demo](/doc/popup-change-keyboard-shortcut-demo.gif)

# Settings

## Dark Mode Setting

Turns on/off the inversion.

![Dark Mode Demo](/doc/popup-dark-mode-demo.gif)

## Fix Colors

Turns on/off the hue rotation. Attempts to fix colors affected by the
inversion. This is inaccurate, especially for hues of red. We recommend
turning off Fix colors on photo heavy sites due to problems with skin tones.

![Dark Mode Fix Colors Demo](/doc/popup-hue-demo.gif)

## Contrast

Adjusts the difference between light and dark colors.

![Dark Mode Fix Colors Demo](/doc/popup-contrast-demo.gif)

# Common Issues

## Dark Mode is not working correctly/looks wrong

You have two options here.

* Turn off dark mode for the current page. This is our first recommendation.

* File an issue

## Even with "Fix Colors" turned on the colors look "off"

We use the css `hue-rotate` filter to "fix" the colors which is clearly not
perfect, especially for shades of red. If this bothers you simply turn off
dark mode for that site.

# Contributing

Issue Tracker: [Here](/issues)

# License

[MIT](/LICENSE)
