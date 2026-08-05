# Octagonal_Torus — a 25 × 25 mm octagonal torus, derived from scratch and buildable at any size

Complete record: the trigonometry, the generator, the corrections, and the verified cut list.

**Worked example:** an octagonal torus with a 25.000 × 25.000 mm square cross-section, outer octagon
at R 90, cut from 3 mm material. Verified cut file: **[`BuildA1_90_25.svg`](BuildA1_90_25.svg)**,
reproduced end to end from Route A.

**Your own size.** Nothing here is fixed to 90 and 25. The whole object follows from **three
numbers** you choose:

| | this example | yours |
|---|---|---|
| Outer octagon radius, corner to centre | 90 | any |
| Ring — the square cross-section | 25 | any |
| Material thickness | 3 | any |

Everything else is derived. `torus-geometry-diagram.js` computes the resulting dimensions for you
(see below the figure), Part 12 gives the general formula, and Route A generates the parts. The
worked numbers are a demonstration, not a constraint — so if you want a 300 mm ring in 6 mm ply, the
method is unchanged and only the arithmetic differs.

![The verified geometry: a plan section through a plate showing the four octagon boundaries and the 25 mm ring, and a radial cross-section of the 25 × 25 cavity](torus-geometry-diagram.svg)

**That figure is generated, not drawn.** `torus-geometry-diagram.js` computes every line, label and
dimension from three numbers, so it always agrees with the arithmetic in this document instead of
being an artist's impression of it.

```
node torus-geometry-diagram.js 90 25 3
                               │  │  └─ material thickness
                               │  └──── the ring you want, face to face
                               └─────── outer octagon radius, corner to centre
```

Those three are what the whole build is defined by. Change any of them and the figure redraws for
*your* geometry — the octagons resize, the shaded bands move, every dimension and the formula in the
title recalculate.

It also prints the numbers, which makes it a calculator even when you do not want the picture:

```
$ node torus-geometry-diagram.js 120 30 6
outer octagon  R 120       apothem 110.866   wall out to 116.866
inner octagon  R 81.034    apothem 74.866    wall out to 80.866
ring           110.866 − 80.866 = 30
outside flats  233.731   bore flats 149.731
```

So a 120 mm octagon with a 30 mm ring in 6 mm material needs an inner octagon of **R 81.034** — the
number you would type into boxes.py as run 2. That is Part 12's formula done for you.

**It draws a picture; it does not make cut files.** For parts, use Route A.

---

# PART 0 — Build it

### Get the files

- **[`BuildA1_90_25.svg`](BuildA1_90_25.svg)** — the cut file. On GitHub use the ⤓ *Download raw
  file* button; clicking the name only previews it.
