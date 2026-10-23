#!/usr/bin/env python3
"""Pull official KTMB train times into the website.

Downloads KTMB's GTFS Static feed from Malaysia's open data portal
(https://developer.data.gov.my/realtime-api/gtfs-static), picks the ETS
trains SinggahPerak uses for each origin, and writes
public/assets/js/trains.js.

Standard library only. Run from the repo root:

    python3 scripts/update_trains.py              # download the live feed
    python3 scripts/update_trains.py ktmb.zip     # or use a downloaded ZIP
"""

import csv
import datetime as dt
import io
import json
import re
import sys
import urllib.request
import zipfile
from pathlib import Path

FEED_URL = "https://api.data.gov.my/gtfs-static/ktmb"
DOCS_URL = "https://developer.data.gov.my/realtime-api/gtfs-static"
OUT = Path(__file__).resolve().parent.parent / "public" / "assets" / "js" / "trains.js"

# Station name variants, compared after upper-casing and removing dots.
STATIONS = {
    "PADANG BESAR": ["PADANG BESAR"],
    "IPOH": ["IPOH"],
    "JB SENTRAL": ["JB SENTRAL", "JOHOR BAHRU SENTRAL"],
    "KL SENTRAL": ["KL SENTRAL", "KUALA LUMPUR SENTRAL"],
}

# For each origin: the station, and the time windows that fit the trip plan
# (day 1 activities start 15:30; the last day ends with a train after 12:00).
ORIGINS = {
    "th": {"station": "PADANG BESAR", "arrive_dep_from": "07:00", "arrive_by": "15:00"},
    "sg": {"station": "JB SENTRAL", "arrive_dep_from": "06:00", "arrive_by": "15:30"},
    "id": {"station": "KL SENTRAL", "arrive_dep_from": "10:00", "arrive_by": "15:00"},
}
DEPART_AFTER = "12:00"
DAYS_CHECKED = 28  # how far ahead to look when deciding if a train runs daily


def read_csv(z, name):
    if name not in z.namelist():
        return []
    with z.open(name) as f:
        return list(csv.DictReader(io.TextIOWrapper(f, encoding="utf-8-sig")))


def norm(name):
    return re.sub(r"\s+", " ", name.upper().replace(".", "")).strip()


def minutes(t):
    h, m = t.strip().split(":")[:2]
    return int(h) * 60 + int(m)


def pretty(station):
    return station.title().replace("Kl ", "KL ").replace("Jb ", "JB ")


def hhmm(m):
    return f"{(m // 60) % 24:02d}:{m % 60:02d}"


def station_stop_ids(stops):
    """Map each station key to the set of stop_ids (including child platforms)."""
    ids = {k: set() for k in STATIONS}
    for s in stops:
        name = norm(s.get("stop_name", ""))
        for key, aliases in STATIONS.items():
            if any(a in name for a in aliases):
                ids[key].add(s["stop_id"])
    for s in stops:  # platforms whose parent is a matched station
        parent = s.get("parent_station")
        for key in ids:
            if parent and parent in ids[key]:
                ids[key].add(s["stop_id"])
    return ids


def active_days(calendar, calendar_dates, start):
    """service_id -> number of days it runs in the DAYS_CHECKED days from start."""
    weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    days = [start + dt.timedelta(d) for d in range(DAYS_CHECKED)]
    runs = {}
    for c in calendar:
        a = dt.datetime.strptime(c["start_date"], "%Y%m%d").date()
        b = dt.datetime.strptime(c["end_date"], "%Y%m%d").date()
        runs[c["service_id"]] = {d for d in days if a <= d <= b and c[weekdays[d.weekday()]] == "1"}
    for c in calendar_dates:
        d = dt.datetime.strptime(c["date"], "%Y%m%d").date()
        if d not in days:
            continue
        s = runs.setdefault(c["service_id"], set())
        if c["exception_type"] == "1":
            s.add(d)
        elif c["exception_type"] == "2":
            s.discard(d)
    return {k: len(v) for k, v in runs.items()}


def feed_start(calendar, calendar_dates):
    """Today, or the feed's first date if the feed starts in the future."""
    today = dt.date.today()
    dates = [dt.datetime.strptime(c["start_date"], "%Y%m%d").date() for c in calendar]
    dates += [dt.datetime.strptime(c["date"], "%Y%m%d").date() for c in calendar_dates]
    return max(today, min(dates)) if dates else today


