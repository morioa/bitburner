# What is this?

The files here are the current scripts that I've created and are using for my play-through of the game, [Bitburner](https://store.steampowered.com/app/1812820/Bitburner/), which is free-to-play on Steam. If you decide to play, I would recommend that you start with following the in-game tutorial and reading the supporting external documentation and guides linked within it before trying to understand and make use of these scripts. But, once you get a good grasp of what is going on and you either get stuck or just want to check out what these scripts do, then feel free to grab a copy and upload them into your own game instance. Enjoy!

__*Beware that reading the details below may give away some spoilers.*__

# Scripts

[init.js](https://github.com/morioa/bitburner/blob/master/init.js)

When starting a new game or reset due to augmentation installation, this script automates starting the watcher for new attack targets, launches the first attack wave against all hackable targets, and attempts to purchase scripts that are available from the Darkweb. 

*__NOTE:__ A specific requirement must be met in order for the automated scripts purchase to be usable.*

```
run init.js
```

[watcher.js](https://github.com/morioa/bitburner/blob/master/watcher.js)

The watcher script allows for monitoring various things indefinitely or until a specified criteria has been met.  I've added an audible beep for alert purposes, but that comes with quite a memory cost to support it that is not feasible to use early on with a "home" server that has very little RAM, so it will only start doing audible alerts once there is enough system memory to handle it. Until then, only visible notices will be displayed in the terminal.

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

[chesterTheMolester.js](https://github.com/morioa/bitburner/blob/master/chesterTheMolester.js)

This guy is the one that gets the most action, getting distributed all over the place and performs weaken, grow, and hack actions against a specified target. While it can be, it would be atypical to run this one manually, and instead just let the attack script handle that.

[attack.js](https://github.com/morioa/bitburner/blob/master/attack.js)

To actually make money in this game and to help raise the hacking skill, you must hack targets. To do that, you must have root access on the target server. To gain that, you must have a high enough hacking skill and enough programs to open the required ports on the server. This script makes that easy by doing all the heavy lifting. This script will automatically breach and gain root access on all hackable hosts and targets before mounting the attack.

*__NOTE__: I was intending on doing multiple attack models, but right now the only one implemented is the "distributed" model, which uses equal resources to attack all possible targets based on the specified attack criteria.*

Show the help to get more detail and examples

```
run attack.js help
```

Attacking all hackable targets with at least $10b server max money using all hosts with root access

```
run attack.js 4 2 10000000000
```

