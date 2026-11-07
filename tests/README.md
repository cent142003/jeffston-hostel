# Public website checks

From the repository root, with Node.js 24 and stable Google Chrome installed:

```sh
npm ci --prefix tests --ignore-scripts
npm test --prefix tests
```

The browser suite launches its own headless Chrome profile. It discovers the
stable system installation by default. If Chrome is installed elsewhere, set
`PUPPETEER_EXECUTABLE_PATH` to the full path of its executable.
Nothing needs to be installed in the production site or signed in to Google.

The tests serve the public site on loopback with sample room availability. They
exercise the Google Business Profile website link's campaign parameters and
`#rooms` anchor on a phone-sized screen, including when room data is unavailable.
Reception's public call and WhatsApp destinations are checked without opening
either service. The suite does not send enquiries, reserve beds, or take payments.

GitHub runs the same Node tests on pull requests to `main` under **Public website
checks → Mobile booking and reception**. A pass verifies the proposed website
code. It does not verify what URL is currently saved on Google's listing,
live inventory, or whether anyone answers the phone.
