// Verify an octagonal-torus cut file: geometry, joint phase, and nesting clearances.
//
//   node verify.js BuildA1_90_25.svg
//   node verify.js BuildA1_90_25.svg RunA2_R59Point693.svg    # 2nd arg = disc the panels key to
//
// Transform-aware: composes every <g transform> on the ancestor chain. A tool that skips them
// reports parts at pre-transform coordinates and will confidently mislocate a correct part.
var fs = require('fs');
var COS = Math.cos(Math.PI / 8), SEC = 1 / COS, TAN = Math.tan(Math.PI / 8);

function mul(A, B) {
  return [A[0]*B[0]+A[2]*B[1], A[1]*B[0]+A[3]*B[1], A[0]*B[2]+A[2]*B[3],
          A[1]*B[2]+A[3]*B[3], A[0]*B[4]+A[2]*B[5]+A[4], A[1]*B[4]+A[3]*B[5]+A[5]];
}
function apply(M, p) { return [M[0]*p[0]+M[2]*p[1]+M[4], M[1]*p[0]+M[3]*p[1]+M[5]]; }
function parseT(s) {
  var M = [1,0,0,1,0,0], re = /(translate|rotate|scale|matrix)\s*\(([^)]*)\)/g, m;
  while ((m = re.exec(s))) {
    var n = m[2].trim().split(/[\s,]+/).map(Number), T;
    if (m[1] === 'translate') T = [1,0,0,1,n[0],n[1]||0];
    else if (m[1] === 'scale') T = [n[0],0,0,n.length>1?n[1]:n[0],0,0];
    else if (m[1] === 'matrix') T = n;
    else { var a=n[0]*Math.PI/180,c=Math.cos(a),s2=Math.sin(a); T=[c,s2,-s2,c,0,0];
           if (n.length===3) T = mul([1,0,0,1,n[1],n[2]], mul(T,[1,0,0,1,-n[1],-n[2]])); }
    M = mul(M, T);
  }
  return M;
}
function pts_(d) {
  var toks = d.match(/[MmLlHhVvCcSsQqAaZz]|-?\d*\.?\d+(?:[eE]-?\d+)?/g) || [];
  var out=[], i=0, cmd=null, x=0, y=0, sx=0, sy=0;
  function num(){ return parseFloat(toks[i++]); }
  while (i < toks.length) {
    if (/^[A-Za-z]$/.test(toks[i])) cmd = toks[i++];
    if (!cmd) { i++; continue; }
    var rel = cmd === cmd.toLowerCase(), c = cmd.toUpperCase();
    if (c==='M'){ var nx=num(),ny=num(); x=rel?x+nx:nx; y=rel?y+ny:ny; sx=x; sy=y; out.push([x,y]); cmd=rel?'l':'L'; }
    else if (c==='L'){ var lx=num(),ly=num(); x=rel?x+lx:lx; y=rel?y+ly:ly; out.push([x,y]); }
    else if (c==='H'){ var v=num(); x=rel?x+v:v; out.push([x,y]); }
    else if (c==='V'){ var w=num(); y=rel?y+w:w; out.push([x,y]); }
    else if (c==='C'){ num();num();num();num(); var ex=num(),ey=num(); x=rel?x+ex:ex; y=rel?y+ey:ey; out.push([x,y]); }
    else if (c==='S'||c==='Q'){ num();num(); var qx=num(),qy=num(); x=rel?x+qx:qx; y=rel?y+qy:qy; out.push([x,y]); }
    else if (c==='A'){ num();num();num();num();num(); var ax=num(),ay=num(); x=rel?x+ax:ax; y=rel?y+ay:ay; out.push([x,y]); }
    else if (c==='Z'){ x=sx; y=sy; }
    else i++;
  }
  return out;
}
function apo(dx, dy) {
  var m = -1e9;
  for (var k = 0; k < 8; k++) { var t=k*Math.PI/4, v=dx*Math.cos(t)+dy*Math.sin(t); if (v>m) m=v; }
  return m;
}
// Non-cut geometry. Widening this list is how a recolour silently loses parts —
// an earlier version skipped #0000ff too, and reported 14 contours for an intact
// file — so each entry has to earn its place.
//
//   #8000ff  the only skip colour. Lines carried in the file that this build does
//            not cut -- here, the trumpet lines that slice the torus into the
//            simple trumpet. Explicit, so "not cut" is a decision recorded in the
//            drawing rather than a colour someone forgot to map.
//
// Red and green were listed here until the trumpet lines were recoloured. They are
// gone deliberately: red means CUT in every repository alongside this one, and a
// verifier that quietly ignores it would pass a file whose parts never get cut.
var IGNORE = { '#8000ff': 'violet — skip, not cut in this build' };
var palette = {};   // every stroke colour seen -> { n, ignored }

