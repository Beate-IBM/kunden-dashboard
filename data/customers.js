// Beispieldaten (fiktiv). Später ersetzen durch Export aus Conga/Salesforce.
// quelle je Feld: "Salesforce" | "Wikipedia" | "LinkedIn" | "Web"
window.CUSTOMERS = [
  { id: 1, name: "Nordwind Maschinenbau AG", branche: "Industrie", land: "DE", mitarbeiter: 4200, umsatzMio: 980,
    quellen: { branche: "Wikipedia", mitarbeiter: "LinkedIn", umsatz: "Salesforce" },
    activities: [
      { datum: "2026-04-28", typ: "Meeting", status: "offen", text: "Workshop Hybrid-Cloud-Strategie" },
      { datum: "2026-04-10", typ: "E-Mail", status: "erledigt", text: "Angebot Automation verschickt" } ] },
  { id: 2, name: "Alpenbank Holding", branche: "Finanzen", land: "CH", mitarbeiter: 8900, umsatzMio: 3100,
    quellen: { branche: "Wikipedia", mitarbeiter: "Web", umsatz: "Salesforce" },
    activities: [
      { datum: "2026-05-05", typ: "Call", status: "offen", text: "Security-Review mit CISO" },
      { datum: "2026-03-18", typ: "Meeting", status: "erledigt", text: "Kick-off Mainframe-Modernisierung" } ] },
  { id: 3, name: "Rheinpharm GmbH", branche: "Pharma", land: "DE", mitarbeiter: 2600, umsatzMio: 740,
    quellen: { branche: "Wikipedia", mitarbeiter: "LinkedIn", umsatz: "Web" },
    activities: [
      { datum: "2026-04-30", typ: "Demo", status: "offen", text: "watsonx Demo für R&D" } ] },
  { id: 4, name: "Hansa Logistik SE", branche: "Logistik", land: "DE", mitarbeiter: 15300, umsatzMio: 2200,
    quellen: { branche: "Wikipedia", mitarbeiter: "LinkedIn", umsatz: "Salesforce" },
    activities: [
      { datum: "2026-04-22", typ: "Meeting", status: "erledigt", text: "Lieferketten-Transparenz Use Case" },
      { datum: "2026-05-12", typ: "Call", status: "offen", text: "Budgetrunde Q3" } ] },
  { id: 5, name: "Tiroler Energie AG", branche: "Energie", land: "AT", mitarbeiter: 3100, umsatzMio: 1250,
    quellen: { branche: "Web", mitarbeiter: "LinkedIn", umsatz: "Salesforce" },
    activities: [
      { datum: "2026-04-15", typ: "E-Mail", status: "erledigt", text: "Referenzfall Netzmonitoring gesendet" } ] },
  { id: 6, name: "Bavaria Automotive Systems", branche: "Automobil", land: "DE", mitarbeiter: 21000, umsatzMio: 5400,
    quellen: { branche: "Wikipedia", mitarbeiter: "Wikipedia", umsatz: "Salesforce" },
    activities: [
      { datum: "2026-05-02", typ: "Meeting", status: "offen", text: "Executive Briefing Edge-Computing" },
      { datum: "2026-04-01", typ: "Demo", status: "erledigt", text: "Instana Proof of Concept" } ] },
  { id: 7, name: "Zürcher Versicherung", branche: "Finanzen", land: "CH", mitarbeiter: 5600, umsatzMio: 1900,
    quellen: { branche: "Wikipedia", mitarbeiter: "LinkedIn", umsatz: "Web" },
    activities: [
      { datum: "2026-05-08", typ: "Call", status: "offen", text: "Follow-up Compliance-Anforderungen" } ] },
  { id: 8, name: "Mittelland Handel GmbH", branche: "Handel", land: "DE", mitarbeiter: 950, umsatzMio: 210,
    quellen: { branche: "Web", mitarbeiter: "LinkedIn", umsatz: "Salesforce" },
    activities: [
      { datum: "2026-03-30", typ: "Meeting", status: "erledigt", text: "Erstgespräch E-Commerce-Plattform" } ] },
  { id: 9, name: "Donau Medizintechnik", branche: "Pharma", land: "AT", mitarbeiter: 1800, umsatzMio: 430,
    quellen: { branche: "Wikipedia", mitarbeiter: "Web", umsatz: "Salesforce" },
    activities: [
      { datum: "2026-05-14", typ: "Demo", status: "offen", text: "KI-gestützte Qualitätsprüfung" } ] },
  { id: 10, name: "Stadtwerke Elbtal", branche: "Energie", land: "DE", mitarbeiter: 1200, umsatzMio: 380,
    quellen: { branche: "Web", mitarbeiter: "Web", umsatz: "Salesforce" },
    activities: [
      { datum: "2026-04-25", typ: "E-Mail", status: "offen", text: "Angebot Observability nachfassen" } ] }
];
