---
title: Configure Keyboard Layout Switching for Sway
tags:
  - linux
  - sway
  - waybar
  - configuration
  - ricing
unsafe: true
date: '2023-02-18'

---


A US keyboard layout increases my productivity as a developer, because characters like square brackets, pipe and backslash are easier to type than on a German keyboard. For the occasional German special character I like to use the <kbd>AltGr</kbd> key, preferably with the keys where they are already printed on my physical keyboard.

From time to time I need to write longer German texts that don't need a lot of special characters and need Umlauts instead. In those cases use a keyboard shortcut to switch between German and US keyboard. 

I know that there are alternative setups like the [compose key](https://help.ubuntu.com/stable/ubuntu-help/tips-specialchars.html.en) or the [European Keyboard Layout](https://eurkey.steffen.bruentjen.eu/layout.html), but I've never warmed up to them.

## Choosing a layout and variant

On Linux, the software for managing keyboard layouts both for the X server and for Sway is [XKB](https://wiki.archlinux.org/title/X_keyboard_extension). It defines keyboard *layouts* that more or less represent the physical keys on he layout and *variants* that can redefine characters, composition and <kbd>AltGr</kbd> behavior.

In my previous installation with xmonad, I had a US keyboard layout with a variant called `cz_sk_de` that allowed to type the umlauts with an <kbd>AltGr</kbd> combination. I don't remember if I installed it manually or if it came with my OS. On my new OS, Ubuntu 22.04, the `cz_sk_de` variant was not present, so I used the following commands to look which other variants are available:

	localectl list-x11-keymap-variants us
	localectl list-x11-keymap-variants de

The US layout has an `altgr-intl` variant that would allow me to type umlauts and accented characters, but they are in unexpected places.

The German (`de`) layouts have a variant called `US` that does exactly what I need: US characters by default, Umlauts in familiar places with <kbd>AltGr</kbd>.

## Configuring my keyboard in Sway

You can list all the inputs available in Sway with the command

	swaymsg -t get_inputs

In my case, with a ThinkPad T14, two keyboard inputs were showing up. I guess one is for special keys. Not wanting to mess with it, I decided to use the unique ID instead of `type:keyboard` when configuring the input. This is what my configuration looks like:

```
input "1:1:AT_Translated_Set_2_keyboard" {
	xkb_layout de,de
	xkb_variant us,
}

bindsym $mod+BackSpace input "1:1:AT_Translated_Set_2_keyboard" xkb_switch_layout next 
```

The `xkb_layout` configuration defines the same layout twice, while the `xkb_variant` configuration defines one variant and one "pure" layout - no variant, hence the empty space after the comma.

My preferred hotkey for switching layouts is <kbd>Super</kbd>+<kbd>Backspace</kbd>, since for me it's the perfect balance between easy to reach and without danger of toggling accidentally.

## Making the keyboard configuration host-specific

In case I want to reuse my Sway configuration on a different machine that has a different ID for the keyboard, I'd like to put the keyboard configuration in a host-specific file. This is possible with the following line in the main sway configuration:

	include ~/.config/sway/$(hostname)/*

Thanks to the [example Sway configuration that uses $hostname variable](https://github.com/rbnis/dotfiles/blob/master/.config/sway/config) 

## Waybar integration

Waybar has [an open issue about adding a keyboard layout module](https://github.com/Alexays/Waybar/issues/66), so I wrote my own custom module in Python:

```python
#!/usr/bin/python

import subprocess
import sys
import json
from argparse import ArgumentParser

KEYBOARD_TABLE = {
    "German": "DE",
    "German (US)": "EN"
}

parser = ArgumentParser()
parser.add_argument("identifier")
args = parser.parse_args()

input_identifier = args.identifier

# We could use the i3ipc library instead, but that would create a
# dependency we'd have to install before using this module
result = subprocess.run(["swaymsg", "-t", "get_inputs", "-r"],
                        encoding="UTF-8", capture_output=True)

inputs = json.loads(result.stdout)
layout_name = ""
for input in inputs:
    if input["identifier"] == input_identifier:
        layout_name = input["xkb_active_layout_name"]

if layout_name == "":
    print("No layout found. check your identifier", file=sys.stderr)
    sys.exit(1)

if layout_name in KEYBOARD_TABLE:
    short_name = KEYBOARD_TABLE[layout_name]
    print(json.dumps({"text": short_name, "tooltip": layout_name}))
else:
    print(json.dumps({"text": layout_name}))
```

The module also "translates" the raw layout name into shorter names (when
configured).

This is the configuration for Waybar:

```json
{
	"modules-right": [ "custom/keyboard",  "clock"],
	"custom/keyboard": {
		"exec": "~/.config/waybar/modules/keyboard.py '1:1:AT_Translated_Set_2_keyboard'",
		"interval": "once",
		"format": " {}  ",
		"return-type": "json",
		"signal": 2,
		"on-click": "~/.config/sway/scripts/switch-keyboard '1:1:AT_Translated_Set_2_keyboard'"
	},
	"clock": {
		"format": "{:%Y-%m-%d %H:%M}"
	}
}
}
```

I have set up the module to avoid polling and instead opted for a small
script that toggles the next layout with `swaymsg` and then sends a
SIGTERM to waybar to trigger an update. In my Sway configuration I have
changed my <kbd>Super</kbd>+<kbd>Backspace</kbd> hotkey to trigger this script as well:

```bash
#!/bin/bash
if [ -z "$1" ]; then
	echo "You need to provide a sway input identifier. Run 'swaymsg -t get_inputs'"
	exit 1
fi

swaymsg input "$1" xkb_switch_layout next
pkill -SIGRTMIN+2 waybar
```


## Sources

- [How to define multiple keyboard layouts and variants](https://unix.stackexchange.com/a/706553/6341)
- [How to set the keyboard layout from the shell](https://unix.stackexchange.com/a/640513/6341)
- [How to list all variants of a keyboard layout](https://unix.stackexchange.com/a/298947/6341)
- [How to query the output of the current Sway configuration with jq](https://www.reddit.com/r/swaywm/comments/rpkuyr/comment/hq50kh4/)
- [Example Sway configuration that uses $hostname variable](https://github.com/rbnis/dotfiles/blob/master/.config/sway/config)