// An explicit #000000 and no stroke at all are the same operation on the machine,
// so they must collapse to one key or the cut order sees an unknown colour.
//
// An element may declare its stroke twice — once in style="", once as a presentation
// attribute stroke="". The CSS cascade says style wins, and browsers and Inkscape both
// agree, so that is what this reads. Not every laser importer applies the cascade, and
// one that takes the attribute instead reads a different cut stage for the same part.
// Anywhere the two disagree is recorded and reported rather than silently resolved.
var strokeClash = [];
function strokeOf(attrs) {
  var sm = /style="[^"]*?stroke:\s*(#[0-9a-fA-F]{6})/.exec(attrs);
  var am = /(?:^|\s)stroke="(#[0-9a-fA-F]{6})"/.exec(attrs);
  if (sm && am && sm[1].toLowerCase() !== am[1].toLowerCase()) {
    var id = /\bid="([^"]+)"/.exec(attrs);
    strokeClash.push({ id: id ? id[1] : '(no id)',
                       style: sm[1].toLowerCase(), attr: am[1].toLowerCase() });
  }
  var m = sm || /stroke:\s*(#[0-9a-fA-F]{6})/.exec(attrs) || am;
  if (!m) return 'black';
  var c = m[1].toLowerCase();
  return c === '#000000' ? 'black' : c;
}
function collect(file) {
  var src = fs.readFileSync(file, 'utf8'), stack = [[1,0,0,1,0,0]], parts = [];
  var re = /<(\/?)(g|path)\b([^>]*?)(\/?)>/g, m;
  while ((m = re.exec(src))) {
    var close=m[1], tag=m[2], attrs=m[3], self=m[4];
    if (tag === 'g') {
      if (close) { stack.pop(); continue; }
      var tm = /transform="([^"]+)"/.exec(attrs);
      stack.push(tm ? mul(stack[stack.length-1], parseT(tm[1])) : stack[stack.length-1]);
      if (self) stack.pop();
      continue;
    }
    if (close) continue;
    var dm = /(?:^|\s)d="([^"]+)"/.exec(attrs);
    if (!dm) continue;
    var col = strokeOf(attrs);
    if (col === 'black' && /fill:\s*#00ff00/i.test(attrs)) col = '#00ff00';
    var ign = Object.prototype.hasOwnProperty.call(IGNORE, col);
    if (!palette[col]) palette[col] = { n: 0, ignored: ign };
    palette[col].n++;
    if (ign) continue;
    var pm = /transform="([^"]+)"/.exec(attrs);
    var M = pm ? mul(stack[stack.length-1], parseT(pm[1])) : stack[stack.length-1];
    var p = pts_(dm[1]).map(function (q) { return apply(M, q); });
    if (p.length < 8) continue;
    var xs=p.map(function(q){return q[0];}), ys=p.map(function(q){return q[1];});
    var x0=Math.min.apply(null,xs), x1=Math.max.apply(null,xs);
    var y0=Math.min.apply(null,ys), y1=Math.max.apply(null,ys);
    var idm = /\bid="([^"]+)"/.exec(attrs);
    parts.push({ pts:p, w:x1-x0, h:y1-y0, cx:(x0+x1)/2, cy:(y0+y1)/2, col:col,
                 id: idm ? idm[1] : '(no id)' });
  }
  return parts;
}
function f(x){ return Math.round(x*1000)/1000; }

var KERF = 0.1, A_HOLE_IN = 55.149, A_HOLE_OUT = 58.149, A_RIM_OUT = 86.149;

