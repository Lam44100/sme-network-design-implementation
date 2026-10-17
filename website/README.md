# Network explainer webpage

A dependency-free HTML/CSS/JavaScript MVP for presenting the existing Packet Tracer project. It includes device details, forward/reply paths, a conceptual EtherChannel outage control, addressing, design notes, original evidence, instructions, attribution, and real downloads.

## Open locally

Run `python website/build.py` from the repository root, then open `website/dist/index.html` directly in a browser. If you received the standalone webpage ZIP, extract it and open its `index.html`; no build is needed. All content and scripts are local; no CDN, API, account, or installation is required to view the built page. Clipboard access may require a local HTTP server; the Copy button selects the commands for manual copying when clipboard access is unavailable.

For a local web server, run `python -m http.server 8765 --bind 127.0.0.1 --directory website/dist` from the repository root, then open `http://127.0.0.1:8765`.

## Edit and rebuild

Edit `index.html`, `styles.css`, `network.js`, or `app.js` in this folder. Run `python website/build.py` from the repository root to update the portable distribution and copy the current network documentation/downloads. Python 3 uses only its standard library.

`network.js` models the documented routes. It does not implement IOS, DHCP, ACLs, LACP negotiation, timing, ARP, or packet delivery. Both directions of inter-VLAN traffic pass through R1, including endpoints attached to the same switch. The link toggles change this explanatory model only.

Run `node --test website/network.test.cjs` to check model behavior. These checks validate the webpage's explanations, **not the Packet Tracer lab**. There is no live network integration.

## Host on Vercel

The initial Vercel release uploads only the four webpage files, images under `assets/`, and this folder's `vercel.json` as the deployment-root configuration. Its download routes redirect to the public GitHub repository; lab files and configurations are not copied to Vercel. This direct deployment does not enable automatic deployment on GitHub pushes.

Import the GitHub repository into Vercel with the repository root as the Root Directory. The root `vercel.json` runs the existing model tests, builds with `python3 website/build.py`, and publishes only `website/dist`. No environment variables or package installation are required. When the GitHub integration is connected, pushes to the production branch trigger a new deployment.

Alternatively, deploy from the repository root with `npx vercel --prod` after signing in to Vercel.

## Host on GitHub Pages

The entire `dist` folder is portable and uses relative URLs, including for project-subpath hosting. A manual GitHub Pages workflow is included at the repository root:

1. Push this project to your GitHub repository.
2. Under **Settings → Pages**, choose **GitHub Actions** as the source.
3. Under **Actions → Deploy network explainer**, choose **Run workflow**.

The workflow rebuilds the static distribution, tests the explanatory model, and deploys only `website/dist`. It has no push trigger and does not publish until manually run. Alternatively, upload the contents of `dist` to any static hosting service. This task does not change your GitHub repository settings or audience.

Workflow reference: [GitHub's official custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

The downloadable project ZIP includes the website source and publishing workflow but excludes generated output to avoid recursive archives. Original `.pkt` and `.ios` hashes are checked against the integrity manifest during packaging. Historical evidence remains labelled as such.
