# ATHS Robotics & Boris Donald's Science Classes

A no-build, static website for GitHub Pages. It recreates a late-1990s/early-2000s class site while using responsive HTML, CSS, and JavaScript.

## Directory Structure

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

ATHS Robotics & Boris Donald's Science Classes/
├── .git/
├── 404.html
├── README.md
├── assets/
│   ├── (static resources, images, stylesheets, scripts)
├── downloads/
│   ├── (downloadable files or resources)
├── index.html
├── pages/
│   ├── (individual pages or sections of the site)
├── posts/
│   ├── astronomy/
│   │   ├── (astronomy-related posts and index.json)
│   ├── chemistry/
│   │   ├── (chemistry-related posts and index.json)
│   ├── physics/
│   │   ├── (physics-related posts and index.json)
│   ├── robotics/
│   │   ├── (robotics-related posts and index.json)
├── tests/
│   ├── (test files for the project)