// A panel is a ~31.2mm-deep rectangle 40–90mm long. Either orientation: nesting rotates
// panels to fit the sheet, and a test that only accepted the wide one reclassified five
// rotated panels as unidentified hole geometry the moment they were turned.
function isPanel(p) {
  var lo = Math.min(p.w, p.h), hi = Math.max(p.w, p.h);
  return lo > 28 && lo < 34 && hi > 40 && hi < 90;
}

// Apothem range of a contour measured about a given centre — the octagon's own metric,
// which is what separates "at the hole boundary" from "adrift in the waste inside it".
function apoRange(p, cx, cy) {
  var lo = 1e9, hi = -1e9;
  p.pts.forEach(function (q) { var a = apo(q[0] - cx, q[1] - cy); if (a < lo) lo = a; if (a > hi) hi = a; });
  return { lo: lo, hi: hi };
}

// The hole boundary sits AT the hole apothem, whether drawn as one loop or as 8 segments,
// so every point of it is out at 55.149 or beyond. A contour that reaches further in than
// that is not the hole: it is a piece being harvested from the waste disc the hole frees.
// Until patches were added to the waste this distinction did not exist and anything inside
// the rim counted as hole geometry — which quietly reported 6 holes across 4 plates.
function isHolePartOf(plate, p) {
  if (p === plate || isPanel(p)) return false;
  var r = apoRange(p, plate.cx, plate.cy);
  return r.hi <= 83.0 && r.lo >= A_HOLE_IN - 0.5;
}
function holePartsFor(plate, all) {
  return all.filter(function (p) { return isHolePartOf(plate, p); });
}

var file = process.argv[2];
var P = collect(file);
console.log('\n════ ' + file.split('/').pop() + '   contours: ' + P.length);

// Print the palette before anything else. Stroke colour decides what gets counted,
// so a recolour must be visible here rather than showing up as a mystery contour count.
var cols = Object.keys(palette).sort(function (a, b) { return palette[b].n - palette[a].n; });
console.log('\n  colours (stroke)');
cols.forEach(function (c) {
  console.log('    ' + c.padEnd(12) + 'x' + String(palette[c].n).padEnd(4) +
              (palette[c].ignored ? 'IGNORED — ' + IGNORE[c] : 'counted as cut geometry'));
});
if (cols.filter(function (c) { return !palette[c].ignored; }).length > 2) {
  console.log('    note: cut contours span several colours. All are counted; make sure your');
  console.log('          laser software assigns every one of them a cutting operation.');
}
if (strokeClash.length) {
  var byPair = {};
  strokeClash.forEach(function (s) { var k = s.style + ' / ' + s.attr; byPair[k] = (byPair[k] || 0) + 1; });
  console.log('\n    *** ' + strokeClash.length + ' path(s) declare their stroke twice, with different ' +
              'colours.\n        style="" wins in a browser and in Inkscape, and is what is counted above.\n' +
              '        A laser importer that reads the presentation attribute instead puts these\n' +
              '        parts in a different cut stage:');
  Object.keys(byPair).sort().forEach(function (k) {
    var pair = k.split(' / ');
    console.log('          x' + String(byPair[k]).padEnd(3) + ' style ' + pair[0] +
                '  vs  attribute ' + pair[1] + '   (counted as ' + pair[0] + ')');
  });
  console.log('        Deleting the redundant stroke="" attribute removes the ambiguity.');
}

var agg = {};
P.forEach(function (p) { var k=f(p.w)+' x '+f(p.h); agg[k]=(agg[k]||0)+1; });
console.log('\n  inventory');
Object.keys(agg).sort(function(a,b){return parseFloat(b)-parseFloat(a);}).forEach(function (k) {
  var w0=parseFloat(k), h0=parseFloat(k.split('x')[1]), ex='';
  var W=Math.max(w0,h0), H=Math.min(w0,h0);   // a rotated panel is the same panel
  if (W>40 && W<80 && H>28 && H<34) {
    var aA=(W-4.443)/(2*TAN), aB=(W-2.685)/(2*TAN);
    ex = '   -> panel for R ' + f(aA*SEC) + ' | ' + f(aB*SEC);
  }
  console.log('    ' + k + '   x' + agg[k] + ex);
});

