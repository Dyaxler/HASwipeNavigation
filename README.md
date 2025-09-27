# HASwipeNavigation

A [Home Assistant](https://www.home-assistant.io/) swipe navigation helper for touch enabled screens.

Useful for navigating between your preferred dashboards on a clean Raspberry Pi Touch Display 2 in kiosk mode. I have two other dashboards I can swipe to. One with camera feeds and one for controlling lights and displaying other small tidbits of info. My PI touch device is Chrome in Kiosk mode and only works with Home Assistant. This script also plays nice and compliments [HASlideShow](https://github.com/Dyaxler/HASlideshow/).

Before proceeding to manual installation, create one or more `Kiosk` type tabs in Home Assistant and make notes of their URL. If you're like me and don't want a bunch of custom `Kiosk` tabs showing up in your mobile app or desktop environments, you can hide certain tabs from users by clicking the Pencil Icon next to the name or icon of the tab you're on (Edit view), select the Visibility tab, and turn off users you don’t want to see this tab. I have a separate user account for all my Touch Displays with these enabled. They will all show up when you’re in Edit Dashboard Mode so don’t worry about not being able to edit these later.

## Manual install

NOTE: This file requires editing before you upload it into Home Assistant. Please read the code comments on lines 29 & 70. These `paths` will need to be updated first. It's ok if you're unfamiliar with JavaScript. The code is easy to read and the changes that need to be made is obvious.

There are several other tweaks you can make beginning with line 57 (example: minSwipeDistance). The code comments are straight forward as to what these do specifically. I honestly don't see a need to mess with these settings unless you have an old touch device that's a little slow. These settings work perfectly on Raspberry PI Touch Screens or third-party screens that work with PI.

1. Download the `HASwipeNavigation.js` script and place it into a new: `www/HASwipeNavigation` folder of your Home Assistant installation. (Edit file first - see note above.) OPTIONAL: It's not neccessary to create a subfolder named `HASwipeNavigation` - you can just upload it into the `www` directory. Just make sure you're using the correct path in Step #3.

2. In Home Assistant, navigate to `Settings` > `Dashboards`, open the three-dots menu and select `resources`; alternatively, point your browser to `/config/lovelace/resources`.

3. Add a new resource as a _javascript module_ pointing to the `/local/HASwipeNavigation/HASwipeNavigation.js` URL. OPTIONAL: `/local/HASwipeNavigation.js` see note in Step #1.
   
4. This normally works for me short of rebooting Home Assistant, go to Developer Tools --> YAML and reload `All YAML configuration`.

5. Use `CTRL + SHIFT + R` to bypass the cache (works with most Windows OS Browsers - not sure what key strokes are on the Mac). This is sometimes necessary to perform this step if swiping doesn't work. Certain browsers are persnickety. NOTE: In `HA Desktop` depending on how you setup Kiosk mode in HA; HASwipeNavigation will not work unless its in Kiosk mode. I use the Browser Mod addon in HA and I just simply append `?kiosk` to my dash URL to put it into Kiosk mode. You can also use Browser Mod to `refresh` your browser without having to reboot your touch screen fully to test swiping. The `Kiosk` check is 100% neccessary since this JS affects all of HA's Dashboard Tabs and you don't want this code running on other tabs that aren't in Kiosk mode.

## Troubleshooting

Any change to the JS Script might require clearing the cache of your browser or the companion mobile app. If step #4 above doesn't work, then reboot Home Assistant but this should only need to be done upon first creating the resource in step #2. Further edits to the JS file will only require a `CTRL + SHIFT + R` in the Desktop environment. HA's caching can be a bit of a pain when you're trying to troubleshoot stuff. Browser Mod is an excellent tool for managing Kiosk screens. The refresh feature is super quick and has worked 100% for me each time I wanted to make a code change; especially when I'm editing the individual `Kiosk Tabs` to make sure all the buttons line up and everything is centered etc.