- **[Everything as a ZIP](https://github.com/Gernreich/octagonal-torus/archive/refs/heads/main.zip)**
  — cut file, this writeup, the diagram, the verification tools.
- **[Repository](https://github.com/Gernreich/octagonal-torus)** — every file named below lives here.

---

**18 pieces of material:** 2 plates + 8 outer panels + 8 inner panels. (That is 34 cut contours —
each plate is a rim plus a stitched hole — which is why Part 10 verifies 20.)

Assembled: **25.000 mm radial × 25.000 mm axial**, 172.298 across the flats outside, 110.298 bore.

**What the parts are.** The two plates are the torus's top and bottom faces — annular, 25 mm wide.
The 8 outer panels form its outside wall, the 8 inner panels its bore wall. Each set of 8 is
**4 long + 4 short, alternating**, because that is how a polygon tube closes with rectangular
fingers (§6b).

## Route A — generate from scratch at boxes.hackerspace-bamberg.de

Three runs, because the plate hole and the inner panels come from **different radii**.

**Run 1 — outer tube.** RegularBox: `radius_bottom = radius_top = 90`, `h = 25`, `n = 8`,
`thickness = 3`, `burn = 0.1`, `top`/`bottom` = closed, `outside` unchecked.
→ Keep **both discs** and all **8 panels**.

**Run 2 — inner panels.** Same settings, `radius = 59.693`.
→ Keep the **8 panels** only. Discard its discs.

**Run 3 — the hole cutter.** Same settings, `radius = 56.446`. (`h` is irrelevant here — you only
want the disc outline.)
→ Keep **one disc**; it is the cutter for both plates. Discard everything else.

**Then:** invert that 56.446 disc and use it to cut the hole in each of the two outer discs.

### How the inversion was done

In **Inkscape**: break the inner octagon outline into its **eight segments** — one per face — and
flip each segment. The eight flipped segments together are the hole; place them concentric on each
outer disc and cut.

Flipping a segment does two things at once, and Part 8 is about both:

- it **mirrors the tab-and-notch pattern**, which is the phase swap the joint needs (§8b), and
- it **lands the band one material thickness further out**, which is the ±3 mm shift you
  pre-compensate for by generating run 3 at 56.446 rather than 59.693 (§8a).

The eight flipped segments come out as eight separate contours, so the hole starts life as eight
open polylines rather than one closed outline.

**Stitching them back together — optional.** In `BuildA1_90_25.svg` the eight were joined into a
single closed loop per plate, which is why `verify.js` reports `hole contours: 2  (1 per plate)`
rather than 16. **This is probably unnecessary.** Measured before stitching, the largest gap between
one segment's endpoint and its neighbour's was **0.077 mm** — smaller than the 0.1 mm `burn`, and
smaller still than a real beam, so the cuts overlap and the waste drops out regardless.

Stitch anyway if your laser software applies its *own* kerf compensation, since offsetting needs
closed paths to know which side is inside. But if it does, turn that off: `burn = 0.1` is already in
the geometry, and compensating twice loosens every joint by another 0.1–0.2 mm — a far worse problem
than a 0.077 mm gap.

**This process is demonstrated step by step in the video.**

Verified example of exactly this: [`RunA1_R90.svg`](RunA1_R90.svg),
[`RunA2_R59Point693.svg`](RunA2_R59Point693.svg), [`RunA3_R56Point446.svg`](RunA3_R56Point446.svg),
assembled into **[`BuildA1_90_25.svg`](BuildA1_90_25.svg)**. All three runs reproduced the
pristine O90 / O59 / O56 files to the last digit — same boundary lines, same finger intervals.

### The three runs as links

Each carries every setting — `thickness=3.0`, `burn=0.1`, `finger=2.0`, `space=2.0`,
`surroundingspaces=1.0`, `play=0.0` — so the form comes up fully populated. Recovered from the
`dc:source` provenance that boxes.py embeds in each generated file.

- [Run 1 — outer tube, R 90](https://boxes.hackerspace-bamberg.de/RegularBox?FingerJoint_style=rectangular&FingerJoint_surroundingspaces=1.0&FingerJoint_bottom_lip=0.0&FingerJoint_edge_width=1.0&FingerJoint_extra_length=0.0&FingerJoint_finger=2.0&FingerJoint_play=0.0&FingerJoint_space=2.0&FingerJoint_width=1.0&h=25&outside=0&radius_bottom=90&radius_top=90&n=8&top=closed&alignment_pins=1.0&bottom=closed&thickness=3.0&burn=0.1&format=svg&labels=0&labels=1&reference=100.0&tabs=0.0&qr_code=0&inner_corners=loop&spacing=0.5&debug=0&language=en&render=0)
- [Run 2 — inner panels, R 59.693](https://boxes.hackerspace-bamberg.de/RegularBox?FingerJoint_style=rectangular&FingerJoint_surroundingspaces=1.0&FingerJoint_bottom_lip=0.0&FingerJoint_edge_width=1.0&FingerJoint_extra_length=0.0&FingerJoint_finger=2.0&FingerJoint_play=0.0&FingerJoint_space=2.0&FingerJoint_width=1.0&h=25&outside=0&radius_bottom=59.693&radius_top=59.693&n=8&top=closed&alignment_pins=1.0&bottom=closed&thickness=3.0&burn=0.1&format=svg&labels=0&labels=1&reference=100.0&tabs=0.0&qr_code=0&inner_corners=loop&spacing=0.5&debug=0&language=en&render=0)
- [Run 3 — hole cutter, R 56.446](https://boxes.hackerspace-bamberg.de/RegularBox?FingerJoint_style=rectangular&FingerJoint_surroundingspaces=1.0&FingerJoint_bottom_lip=0.0&FingerJoint_edge_width=1.0&FingerJoint_extra_length=0.0&FingerJoint_finger=2.0&FingerJoint_play=0.0&FingerJoint_space=2.0&FingerJoint_width=1.0&h=25&outside=0&radius_bottom=56.446&radius_top=56.446&n=8&top=closed&alignment_pins=1.0&bottom=closed&thickness=3.0&burn=0.1&format=svg&labels=0&labels=1&reference=100.0&tabs=0.0&qr_code=0&inner_corners=loop&spacing=0.5&debug=0&language=en&render=0)

### Why run 3 uses 56.446 and not 59.693

Inverting moves a part outward by one tab depth — 3 mm — and never leaves it in place (Part 8a). So
you type a radius 3 mm of apothem *smaller* than where you want it to land:

```
56.446  →  disc at apothem 52.149 / 55.149
invert  →  lands at 55.149 / 58.149   ✓ exactly where the hole belongs
```

Invert the 59.693 disc instead and it lands at 58.149 / 61.149 — a **22 mm** ring.

## Route B — shortcut, cut the finished file

**[`BuildA1_90_25.svg`](BuildA1_90_25.svg)** is those 18 pieces already laid out — assembled by exactly the Route A steps
above, and verified: 20 contours, holes concentric with their plates, joint phase complementary,
no overlaps.
Cut it as-is.

It is specific to **this** build — R 90 outer, 25 × 25 mm cross-section, 3 mm material. At any other
size or thickness use Route A, or Part 12 for the general formulas; none of the widths carry over.

Part 10 says what every other file here is.

## Before cutting the full sheet

Dry-fit **one plate and one inner panel** in cardboard. The plate's tabs around the hole should drop
into the panel's notches.

- Line up → cut everything
- Land between the notches → change `surroundingspaces` from 1.0 and regenerate (12 mm pitch, so a
  half-pitch is 6 mm)
- Too tight → set `play` to 0.05–0.1

Coordinates can prove every dimension here but not this registration, and it is the one thing that
has actually failed.

## Check before cutting

| measure | should read |
|---|---|
| plate outer rim, across flats | **166.30** |
| plate hole, across flats (tip to tip) | **110.30** |
| inner panel | **50.130 × 31.200** |
| outer panel | **73.326 × 31.200** |

## Tooling

Three scripts live beside this document — [`verify.js`](verify.js), [`md2html.py`](md2html.py)
and [`torus-geometry-diagram.js`](torus-geometry-diagram.js). Everything they report has been derived and explained
below; they exist so a file can be checked in one command instead of by eye.

```
node verify.js BuildA1_90_25.svg RunA2_R59Point693.svg
```

Checks a cut file end to end: contour inventory with each panel's implied radius, plate and hole
count, hole eccentricity, every boundary line as apothem / R / across-flats, the **joint phase**,
and nesting clearances. The second argument is the R 59.693 run — the disc the inner panels key to.
Without it the phase pattern still prints but cannot be judged, so pass it. A **COMPLEMENTARY ✓**
verdict is the check that would have caught the first failed build; run it after any edit, including
ones you believe were only cosmetic.

```
python3 md2html.py Octagonal_Torus_Gold.md Octagonal_Torus_Gold.html
```

Regenerates the HTML from this markdown, inlining `torus-geometry-diagram.svg` so the page stays
self-contained. **The markdown is the source — edits made directly to the HTML are lost on the next
run.**

```
node torus-geometry-diagram.js 90 25 3      # outer R, ring, thickness
```

Redraws the figure at the top of this document and prints the resulting dimensions — see the note
under the figure for what the three arguments mean. Regenerate the HTML afterwards to pick up the
new drawing.

Everything below is why.

---

# PART 1 — Octagon trigonometry

A regular octagon has two "radii" that people constantly confuse:

- **R** (circumradius) — centre to a **vertex**
- **a** (apothem) — centre to the middle of a **face**

They are locked by the half-angle **180°/8 = 22.5°**:

```
a    = R × cos(22.5°)              cos(22.5°) = 0.923880
R    = a × sec(22.5°)              sec(22.5°) = 1.082392
side = R × 2sin(22.5°)             2sin(22.5°) = 0.765367
side = a × 2tan(22.5°)             tan(22.5°) = 0.414214 = √2 − 1
```

Closed forms:

```
cos(22.5°) = √(2+√2) / 2 = 0.923880
sec(22.5°) = 2 / √(2+√2) = 1.082392
tan(22.5°) = √2 − 1      = 0.414214
```

**sec(22.5°) = 1.0824 is the number this entire project turns on.** It says the corners of an
octagon sit **8.24 % further from centre** than the flats.

| R | apothem | across flats | across corners | side |
|---|---|---|---|---|
| 90.000 | 83.149 | 166.298 | 180.000 | 68.883 |
| 62.940 | 58.149 | 116.298 | 125.880 | 48.172 |
| 59.693 | 55.149 | 110.298 | 119.386 | 45.687 |
| 56.446 | 52.149 | 104.298 | 112.892 | 43.202 |

---

# PART 2 — Nesting two octagons: the 1.0824 rule

Two concentric, same-orientation octagons. The **gap between their faces** is a difference of
*apothems*; CAD wants *radii*. Since both scale by the same cos(22.5°):

```
gap = a_outer − a_inner = (R_outer − R_inner) × cos(22.5°)

ΔR / gap = sec(22.5°) = 1.082392
```

**The ratio is independent of size.** It holds for one octagon and for the difference between two,
which is what keeps the whole problem linear — no iteration, no trial fits.

Two consequences that bite:

**Trap 1 — corners open faster than flats.** For a 25 mm face gap the corners are
`25 × 1.0824 = 27.060` apart. Subtract 25 straight off the radius instead and you get
`90 − 25 = 65`, apothem `60.052`, so only `83.149 − 60.052 = 23.097` at the flats — **1.903 short**.

**Trap 2 — the ring width is a difference, so it is shift-invariant.** Move both octagons outward
by the same amount and the gap between them does not change. This becomes important in Part 8.

---

# PART 3 — Material: walls eat the gap

The octagons are *surfaces*. Material grows off them, and whether that costs you depends on
direction.

In this build (see Part 5 for why), **R 90 is the inner surface of the outer tube**, so its wall
grows outward, away from the ring — free. The inner tube's wall grows outward too, but for the
inner octagon "outward" means *into* the ring — costs one thickness.

```
one wall intrudes  →  nominal gap = ring + wall = 25 + 3 = 28
R_inner = R_outer − nominal × sec(22.5°)
        = 90 − 28 × 1.082392
        = 90 − 30.307
        = 59.693 mm
```

**Wall allowances ADD, in face-to-face units. sec(22.5°) MULTIPLIES, and only to convert a
face-to-face figure into a radius.** Two operations, two domains, in that order.

Getting this backwards is the classic error. If you come up short and "scale up by the ratio you
missed by", you leave a residual of `L²/(gap − L)`:

| nominal gap | real ring (L = 3) | implied "ratio" | error if you scale by it |
|---|---|---|---|
| 10 | 7 | 1.4286 | +1.29 |
| 25 | 22 | 1.1364 | +0.41 |
| 50 | 47 | 1.0638 | +0.19 |
| 100 | 97 | 1.0309 | +0.09 |

The "ratio" changes with the gap, which proves it is not geometry — it is an artifact of where you
measured. 1.0824 is identical at every size. *That* is what a real ratio looks like.

---

# PART 4 — The generator

**<https://boxes.hackerspace-bamberg.de/>** — boxes.py, generator **RegularBox**.

Settings used:

| RegularBox | value | meaning |
|---|---|---|
| `radius_bottom` / `radius_top` | 90 or 59.693 | **inner radius of the box bottom, at the corners** |
| `h` | 25 | **inner** height in mm (`outside` unchecked) |
| `n` | 8 | number of sides |
| `top` / `bottom` | closed | solid discs top and bottom |

| Default | value | meaning |
|---|---|---|
| `thickness` | 3.0 | material thickness |
| `burn` | 0.1 | kerf compensation — every contour is outset 0.1 mm |
| `inner_corners` | loop | |

| Finger joints | value | meaning |
|---|---|---|
| `style` | rectangular | |
| `finger` | 2.0 | finger width in multiples of thickness → **6 mm** |
| `space` | 2.0 | gap between fingers → **6 mm** (so a **12 mm pitch**) |
| `surroundingspaces` | 1.0 | space at the start and end — **this is the phase control** |
| `play` | 0.0 | extra clearance; raise if joints are too tight |

Each run produces: **2 discs** (top and bottom) and **8 side panels**.

---

# PART 5 — Mapping generator terms to the geometry

This is the join between Parts 1–3 and the tool, and it is exact:

| measured in the SVG | generator setting | relation |
|---|---|---|
| uniform +0.100 mm outset on every contour | `burn = 0.1` | direct |
| disc body apothem 55.149 | `radius = 59.693` | `55.149 = 59.693 × cos 22.5°` |
| disc body apothem 83.149 | `radius = 90` | `83.149 = 90 × cos 22.5°` |
| finger reach, +3.000 beyond the body | `thickness = 3.0` | direct |
| panel height 31.200 | `h = 25` | `25 + 3 + 3 + 2 × 0.1` |
| wall thickness 3.000 | `thickness = 3.0` | direct |

**`radius` is the vertex radius of the *inner* surface.** That is precisely the quantity the
sec(22.5°) conversion in Part 3 operates on, so the number you type goes straight into the formula:

```
R_inner = R_outer − (ring + thickness) × 1.082392
```

It also settles Part 3's "one wall, not two": since `radius` is an *inner* surface, R 90 is the
inside of the outer tube, and only the inner tube's wall reaches into the ring.

And the axial 25 is not luck — it is `h = 25` typed in, with `outside` unchecked.

---

# PART 6 — Panel widths, derived

Each run emits **two alternating panel types**. Both are the octagon's side length plus a corner
allowance:

```
side = 2 × a × tan(22.5°)

long  panel = side + t√2          + 2·burn
short panel = side + 2t·tan(22.5°) + 2·burn
```

With t = 3.0 and burn = 0.1:

```
t√2 + 2·burn          = 4.2426 + 0.2 = 4.443
2t·tan(22.5°) + 2·burn = 2.4853 + 0.2 = 2.685
difference             = t(2 − √2)    = 1.757
```

Check against every panel measured across all files:

| R | apothem | side | long (+4.443) | short (+2.685) | matches file? |
|---|---|---|---|---|---|
| 90.000 | 83.149 | 68.883 | **73.326** | **71.568** | ✓ |
| 59.693 | 55.149 | 45.687 | **50.130** | **48.372** | ✓ |
| 56.446 | 52.149 | 43.202 | **47.645** | **45.887** | ✓ |

Exact to the last digit in every case. **This is the diagnostic that caught the defect:** given a
panel width you can invert the formula and recover the radius it was generated from.

The two closed forms were matched to the measured widths, not read out of boxes.py's source. Both
have a sensible reading at a 135° corner — `t√2` is a thickness cut at 45°, `2t·tan(22.5°)` is the
wall's double offset — but treat them as a fitted rule that holds across every file here, not as
proven generator behaviour.

Note the `a` above is the apothem of the **inner** surface — the apothem of the radius you typed.
§6b measures the same panels against the **outer** surface instead. Both are correct and give the
same widths; they differ by the wall's projection, `2t·tan(22.5°) = 2.485`:

```
4.443 = 2.485 + 1.958        2.685 = 2.485 + 0.200
```

## 6a. Why a panel looks too wide for its octagon

Lay an inner panel against the plate's hole and it appears oversized by about 2 mm per end. It
isn't. Two different faces are being compared.

A face of the octagon has **two lengths**, because the wall is a trapezoid in plan:

```
at the bore,          apothem 55.149:  2 × 55.149 × tan(22.5°) = 45.687
at the wall's outside, apothem 58.149: 2 × 58.149 × tan(22.5°) = 48.172
difference = 2t·tan(22.5°)                                     =  2.485
```

The hole's straight segment measures **45.688** — it spans the face at the **bore**. The panel is
cut to the face at the wall's **outer surface**, 48.172. So laying one on the other compares a
panel to the short end of the trapezoid:

| | vs the hole segment (45.688) | per end |
|---|---|---|
| long panel 50.130 | +4.442 | **2.221** |
| short panel 48.372 | +2.684 | **1.342** |

Of both figures, **1.243 per end** is the same thing: the wall projecting outward as the face grows
from bore radius to outer radius, `t·tan(22.5°)`. What remains differs by panel type — for the long
panel it is the 0.979 corner lap (§6b), for the short panel it is just the 0.100 kerf.

## 6b. The corner lap

The two panel types are not a mistake either. Measured against the face at the wall's **outer**
surface — the correct reference — both tubes behave identically:

| tube | outer-surface face | long panel | short panel | long over | short over |
|---|---|---|---|---|---|
| Outer (a = 86.149) | 71.368 | 73.326 | 71.568 | **+1.958** | **+0.200** |
| Inner (a = 58.149) | 48.172 | 50.130 | 48.372 | **+1.958** | **+0.200** |

Short panels sit flush on the face (+0.100 per end, kerf only). Long panels stand **0.979 per end**
proud — `t(1 − 1/√2) + burn` — and lap over the short panel next to them. That is how boxes.py
closes a polygon tube with rectangular fingers rather than mitres: **4 long, 4 short, alternating.**
A panel that stopped exactly at the face would leave every corner open.

---

# PART 7 — Why a torus forces an inversion

RegularBox makes a **box**. A torus needs its two rims facing opposite ways:

- The **outer** tube's wall stands *outside* the plate's outer edge → fingers point outward.
- The **inner** tube's wall stands *inside* the plate's inner edge → fingers point inward.

RegularBox draws every disc with fingers facing consistently outward, and has **no setting for
finger direction**. It has no concept of a part that is a wall on one side and a hole on the other.

So exactly one of the two discs must be mirrored. **The inversion is structural, not a mistake.**
The mistake is failing to compensate for what it does.

The torus plate is therefore: the **outer disc**, with a hole cut in it derived from an inverted
inner disc. The inner tube's own discs are not used.

One wrinkle, developed in Part 8a: the disc you invert must be generated one thickness *inside*
where the hole belongs, because inverting moves it outward. That is why Part 0's Route A needs a
third generator run at R 56.446 rather than reusing the R 59.693 discs.

---

# PART 8 — What inversion actually does

Two things at once, and they must be handled separately.

## 8a. It shifts the part ±3 mm

Verified against pristine baselines with the file `O56_RingInvert.svg` — pristine O56 inverted both
ways, measured against the untouched O56 and O59 output:

| part | boundary lines (apothem) | shift | gap to the R 90 plate |
|---|---|---|---|
| O56 inverted inward | 49.149 / 52.149 | −3.000 | 31.000 |
| **pristine O56** | 52.149 / 55.149 | — | 28.000 |
| O56 inverted outward | 55.149 / 58.149 | +3.000 | **25.000** |
| **pristine O59** | 55.149 / 58.149 | — | **25.000** |

**Inverting rebuilds the castellation on the other side of its original line and never leaves the
part in place.** It moves by exactly one tab depth.

Note rows 3 and 4: the inverted O56 disc lands in the *identical position* as the pristine O59
disc. That is why typing 56.446 and inverting is a legitimate route to a ring at R 59.693.

**Rule:** if you pre-compensate the radius for an inversion, take the panels from the run whose
radius equals where the part *ended up*, not where you typed it. boxes.py sizes panels from the
number you type, and nothing tells them the disc moved.

## 8b. It flips the phase — and that is the part that must be right

Call the disc's finger positions **F** and its gaps **G**. The panels have notches at **F**,
because that is where the disc's fingers went.

- Cut the hole using the disc outline **as-is**: the fingers at F are removed, so the plate keeps
  material at **G**. Its tabs land where the panel has no notches. **Won't assemble.**
- Cut the hole using the **phase-inverted** disc: material remains at **F**, so the plate's tabs
  drop into the panel's notches. ✓

Using a disc outline as a hole flips *material for air*. It does **not** flip the *finger pattern*.
That distinction is the whole difficulty of this project.

### Reading the phase from a file

Take one face. For every point on it, record which of the two boundary lines it sits on, then
compress to runs along the face. That prints the finger pattern directly:

```
RunA2 disc — what the inner panels key to
  OUT[-22.8…-15.0] OUT[-14.9…-9.1] OUT[-9.0…-3.0] OUT[-2.9…2.9] OUT[3.0…9.0] …

BuildA1 plate hole
  in [-22.9…-15.0] in [-14.9…-9.1] in [-9.0…-3.0] in [-2.9…2.9] in [3.0…9.0] …
```

**Same intervals, opposite lines = complementary = the plate's tabs land in the panel's notches.**

**Do not use point counts for this.** An earlier version of this document read phase off the number
of points on each line, taking the minority line as the finger side. It is wrong: `RunA2`'s disc has
48 points where pristine `O59`'s has 96 — the originals carry duplicate nodes from having been
opened and re-saved in Inkscape — so the heuristic calls two geometrically **identical** discs
opposite in phase. Counts depend on edit history and clustering tolerance. Intervals depend only on
the geometry.

If a build comes out a half-pitch out of register, the fix is `surroundingspaces`, not geometry.
With a 12 mm pitch, half a pitch is 6 mm.

---

# PART 9 — How everything was measured

Every number here was extracted from path coordinates, not from CAD readouts.

**Octagon support function.** For each point, the apothem-equivalent is
`max over k of (dx·cos(k·45°) + dy·sin(k·45°))` for k = 0…7. Taking the max over all eight face
normals means corner geometry cannot skew the result, unlike a bounding box. Clustering those
values reveals the boundary lines directly.

**Kerf.** Every contour is outset by `burn = 0.1`, so measured values run 0.1 high per edge and
0.2 high across a full width. All nominal figures here have that backed out. A measured 83.249
is a nominal 83.149.

**Cross-check.** All four cardinal faces (top / bottom / left / right) are measured independently.
On plate rims they agreed to 0.001 mm in every file. On plate *holes* they spread by up to 0.17 mm,
which is not measurement error — it is a hole sitting fractionally off the rim's centre. Averaging
the four is what recovers the true apothem; a single face can be off by half the spread.

Three parsing pitfalls cost real time and are worth recording:

1. **Relative subpaths.** Splitting a `d` attribute on `M`/`m` and parsing each fragment
   independently breaks relative (`m`) subpaths — the running point resets to 0,0 and pieces
   scatter across the sheet. Subpaths must be split *while* carrying the current point.
2. **Combined paths.** Inkscape's Combine puts several unrelated parts in one `<path>`. Per-path
   bounding boxes then span the whole sheet; per-subpath is right for those.
3. **Multi-subpath outlines.** Conversely, some panels are drawn as four separate edge subpaths
   (top / bottom / left / right), where only the *union* is the part. Both groupings are needed.

4. **Group transforms.** Every `<g transform>` on the path's ancestor chain must be composed and
   applied, `translate()` included. Skipping them does not fail loudly — it silently reports parts
   at their pre-transform coordinates. Here it produced a confident, wrong claim that a correctly
   centred hole sat 98 mm off its plate. If a part looks displaced by a round number, suspect the
   measuring tool before the file.

Plus: `id="..."` contains the substring `d="..."`, so a naive regex will match it and parse
nonsense.

---

# PART 10 — File record

| file | what it is | verdict |
|---|---|---|
| `O56.svg` | pristine boxes.py, R 56.446 | disc 52.149/55.149, panels 47.645/45.887 — self-consistent |
| `O59.svg` | pristine boxes.py, R 59.693 | disc 55.149/58.149, panels 50.130/48.372 — self-consistent |
| `O90_O56point446_25mm.svg` | composite | plates **correct** (hole 55.149/58.149, inverted phase); inner panels wrong (R 56.446, 2.485 too narrow) |
| `O90_O59point693_25mm.svg` | composite | hole un-inverted (wrong phase); inner panels right width but 25.000 tall, tabs stripped |
| `TwoRings.svg` † | plate only | rim R 90, hole R 59.693, ring 25.000 |
| `InnerRingInverted.svg` | test | hole 55.149/58.149, tabs outward, stored as 8 subpaths |
| `InnerSidesInverted.svg` | test | same envelope, tabs inward, one clean subpath |
| `O56_RingInvert.svg` | the ±3 mm experiment | proved inversion shifts by exactly one tab depth |
| `OctagonalTorus.svg` | first attempt | correct parts, **hole phase wrong** — would not assemble |
| `OctagonalTorus2.svg` † | second attempt | phase corrected, fully verified ✓ |
| `RunA1_R90.svg` | Route A run 1 | discs 83.149→86.149, panels 73.326 / 71.568 — matches `O90.svg` ✓ |
| `RunA2_R59Point693.svg` | Route A run 2 | discs 55.149→58.149, panels 50.130 / 48.372 — matches `O59.svg` ✓ |
| `RunA3_R56Point446.svg` | Route A run 3 | discs 52.149→55.149 — matches `O56.svg` ✓; its panels are unused |
| **`BuildA1_90_25.svg`** | **final — cut this** | **20 contours, holes stitched and concentric, phase confirmed ✓** |

† No longer in the folder — measured during the investigation, then superseded. Every other file
listed is still present.

## Final verification, `BuildA1_90_25.svg`

| feature | nominal | R |
|---|---|---|
| Plate rim | 83.149 → 86.149 | 90.000 → 93.247 |
| Plate hole | 55.149 → 58.149 | 59.693 → 62.940 |
| Outer panels | 73.326 / 71.568 × 31.200 | R 90.000 |
| Inner panels | 50.130 / 48.372 × 31.200 | R 59.693 |

```
ring    = 83.149 − 58.149 = 25.000 ✓
axial   = 31.200 − 3.1 − 3.1 = 25.000 ✓   (as-drawn; nominally 31.000 − 3.0 − 3.0)
outside = 2 × 86.149 = 172.298
bore    = 2 × 55.149 = 110.298
phase   = interval pattern complementary to RunA2's disc ✓
holes   = one stitched contour per plate (20 contours total, not 34)
```

Both holes are concentric with their plate to **0.000 mm**.

---

# PART 11 — Wrong turns, recorded

Kept because each one was a plausible reading that the measurements killed.

1. **"Two walls eat the gap, so nominal = 31."** True only if R 90 were the *outside* of the outer
   tube. boxes.py's `radius` is an inner surface, so R 90 is the inside and only one wall intrudes:
   nominal = 28.
2. **"The inner panels don't follow the outer tube's width rule."** They do — Part 6's formula fits
   every panel in every file. They were sized from the *typed* radius, which had stopped matching
   the *shifted* disc.
3. **"No inversion is needed anywhere."** A torus forces one (Part 7).
4. **"The hole is already correctly phased because it matches the pristine disc."** Backwards — the
   hole must be the disc's *complement* (Part 8b). This one produced
   `OctagonalTorus.svg`, which doesn't assemble.

The recurring lesson: position and phase are independent, and boxes.py's inversion changes both at
once.

---

# PART 12 — Doing this at another size

```
R_inner = R_outer − (ring + thickness) × sec(180°/n)
h       = the axial dimension, entered directly
```

For a square cross-section of side S in n-sided material of thickness t, **three runs**:

| run | radius | keep |
|---|---|---|
| 1 — outer tube | `R_outer` (your choice) | both discs + n panels |
| 2 — inner panels | `R_inner = R_outer − (S + t) × sec(180°/n)` | n panels only |
| 3 — hole cutter | `R_hole = R_inner − t × sec(180°/n)` | one disc only |

`h = S` on runs 1 and 2; run 3's `h` does not matter, since only its disc outline is used.

Then invert run 3's disc and cut the hole in each of run 1's discs with it. Dry-fit one plate
against one inner panel before committing the sheet.

**Run 3 is not optional and it is not the same as run 2.** Inverting shifts a disc outward by one
tab depth, so the cutter must be generated one thickness *inside* where the hole belongs. For this
build: `59.693 − 3 × 1.082392 = 56.446`. Invert run 2's disc instead and the hole lands 3 mm out,
giving a ring of `S − t` instead of `S`.

`sec(180°/n)` for other shapes:

| shape | n | sec(180°/n) |
|---|---|---|
| square | 4 | 1.4142 |
| hexagon | 6 | 1.1547 |
| **octagon** | **8** | **1.0824** |
| decagon | 10 | 1.0515 |
| dodecagon | 12 | 1.0353 |

---

# The two rules

1. **Wall allowances ADD**, in face-to-face units, once per wall growing into the gap.
2. **sec(22.5°) = 1.0824 MULTIPLIES**, only to turn a face-to-face figure into a radius.

Corners always open up 8.24 % more than flats. Miscount the walls by one and you are out by
3.247 mm of radius. Mismatch a panel set by one generator run and you are out by 2.485 mm of width.
Get the phase backwards and the dimensions are all perfect and nothing fits.