var plates = P.filter(function(p){ return p.w>160 && Math.abs(p.w-p.h)<1; });
var holeCount = plates.reduce(function (t, pl) { return t + holePartsFor(pl, P).length; }, 0);
console.log('\n  plates: ' + plates.length + '   hole contours: ' + holeCount +
            (plates.length ? '  (' + (holeCount / plates.length) + ' per plate — 8 if segmented, 1 if stitched)' : ''));

plates.forEach(function (PL, i) {
  var near = holePartsFor(PL, P);
  var all = []; near.forEach(function(s){ all = all.concat(s.pts); });
  if (!all.length) {
    console.log('\n  PLATE ' + i + '  centre (' + f(PL.cx) + ', ' + f(PL.cy) + ')');
    console.log('     *** NO HOLE FOUND IN THIS PLATE — it is solid, or the hole is not positioned in it ***');
    return;
  }
  var xs=all.map(function(q){return q[0];}), ys=all.map(function(q){return q[1];});
  var hx=(Math.min.apply(null,xs)+Math.max.apply(null,xs))/2;
  var hy=(Math.min.apply(null,ys)+Math.max.apply(null,ys))/2;
  console.log('\n  PLATE ' + i + '  centre (' + f(PL.cx) + ', ' + f(PL.cy) + ')   segments ' + near.length +
              '   hole eccentricity ' + f(Math.hypot(hx-PL.cx, hy-PL.cy)));
  [['rim', PL.pts, PL.cx, PL.cy], ['hole', all, hx, hy]].forEach(function (S) {
    var vals = S[1].map(function(q){ return apo(q[0]-S[2], q[1]-S[3]); }).sort(function(a,b){return a-b;});
    var cl=[]; vals.forEach(function(v){ var l=cl[cl.length-1]; if(l&&v-l.hi<0.06){l.hi=v;l.n++;} else cl.push({lo:v,hi:v,n:1}); });
    cl.forEach(function (c) { if (c.n<8) return;
      console.log('     ' + S[0].padEnd(5) + ' line ' + f(c.lo-0.1) + '   R ' + f((c.lo-0.1)*SEC) +
                  '   flats ' + f(2*(c.lo-0.1)) + '   n ' + c.n); });
  });
});


// ─── joint phase ──────────────────────────────────────────────────────────────
// Which of the two boundary lines each point of a face sits on, compressed to runs.
// Counts are NOT usable for this: files re-saved through Inkscape carry duplicate nodes,
// so identical parts can report opposite majorities. Intervals depend only on geometry.
function facePattern(pts, cx, cy, aIn, aOut) {
  var half = aOut * TAN, seg = [];
  pts.forEach(function (q) {
    var dx = q[0] - cx, dy = cy - q[1];
    if (Math.abs(dx) > half - 0.5) return;
    var w = Math.abs(dy - aIn) < 0.15 ? 'in ' : (Math.abs(dy - aOut) < 0.15 ? 'OUT' : null);
    if (w) seg.push({ x: +dx.toFixed(2), w: w });
  });
  seg.sort(function (a, b) { return a.x - b.x; });
  var runs = [], cur = null;
  seg.forEach(function (s) {
    if (!cur || cur.w !== s.w) { cur = { w: s.w, lo: s.x, hi: s.x }; runs.push(cur); } else cur.hi = s.x;
  });
  return runs.filter(function (r) { return r.hi - r.lo > 0.3; });
}
function fmtPattern(runs) {
  return runs.map(function (r) { return r.w + '[' + r.lo.toFixed(1) + '…' + r.hi.toFixed(1) + ']'; }).join(' ');
}
// Complementary = the same runs along the face, but on opposite boundary lines.
// Compare run midpoints with tolerance: the hole is kerf-offset from the disc, so the
// interval ends legitimately differ by ~0.1mm and an exact match would never fire.
function complementary(a, b, tol) {
  if (a.length !== b.length || !a.length) return false;
  for (var i = 0; i < a.length; i++) {
    if (a[i].w === b[i].w) return false;                                  // same line = same phase
    if (Math.abs((a[i].lo + a[i].hi) / 2 - (b[i].lo + b[i].hi) / 2) > tol) return false;
  }
  return true;
}

