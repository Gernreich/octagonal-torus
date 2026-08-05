# Octagonal torus — 25 × 25 mm cross-section

A laser-cut octagonal torus: two nested octagonal tubes joined by annular plates, leaving a
**square 25 × 25 mm channel** all the way round. Outer octagon R 90, 3 mm material.

![geometry](torus-geometry-diagram.svg)

**Full writeup:** [`Octagonal_Torus_Gold.md`](Octagonal_Torus_Gold.md) — the trigonometry, the
generator settings, every wrong turn, and how each number was verified against the cut files.

---

## Just cut it

**[`BuildA1_90_25.svg`](BuildA1_90_25.svg)** — 18 pieces, 34 contours, verified.

| | |
|---|---|
| Material | 3 mm |
| Kerf (`burn`) | 0.1 mm |
| Sheet | 483 × 181 mm |
| Pieces | 2 plates · 8 outer panels · 8 inner panels |
| Result | 25.000 mm radial × 25.000 mm axial · 172.3 across flats · 110.3 bore |

Dry-fit one plate against one inner panel in cardboard before committing a sheet. The plate's tabs
around the hole should drop into the panel's notches.

## Build it at your own size

Made with **[boxes.py](https://boxes.hackerspace-bamberg.de/)** by Hackerspace Bamberg — generator
**RegularBox**. Three runs; each link carries every setting, so the form arrives populated:

1. **[Outer tube, R 90](https://boxes.hackerspace-bamberg.de/RegularBox?FingerJoint_style=rectangular&FingerJoint_surroundingspaces=1.0&FingerJoint_bottom_lip=0.0&FingerJoint_edge_width=1.0&FingerJoint_extra_length=0.0&FingerJoint_finger=2.0&FingerJoint_play=0.0&FingerJoint_space=2.0&FingerJoint_width=1.0&h=25&outside=0&radius_bottom=90&radius_top=90&n=8&top=closed&alignment_pins=1.0&bottom=closed&thickness=3.0&burn=0.1&format=svg&labels=0&labels=1&reference=100.0&tabs=0.0&qr_code=0&inner_corners=loop&spacing=0.5&debug=0&language=en&render=2)** — keep both discs and all 8 panels
2. **[Inner panels, R 59.693](https://boxes.hackerspace-bamberg.de/RegularBox?FingerJoint_style=rectangular&FingerJoint_surroundingspaces=1.0&FingerJoint_bottom_lip=0.0&FingerJoint_edge_width=1.0&FingerJoint_extra_length=0.0&FingerJoint_finger=2.0&FingerJoint_play=0.0&FingerJoint_space=2.0&FingerJoint_width=1.0&h=25&outside=0&radius_bottom=59.693&radius_top=59.693&n=8&top=closed&alignment_pins=1.0&bottom=closed&thickness=3.0&burn=0.1&format=svg&labels=0&labels=1&reference=100.0&tabs=0.0&qr_code=0&inner_corners=loop&spacing=0.5&debug=0&language=en&render=2)** — keep the 8 panels only
3. **[Hole cutter, R 56.446](https://boxes.hackerspace-bamberg.de/RegularBox?FingerJoint_style=rectangular&FingerJoint_surroundingspaces=1.0&FingerJoint_bottom_lip=0.0&FingerJoint_edge_width=1.0&FingerJoint_extra_length=0.0&FingerJoint_finger=2.0&FingerJoint_play=0.0&FingerJoint_space=2.0&FingerJoint_width=1.0&h=25&outside=0&radius_bottom=56.446&radius_top=56.446&n=8&top=closed&alignment_pins=1.0&bottom=closed&thickness=3.0&burn=0.1&format=svg&labels=0&labels=1&reference=100.0&tabs=0.0&qr_code=0&inner_corners=loop&spacing=0.5&debug=0&language=en&render=2)** — keep one disc, invert it, cut the hole in both outer discs

Run 3 uses a *smaller* radius on purpose: inverting a disc shifts it outward by one material
thickness. Type the radius 3 mm of apothem short of where the hole belongs and the inversion lands
it exactly right. Details in Part 8a of the writeup.

The size relationship is fixed by one constant:

```
R_inner = R_outer − (ring + thickness) × sec(22.5°)
        = 90 − 28 × 1.082392 = 59.693
```

`sec(22.5°) = 1.0824` — an octagon's corners sit 8.24 % further out than its flats.

## Check your own file

```
node verify.js BuildA1_90_25.svg RunA2_R59Point693.svg
```

Reports contours, plate and hole geometry, hole concentricity, **joint phase**, and nesting
clearances. The phase check is the one that matters — it catches a hole whose tabs land where the
panel is solid, which is a build that measures perfectly and cannot be assembled.

```
node torus-geometry-diagram.js 90 25 3        # redraw the figure at any size
python3 md2html.py Octagonal_Torus_Gold.md Octagonal_Torus_Gold.html
```

## What else is here

`RunA1/2/3` are the three generator outputs above, unmodified. `O56/O59/O90.svg` are earlier
identical runs. The rest — `InnerRingInverted`, `InnerSidesInverted`, `O56_RingInvert`,
`O90_O56point446_25mm`, `O90_O59point693_25mm`, `OctagonalTorus`, `OctagonalTorusGold` — are the
investigation: the experiments that established what inverting actually does, and two builds that
were wrong in instructive ways. Part 10 of the writeup says what each one is.

## Licence

Released under **[CC0 1.0](LICENSE)** — public domain, no strings. Cut it, modify it, sell what you
make, no attribution required. A credit is always welcome but never owed.

That dedication covers what is mine: the writeup, the diagram and its generator, and the tools. The
part geometry itself comes from **[boxes.py](https://boxes.hackerspace-bamberg.de/)** by Hackerspace
Bamberg — the SVGs carry its `dc:source` provenance in their metadata. Check boxes.py's own terms if
you plan to redistribute generated output at scale.

## Credit

Parts generated with [boxes.py](https://boxes.hackerspace-bamberg.de/) (Hackerspace Bamberg),
generator **RegularBox**.
