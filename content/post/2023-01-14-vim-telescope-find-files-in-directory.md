---
title: "NeoVim + Telescope: Find Files in Specific Directory"
date: 2023-01-14
tags:
  - programming
  - lua
  - neovim
  - telescope
categories:
  - wikimedia
description: "How to open the find_files list with a specific directory"

---

I like to tweak my [NeoVim](https://neovim.io) configuration from time to
time, without opening a new terminal window and changing to my NeoVim
configuration directory. When I switched from
[FZF](https://github.com/junegunn/fzf.vim) to
[Telescope](https://github.com/nvim-telescope/telescope.nvim) as my fuzzy
file finder, I needed to redefine my shortcut for listing the configuration
file. I found out that `find_files` allows for providing a `cwd`
parameter:

<!--more-->

```lua
vim.api.nvim_create_user_command(
    'Config',
    function ()
        require('telescope.builtin').find_files({cwd="~/.config/nvim"})
    end,
    {}
)
```

This code snippet adds a `Config` command that shows a fuzzy finder of all
my NeoVim configuration files. The crucial part is the `cwd` parameter.

Most examples of `find_files` don't use parameters. This entry is for my
future self and for all people who might search for this topic. 