// KERF and the apothem constants are declared once, above isPanel.

if (plates.length) {
  var pl0 = plates[0];
  var sg0 = holePartsFor(pl0, P);
  var ha = []; sg0.forEach(function (s) { ha = ha.concat(s.pts); });
  if (!ha.length) {
    console.log('\n  JOINT PHASE');
    console.log('    *** cannot check — no hole geometry found in plate 0 ***');
  } else {
    var hxs = ha.map(function (q) { return q[0]; }), hys = ha.map(function (q) { return q[1]; });
    var hcx = (Math.min.apply(null, hxs) + Math.max.apply(null, hxs)) / 2;
    var hcy = (Math.min.apply(null, hys) + Math.max.apply(null, hys)) / 2;
    var hp = facePattern(ha, hcx, hcy, A_HOLE_IN + KERF, A_HOLE_OUT + KERF);
    console.log('\n  JOINT PHASE  (interval pattern along one face)');
    console.log('    plate hole  : ' + fmtPattern(hp));
    if (process.argv[3]) {
      var ref = collect(require('path').resolve(process.argv[2], '..', process.argv[3]))
                  .filter(function (p) { return Math.abs(p.w - 116.499) < 0.05; })[0];
      if (ref) {
        var rp = facePattern(ref.pts, ref.cx, ref.cy, A_HOLE_IN + KERF, A_HOLE_OUT + KERF);
        console.log('    ref disc    : ' + fmtPattern(rp));
        console.log('    -> ' + (complementary(hp, rp, 0.3)
                     ? 'COMPLEMENTARY ✓  the plate\'s tabs land in the panel\'s notches'
                     : '*** NOT COMPLEMENTARY — will not assemble ***'));
      } else {
        console.log('    (no R 59.693 disc found in ' + process.argv[3] + ')');
      }
    } else {
      console.log('    (pass the R 59.693 run file as a 2nd argument to check complementarity)');
    }
  }
}

// ─── nesting clearances ───────────────────────────────────────────────────────
// Bounding boxes are useless here: the plates have a 110mm hole and panels are legitimately
// nested in that waste. Classify each panel by the octagon support function instead.
var panels = P.filter(isPanel);   // strictly ~31.2mm tall rectangles — not hole loops
if (plates.length && panels.length) {
  var bad = 0, tight = 1e9, tightWho = '';
  panels.forEach(function (pn) {
    plates.forEach(function (pl, pi) {
      var lo = 1e9, hi = -1e9;
      pn.pts.forEach(function (q) { var a = apo(q[0] - pl.cx, q[1] - pl.cy); if (a < lo) lo = a; if (a > hi) hi = a; });
      var margin = null;
      if (hi <= A_HOLE_IN) margin = A_HOLE_IN - hi;
      else if (lo >= A_RIM_OUT) margin = lo - A_RIM_OUT;
      else { bad++; console.log('    *** CONFLICT: panel ' + f(pn.w) + ' @(' + f(pn.cx) + ',' + f(pn.cy) +
                                ') crosses plate ' + pi + ' material, spans a ' + f(lo) + '…' + f(hi)); }
      if (margin !== null && margin < tight) { tight = margin; tightWho = 'panel ' + f(pn.w) + ' vs plate ' + pi; }
    });
  });
  var ov = 0, mg = 1e9, mgWho = '';
  for (var i = 0; i < panels.length; i++) for (var j = i + 1; j < panels.length; j++) {
    var a = panels[i], b = panels[j];
    var g = Math.max(Math.max((a.cx - a.w / 2) - (b.cx + b.w / 2), (b.cx - b.w / 2) - (a.cx + a.w / 2)),
                     Math.max((a.cy - a.h / 2) - (b.cy + b.h / 2), (b.cy - b.h / 2) - (a.cy + a.h / 2)));
    if (g < 0) { ov++; console.log('    *** PANEL OVERLAP: ' + f(a.w) + ' and ' + f(b.w) + ' by ' + f(-g)); }
    else if (g < mg) { mg = g; mgWho = f(a.w) + ' ↔ ' + f(b.w); }
  }
  console.log('\n  NESTING');
  console.log('    panels crossing plate material : ' + bad + (bad ? '  ✗' : '  ✓'));
  console.log('    panel-to-panel overlaps        : ' + ov + (ov ? '  ✗' : '  ✓'));
  console.log('    tightest panel↔plate margin    : ' + f(tight) + 'mm   (' + tightWho + ')');
  console.log('    tightest panel↔panel gap       : ' + f(mg) + 'mm   (' + mgWho + ')');
}

