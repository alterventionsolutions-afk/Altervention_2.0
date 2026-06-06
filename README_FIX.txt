ALTERVENTION mobile slideshow fix

What changed:
1. Mobile hero now uses aspect-ratio: 16/9 and background-size: contain.
2. This prevents your landscape banner text/images from being cropped on portrait phones.
3. Extra dark overlay is reduced on mobile so the uploaded banner designs remain clear.
4. Swipe support was added for mobile slideshow navigation.
5. Images are placed in /public/1.jpeg ... /public/5.jpeg to match index.html.

Upload these files to GitHub/Vercel:
- index.html
- vercel.json
- company_logo.jpeg
- public/1.jpeg to public/5.jpeg

If your project uses separate CSS/JS, also keep styles.css and shared.js.
