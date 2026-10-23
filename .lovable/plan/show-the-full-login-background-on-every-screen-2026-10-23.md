# Show the full login background on every screen

## Problem
The background photo is stretched to fill the screen, so on screens that are taller or narrower than the photo (most laptops, tablets, phones), its edges get cut off: the logo, headline, or copyright can slip off screen.

## Fix
- **Large desktop (wide screens):** the photo is always shown whole, never cropped. It sits at the top-left at its natural shape, and any extra space around it is filled with a soft white-to-powder-blue wash that matches the photo's edges, so there is no visible seam. The sign-in card stays floating on the right, over the empty office area of the photo.
- **Tablet and phone:** the page stacks vertically. The full photo appears at the top at full width, uncropped, so the logo, headline, man at the desk and blue curves are all visible. The sign-in card sits directly below it, overlapping the bottom of the photo slightly so it looks connected, then the page scrolls normally.
- The card keeps the same contents (email, password, Log in, Google, Demo access buttons).

## Verification
- Screenshot the login page at desktop (1440x810 and 1280x1024), tablet (820x1180) and phone (390x844) and confirm the whole photo is visible each time and the card is readable and not covering the headline or logo.
- Confirm both demo buttons still open their dashboards.

## Technical details
- `src/routes/index.tsx` only. Replace the `absolute inset-0 object-cover` image with an `aspect-[16/9]` container and `object-contain`.
- Desktop (`lg` and wide aspect): wrapper `bg-gradient` using existing powder tokens; image `w-full max-h-screen object-contain object-left-top`; card absolutely positioned right, vertically centered within the photo area.
- Below `lg`: image `w-full h-auto` block, card `-mt-12 mx-auto max-w-[440px] relative`, page scrolls.
