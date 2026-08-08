# Octagonal torus — parametric, 90mm radius, 25 × 25mm cross-section

A laser-cut octagonal torus: two nested octagonal tubes joined by annular plates, leaving a
**square channel** all the way round. The cut file here is a 25 × 25mm channel with an outer
octagon of R 90 in 3mm Baltic birch plywood — but those are three numbers you choose, and everything else
derives from them, within one constraint. [Build it at your own size](#build-it-at-your-own-size).

![Plan section through a plate showing the four octagon boundaries and the 25mm ring, with a radial cross-section of the 25 × 25mm cavity](torus-geometry-diagram.svg)

**[Read the writeup](https://gernreich.github.io/octagonal-torus/)** — the trigonometry,
the generator settings, and how every number was verified against the cut files. Also
here as markdown: [`Octagonal_Torus_Gold.md`](Octagonal_Torus_Gold.md).

**[Download everything as a ZIP](https://github.com/Gernreich/octagonal-torus/archive/refs/heads/main.zip)** — the cut file, the writeup, the diagram and the verification tools.

## The files, at a glance

<p>
<a href="BuildA1_90_25.svg"><img src="previews/BuildA1_90_25.svg" alt="The finished cut sheet: two annular plates with octagonal holes, sixteen wall panels nested inside and around them, coloured by cut order" width="98%"></a>
</p>

<p>
<a href="RunA1_R90.svg"><img src="previews/RunA1_R90.svg" alt="Generator run 1 at R 90: two discs and eight side panels as boxes.py emits them" width="48%"></a>
<a href="RunA2_R59Point693.svg"><img src="previews/RunA2_R59Point693.svg" alt="Generator run 2 at R 59.693: the run the inner panels come from" width="48%"></a>
</p>

*Above, the cut file — colour is the cut order, not decoration. Below, two of the three
generator runs it was assembled from. Click any to download. The pictures are display
renderings with the stroke thickened; the real files draw 0.2646mm, which a browser shows
almost invisibly against a transparency checkerboard.*

---

## Just cut it

**[`BuildA1_90_25.svg`](BuildA1_90_25.svg)** — the torus's 18 pieces plus 4 optional extras, 26 contours, verified.

| | |
|---|---|
| Material | 3mm Baltic birch ply |
| Kerf (`burn`) | 0.1mm |
| Sheet | 484 × 375mm |
| Pieces | 2 plates · 8 outer panels · 8 inner panels |
| Optional extras | 2 single-piece stiffening rings · 2 square patches for joining sliced sections |
| Result | 25.000mm radial × 25.000mm axial · 172.3 across flats · 110.3 bore |

Dry-fit one plate against one inner panel in cardboard before committing a sheet. The plate's tabs
around the hole should drop into the panel's notches.

**Cut everything except the violet.** Those paths mark cuts this build does not make: the slices
that would turn the torus into the simple trumpet, and 22 straight patch lines across the plate and
ring walls, for joining sliced sections. Move them to a non-cutting layer or delete them first —
or turn one green if you do want it cut.

**Colour is the cut order: green → orange → cyan → black.** Eight panels and both patches are nested
inside the plate and ring holes, so they have to be cut before the hole that frees that waste; the
holes have to be cut before the rims that free the plates. Give all four a cutting operation and run them in that order.
`verify.js` checks the sequence and will tell you if it is wrong.

**Violet `#8000ff` is skip** — 64 lines carried in the file that this build does not cut: the
trumpet slices, and the patch lines across the plate and ring walls. Leave it unmapped or delete it.
Blue does not appear at all: blue means engrave across these repositories and never cuts.

The sequence is shared by every LaserMadeMusic repository — blue engraves, then
green → orange → cyan → black, with black always the cut that frees the part and violet always
skip. A file uses only the stages it needs.

**Two optional stiffening rings** sit on the lower half of the sheet — plain octagons, no joinery,
172.258mm across the flats with a 110.298mm hole, which is the finished torus's own outside and bore.
Lay one on a face and it sits flush at both edges, adding material without changing any dimension you
have to fit to. The torus closes without them; cut them if it needs stiffening.

## Build it at your own size

Made with **[boxes.py](https://boxes.hackerspace-bamberg.de/)** by Hackerspace Bamberg — generator
**RegularBox**. Each link opens the form with every setting already filled in — change the radius or
thickness if you want, then hit **Generate**. Save each one under its own name; boxes.py serves them
all as `RegularBox.svg`.

1. **[Outer tube, R 90](https://boxes.hackerspace-bamberg.de/RegularBox?FingerJoint_style=rectangular&FingerJoint_surroundingspaces=1.0&FingerJoint_bottom_lip=0.0&FingerJoint_edge_width=1.0&FingerJoint_extra_length=0.0&FingerJoint_finger=2.0&FingerJoint_play=0.0&FingerJoint_space=2.0&FingerJoint_width=1.0&h=25&outside=0&radius_bottom=90&radius_top=90&n=8&top=closed&alignment_pins=1.0&bottom=closed&thickness=3.0&burn=0.1&format=svg&labels=0&labels=1&reference=100.0&tabs=0.0&qr_code=0&inner_corners=loop&spacing=0.5&debug=0&language=en&render=0)** — keep both discs and all 8 panels
2. **[Inner panels, R 59.693](https://boxes.hackerspace-bamberg.de/RegularBox?FingerJoint_style=rectangular&FingerJoint_surroundingspaces=1.0&FingerJoint_bottom_lip=0.0&FingerJoint_edge_width=1.0&FingerJoint_extra_length=0.0&FingerJoint_finger=2.0&FingerJoint_play=0.0&FingerJoint_space=2.0&FingerJoint_width=1.0&h=25&outside=0&radius_bottom=59.693&radius_top=59.693&n=8&top=closed&alignment_pins=1.0&bottom=closed&thickness=3.0&burn=0.1&format=svg&labels=0&labels=1&reference=100.0&tabs=0.0&qr_code=0&inner_corners=loop&spacing=0.5&debug=0&language=en&render=0)** — keep the 8 panels only
3. **[Hole cutter, R 56.446](https://boxes.hackerspace-bamberg.de/RegularBox?FingerJoint_style=rectangular&FingerJoint_surroundingspaces=1.0&FingerJoint_bottom_lip=0.0&FingerJoint_edge_width=1.0&FingerJoint_extra_length=0.0&FingerJoint_finger=2.0&FingerJoint_play=0.0&FingerJoint_space=2.0&FingerJoint_width=1.0&h=25&outside=0&radius_bottom=56.446&radius_top=56.446&n=8&top=closed&alignment_pins=1.0&bottom=closed&thickness=3.0&burn=0.1&format=svg&labels=0&labels=1&reference=100.0&tabs=0.0&qr_code=0&inner_corners=loop&spacing=0.5&debug=0&language=en&render=0)** — keep one disc, invert it, cut the hole in both outer discs

**Inverting the disc:** in Inkscape, break the octagon outline into its eight segments — one per
face — and flip each one. The flipped segments together are the hole; place them concentric on each
outer disc and cut. **The [video](https://www.youtube.com/@LaserMadeMusic) shows this step by step**, and
[the writeup](Octagonal_Torus_Gold.md#how-the-inversion-was-done) explains what flipping does to the
joint.

The eight segments in `BuildA1_90_25.svg` have been stitched into one closed loop per plate, but
that is **probably unnecessary** — the gaps between segments measured 0.077mm against a 0.1mm
kerf, so the cuts overlap anyway. It only matters if your laser software applies its own kerf
compensation, which needs closed paths — and if it does, switch it off, because `burn = 0.1` is
already baked into these files.

Run 3 uses a *smaller* radius on purpose: flipping shifts the band outward by one material
thickness. So you type the radius whose *apothem* is 3mm short of where the band should land —
3.247 smaller in radius, since 3mm of apothem is 3 × sec(22.5°) — and the inversion carries it
exactly into place. Details in Part 8a of the writeup.

The size relationship is fixed by one constant:

```
R_inner = R_outer − (ring + thickness) × sec(22.5°)
        = 90 − 28 × 1.082392 = 59.693
```

`sec(22.5°) = 1.0824` — an octagon's corners sit 8.24 % further out than its flats.

**The three numbers are not independent.** The ring and both walls have to fit inside the outer
octagon, which puts a floor under the radius:

```
R_outer  >  (ring + 2 × thickness) × sec(180°/n)
```

For a 25mm ring in 3mm that floor is 33.554mm, so R 90 is comfortably clear. Below it the hole
cutter comes out zero or negative and there is no bore at all — ask for a 500mm ring at R 10 and
the arithmetic has nowhere to put it. `torus-geometry-diagram.js` checks this before it draws
anything and refuses, naming the minimum for your ring and thickness.

## Check your own file

```
node verify.js BuildA1_90_25.svg RunA2_R59Point693.svg
```

Reports the stroke palette, contours, plate and hole geometry, hole concentricity, **joint phase**,
**cut order**, nesting clearances, and whether everything sits inside the viewBox. The phase check
is the one that matters — it catches a hole whose tabs land where the panel is solid, which is a
build that measures perfectly and cannot be assembled.

```
node torus-geometry-diagram.js 90 25 3        # redraw the figure at any size
```

## What else is here

`RunA1/2/3` are the three generator outputs from the links above, unmodified. Run 2 doubles as the
reference `verify.js` checks joint phase against, so keep it if you plan to verify your own files.
Part 10 of the writeup says what each one is.

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
