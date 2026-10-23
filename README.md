# SinggahPerak 🚆

**Jangan sekadar singgah. Bermalamlah di Perak.**
*Don't just pass through. Stay the night in Perak.*

New here? Read [`docs/how-it-works.md`](docs/how-it-works.md) for the full flow and how the code fits together.

Prototype for **Perak Social Innovation – Hack2Impact 2026** (Institut Darul Ridzuan).
Theme: **A. Pembangunan Ekonomi dan Daya Saing Negeri**, covering tourism (pelancongan), entrepreneurship (keusahawanan) and jobs (peluang pekerjaan).

## The problem

- International tourist arrivals to Perak **fell about 1.5% in 2025**. The state blamed the lack of Singapore–Ipoh flights and the global oil crisis. Domestic overnight arrivals rose to 10.4 million. ([The Star, 26 Jun 2026](https://www.thestar.com.my/metro/metro-news/2026/06/26/foreign-visitors-down-domestic-tourists-up-in-perak))
- Many tourists **only stop briefly in Perak, then spend the night in Penang or KL**. The state wants longer stays and more night activities. ([RTM](https://berita.rtm.gov.my/niaga/senarai-berita-niaga/senarai-artikel/perak-fokus-tingkat-penginapan-pelancong-tarik-pelabur-hotel-antarabangsa/))
- 2026 target: **1.1 million international tourists**, focused on Thailand, Indonesia, Singapore and southern China. ([The Sun, 2026](https://thesun.my/news/malaysia-news/people-issues/perak-targets-regional-tourists-from-thailand-indonesia-and-singapore-for-vm2026/))

## The idea

Rail-first trip packages that make Perak a place to stay, not a stopover:

1. **Multilingual trip planner** (BM, English, Thai, Bahasa Indonesia, Chinese). Plans follow ETS train routes from the Thai border (Padang Besar), the Singapore border (JB Sentral) and KL, and always include at least one night in Perak.
2. **Kampung sellers on the platform.** Homestays, guides, night stalls and craft makers get bookings directly. Thai, Indonesian and Singaporean visitors can pay with their own banking apps at DuitNow QR merchants, so small sellers need no new system.
3. **Tourism Perak dashboard.** Shows length of stay, spending by district and visitors' countries: the numbers the state is trying to improve.

## Run it

It's a static site with no build step and no dependencies to install.

```bash
python3 -m http.server 8000 --directory public
# open http://localhost:8000
```

Or just open `public/index.html` in a browser. Chart.js and Leaflet are vendored in `public/assets/vendor/`, so everything except the map tiles works offline.

**Live demo for judges:**
1. On `seller.html`, register a kampung seller in Kuala Kangsar.
2. On the planner, build a 🇹🇭 Thailand, 3 days 2 nights, Heritage trip. The new seller appears under "Peniaga komuniti baharu di laluan anda". Add them, and the kampung share goes up.
3. Book the trip. On the dashboard (open in a second tab), the booking appears immediately with a green "Langsung" dot.
4. Scroll to the impact calculator and change the assumptions.

## Deploy (Cloudflare Pages)

Connect the repo in Cloudflare (**Workers & Pages → Create application → Pages → Connect to Git**) with:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None |
| Build command | *(empty)* |
| Build output directory | `public` |

Only `public/` is served, so `docs/` and the README stay in GitHub. Every push to `main` redeploys.

## Update train times (official KTMB data)

KTMB's timetable is published as a GTFS feed on Malaysia's open data portal ([data.gov.my GTFS Static API](https://developer.data.gov.my/realtime-api/gtfs-static)). The script downloads it, picks the ETS trains that fit each trip plan, and writes `public/assets/js/trains.js`:

```bash
python3 scripts/update_trains.py            # downloads https://api.data.gov.my/gtfs-static/ktmb
python3 scripts/update_trains.py ktmb.zip   # or use a ZIP you downloaded yourself
```

It needs only Python 3 (no installs). It prints the trains it picked; commit `trains.js` afterwards. The planner then shows "Jadual rasmi KTMB" with the date the data was pulled.

## Structure

```
public/                      The website (the only folder that gets deployed)
  index.html                 Trip planner (tourist view)
  dashboard.html             Tourism Perak dashboard + impact calculator (state view)
  seller.html                Seller sign-up (kampung seller view)
  assets/js/core.js          Origins, stops, sellers, trip builder, demo bookings
  assets/js/i18n.js          UI strings in 5 languages
  assets/js/planner.js       Planner page
  assets/js/dashboard.js     Dashboard page
  assets/js/seller.js        Seller sign-up page
  assets/css/style.css       Styles (light + dark mode)
  assets/js/trains.js        Official KTMB train times (generated, don't edit)
scripts/update_trains.py     Pulls KTMB's GTFS feed into trains.js
docs/                        Submission drafts (not deployed)
```

## Honest limitations (prototype)

- **Train times:** the planner uses KTMB's official timetable once `scripts/update_trains.py` has been run (see "Update train times" above). Until then it falls back to times from a third-party site (train36.com), labelled as such.
- **Seller sign-ups are saved only in the browser** (localStorage). The DuitNow ID field is not stored or checked.
- **The impact calculator gives estimates, not forecasts.** It multiplies the state's 2026 target by your assumptions.
- **All seller names are sample data** and marked "Contoh" in the UI.
- **The QR code is a placeholder.** No payment is made.
- Dashboard numbers under "Data prototaip" are generated sample bookings. Only the "Konteks" tiles are real figures (with sources).

## Submission

Deadline: **Thursday, 29 October 2026**, to publish@idrperak.com. See [`docs/build-plan.md`](docs/build-plan.md) for the build schedule and [`docs/semakan-penghantaran.md`](docs/semakan-penghantaran.md) for the checklist.

Libraries: [Chart.js](https://www.chartjs.org/) 4.4.1 (MIT), [Leaflet](https://leafletjs.com/) 1.9.4 (BSD-2). Map data © OpenStreetMap contributors.