// ─── cut order ────────────────────────────────────────────────────────────────
// Colour is the cut sequence. The rule a laser job must respect is that a contour
// is cut while its material is still held: anything nested inside a piece of waste
// goes before the cut that frees that waste. Here that means the panels sitting in
// the plate holes precede the holes, and the holes precede the rims.
// green -> orange -> cyan -> black, and blue is not here at all: blue means ENGRAVE
// across these repositories and never cuts. Green goes first because it carries both
// the panels nested in the plate holes and the patch lines, and each has to be cut
// while its material is still held — the panels before the orange hole drops the
// waste they sit in, the patch lines before the black rim frees the plate.
var CUT_ORDER = ['#00ff00', '#ff8000', '#00ffff', 'black'];
var CUT_NAME = { '#00ff00': 'green', '#ff8000': 'orange', '#00ffff': 'cyan', 'black': 'black' };

if (plates.length) {
  console.log('\n  CUT ORDER');
  // Check every colour the file uses, not just the closed contours. The patch lines
  // are open paths, so a check that walked contours alone reported a clean order
  // while twenty cut-coloured segments had no place in it.
  Object.keys(palette).forEach(function (c) {
    if (palette[c].ignored || CUT_ORDER.indexOf(c) >= 0) return;
    console.log('    *** ' + c + ' (x' + palette[c].n + ') is a cut colour with no place in the ' +
                'cut order — sequence unknown for it');
  });
  var rank = {}; CUT_ORDER.forEach(function (c, i) { rank[c] = i; });

  // Which contours sit inside a plate's hole, and therefore drop out with the waste?
  // Not only panels: patches harvested from the waste disc are nested in exactly the same
  // sense and carry exactly the same ordering obligation. Restricting this to panels let
  // two 76mm patches be added inside the ring holes and cut a stage AFTER the hole that
  // frees the disc they are drawn on, with the check still printing a tick.
  var nested = [];
  plates.forEach(function (pl, pi) {
    P.forEach(function (p) {
      if (p === pl || isHolePartOf(pl, p)) return;
      var r = apoRange(p, pl.cx, pl.cy);
      if (r.hi <= A_HOLE_IN) {
        nested.push({ part: p, plate: pi, kind: isPanel(p) ? 'panel' : 'patch',
                      web: A_HOLE_IN + 0.1 - r.hi });
      }
    });
  });
  // How much material is left between a nested piece and the hole cut that surrounds it.
  // The NESTING block above measures panels only, so a patch tucked hard against the hole
  // does not show up there.
  var thin = nested.length
    ? nested.slice().sort(function (a, b) { return a.web - b.web; })[0] : null;

  CUT_ORDER.forEach(function (c, i) {
    var g = P.filter(function (p) { return p.col === c; });
    // A stage may be open paths only — the patch lines are — in which case there is
    // no contour to describe, but the stage still has to appear in the sequence.
    if (!g.length) {
      if (palette[c] && !palette[c].ignored) {
        console.log('    ' + (i + 1) + '. ' + CUT_NAME[c].padEnd(7) + 'x' +
                    String(palette[c].n).padEnd(4) +
                    'open cut lines — patch cuts, no closed contour of their own');
      }
      return;
    }
    var nPan = g.filter(function (p) { return isPanel(p); }).length;
    var nRim = g.filter(function (p) { return p.w > 160 && Math.abs(p.w - p.h) < 1; }).length;
    var nPatch = g.filter(function (p) {
      return nested.some(function (nn) { return nn.part === p && nn.kind === 'patch'; });
    }).length;
    var nHole = g.length - nPan - nRim - nPatch;
    var role;
    if (nPatch === g.length) role = 'patches harvested from the waste — cut before the waste is freed';
    else if (nPan === g.length) {
      role = g.every(function (p) { return nested.some(function (nn) { return nn.part === p; }); })
        ? 'panels nested in the plate holes — cut before the waste is freed'
        : (nested.some(function (nn) { return nn.part.col === c; })
            ? 'panels, some nested in the holes and some on the open sheet'
            : 'panels on the open sheet');
    } else if (nRim === g.length) role = 'plate rims — frees the plates';
    else if (nHole === g.length) role = 'plate holes';
    else role = 'mixed — ' + nPan + ' panel(s), ' + nPatch + ' patch(es), ' +
                nHole + ' hole(s), ' + nRim + ' rim(s)';
    console.log('    ' + (i + 1) + '. ' + CUT_NAME[c].padEnd(7) + 'x' + String(g.length).padEnd(4) + role);
  });

  if (thin) {
    console.log('    tightest nested piece to its hole: ' + f(thin.web) + 'mm  (' +
                f(thin.part.w) + ' x ' + f(thin.part.h) + ' ' + thin.kind +
                ' in plate ' + thin.plate + ') — kerf comes off both sides of that');
  }
  var viol = 0;
  var holeCol = null, rimCol = null;
  P.forEach(function (p) {
    if (p.w > 160 && Math.abs(p.w - p.h) < 1) rimCol = p.col;
    else if (plates.some(function (pl) { return isHolePartOf(pl, p); })) holeCol = p.col;
  });
  nested.forEach(function (nn) {
    if (holeCol !== null && rank[nn.part.col] > rank[holeCol]) {
      viol++;
      console.log('    *** ' + f(nn.part.w) + 'mm ' + nn.kind + ' ' + nn.part.id +
                  ' sits inside plate ' + nn.plate + "'s hole but is cut " + CUT_NAME[nn.part.col] +
                  ', AFTER the ' + CUT_NAME[holeCol] + ' hole — the waste it is drawn on is ' +
                  'already loose by then');
    }
  });
  if (holeCol !== null && rimCol !== null && rank[holeCol] > rank[rimCol]) {
    viol++;
    console.log('    *** holes (' + CUT_NAME[holeCol] + ') are cut after rims (' + CUT_NAME[rimCol] +
                ') — the plate is loose before its hole is made');
  }
  var nP = nested.filter(function (n) { return n.kind === 'panel'; }).length;
  console.log('    ' + (viol ? '*** ' + viol + ' ordering problem(s) ***'
                             : nP + ' nested panels and ' + (nested.length - nP) +
                               ' patches cut before their hole ✓   holes before rims ✓'));
}

