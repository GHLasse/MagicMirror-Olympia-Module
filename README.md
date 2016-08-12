# MagicMirror-Olympia-Module
Module for MagicMirror2 to display current olympia medals

![preview](https://github.com/GHLasse/MagicMirror-Olympia-Module/blob/master/.github/medalsRio01.png)

This module is only valid for the 2016 Summer Olympics in Rio but can be used as a base for future Olympics - simply modify the api address and the identifiers.

Find out more about MagicMirror Modules here:
https://github.com/MichMich/MagicMirror/wiki/MagicMirror%C2%B2-Modules

## Installation

Go to your MagicMirror folder.

 `cd MagicMirror`

Clone the repository.

 `git clone https://github.com/GHLasse/MagicMirror-Olympia-Module.git modules/olympia`
 
 
## Configuration

Add module configuration to config.js.

```
{
  module: 'olympia',
  position: 'ANY_POSITION',
  config: {
    maximumEntries: 8,
    interest: ['Brazil','China','United States']
  }
},
```


