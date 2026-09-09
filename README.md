# ATHS Robotics & Boris Donald's Science Classes

A no-build, static website for GitHub Pages. It recreates a late-1990s/early-2000s class site while using responsive HTML, CSS, and JavaScript.

## Publish with GitHub Pages

1. Push this folder to the repository's default branch.
2. In GitHub, open **Settings → Pages**.
3. Choose **Deploy from a branch**, then select the default branch and `/ (root)`.

## Add a class post

1. Open the website and select **Make a Post**.
2. Write the post and download the generated JSON file.
3. Move the file into `posts/astronomy`, `posts/physics`, `posts/chemistry`, or `posts/robotics`.
4. Add the new filename to that folder's `index.json`, newest first.
5. Commit and push.

The visitor counter uses CounterAPI when online and falls back to a per-browser count if that service cannot be reached. The site's displayed date and copyright year are generated from the viewer's current date.
