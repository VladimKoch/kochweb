# =====================================================================
# 1. IMPORT KNIHOVEN 
# =====================================================================
from flask import Flask, request, jsonify           # Flask pro webový server, jsonify pro formátování dat
from flask_cors import CORS                # CORS umožňuje tvému webu volat tento server
from google import genai
from google.genai import types                   # Připojení k modelům Gemini
import feedparser                          # Stahování RSS článků z internetu
import json                                # Práce s JSON formátem
import os                                  # Pro kontrolu, zda soubor s pamětí existuje
import time                                # Pro měření času (jak staré jsou články)

# =====================================================================
# 2. NASTAVENÍ A ZDROJE
# =====================================================================
app = Flask(__name__)
CORS(app)

# Vlož svůj API klíč
client = genai.Client(api_key="AIzaSyBXj4f2nH45qSjz8zxIW1iGzdVMmGSM9tk")

# Zdroje novinek. Pokud jich přidáš více, doporučuji stahovat z každého jen pár článků.
RSS_FEEDS = [
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://venturebeat.com/category/ai/feed/",
    "https://www.zdnet.com/topic/artificial-intelligence/rss.xml",
    # "https://zapier.com/blog/feeds/latest/",
    # "https://www.smashingmagazine.com/feed/"
]

# --- NASTAVENÍ PAMĚTI (CACHE) ---
CACHE_SOUBOR = "trendy_cache.json"
CACHE_ZIVOTNOST = 24 * 60 * 60  # 24 hodin převedeno na sekundy (můžeš změnit)

# =====================================================================
# 3. HLAVNÍ FUNKCE: LOV A ANALÝZA TRENDŮ S PAMĚTÍ
# =====================================================================
@app.route('/trendy', methods=['GET'])
def ziskej_trendy():
    # -----------------------------------------------------------------
    # KROK A: KONTROLA PAMĚTI (Máme už články stažené?)
    # -----------------------------------------------------------------
    if os.path.exists(CACHE_SOUBOR):
        with open(CACHE_SOUBOR, 'r', encoding='utf-8') as f:
            pamet = json.load(f)
            
            # Zjistíme, před kolika sekundami byl soubor vytvořen
            stari_pameti = time.time() - pamet['cas_ulozeni']
            
            # Pokud je paměť mladší než naše nastavená životnost (24h)
            if stari_pameti < CACHE_ZIVOTNOST:
                print("bleskove nacteno z pameti (Zdarma!)")
                return jsonify(pamet['data'])
            else:
                print("Pamet je stara, jdu stahnout nove clanky...")

    # -----------------------------------------------------------------
    # KROK B: STAŽENÍ NOVÝCH ČLÁNKŮ (Pokud je paměť prázdná nebo stará)
    # -----------------------------------------------------------------
    vsechny_clanky = []
    
    for url in RSS_FEEDS:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:3]: # Bereme jen 3 nejnovější z každého (celkem 9)
                vsechny_clanky.append({
                    "title": entry.title,
                    "summary": entry.summary if "summary" in entry else "",
                    "link": entry.link
                })
        except Exception as e:
            print(f"Nelze načíst feed {url}: {e}")

    if not vsechny_clanky:
        return jsonify([])

    text_ke_zpracovani = ""
    for idx, clanek in enumerate(vsechny_clanky):
        text_ke_zpracovani += f"Článek {idx+1}:\nTitulky: {clanek['title']}\nObsah: {clanek['summary']}\nOdkaz: {clanek['link']}\n\n"

    PROMPT_TRENDY = """
    Přečti si následující zahraniční články o AI.
    Vyber z nich přesně 9 nejzajímavějších novinek pro byznys (AI automatizace, weby).
    Vytvoř český nadpis, české shrnutí (2-3 věty) a ponech originální odkaz.
    Odpověz STRIKTNĚ v čistém JSON formátu jako pole objektů. Nepoužívej formátování markdown.
    Příklad: [{"nadpis": "...", "obsah": "...", "odkaz": "..."}]
    """

    try:
        response = client.models.generate_content(
            model='models/gemini-3.5-flash',
            contents=f"{PROMPT_TRENDY}\n\n{text_ke_zpracovani}"
        )
        
        cisty_text = response.text.strip().strip('`').replace('json\n', '')
        vycistena_data = json.loads(cisty_text)
        
        # -----------------------------------------------------------------
        # KROK C: ULOŽENÍ DO PAMĚTI PRO PŘÍŠTÍ NÁVŠTĚVNÍKY
        # -----------------------------------------------------------------
        nova_pamet = {
            "cas_ulozeni": time.time(),
            "data": vycistena_data
        }
        with open(CACHE_SOUBOR, 'w', encoding='utf-8') as f:
            # Uložíme čistá data do souboru na disk
            json.dump(nova_pamet, f, ensure_ascii=False, indent=4)
            
        print("Nove clanky stazeny, prelozeny a ulozeny do pameti!")
        return jsonify(vycistena_data)
        
    except Exception as e:
        print(f"Chyba při analýze trendů: {e}")
        # Pokud nastane chyba, zkusíme alespoň vrátit starou paměť, pokud existuje
        if os.path.exists(CACHE_SOUBOR):
            with open(CACHE_SOUBOR, 'r', encoding='utf-8') as f:
                return jsonify(json.load(f)['data'])
        return jsonify([{"nadpis": "Chyba", "obsah": "Nepodařilo se načíst novinky z trhu.", "odkaz": "#"}])

# =====================================================================
# 4. Chat Bot pro zjištění potřeb klienta a získání e-mailu
# =====================================================================
SYSTEM_PROMPT = """
Jsi AI asistent firmy zaměřené na IT automatizaci a tvorbu webů.
Tvé služby: Tvorba webů, AI agenti, automatizace procesů.
Cíl: Zjistit, co klienta trápí, a získat jeho e-mail pro domluvení schůzky.
Odpovídej stručně a přátelsky v češtině.
"""

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message")

    try:
        # Nový způsob volání Gemini API
        response = client.models.generate_content(
            model='models/gemini-3.5-flash',
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT
            )
        )
        bot_reply = response.text
    except Exception as e:
        print(f"Chyba při komunikaci s API: {e}")
        bot_reply = "Omlouvám se, ale momentálně mám technické potíže. Zkuste to prosím za chvíli."

    return jsonify({"reply": bot_reply})
# =====================================================================
# 5. SPUŠTĚNÍ SERVERU
# =====================================================================
if __name__ == '__main__':
    app.run(port=5000)