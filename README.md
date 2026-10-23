# SinggahPerak 🚆

**Jangan sekadar singgah. Bermalamlah di Perak.**
*Don't just pass through. Stay the night in Perak.*

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
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` in a browser. Chart.js and Leaflet are vendored in `assets/vendor/`, so everything except the map tiles works offline.

**Live demo for judges:**
1. On `seller.html`, register a kampung seller in Kuala Kangsar.
2. On the planner, build a 🇹🇭 Thailand, 3 days 2 nights, Heritage trip. The new seller appears under "Peniaga komuniti baharu di laluan anda". Add them, and the kampung share goes up.
3. Book the trip. On the dashboard (open in a second tab), the booking appears immediately with a green "Langsung" dot.
4. Scroll to the impact calculator and change the assumptions.

## Structure

```
index.html            Trip planner (tourist view)
dashboard.html        Tourism Perak dashboard + impact calculator (state view)
seller.html           Seller sign-up (kampung seller view)
assets/js/core.js     Origins, stops, sellers, trip builder, demo bookings
assets/js/i18n.js     UI strings in 5 languages
assets/js/planner.js  Planner page
assets/js/dashboard.js Dashboard page
assets/js/seller.js   Seller sign-up page
assets/css/style.css  Styles (light + dark mode)
docs/                 Submission drafts (summary, video script, checklist)
```

## Honest limitations (prototype)

- **Train times come from a third-party site** (train36.com: Padang Besar timetable of 30 Aug 2025, JB Sentral timetable of Feb 2026). A newer KTMB timetable took effect on 1 June 2026, so confirm with KTMB before using them in the proposal. Update them in `ORIGINS` in `assets/js/core.js`.
- **Seller sign-ups are saved only in the browser** (localStorage). The DuitNow ID field is not stored or checked.
- **The impact calculator gives estimates, not forecasts.** It multiplies the state's 2026 target by your assumptions.
- **All seller names are sample data** and marked "Contoh" in the UI.
- **The QR code is a placeholder.** No payment is made.
- Dashboard numbers under "Data prototaip" are generated sample bookings. Only the "Konteks" tiles are real figures (with sources).

## Submission

Deadline: **Thursday, 29 October 2026**, to publish@idrperak.com. See [`docs/build-plan.md`](docs/build-plan.md) for the build schedule and [`docs/semakan-penghantaran.md`](docs/semakan-penghantaran.md) for the checklist.

Libraries: [Chart.js](https://www.chartjs.org/) 4.4.1 (MIT), [Leaflet](https://leafletjs.com/) 1.9.4 (BSD-2). Map data © OpenStreetMap contributors.