// ─── the skip lines ───────────────────────────────────────────────────────────
// collect() drops ignored colours before they ever become contours, which is right for
// counting cut geometry and useless for describing what is skipped. So re-read the file
// for them here.
//
// This exists because the writeup twice described these lines wrongly -- once as 42
// trumpet slices plus 22 patch lines, when they are one family of 16 per octagon -- and
// nothing could contradict it. A count printed from the file can.
(function () {
  var src = fs.readFileSync(file, 'utf8'), stack = [[1,0,0,1,0,0]], skip = [];
  var re = /<(\/?)(g|path)\b([^>]*?)(\/?)>/g, m;
  while ((m = re.exec(src))) {
    var close = m[1], tag = m[2], attrs = m[3], self = m[4];
    if (tag === 'g') {
      if (close) { stack.pop(); continue; }
      var tm = /transform="([^"]+)"/.exec(attrs);
      stack.push(tm ? mul(stack[stack.length-1], parseT(tm[1])) : stack[stack.length-1]);
      if (self) stack.pop();
      continue;
    }
    if (close) continue;
    var dm = /(?:^|\s)d="([^"]+)"/.exec(attrs);
    if (!dm || !Object.prototype.hasOwnProperty.call(IGNORE, strokeOf(attrs))) continue;
    var pm = /transform="([^"]+)"/.exec(attrs);
    var M = pm ? mul(stack[stack.length-1], parseT(pm[1])) : stack[stack.length-1];
    var q = pts_(dm[1]).map(function (t) { return apply(M, t); });
    if (q.length) skip.push({ pts: q, n: q.length });
  }
  if (!skip.length || !plates.length) return;

  console.log('\n  SKIP LINES  (violet — carried, not cut)');
  var per = plates.map(function () { return []; });
  var loose = 0;
  skip.forEach(function (s) {
    var best = -1, bd = 1e9;
    plates.forEach(function (pl, i) {
      var hi = apoRange(s, pl.cx, pl.cy).hi;
      if (hi < bd) { bd = hi; best = i; }
    });
    if (bd > 110) { loose++; return; }
    per[best].push(apoRange(s, plates[best].cx, plates[best].cy));
  });
  // How far out the octagon itself is drawn, measured rather than assumed: the plates
  // carry finger joints and the rings do not, so their outer edges are not the same
  // number and neither is the constant a skip line should stop at.
  var edge = plates.map(function (pl) { return apoRange(pl, pl.cx, pl.cy).hi; });

  var counts = per.map(function (g) { return g.length; }), over = 0;
  per.forEach(function (g, i) {
    if (!g.length) { console.log('    plate ' + i + ': none'); return; }
    var lo = Math.min.apply(null, g.map(function (r) { return r.lo; }));
    var hi = Math.max.apply(null, g.map(function (r) { return r.hi; }));
    console.log('    plate ' + i + ': ' + g.length + ' line(s), apothem ' +
                f(lo) + ' … ' + f(hi) + '   edge at ' + f(edge[i]));
    // A skip line is a division of the wall, so it belongs between the hole and the
    // edge. One running past the edge sticks out into the waste, where it marks a cut
    // through nothing -- two did, by 0.414mm, and only a reading of the picture caught
    // them. Half the drawn stroke is the tolerance; anything more is real geometry.
    g.forEach(function (r) {
      if (r.hi > edge[i] + 0.15) {
        over++;
        console.log('      *** one reaches ' + f(r.hi) + ', ' + f(r.hi - edge[i]) +
                    'mm past the edge — it overshoots into the waste');
      }
    });
  });
  if (!over) console.log('    none reaches past its octagon\'s outer edge ✓');
  if (loose) console.log('    ' + loose + ' not associated with any plate');
  var same = counts.every(function (c) { return c === counts[0]; });
  console.log('    ' + (same ? 'every plate carries the same ' + counts[0] + ' ✓'
                              : '*** plates carry different counts: ' + counts.join(', ') +
                                ' — deliberate, or a line missed on one of them?'));
})();

