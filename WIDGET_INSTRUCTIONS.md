# Developer Instructions: Integrating the ARC Booking & Events Widget

This document provides instructions for the developer (or AI developer agent) responsible for building/updating this website to integrate the new unified ARC Booking & Events widget.

## Objective
Replace any old, fragmented, or inline widget scripts on the pages with the unified and configurable widget template provided in [arc-widget-template.js](file:///Users/ceesoddens/AI_Projecten/EigenWebsite/arc-widget-template.js).

---

## 1. Widget Locations & Modes

Currently, the pages are configured as follows:
* **Home Page (`index.html`) & Showreel (`showreel.html`):** 
  * Uses the **standard booking widget** (tables reservations & gift cards).
  * Configuration: `mode: "booking"`, `position: "fixed"`.
* **Storyboards Page (`storyboard.html`) & AI Agents Page (`agents.html`):**
  * Uses the **events/hall booking widget** (single button opening a large overlay).
  * Configuration: `mode: "events"`, `position: "fixed"`.

---

## 2. Integration Steps

For each HTML file, perform the following steps:

1. **Locate the old widget code:** Find the `<!-- ARC Booking Widget Button -->` or `<!-- ARC Evenementen Widget -->` comment and its corresponding container `<div>` and `<script>` tags at the very bottom of the page (right before the closing `</body>` tag).
2. **Replace with the Template Code:** Copy the entire contents of [arc-widget-template.js](file:///Users/ceesoddens/AI_Projecten/EigenWebsite/arc-widget-template.js) and paste it inside a `<script>` tag. Ensure the corresponding HTML container is also present:
   ```html
   <!-- ARC Widget Container -->
   <div id="arc-widget-container"></div>
   
   <!-- ARC Widget Script -->
   <script>
     // Paste the contents of arc-widget-template.js here
   </script>
   ```
3. **Configure the Page-Specific Settings:** Adjust the `CONFIG` object at the top of the script according to the page requirements.

---

## 3. Important Configuration Notes

### 📌 Keep Position Fixed (`position: "fixed"`)
* **Why:** The website uses full-screen media assets, heavy video backgrounds, and unique layout offsets (especially on pages like `storyboard.html` and `agents.html`). If the button is rendered inline at the bottom of the page, it will be pushed below the fold and become invisible.
* **How:** Always set `"position": "fixed"` for these pages. This anchors the buttons at the bottom-right of the viewport (`bottom: 24px; right: 24px; z-index: 999999`) so they always float nicely above all background layers.

### 📌 Modus (`mode`)
* Set to `"booking"` to display the standard **Reserveren** + **Cadeaubon** buttons.
* Set to `"events"` to display the single **Evenement of zaal boeken** button.
* Set to `"both"` to show all three buttons side-by-side.

### 📌 Restaurant ID (`restaurantId`)
* Currently set to `"IVTBpFtSaHL7jragotiu"` for Cees Oddens.
* To deploy this for other restaurants, simply change this string to their corresponding ARC restaurant ID.

---

## 4. Verification Check
After updating a page:
1. Reload the page (clear cache/hard refresh: `Ctrl + F5` or `Cmd + Shift + R`).
2. Verify the widget button(s) fade in and appear fixed in the bottom-right corner.
3. Click the button(s) and verify the booking/events iframe opens in a clean modal overlay.
