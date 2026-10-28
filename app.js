(function () {
  "use strict";
  var data = window.CUSTOMERS || [];
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
    var meta = [
      ["Branche", c.branche, c.quellen.branche],
      ["Mitarbeiter", fmt.format(c.mitarbeiter), c.quellen.mitarbeiter],
      ["Umsatz", fmt.format(c.umsatzMio) + " Mio. €", c.quellen.umsatz]
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
  var branchen = ["Alle"].concat(Array.from(new Set(data.map(function (c) { return c.branche; }))).sort());
  branchen.forEach(function (b) { var o = el("option", b); o.value = b; $("branche").appendChild(o); });
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

  render();
})();