def build(z):
    stops = read_csv(z, "stops.txt")
    routes = {r["route_id"]: r for r in read_csv(z, "routes.txt")}
    trips = {t["trip_id"]: t for t in read_csv(z, "trips.txt")}
    calendar = read_csv(z, "calendar.txt")
    calendar_dates = read_csv(z, "calendar_dates.txt")
    feed_info = (read_csv(z, "feed_info.txt") or [{}])[0]

    ids = station_stop_ids(stops)
    missing = [k for k, v in ids.items() if not v]
    if missing:
        names = sorted({s.get("stop_name", "") for s in stops})
        sys.exit(f"Station(s) not found in stops.txt: {missing}\nStop names in feed: {names}")

    start = feed_start(calendar, calendar_dates)
    runs = active_days(calendar, calendar_dates, start)

    # trip_id -> {station key: (arrival_min, departure_min, stop_sequence)}
    at = {}
    station_of = {sid: key for key, v in ids.items() for sid in v}
    with z.open("stop_times.txt") as f:
        for r in csv.DictReader(io.TextIOWrapper(f, encoding="utf-8-sig")):
            key = station_of.get(r["stop_id"])
            if not key or not r.get("departure_time"):
                continue
            at.setdefault(r["trip_id"], {})[key] = (
                minutes(r.get("arrival_time") or r["departure_time"]),
                minutes(r["departure_time"]),
                int(r["stop_sequence"]),
            )

    def label(trip):
        route = routes.get(trip.get("route_id"), {})
        return " ".join(
            x for x in [trip.get("trip_short_name"), route.get("route_short_name"), route.get("route_long_name")] if x
        )

    def is_ets(trip):
        return "ETS" in label(trip).upper() or bool(re.match(r"^E[A-Z]?\s?\d", trip.get("trip_short_name", "")))

    def options(frm, to):
        """All trips calling at frm then to, as dicts; ETS only if the pair has any ETS."""
        out = []
        for tid, st in at.items():
            if frm in st and to in st and st[frm][2] < st[to][2]:
                trip = trips.get(tid, {})
                out.append({
                    "trip": trip, "dep": st[frm][1], "arr": st[to][0],
                    "days": runs.get(trip.get("service_id"), 0),
                })
        ets = [o for o in out if is_ets(o["trip"])]
        out = ets or out
        regular = [o for o in out if o["days"] >= DAYS_CHECKED * 0.7]
        return regular or [o for o in out if o["days"] > 0]

    def describe(o, frm, to):
        trip = o["trip"]
        code = trip.get("trip_short_name") or trip.get("trip_headsign") or trip.get("trip_id")
        return {
            "code": code, "service": label(trip), "from": pretty(frm),
            "to": pretty(to), "dep": hhmm(o["dep"]), "arr": hhmm(o["arr"]),
            "daysPerWeek": round(o["days"] * 7 / DAYS_CHECKED, 1),
        }

    result = {}
    for key, cfg in ORIGINS.items():
        stn = cfg["station"]
        inbound = sorted(
            (o for o in options(stn, "IPOH")
             if o["dep"] >= minutes(cfg["arrive_dep_from"]) and o["arr"] <= minutes(cfg["arrive_by"])),
            key=lambda o: o["dep"],
        )
        outbound = sorted(
            (o for o in options("IPOH", stn) if o["dep"] >= minutes(DEPART_AFTER)), key=lambda o: o["dep"]
        )
        result[key] = {
            # Latest inbound that still fits the day-1 plan; earliest train home after lunch.
            "arrive": describe(inbound[-1], stn, "IPOH") if inbound else None,
            "depart": describe(outbound[0], "IPOH", stn) if outbound else None,
            "inboundPerDay": len(options(stn, "IPOH")),
        }

    return {
        "generated": dt.date.today().isoformat(),
        "checkedFrom": start.isoformat(),
        "feedVersion": feed_info.get("feed_version") or None,
        "feedValidUntil": feed_info.get("feed_end_date") or None,
        "source": "KTMB GTFS Static, data.gov.my",
        "url": DOCS_URL,
        "routes": result,
    }


def main():
    if len(sys.argv) > 1:
        data = Path(sys.argv[1]).read_bytes()
    else:
        print(f"Downloading {FEED_URL} ...")
        with urllib.request.urlopen(FEED_URL, timeout=60) as r:
            data = r.read()
    trains = build(zipfile.ZipFile(io.BytesIO(data)))

    OUT.write_text(
        "// Generated by scripts/update_trains.py from KTMB's official GTFS feed (data.gov.my).\n"
        "// Do not edit by hand: re-run the script to refresh.\n"
        f"const KTMB_TRAINS = {json.dumps(trains, indent=2, ensure_ascii=False)};\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUT}")
    for key, r in trains["routes"].items():
        for leg in ("arrive", "depart"):
            t = r[leg]
            line = "not found" if not t else "{code}  {from} {dep} -> {to} {arr}".format(**t)
            print(f"  {key} {leg:6}: {line}")


if __name__ == "__main__":
    main()
