# What is this?

These files are the current scripts that I've created and are using for my play-through of the game, [Bitburner](https://github.com/danielyxie/bitburner#readme), which is free-to-play. If you decide to give it a try, I would recommend that you start with following the in-game tutorial and reading the supporting external documentation and guides linked within it before trying to understand and make use of these scripts. But, once you get a good grasp of what is going on and you either get stuck or just want to check out what these scripts do, then feel free to grab a copy and upload them into your own game instance. Enjoy!

__*Beware that reading the details below may give away some spoilers.*__

# Scripts

[init.js](https://github.com/morioa/bitburner/blob/master/init.js)

When starting a new game or reset due to augmentation installation, this script automates starting the watcher for new attack targets, launches the first attack wave against all hackable targets, and attempts to purchase scripts that are available from the Darkweb. If you pass a max money value as the first argument for the script, then it will pass it along to the watcher script, which will then pass it along to the attack script to attack only targets that meet that minimum money requirement. The init script now also instructs the watcher script to automatically remount attacks when new hackable targets are found.

*__NOTE:__ A specific requirement must be met in order for the automated scripts purchase to be usable.*

Initialize with defaults
```
run init.js
```

Initialize with instruction to watch and attack hackable targets with at least $10m server max money
```
run init.js 10000000
```

[watcher.js](https://github.com/morioa/bitburner/blob/master/watcher.js)

The watcher script allows for monitoring various things indefinitely or until a specified criteria has been met.  I've added an audible beep for alert purposes, but that comes with quite a memory cost to support it that is not feasible to use early on with a "home" server that has very little RAM, so it will only start doing audible alerts once there is enough system memory to handle it. Until then, only visible notices will be displayed in the terminal. The watcher can now optionally remount the attack when a new target is found, which is enabled by default by the init script. While this essentially makes the game play itself (as far as the hacking goes), you still need to make sure to either create or buy the programs necessary to open ports on the target servers, otherwise you will be hamstrung by only being able to hack the very insecure and low-money servers.

*__NOTE:__ A specific requirement must be met in order for reputation to be monitored.* 

Watching for the newest hackable target
```
run watcher.js new
```

Watching a list of hackable targets with at least $10b server max money
```
run watcher.js list 10000000000 1
```

Watching and getting an alert when your reputation reaches 50k with the CyberSec faction

```
run watcher.js rep faction "CyberSec" 50000
```

[attack.js](https://github.com/morioa/bitburner/blob/master/attack.js)

To actually make money in this game, one of your options is to hack targets. To do that, you must have root access on the target server. To gain that, you must have a high enough hacking skill and enough programs to open the required ports on the server. This script makes that easy by doing all the heavy lifting by automatically breaching and gaining root access on all hackable hosts and targets before copying *Chester* to the remote host and setting him loose to mount the attack.

*__NOTE__: I was intending on doing multiple attack models, but right now the only one implemented is the "distributed" model, which uses all available resources equally to attack all possible targets based on the specified attack criteria.*

Show the help to get more detail and examples

```
run attack.js help
```

Attacking all hackable targets with at least $10b server max money using all hosts with root access

```
run attack.js 4 2 10000000000
```

[_chesterTheMolester.js](https://github.com/morioa/bitburner/blob/master/_chesterTheMolester.js)

This guy is the one that gets the most action, getting distributed all over the place and performing weaken, grow, and hack actions against a specified target. This script is only used when the "consolidated" algorithm is chosen for the attack. This was based on the original script from the tutorial and is not the most efficient method of attack, thus it is no longer the default script used by the attack script.

*__NOTE__: This script should be used instead of `attack.js` in the early game, when your "home" server has limited RAM, for however many threads it can handle.*

```
run _chesterTheMolester.js -t 3 "n00dles"
```

[_grow.js](https://github.com/morioa/bitburner/blob/master/_grow.js), 
[_hack.js](https://github.com/morioa/bitburner/blob/master/_hack.js), 
[_weaken.js](https://github.com/morioa/bitburner/blob/master/_weaken.js)

These are forever loop scripts that are very small in RAM usage and will continuously attempt one action each. They are simple, but require a lot more to manage them than Chester. These are used by the attack script using the "loop" algorithm, and is currently the default method of attack. They are not executed equally, but each script is weighted as to how many threads they will consume on each host server. 
