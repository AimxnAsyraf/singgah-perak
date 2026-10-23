# SinggahPerak: Build & Submission Plan

**Today:** Fri 23 Oct 2026 · **Submission deadline:** Thu 29 Oct 2026 (publish@idrperak.com) · **Finals (if shortlisted):** Mon 16 Nov 2026 at Perak Economic Outlook 2027

---

## 1. What we're judged on → what we build for it

The guideline (section 2.1-III) lists six criteria. Every feature below exists to score on at least one of them.

| Criterion | What earns the score | Where it shows |
|---|---|---|
| **Understanding the issue** (Kefahaman isu) | Sourced data: −1.5% international arrivals, the "transit state" problem, flight gaps | Summary §2, "Why" section on the site, video 0:00–0:40 |
| **Innovation & creativity** (Inovasi & kreativiti) | Rail-first trips (not flights), cross-border QR so kampung sellers need nothing new, 5 languages | Planner, booking modal |
| **Impact on Perak** (Impak kepada Negeri Perak) | Nights in Perak, % of spend to kampung sellers, spend spread across districts | Plan stats, dashboard, impact calculator |
| **Feasibility** (Kebolehlaksanaan) | Uses infrastructure that already exists (ETS, DuitNow QR); evidence from real sellers or travellers | Seller page, survey results, summary §6 |
| **Demo quality** (Kualiti demonstrasi) | Working link judges can click; live booking → dashboard update | GitHub Pages link, demo video |
| **Pitching** | Clear 3-minute story with one memorable line | Video, finals pitch |

---

## 2. Features

### ✅ Already built
- Multilingual trip planner (BM, EN, TH, ID, ZH) with 3 origins, 2–4 day plans, 4 interests, Muslim-friendly mode
- Every plan includes nights in Perak and shows % of spend to kampung sellers
- Demo booking with a placeholder QR (stamped DEMO)
- Tourism Perak dashboard: official context figures with sources, sample + live bookings, 3 charts, district map, latest bookings table
- Live demo: book in one tab → dashboard updates in the other
- Submission drafts: summary, video script, checklist

### 🔴 Must have (before 29 Oct)
| # | Feature | Why it matters | Effort |
|---|---|---|---|
| M1 | **Check ETS times with KTMB** and update `core.js` with real departure/arrival times per origin | Feasibility: a judge who knows the trains will catch wrong times | 1–2 h |
| M2 | **"Singgah vs Bermalam" comparison card** on each plan: spending as a day-tripper vs with nights in Perak | Turns the core problem into one number for the pitch | 2 h |
| M3 | **Problem section on the landing page**: 3 sourced stats + "how it works" in 3 steps | Judges who open the link cold understand the idea in 20 seconds | 2 h |
| M4 | **Seller sign-up page** (`seller.html`): a kampung seller registers name, district, type, price and DuitNow QR. Saved on the device and appears in the planner. | Shows the community side, not just a tourist app. This is what makes it *social* innovation. | 4 h |
| M5 | **Impact calculator** on the dashboard: "If X% of the 1.1M target stays 1 extra night → RM Y extra spend, RM Z to kampung sellers". Assumptions labelled clearly. | Impact criterion; a strong slide/poster number | 2–3 h |
| M6 | **Deploy to GitHub Pages** and test the link on a phone | The demo link is a required submission item | 30 min |
| M7 | **Demo video (MP4)** recorded from the live site, as a backup in case the link fails | Prototype material + video are both required | covered on Day 5 |

### 🟡 Should have (if time allows before 29 Oct, otherwise before finals)
| # | Feature | Why |
|---|---|---|
| S1 | **Share plan** button: WhatsApp share link + print/PDF view | Tourists share plans with family; good demo moment |
| S2 | **"Night activity" 🌙 tag** and at least one night activity per day | The state explicitly wants more night activities |
| S3 | **Seller earnings view**: a seller sees bookings and income | Completes the seller story |
| S4 | **Perak Stay & Explore link**: show when a plan qualifies (2 days 1 night or more) | Shows we fit existing state programmes |
| S5 | **More stops**: Taiping Lake Gardens, Royal Belum (Gerik), Kek Lok Tong | More variety; covers more districts |

### 🟢 Could have (for the finals on 16 Nov)
| # | Feature | Note |
|---|---|---|
| C1 | **AI trip assistant** that answers questions in Thai/Indonesian | Needs a small backend so the API key isn't exposed. Only if the core is solid. |
| C2 | **Installable app (PWA)** that works offline | Helps if the exhibition Wi-Fi is bad |
| C3 | **QR on the poster** that opens the planner in the visitor's language | Lets visitors at the showcase try it on their own phone |
| C4 | **Admin filter** on the dashboard (by origin, by month) | Nice for Q&A |

### ⛔ Won't do (state this clearly if asked)
- Real payments or real bookings
- User accounts or logins
- Real seller data without their permission

---

## 3. Evidence (big boost for feasibility)

Do these **in parallel with building**. Even small numbers are better than none.

1. **Traveller survey (Google Form, 5 questions)**: share in Thai, Singaporean and Indonesian travel groups or with friends. Target: 20+ responses by Tue 27 Oct.
   - Have you visited Perak? Did you stay overnight?
   - Would you take the train from Hat Yai / JB to Ipoh?
   - What would make you stay one more night?
   - Would you prefer a homestay/kampung experience?
   - Would you pay with your own banking app QR?
