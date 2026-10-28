(function () {
  "use strict";
  var demoData = window.CUSTOMERS || [];
  var data = demoData;
  var branchen = [];
  var state = { search: "", branche: "Alle", sortKey: "umsatzMio", sortDir: -1, selected: null };

  var fmt = new Intl.NumberFormat("de-DE");
  function $(id) { return document.getElementById(id); }
  function el(tag, text, cls) {
    var e = document.createElement(tag);
    if (text !== undefined) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }

  function filtered() {
    var s = state.search.toLowerCase();
    return data.filter(function (c) {
      return (state.branche === "Alle" || c.branche === state.branche) &&
             (!s || c.name.toLowerCase().indexOf(s) !== -1);
    }).sort(function (a, b) {
      var x = a[state.sortKey], y = b[state.sortKey];
      var r = typeof x === "string" ? x.localeCompare(y, "de") : x - y;
      return r * state.sortDir;
    });
  }

  function sum(list, key) { return list.reduce(function (t, c) { return t + c[key]; }, 0); }

  function renderKpis(list) {
    var open = 0;
    list.forEach(function (c) { c.activities.forEach(function (a) { if (a.status === "offen") open++; }); });
    var items = [
      [list.length, "Kunden"],
      [fmt.format(sum(list, "umsatzMio")), "Umsatz gesamt (Mio. €)"],
      [fmt.format(sum(list, "mitarbeiter")), "Mitarbeiter gesamt"],
      [open, "Offene Aktivitäten"]
    ];
    var box = $("kpis");
    box.textContent = "";
    items.forEach(function (i) {
      var k = el("div", undefined, "kpi");
      k.appendChild(el("div", String(i[0]), "v"));
      k.appendChild(el("div", i[1], "l"));
      box.appendChild(k);
    });
  }

  function renderChart(list) {
    var byB = {};
    list.forEach(function (c) { byB[c.branche] = (byB[c.branche] || 0) + c.umsatzMio; });
    var rows = Object.keys(byB).map(function (k) { return [k, byB[k]]; })
      .sort(function (a, b) { return b[1] - a[1]; });
    var max = rows.length ? rows[0][1] : 1;
    var box = $("chart");
    box.textContent = "";
    rows.forEach(function (r) {
      var row = el("div", undefined, "bar-row");
      row.appendChild(el("span", r[0]));
      var bar = el("div", undefined, "bar");
      bar.style.width = Math.max(2, (r[1] / max) * 100) + "%";
      row.appendChild(bar);
      row.appendChild(el("span", fmt.format(r[1]), "num"));
      box.appendChild(row);
    });
  }

  function renderOpen(list) {
    var items = [];
    list.forEach(function (c) {
      c.activities.forEach(function (a) { if (a.status === "offen") items.push({ c: c, a: a }); });
    });
    items.sort(function (x, y) { return x.a.datum.localeCompare(y.a.datum); });
    var ul = $("open");
    ul.textContent = "";
    if (!items.length) ul.appendChild(el("li", "Keine offenen Aktivitäten.", "muted"));
    items.forEach(function (i) {
      var li = el("li");
      li.appendChild(el("strong", i.c.name));
      li.appendChild(document.createElement("br"));
      li.appendChild(el("small", i.a.datum + " · " + i.a.typ + " · " + i.a.text));
      ul.appendChild(li);
    });
  }

  function renderTable(list) {
    var tb = document.querySelector("#table tbody");
    tb.textContent = "";
    list.forEach(function (c) {
      var tr = el("tr");
      tr.tabIndex = 0;
      [[c.name], [c.branche], [fmt.format(c.mitarbeiter), "num"], [fmt.format(c.umsatzMio), "num"]]
        .forEach(function (v) { tr.appendChild(el("td", v[0], v[1])); });
      var open = function () { state.selected = c.id; renderDetail(); };
      tr.addEventListener("click", open);
      tr.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
      tb.appendChild(tr);
    });
  }

  function renderDetail() {
    var box = $("detail");
    var c = data.filter(function (x) { return x.id === state.selected; })[0];
    if (!c) { box.hidden = true; return; }
    box.hidden = false;
    box.textContent = "";
    box.appendChild(el("h2", c.name + " · " + c.land));
    var h = c.hinweise || {};
    var meta = [
      ["Branche", c.branche, c.quellen.branche],
      ["Mitarbeiter", fmt.format(c.mitarbeiter) + (h.mitarbeiter ? " (" + h.mitarbeiter + ")" : ""), c.quellen.mitarbeiter],
      ["Umsatz", fmt.format(c.umsatzMio) + " Mio. €" + (h.umsatz ? " (" + h.umsatz + ")" : ""), c.quellen.umsatz]
    ];
    meta.forEach(function (m) {
      var p = el("p", m[0] + ": " + m[1]);
      p.appendChild(el("span", "Quelle: " + m[2], "src"));
      box.appendChild(p);
    });
    var ul = el("ul", undefined, "list");
    c.activities.slice().sort(function (a, b) { return b.datum.localeCompare(a.datum); })
      .forEach(function (a) {
        ul.appendChild(el("li", a.datum + " · " + a.typ + " · " + a.status + " · " + a.text));
      });
    box.appendChild(ul);
  }

  function render() {
    var list = filtered();
    renderKpis(list); renderChart(list); renderOpen(list); renderTable(list); renderDetail();
  }

  // Filter und Sortierung
  function setData(list) {
    data = list;
    state.branche = "Alle"; state.search = ""; state.selected = null;
    $("search").value = "";
    branchen = ["Alle"].concat(Array.from(new Set(data.map(function (c) { return c.branche; }))).sort());
    var sel = $("branche");
    sel.textContent = "";
    branchen.forEach(function (b) { var o = el("option", b); o.value = b; sel.appendChild(o); });
    render();
  }
  $("branche").addEventListener("change", function (e) { state.branche = e.target.value; render(); });
  $("search").addEventListener("input", function (e) { state.search = e.target.value; render(); });
  Array.prototype.forEach.call(document.querySelectorAll("th[data-key]"), function (th) {
    th.addEventListener("click", function () {
      var k = th.getAttribute("data-key");
      state.sortDir = state.sortKey === k ? -state.sortDir : 1;
      state.sortKey = k;
      render();
    });
  });

  // ---- Datenimport (lokal, die Datei verlässt den Browser nie) ----
  // CSV: eine Zeile pro Aktivität, Kundenspalten wiederholt. Gleiche id (sonst gleicher Name) = ein Kunde.
  function parseCsv(text, d) {
    var rows = [], row = [], f = "", q = false, i, ch;
    for (i = 0; i < text.length; i++) {
      ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
        else f += ch;
      } else if (ch === '"') q = true;
      else if (ch === d) { row.push(f); f = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(f); rows.push(row); row = []; f = "";
      } else f += ch;
    }
    if (q) throw new Error("CSV ungültig: Anführungszeichen nicht geschlossen.");
    if (f !== "" || row.length) { row.push(f); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return c.trim() !== ""; }); });
  }

  // "1.200" -> 1200, "310,5" -> 310.5, "1.234,5" -> 1234.5. Nicht lesbar: Text bleibt, validate() meldet es.
  function num(s) {
    var t = s.replace(/[\s\u00a0€]/g, "");
    if (t === "") return s;
    var dot = t.lastIndexOf("."), com = t.lastIndexOf(",");
    if (dot !== -1 && com !== -1) t = dot > com ? t.replace(/,/g, "") : t.replace(/\./g, "").replace(",", ".");
    else if (com !== -1) t = t.split(",").length > 2 ? t.replace(/,/g, "") : t.replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
    var n = Number(t);
    return isNaN(n) ? s : n;
  }

  // Liest die erste Zahl aus Text wie "~49.000 (Gruppe)", "350+" oder "47,1 (USD)".
  // Zusätze (ca., mindestens, Klammertext) werden als Hinweis aufbewahrt.
  function numInfo(s) {
    var m = s.match(/\d[\d.,]*\d|\d/);
    if (!m) return { value: s, note: "" };
    var v = num(m[0]);
    if (typeof v !== "number") return { value: s, note: "" };
    var before = s.slice(0, m.index), after = s.slice(m.index + m[0].length), notes = [];
    if (/(~|≈|\bca\.?)\s*$/i.test(before)) notes.push("ca. Wert");
    if (/^\s*\+/.test(after)) notes.push("Mindestwert");
    var p = after.match(/\(([^)]*)\)/);
    if (p && p[1].trim()) notes.push(p[1].trim());
    return { value: v, note: notes.join(", ") };
  }

  // "22.10.26" -> "2026-10-22". Andere Formate bleiben unverändert.
  function isoDate(s) {
    var m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
    if (!m) return s;
    return (m[3].length === 2 ? "20" + m[3] : m[3]) + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[1]).slice(-2);
  }

  // Salesforce-Status: Open, Not Started, In Progress, Waiting, Deferred gelten als offen, alles andere als erledigt.
  function normStatus(s) {
    return /^(open|offen|not started|nicht begonnen|in progress|in bearbeitung|waiting|deferred)/i.test(s.trim()) ? "offen" : "erledigt";
  }

  function csvToCustomers(text) {
    text = text.replace(/^\uFEFF/, "");
    var first = text.split(/\r?\n/)[0] || "";
    var best = ";", bestN = -1;
    [";", ",", "\t"].forEach(function (d) {
      var n = first.split(d).length - 1;
      if (n > bestN) { best = d; bestN = n; }
    });
    var rows = parseCsv(text, best);
    if (rows.length < 2) throw new Error("Die CSV-Datei braucht eine Kopfzeile und mindestens eine Datenzeile.");
    var header = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    ["name", "branche", "mitarbeiter", "umsatzmio"].forEach(function (col) {
      if (header.indexOf(col) === -1) throw new Error("Spalte \"" + col + "\" fehlt in der Kopfzeile.");
    });
    function cell(r, n) { var i = header.indexOf(n); return i < 0 || r[i] === undefined ? "" : r[i].trim(); }
    var map = {}, list = [];
    rows.slice(1).forEach(function (r, i) {
      var key = cell(r, "id") || cell(r, "name");
      if (!key) throw new Error("Zeile " + (i + 2) + ": weder \"id\" noch \"name\" angegeben.");
      var c = map[key];
      if (!c) {
        var mi = numInfo(cell(r, "mitarbeiter")), um = numInfo(cell(r, "umsatzmio"));
        c = map[key] = {
          id: cell(r, "id") || undefined, name: cell(r, "name"), branche: cell(r, "branche"), land: cell(r, "land"),
          mitarbeiter: mi.value, umsatzMio: um.value,
          hinweise: { mitarbeiter: mi.note, umsatz: um.note },
          quellen: { branche: cell(r, "quelle_branche"), mitarbeiter: cell(r, "quelle_mitarbeiter"), umsatz: cell(r, "quelle_umsatz") },
          activities: []
        };
        list.push(c);
      }
      var a = { datum: isoDate(cell(r, "aktivitaet_datum")), typ: cell(r, "aktivitaet_typ"),
                status: cell(r, "aktivitaet_status"), text: cell(r, "aktivitaet_text") };
      if (!(a.datum || a.typ || a.status || a.text)) return;
      a.status = normStatus(a.status);
      // Doppelte Zeilen (gleiche Aktivität beim selben Kunden) nur einmal übernehmen
      var dup = c.activities.some(function (x) {
        return x.datum === a.datum && x.typ === a.typ && x.status === a.status && x.text === a.text;
      });
      if (!dup) c.activities.push(a);
    });
    return list;
  }

  // UTF-8 (auch mit BOM), sonst Windows-1252 (typisch für Excel-Export)
  function decode(buf) {
    try { return new TextDecoder("utf-8", { fatal: true }).decode(buf); }
    catch (e) { return new TextDecoder("windows-1252").decode(buf); }
  }

  function isStr(v) { return typeof v === "string" && v.trim() !== ""; }
  function isNum(v) { return typeof v === "number" && isFinite(v); }
  function str(v, fallback) { return isStr(v) ? v : fallback; }

  // Prüft und normalisiert. Wirft Error mit verständlicher Meldung.
  function validate(raw) {
    if (!Array.isArray(raw) || !raw.length) throw new Error("Die Datei enthält keine Kunden.");
    var ids = {};
    return raw.map(function (c, i) {
      var pos = "Eintrag " + (i + 1) + ": ";
      if (!c || typeof c !== "object") throw new Error(pos + "ist kein Objekt.");
      if (!isStr(c.name)) throw new Error(pos + "Feld \"name\" fehlt.");
      if (!isStr(c.branche)) throw new Error(pos + "Feld \"branche\" fehlt (" + c.name + ").");
      if (!isNum(c.mitarbeiter)) throw new Error(pos + "\"mitarbeiter\" muss eine Zahl sein (" + c.name + ").");
      if (!isNum(c.umsatzMio)) throw new Error(pos + "\"umsatzMio\" muss eine Zahl sein (" + c.name + ").");
      var id = c.id !== undefined && c.id !== null ? c.id : i + 1;
      if (ids[id]) throw new Error(pos + "id \"" + id + "\" kommt doppelt vor.");
      ids[id] = true;
      var acts = c.activities === undefined ? [] : c.activities;
      if (!Array.isArray(acts)) throw new Error(pos + "\"activities\" muss eine Liste sein (" + c.name + ").");
      var q = c.quellen && typeof c.quellen === "object" ? c.quellen : {};
      var h = c.hinweise && typeof c.hinweise === "object" ? c.hinweise : {};
      return {
        id: id, name: c.name, branche: c.branche, land: str(c.land, "–"),
        mitarbeiter: c.mitarbeiter, umsatzMio: c.umsatzMio,
        hinweise: { mitarbeiter: str(h.mitarbeiter, ""), umsatz: str(h.umsatz, "") },
        quellen: { branche: str(q.branche, "unbekannt"), mitarbeiter: str(q.mitarbeiter, "unbekannt"), umsatz: str(q.umsatz, "unbekannt") },
        activities: acts.map(function (a, j) {
          if (!a || typeof a !== "object") throw new Error(pos + "Aktivität " + (j + 1) + " ist kein Objekt (" + c.name + ").");
          return {
            datum: str(a.datum, ""), typ: str(a.typ, "Aktivität"),
            status: a.status === "offen" ? "offen" : "erledigt", text: str(a.text, "")
          };
        })
      };
    });
  }

  function showImportMsg(text, isError) {
    var m = $("importMsg");
    m.textContent = text;
    m.hidden = !text;
    m.className = "import-msg" + (isError ? " error" : "");
  }

  $("file").addEventListener("change", function (e) {
    var f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    var reader = new FileReader();
    reader.onerror = function () { showImportMsg("Datei konnte nicht gelesen werden.", true); };
    reader.onload = function () {
      try {
        var list = validate(csvToCustomers(decode(reader.result)));
        setData(list);
        $("badge").textContent = "Eigene Daten: " + f.name + " (nur lokal im Browser)";
        $("resetData").hidden = false;
        showImportMsg(list.length + " Kunden geladen.", false);
        addMsg("Neue Daten geladen: " + list.length + " Kunden.", "bot");
      } catch (err) {
        showImportMsg(err.message, true);
      }
    };
    reader.readAsArrayBuffer(f);
  });

  $("resetData").addEventListener("click", function () {
    setData(demoData);
    $("badge").textContent = "Prototyp mit Beispieldaten";
    $("resetData").hidden = true;
    showImportMsg("", false);
    addMsg("Zurück zu den Beispieldaten.", "bot");
  });

  // ---- Copilot (Mock, regelbasiert) ----
  // Später ersetzen: watsonx-Orchestrate-Webchat einbinden und answer() nicht mehr verwenden.
  function answer(q) {
    var t = q.toLowerCase();
    var list = filtered();
    var found = data.filter(function (c) { return t.indexOf(c.name.toLowerCase().split(" ")[0]) !== -1; })[0];
    if (found) {
      var open = found.activities.filter(function (a) { return a.status === "offen"; });
      return found.name + ": " + found.branche + ", " + fmt.format(found.mitarbeiter) + " Mitarbeiter, " +
        fmt.format(found.umsatzMio) + " Mio. € Umsatz. Offene Aktivitäten: " +
        (open.length ? open.map(function (a) { return a.typ + " am " + a.datum + " (" + a.text + ")"; }).join("; ") : "keine") + ".";
    }
    if (/umsatz|top/.test(t)) {
      return "Top 3 nach Umsatz:\n" + list.slice().sort(function (a, b) { return b.umsatzMio - a.umsatzMio; })
        .slice(0, 3).map(function (c, i) { return (i + 1) + ". " + c.name + " (" + fmt.format(c.umsatzMio) + " Mio. €)"; }).join("\n");
    }
    if (/offen|aktivit|termin/.test(t)) {
      var n = 0;
      list.forEach(function (c) { c.activities.forEach(function (a) { if (a.status === "offen") n++; }); });
      return "Es gibt " + n + " offene Aktivitäten in der aktuellen Auswahl.";
    }
    if (/mitarbeiter/.test(t)) {
      return "Mitarbeiter gesamt in der Auswahl: " + fmt.format(sum(list, "mitarbeiter")) + ".";
    }
    if (/branche/.test(t)) {
      return "Branchen: " + branchen.slice(1).join(", ") + ".";
    }
    return "Das kann der Prototyp noch nicht beantworten. Probiere: \"Top-Kunden nach Umsatz\", \"Offene Aktivitäten\" oder einen Kundennamen.";
  }

  function addMsg(text, who) {
    var m = el("div", text, "msg " + who);
    $("messages").appendChild(m);
    $("messages").scrollTop = $("messages").scrollHeight;
  }
  addMsg("Hallo! Ich beantworte Fragen zu deinen Kunden (Prototyp mit Beispieldaten).", "bot");
  $("chat").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = $("q").value.trim();
    if (!q) return;
    addMsg(q, "user");
    addMsg(answer(q), "bot");
    $("q").value = "";
  });

  setData(demoData);
})();