// ─── sheet bounds ─────────────────────────────────────────────────────────────
var allx = [], ally = [];
P.forEach(function (p) { p.pts.forEach(function (q) { allx.push(q[0]); ally.push(q[1]); }); });
var x0 = Math.min.apply(null, allx), x1 = Math.max.apply(null, allx);
var y0 = Math.min.apply(null, ally), y1 = Math.max.apply(null, ally);
var vbm = /viewBox="([^"]+)"/.exec(fs.readFileSync(file, 'utf8'));
console.log('\n  SHEET');
console.log('    content : x ' + f(x0) + ' … ' + f(x1) + '   y ' + f(y0) + ' … ' + f(y1) +
            '   (' + f(x1 - x0) + ' × ' + f(y1 - y0) + 'mm)');
if (vbm) {
  var vb = vbm[1].trim().split(/[\s,]+/).map(Number);
  var outside = x0 < vb[0] - 0.01 || x1 > vb[0] + vb[2] + 0.01 || y0 < vb[1] - 0.01 || y1 > vb[1] + vb[3] + 0.01;
  console.log('    viewBox : x ' + vb[0] + ' … ' + f(vb[0] + vb[2]) + '   y ' + vb[1] + ' … ' + f(vb[1] + vb[3]));
  console.log('    ' + (outside ? '*** content extends outside the viewBox ***' : 'all content inside the viewBox ✓'));
}
console.log('');
