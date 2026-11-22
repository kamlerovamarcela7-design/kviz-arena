# KVÍZ ARÉNA – multiplayer kvíz

Funkční první verze: moderátorka spouští otázky, hráči odpovídají přes telefony, server přidělí 1 bod prvnímu hráči se správnou odpovědí. Obsahuje 24 jednoduchých otázek a přidávání vlastních otázek.

## Spuštění

1. Nainstalujte Node.js 18+.
2. V této složce spusťte `npm install`.
3. Spusťte `npm start`.
4. Otevřete `http://localhost:3000`.
5. Pro hraní z více telefonů použijte veřejné HTTPS nasazení na hosting podporující Node.js a WebSockety (např. Render nebo Railway). Případně v jedné Wi-Fi síti otevřete na telefonech adresu `http://IP_ADRESA_POČÍTAČE:3000`.

## Důležité

- Místnosti a skóre jsou v paměti serveru; restart serveru je smaže.
- Pokud se moderátorka odpojí, místnost po 60 sekundách zanikne. Po obnovení spojení musí založit novou místnost.
- Pro veřejný provoz je vhodné doplnit databázi, moderátorské přihlášení, omezení požadavků a správu otázek.
- Otázky se losují náhodně bez opakování v rámci jedné hry.
- Hráč může po chybné odpovědi zkusit jinou možnost; stejnou chybnou možnost již znovu nezvolí.
- Pro férovost rozhoduje pořadí doručení správných odpovědí na server, nikoliv čas z telefonu hráče.
