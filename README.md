

[Dronograph](https://parkertimmins.github.io/dronograph/index.html) is a tool that makes [Spirograph](https://en.wikipedia.org/wiki/Spirograph) designs which can be exported as a path for a drone to fly. The idea is for a drone to fly the path of the design with a light, probably at night. The design can then be captured using an long exposure image.

Concept by [Jeremy Guillory](https://www.instagram.com/jeremy.b.guillory/), coding by Parker Timmins. Look and UI of tool heavily inspired by [SpirographN](http://seedcode.com/SpirographN/sgn.html").

### Quick Tour
* Click 'Animate', and wait for animation to finish
* Click 'KML' and to generate and download kml
* Open kml file in Google Earth to inspect path on Earth's surface
    * It's easier if you install [Google Earth Pro](https://www.google.com/earth/versions/#download-pro) locally, but Google Earth Web also supports uploading KML files
* Add/Remove rotors with different radii and repeat Animation and KML download


### Controls
##### Design Controls

* Stator radius - The stator is the main circle that doesn't move. You can change its radius, but this will only be necessary to make sure the design as a whole fits within the display. Value should be between 1 and about 300.

* Rotors - The rotors are the moving circles that roll in or around the stator or the previous rotor. There must be at least one rotor. To delete a rotor click the red 'x' to the left of the h/e radio option. To add a new rotor, click 'Add Rotor' button. Each rotor has a radius, this can be smaller or larger than the previous rotor's radius. When a new rotor is added it's radius it set to half of the preceding
 circle's radius, but this can be changed. Rotors that roll on the inside of the preceding circle are called Hypotrochoid, and those that roll on the outside are Epitrochoids - click the h or e to toggle between these options.

* Pen Radius - distance from the center of the last rotor to the point that draws the design. If you set this to the radius of the last rotor, the design will be along the edge of the last rotor.

* Sample Points - number of points that are output in the path for a drone to fly. The default is set to 300, but many drone controllers only allows 99 waypoints. With this few waypoints, if the design is at all complicated, it will not look smooth. This problem can be partially fixed by controllers like FlyLitchi, which can smooth between waypoints. Even so, for complicated designs, a controller which allows more waypoints, like Autopilot, will be necessary.

* Start segment degrees / End segment degrees - These control where the first rotor starts and ends on a given design. The default values of 0 and 720 mean that the primary rotor will start at 0 degrees (the right side of the stator) and go counterclockwise 720 degrees, or two times around the stator. For the rotors in the default design, two times around the circle are enough to complete the design. For other designs higher 'End Segment degrees' will be needed to complete the design. A design can also be split into multiple pieces using these controls. For example the default design could be run once wi
th 0 - 360 and once with 360 - 720. These could each be output as a path with 99 waypoints. Having a drone fly each of these paths separately would allow for the design to be twice as detailed.



##### Display Controls
* Animate - Show the spirograph being created, along with the Stator and Rotors. Can choose animation speed of Slow/Medium/Fast
* Show - Skip the animation and show the final design, this is often useful when you've already made the design but you want to tweak Sample Points or Start/End segment degrees


##### Output file Controls
* Lat, Long - A comma separated Latitude and Longitude for the center of the design in the real world. This is the point which the drone will fly around.
* Real scale of radius (meters) - The radius of the design in the real world. This is the distance from the center Lat/Long which the drone be at when it starts flying (assuming Start Segment degrees is 0). The drone will usually flying within this radius, but it is possible to go outside if any rotor has a larger radius than its parent circle.
* Altitude - The altitude of the drone relative to the takeoff point when flown in the real world. The 'Autopilot' app will ignore this value and use a separate 'default altitude' controlled from the app.

* KML - Output KML file of drone path. This is required for Autopilot app. The waypoints have an altitude value but this will be ignored by Autopilot.
* CSV - Output a csv file of drone path. Recommended for FlyLitchi.