2. **Talk to 2–3 real sellers** (homestay, guide, night stall) by phone or WhatsApp: "Would you list on a platform like this? What do you need?" Write down one quote. If one agrees to be named in the pilot, even better. **Ask permission before using a name.**
3. **Optional:** email Tourism Perak or a homestay association about the idea. Even "we contacted X" helps answer Q&A.

Put the results in the summary §2/§6 and in the video.

---

## 4. Day-by-day plan

| Day | Build | Write / research | Done when |
|---|---|---|---|
| **Fri 23 Oct** | M3 problem section · M6 GitHub Pages (private test first) | Launch traveller survey · message 3 sellers | Survey link shared; landing page explains the problem |
| **Sat 24 Oct** | M4 seller sign-up page | Call KTMB / check KTMB app for ETS times (M1) | A new seller appears in a generated plan |
| **Sun 25 Oct** | M1 real train times · M2 Singgah vs Bermalam card · M5 impact calculator | Fill in the Lampiran A form, get it signed | All numbers on screen are real or labelled as estimates |
| **Mon 26 Oct** | S1 share · S2 night tags · bug fixes · phone testing | Finish the 3-page summary with survey results; export to PDF | Summary PDF ≤ 3 pages |
| **Tue 27 Oct** | Freeze features. Final polish only. | **Record the video** (script in `skrip-video.md`); edit; add subtitles | Video 2–3 min, MP4 exported |
| **Wed 28 Oct** | Make repo public + Pages live (or keep private + MP4 demo) | Upload video to YouTube/Drive ("Anyone with the link"); full checklist review | Every link opens in an incognito window |
| **Thu 29 Oct** | Buffer only | **Send the email in the morning.** Don't wait until night. | Email sent, reply/confirmation saved |

**Rule:** no new features after Tue 27 Oct. Anything unfinished moves to the finals list.

---

## 5. Team roles (max 3 people)

| Role | Owns |
|---|---|
| **Builder** | All features, deployment, demo recording |
| **Researcher / writer** | Survey, seller interviews, KTMB times, summary PDF, Lampiran A |
| **Presenter / designer** | Video script and voice, editing, poster (finals), pitch rehearsal |

If you're solo, follow the day plan in order and skip the Should-have list.

---

## 6. Submission package

| Item | Format | File name |
|---|---|---|
| 1. Lampiran A (entry form) | PDF or JPG/PNG scan, signed | `SinggahPerak_LampiranA.pdf` |
| 2. Project summary | PDF, **max 3 pages** | `SinggahPerak_RingkasanProjek.pdf` |
| 3. Pitch video | MP4/MOV, or a YouTube/Drive link set to "Anyone with the link", **2–3 min** | `SinggahPerak_Video.mp4` |
| 4. Prototype | Demo URL + storyboard PDF or MP4 recording | GitHub Pages link + `SinggahPerak_Demo.mp4` |

### Email template

> **Kepada:** publish@idrperak.com
> **Subjek:** Penyertaan Perak Social Innovation – Hack2Impact 2026: SinggahPerak
>
> Tuan/Puan,
>
> Saya [NAMA], ketua kumpulan [NAMA KUMPULAN / INDIVIDU], ingin menghantar penyertaan bagi Perak Social Innovation – Hack2Impact 2026 di bawah Tema A: Pembangunan Ekonomi dan Daya Saing Negeri.
>
> Tajuk projek: **SinggahPerak: Pakej Pelancongan Berasaskan Kereta Api untuk Pelancong Serantau**
>
> Dilampirkan:
> 1. Borang Penyertaan (Lampiran A)
> 2. Ringkasan Projek (PDF)
> 3. Video Pitching: [PAUTAN]
> 4. Prototaip: [PAUTAN DEMO] dan rakaman demo: [PAUTAN]
>
> Sekian, terima kasih.
>
> [NAMA] · [NO. TELEFON] · [E-MEL]

---

## 7. Demo script (60 seconds, used in the video and at the finals)

1. Open the planner, language **ไทย**. "A tourist from Hat Yai…"
2. Pick 🇹🇭 Thailand, 3 days 2 nights, Heritage → **Build my trip**
3. Point at: **2 nights in Perak**, **% to kampung sellers**, the seller tags
4. Show the Singgah vs Bermalam card (M2)
5. Press **Book** → DEMO QR → Confirm
6. Switch to the dashboard tab → the new booking appears with the green live dot
7. Finish on the impact calculator number (M5)

---

## 8. Risks

| Risk | Plan |
|---|---|
| Train times are wrong | Check with KTMB (M1); keep the "approximate" label |
| Demo link fails during judging | Submit the MP4 demo too; vendor libraries are already bundled |
| Idea copied once the repo is public | Make it public only on 28 Oct; or keep private and submit the MP4 |
| Judges ask "how is this different from Klook?" | Rail-first trips + kampung sellers + state data (see `semakan-penghantaran.md`) |
| Survey gets few responses | Use what you have; be honest about the sample size |
| Running out of time | Must-haves only; skip Should/Could |

---

## 9. If shortlisted: 30 Oct → 16 Nov

| When | Task |
|---|---|
| Week 1 (30 Oct–5 Nov) | Should-have features S3–S5; collect more survey responses; any feedback from IDR |
| Week 2 (6–12 Nov) | **A1 portrait poster** (594 × 841 mm), with a QR to the demo (C3); print it; C2 offline mode |
| 13–15 Nov | Rehearse the 3-minute pitch 10+ times with a timer; practise 5-minute Q&A with a friend asking hard questions |
| **16 Nov** | Bring laptop, tablet/phone, extension wire, display cable, stand, double-sided tape or velcro, phone hotspot, backup MP4 on a USB drive |
