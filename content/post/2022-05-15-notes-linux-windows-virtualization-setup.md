---
title: Notes from my Linux Virtualization setup with GPU passthru
date: 2022-05-15
tags:
  - Linux
  - virtualization
  - configuration
  - administration
---

I was tired of having to reboot my Linux PC into Windows just to play a game. While gaming on
Linux has made great progress, some of the most-played games in my
collection still don't work properly. So the next best thing besides
getting a second PC was a virtual machine. Modern virtualization  allows to "pass through" your graphics card to the virtual machine. There are many tutorials for such a setup on the internet, but it turned out that I had to tweak the described setups for me. This article is a mixture of links to resources and the tweaks I have done for my setup.

## My Hardware Setup

In my dual-boot setup I had the following hardware

* Dell 32" monitor with HDMI and DisplayPort inputs
* AMD Ryzen 7 3700X with a B450 TOMAHAWK MAX board
* 500 GB NVME SDD
* GeForce GTX 1650 Graphics card

For the virtualization setup I needed a second graphics card. The GeForce card should be passed through to the Windows guest and I chose a **Radeon PRO WX 2100** to be the new main graphics card for my Linux host system. It might seem slightly underpowered, but since I don't run graphics-intensive software on Linux, it's fine. I chose this card because

* It's passively cooled and has a small form factor that fits well
    into my system. I'm a big fan of silent computers.
* It's an AMD graphics card, so I can distinguish between the
    graphic cards, allowing me to selectively load drivers
* It has H.256 decoding capabilities. Unfortunately, I haven't succeeded
    in configuring my system to actually use the video hardware decoder, so YouTube and VLC on Linux stays a janky mess. I don't know if it's just missing browser support (video hardware acceleration support for Linux is not good both on Firefox and Chrome) or a general problem.

Both graphic cards are plugged into the same monitor, the Radeon via DisplayPort, the GeForce via HDMI. I can switch source inputs on the monitor with the on-screen-menu and monitor buttons. The monitor also has a picture-in-picture function, which I used to troubleshoot.

With the size of modern games I also added a 1TB SATA SSD that I'll use for the Windows guest.


## GPU passthru

I made several attempts on this project. The first one was successful for
the GPU passthru, but I still had not figured out how to share my
keyboard (see below).

I used the following guides for my initial attempt:

* https://www.heiko-sieger.info/running-windows-10-on-linux-using-kvm-with-vga-passthrough/
* https://wiki.debianforum.de/QEMU/KVM_mit_GPU_Passthrough (German)

After a few months I tried to run my VM again and the passthru did no
longer work. I then followed this guide: https://mathiashueber.com/pci-passthrough-ubuntu-2004-virtual-machine/

I encountered two problems: forcing Linux to use the virtio drivers and the priority settings of graphics card and input on my monitor.

### Driver selection

In my dual-boot setup I had installed the proprietary NVidia drivers.
Before following the instructions in the guides I wanted to make the
Radeon card my primary graphics card and make Linux ignore the NVidia
card. I uninstalled the proprietary drivers. But a few weeks after my
first attempt, I must have done something to bring my system into a state
where it insisted on loading the `nouveau` drivers (an open source driver
for NVidia cards). This had the side effect of no longer being able to
suspend my computer. Also, the settings for using the vfio driver for the
graphics card did not take, running `lspci -nnv` still showed the nouveau
driver for the NVidia card. Not wanting to mess with packages and
destroying my graphical desktop (something that happened during my first
attempt), I resorted to blocking the driver: I created the file
`/etc/modprobe.d/blacklist-nvidia-nouveau.conf` with the following
contents:

```
blacklist nouveau
options nouveau modeset=0
```

After another reboot, `lspci -nnv` finally showed `vfio-pci` and the VM
passthru worked. I was relieved and validated for choosing two different graphics card manufacturers, allowing me to block the drivers.

### Monitor and mainboard interaction

My mainboard chooses the GeForce card as the "primary" graphics card to display
status information when booting. As soon as Linux takes over, it uses the
Radeon card. This means that on reboot the monitor loses its signal, looks
for a signal, switches to HDMI because it comes "online" first and then
the whole system looks frozen because Linux does not update anything on
the HDMI card. This means I have to switch input sources on my monitor on reboot (~5-6 key presses on the monitor keys).

While the nouveau driver was loaded (but not used), the display showed a
completely white background.

## Windows monitor configuration

My windows installation had two "screens" - the passed-thru one and the
tiny 800x600 console from the VM. When the passthru worked, I changed the Windows settings so that
the console mirrors the big screen. Now that the passthru works and Windows is configured, I could probably remove the graphics
card from the VM configurations, but I'd rather keep the primitive console
as a fallback option.

But there is one caveat - I must now show the tiny window when starting
the virtual machine, otherwise it will slow down the rendering on the main
screen.

## Sharing mouse and keyboard between guest and host

Plugging in a second set of input devices was out of the question - not
enough space on my desk. I also did not want to clutter my desk with a
physical KVM (Keyboard-Video-Mouse) switch and introduce potential hardware errors. My preferred solution was a software KVM.

I almost used [barrier](https://github.com/debauchee/barrier), but the
into videos I watched did not tell me if this would be really a "switch"
between two separate workspaces or one big unified workspace between guest
and host, which would have been confusing. Also, barrier sends the mouse
and keyboard events over a TCP connection and there were articles that
mentioned that sometimes client and host lose their connection.

Instead I went the `evdev` route (after seeing [a video tutorial about using evdev](https://www.youtube.com/watch?v=4XDvHQbgujI)) and used this tutorial: https://passthroughpo.st/using-evdev-passthrough-seamless-vm-input/

I struggled for an afternoon and could not get it to work. It either did
not find the input device or got denied permissions. I fiddled with user
settings, tried using `/dev/input/event5` instead of
`/dev/input/by-id/device-name` (which symlinks to `/dev/input/event5`),
nothing worked. I also learned that you **don't** use `/dev/input/mouse0`, because that's not an evdev source. Each attempt took a few minutes, because I needed a `libvirt` restart, which takes some time.

In the end I
used the [evdev helper scripts](https://github.com/pavolelsig/evdev_helper) and it made the switching work. I suspect that AppArmor was blocking access, the helper script not only generates a configuration snippet for QEMU, but also adds `/dev/input/*` to the AppArmor permissions for QEMU.

Installing the virtio drivers in Windows failed, [the most current
version seems to have a bug](https://www.reddit.com/r/VFIO/comments/uju0pf/virtiowindriverinstaller_setup_wizard_ended/). The only thing that worked was to de-select every driver except the one for input.

## Enabling sound output

### PulseAudio

QEMU can route the sound from the virtual machine to the host system via
PulseAudio. 

This tutorial outlines the necessary steps: https://mathiashueber.com/virtual-machine-audio-setup-get-pulse-audio-working/

It did not work on the first run, because the evdev helper scripts had set
the user and group settings of in `/etc/libvirt/quemu.conf` to `root`.
After setting them to my primary user, the keyboard switching still worked
and the sound started working.

### Dedicated USB device
For some more hardware-intensive games the sound can get "scratchy". In
the end, I don't use evdev and PulseAudio and plug in a USB headset,
instructing the VM to pass through the USB device from host to guest.


