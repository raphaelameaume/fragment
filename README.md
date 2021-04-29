## CLI

fragment ./scenes
fragment ./scenes/Cubes.js --open -p 3002

fragment ./scenes/Spheres --new --template three/orthographic
fragment ./scenes/Spheres --new --template ogl/perspective
fragment ./scenes/Spheres --new --template 2d
fragment ./scenes/Spheres --new --template ./custom-template.js

## Features

- CLI
- Inputs out of the box: MIDI, Mouse, Keyboard
- Screenshots
- Record canvas output to mp4
- Renderer: perspective transform on canvas output. Switch layout in UI between transformed/not transformed
- Scene can have specific duration or framerate
- Open output in another url with sync
- Save state between sessions
- Assets Explorer
