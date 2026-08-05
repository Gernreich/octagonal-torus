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
    if (/stroke:\s*#(ff0000|0000ff|00ff00)|fill:\s*#00ff00/i.test(attrs)) continue;
    var dm = /(?:^|\s)d="([^"]+)"/.exec(attrs);
    if (!dm) continue;
    var pm = /transform="([^"]+)"/.exec(attrs);
    var M = pm ? mul(stack[stack.length-1], parseT(pm[1])) : stack[stack.length-1];
    var p = pts_(dm[1]).map(function (q) { return apply(M, q); });
    if (p.length < 8) continue;
    var xs=p.map(function(q){return q[0];}), ys=p.map(function(q){return q[1];});
    var x0=Math.min.apply(null,xs), x1=Math.max.apply(null,xs);
    var y0=Math.min.apply(null,ys), y1=Math.max.apply(null,ys);
    parts.push({ pts:p, w:x1-x0, h:y1-y0, cx:(x0+x1)/2, cy:(y0+y1)/2 });
  }
  return parts;
}
function f(x){ return Math.round(x*1000)/1000; }

// A panel is specifically a ~31.2 mm tall rectangle. Anything else lying wholly inside a plate's
// rim is hole geometry — whether drawn as one loop or as 8 segments.
function isPanel(p) { return p.h > 28 && p.h < 34 && p.w > 40 && p.w < 90; }
function holePartsFor(plate, all) {
  return all.filter(function (p) {
    if (p === plate || isPanel(p)) return false;
    var inside = true;
    p.pts.forEach(function (q) { if (apo(q[0] - plate.cx, q[1] - plate.cy) > 83.0) inside = false; });
    return inside;
  });
}

var file = process.argv[2];
var P = collect(file);
console.log('\n════ ' + file.split('/').pop() + '   contours: ' + P.length);

var agg = {};
P.forEach(function (p) { var k=f(p.w)+' x '+f(p.h); agg[k]=(agg[k]||0)+1; });
console.log('\n  inventory');
Object.keys(agg).sort(function(a,b){return parseFloat(b)-parseFloat(a);}).forEach(function (k) {
  var W=parseFloat(k), H=parseFloat(k.split('x')[1]), ex='';
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
// interval ends legitimately differ by ~0.1 mm and an exact match would never fire.
function complementary(a, b, tol) {
  if (a.length !== b.length || !a.length) return false;
  for (var i = 0; i < a.length; i++) {
    if (a[i].w === b[i].w) return false;                                  // same line = same phase
    if (Math.abs((a[i].lo + a[i].hi) / 2 - (b[i].lo + b[i].hi) / 2) > tol) return false;
  }
  return true;
}

var KERF = 0.1, A_HOLE_IN = 55.149, A_HOLE_OUT = 58.149, A_RIM_OUT = 86.149;

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
// Bounding boxes are useless here: the plates have a 110 mm hole and panels are legitimately
// nested in that waste. Classify each panel by the octagon support function instead.
var panels = P.filter(isPanel);   // strictly ~31.2 mm tall rectangles — not hole loops
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
  console.log('    tightest panel↔plate margin    : ' + f(tight) + ' mm   (' + tightWho + ')');
  console.log('    tightest panel↔panel gap       : ' + f(mg) + ' mm   (' + mgWho + ')');
}

// ─── sheet bounds ─────────────────────────────────────────────────────────────
var allx = [], ally = [];
P.forEach(function (p) { p.pts.forEach(function (q) { allx.push(q[0]); ally.push(q[1]); }); });
var x0 = Math.min.apply(null, allx), x1 = Math.max.apply(null, allx);
var y0 = Math.min.apply(null, ally), y1 = Math.max.apply(null, ally);
var vbm = /viewBox="([^"]+)"/.exec(fs.readFileSync(file, 'utf8'));
console.log('\n  SHEET');
console.log('    content : x ' + f(x0) + ' … ' + f(x1) + '   y ' + f(y0) + ' … ' + f(y1) +
            '   (' + f(x1 - x0) + ' × ' + f(y1 - y0) + ' mm)');
if (vbm) {
  var vb = vbm[1].trim().split(/[\s,]+/).map(Number);
  var outside = x0 < vb[0] - 0.01 || x1 > vb[0] + vb[2] + 0.01 || y0 < vb[1] - 0.01 || y1 > vb[1] + vb[3] + 0.01;
  console.log('    viewBox : x ' + vb[0] + ' … ' + f(vb[0] + vb[2]) + '   y ' + vb[1] + ' … ' + f(vb[1] + vb[3]));
  console.log('    ' + (outside ? '*** content extends outside the viewBox ***' : 'all content inside the viewBox ✓'));
}
console.log('');
