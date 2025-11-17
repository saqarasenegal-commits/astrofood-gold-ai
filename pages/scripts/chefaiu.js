
(function () {
  // Trace très visible pour vérifier que c'est bien CE script qui tourne
  console.log("CHEFAI UI v7 LOADED");

  const byId = (id) => document.getElementById(id);

  const btn = byId("btn-generate");
  const signSel = byId("sign");
  const langSel = byId("lang");
  const card = byId("recipe");

  const el = {
    title: byId("r-title"),
    poem: byId("r-poem"),
    ing: byId("r-ingredients"),
    steps: byId("r-steps"),
    nutri: byId("r-nutrition"),
    tip: byId("r-tip"),
    openCard: byId("open-card"),
    debug: byId("r-debug"),
  };

  const loader = document.getElementById("chefai-loader");
  const setLoading = (on) => {
    if (loader) loader.style.display = on ? "grid" : "none";
  };

  const br = (t) => String(t || "").replace(/\n/g, "<br>");

  async function generate() {
    if (!btn) return;
    const sign = (signSel?.value || "belier").trim().toLowerCase();
    const lang = (langSel?.value || "fr").trim().toLowerCase();

    btn.disabled = true;
    btn.textContent = "⏳ Génération…";
    setLoading(true);
    if (card) card.style.display = "none";
    if (el.debug) el.debug.textContent = "";

    try {
      const res = await fetch("/api/chefai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sign, lang }),
      });

      // On essaie de lire JSON, sinon texte
      let data;
      try {
        data = await res.json();
      } catch {
        const txt = await res.text();
        console.log("Réponse TEXTE brute de /api/chefai :", txt);
        alert("Réponse API en texte brut, voir console.");
        return;
      }

      console.log("Réponse JSON de /api/chefai :", data);

      if (!res.ok) {
        alert("Erreur HTTP " + res.status + " – voir console.");
        return;
      }

      // On accepte { ok:true, recipe:{...} } ou { ...recette... } directement
      const rec = data.recipe || data;

      if (!rec || typeof rec !== "object") {
        alert("Réponse API inattendue, voir console.");
        console.log("Objet reçu:", data);
        return;
      }

      // Remplissage très simple
      const ingredients = Array.isArray(rec.ingredients)
        ? rec.ingredients
        : rec.ingredients
        ? [String(rec.ingredients)]
        : [];

      const instructions = Array.isArray(rec.instructions || rec.steps)
        ? (rec.instructions || rec.steps)
        : rec.instructions || rec.steps
        ? [String(rec.instructions || rec.steps)]
        : [];

      const nutri = rec.nutrition && typeof rec.nutrition === "object"
        ? rec.nutrition
        : {};

      if (el.title) el.title.textContent = rec.title || "Recette AstroFood";
      if (el.poem) el.poem.innerHTML = br(rec.poem || "");
      if (el.ing) {
        el.ing.innerHTML = ingredients.map((x) => `<li>${x}</li>`).join("");
      }
      if (el.steps) {
        el.steps.innerHTML = instructions.map((x) => `<li>${x}</li>`).join("");
      }
      if (el.nutri) {
        const line =
          nutri.calories || nutri.proteins || nutri.carbs || nutri.fats
            ? `Kcal: ${nutri.calories ?? "-"} – Prot: ${
                nutri.proteins ?? "-"
              } – Glu: ${nutri.carbs ?? "-"} – Lip: ${nutri.fats ?? "-"}`
            : "";
        el.nutri.textContent = line;
      }
      if (el.tip) el.tip.textContent = rec.tip || "";

      if (el.openCard) {
        el.openCard.href = `/card/${encodeURIComponent(
          sign
        )}?lang=${encodeURIComponent(lang)}`;
      }

      if (el.debug) {
        el.debug.textContent = JSON.stringify(rec, null, 2);
      }

      if (card) {
        card.style.display = "block";
        card.scrollIntoView({ behavior: "smooth" });
      }
    } catch (e) {
      alert("Erreur réseau / JS : " + e.message);
      console.error("Erreur generate():", e);
    } finally {
      setLoading(false);
      if (btn) {
        btn.disabled = false;
        btn.textContent = "🍳 Générer";
      }
    }
  }

  if (btn) {
    btn.addEventListener("click", generate);
  } else {
    console.warn("Bouton #btn-generate introuvable dans le DOM.");
  }
})();
