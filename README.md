# Validata

AI-assisted product idea validation — scores product ideas 1–10 across four pillars (Demand, Innovation, Execution, Monetization).

## What's here

`index.html` is a self-contained, interactive frontend mockup: marketing landing page + an in-browser "dashboard" app (idea scoring, Deep Scan, Product/Supplier Finder, Viral Finder, YouTube Ideas generator, 10/10 Finder, Photo Scan, a small toolkit, and a roadmap board).

Scoring, competitor lists, suppliers, etc. are all **deterministic client-side placeholders** (hashed from your input text) — there is no backend yet. See "Next steps" below for what turns this into a real product.

## Running it locally

No build step. Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

This repo is set up to be served as a static site (e.g. GitHub Pages: Settings → Pages → Deploy from branch → this branch, root folder).

## Next steps (real backend)

- Auth + Postgres persistence (per-user validation history)
- Real AI scoring endpoint (replace the deterministic hash scoring)
- Stripe: create the Explorer / Founder / Scale products & prices, wire checkout + webhooks
- License key email delivery
- Deep Scan / Product Finder / Viral Finder / YouTube Ideas as real async jobs backed by actual research
