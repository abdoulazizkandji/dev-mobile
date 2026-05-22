/* ============================================
   Calculateur IMC — Logique principale
   Encodage UTF-8 — Commentaires en français
   ============================================ */

/**
 * Définition des catégories IMC
 * Chaque objet contient :
 *   - max       : valeur max de l'intervalle (Infinity si pas de borne)
 *   - label     : nom de la catégorie
 *   - cssClass  : classe CSS pour la couleur
 *   - conseil   : message de conseil affiché à l'utilisateur
 *   - icone     : emoji indicatif
 */
var CATEGORIES_IMC = [
  {
    max: 16.5,
    label: "Dénutrition",
    cssClass: "cat-denutrition",
    icone: "⚠️",
    conseil: "Votre IMC indique une dénutrition. Consultez un médecin ou nutritionniste rapidement."
  },
  {
    max: 18.5,
    label: "Maigreur",
    cssClass: "cat-maigreur",
    icone: "📉",
    conseil: "Votre IMC indique une corpulence insuffisante. Un suivi médical et nutritionnel est recommandé."
  },
  {
    max: 25.0,
    label: "Poids normal",
    cssClass: "cat-normal",
    icone: "✅",
    conseil: "Félicitations ! Votre poids est dans la plage normale. Continuez à maintenir une alimentation équilibrée et une activité physique régulière."
  },
  {
    max: 30.0,
    label: "Surpoids",
    cssClass: "cat-surpoids",
    icone: "⚡",
    conseil: "Votre IMC indique un surpoids léger. Une activité physique régulière et une alimentation équilibrée sont conseillées."
  },
  {
    max: 35.0,
    label: "Obésité modérée",
    cssClass: "cat-ob-moderee",
    icone: "🔶",
    conseil: "Votre IMC indique une obésité modérée. Consultez un professionnel de santé pour un accompagnement adapté."
  },
  {
    max: 40.0,
    label: "Obésité sévère",
    cssClass: "cat-ob-severe",
    icone: "🔴",
    conseil: "Votre IMC indique une obésité sévère. Un suivi médical spécialisé est fortement recommandé."
  },
  {
    max: Infinity,
    label: "Obésité massive / morbide",
    cssClass: "cat-ob-massive",
    icone: "🆘",
    conseil: "Votre IMC indique une obésité massive ou morbide. Une prise en charge médicale urgente est nécessaire."
  }
];

/**
 * Correspondance entre les classes CSS et les lignes du tableau de référence
 */
var LIGNE_TABLEAU = {
  "cat-denutrition": ".ref-denutrition",
  "cat-maigreur":    ".ref-maigreur",
  "cat-normal":      ".ref-normal",
  "cat-surpoids":    ".ref-surpoids",
  "cat-ob-moderee":  ".ref-ob-mod",
  "cat-ob-severe":   ".ref-ob-sev",
  "cat-ob-massive":  ".ref-ob-mas"
};

/**
 * Calcule et affiche l'IMC
 * Appelé par le bouton "Calculer mon IMC"
 */
function calculerIMC() {

  // Récupération et nettoyage des valeurs saisies
  var poids  = parseFloat(document.getElementById("poids").value);
  var taille = parseFloat(document.getElementById("taille").value);

  // Validation des entrées
  if (!validerEntrees(poids, taille)) {
    return; // Arrêt si les valeurs sont invalides
  }

  // Conversion de la taille en mètres
  var tailleMetres = taille / 100;

  // Calcul de l'IMC : poids / taille²
  var imc = poids / (tailleMetres * tailleMetres);

  // Arrondi à 2 décimales
  imc = Math.round(imc * 100) / 100;

  // Identification de la catégorie
  var categorie = determinerCategorie(imc);

  // Affichage des résultats
  afficherResultat(imc, categorie);
}

/**
 * Valide les entrées utilisateur
 * @param {number} poids  - Poids en kg
 * @param {number} taille - Taille en cm
 * @returns {boolean} true si les valeurs sont valides
 */
function validerEntrees(poids, taille) {

  // Suppression de tout message d'erreur existant
  var erreurExistante = document.getElementById("msg-erreur");
  if (erreurExistante) {
    erreurExistante.remove();
  }

  var messageErreur = "";

  if (isNaN(poids) || poids <= 0) {
    messageErreur = "Veuillez entrer un poids valide (ex : 70).";
  } else if (poids > 300) {
    messageErreur = "Le poids saisi semble trop élevé (max : 300 kg).";
  } else if (isNaN(taille) || taille <= 0) {
    messageErreur = "Veuillez entrer une taille valide (ex : 175).";
  } else if (taille < 50 || taille > 250) {
    messageErreur = "La taille doit être comprise entre 50 et 250 cm.";
  }

  if (messageErreur !== "") {
    afficherErreur(messageErreur);
    return false;
  }

  return true;
}

/**
 * Affiche un message d'erreur dans l'interface
 * @param {string} message - Message à afficher
 */
function afficherErreur(message) {
  var div = document.createElement("div");
  div.id = "msg-erreur";
  div.className = "message-erreur";
  div.textContent = message;

  // Insertion avant le bouton calculer
  var btnCalculer = document.getElementById("btn-calculer");
  btnCalculer.parentNode.insertBefore(div, btnCalculer.nextSibling);
}

/**
 * Détermine la catégorie IMC à partir de la valeur calculée
 * @param {number} imc - Valeur IMC calculée
 * @returns {object} Objet catégorie correspondant
 */
function determinerCategorie(imc) {
  for (var i = 0; i < CATEGORIES_IMC.length; i++) {
    if (imc < CATEGORIES_IMC[i].max) {
      return CATEGORIES_IMC[i];
    }
  }
  // Ne devrait pas arriver (Infinity est la dernière borne)
  return CATEGORIES_IMC[CATEGORIES_IMC.length - 1];
}

/**
 * Affiche le résultat dans l'interface
 * @param {number} imc      - Valeur IMC calculée
 * @param {object} categorie - Catégorie IMC déterminée
 */
function afficherResultat(imc, categorie) {

  // Mise à jour de la valeur numérique
  document.getElementById("valeur-imc").textContent = imc.toFixed(1);

  // Mise à jour du bloc interprétation
  var divInterpretation = document.getElementById("interpretation");
  divInterpretation.className = "interpretation " + categorie.cssClass;
  divInterpretation.innerHTML =
    "<strong>" + categorie.icone + " " + categorie.label + "</strong><br>" +
    "<p style='font-size:0.88em;font-weight:normal;margin-top:8px'>" +
    categorie.conseil + "</p>";

  // Mise en surbrillance de la ligne dans le tableau de référence
  // Suppression de toute surbrillance précédente
  var lignesActives = document.querySelectorAll(".ligne-active");
  for (var j = 0; j < lignesActives.length; j++) {
    lignesActives[j].classList.remove("ligne-active");
  }

  // Application de la surbrillance sur la bonne ligne
  var selecteurLigne = LIGNE_TABLEAU[categorie.cssClass];
  if (selecteurLigne) {
    var ligne = document.querySelector(selecteurLigne);
    if (ligne) {
      ligne.classList.add("ligne-active");
    }
  }

  // Affichage de la zone résultat (avec animation CSS)
  var zoneResultat = document.getElementById("zone-resultat");
  zoneResultat.style.display = "block";

  // Défilement automatique vers les résultats
  setTimeout(function() {
    zoneResultat.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

/**
 * Remet l'interface à l'état initial
 * Appelé par le bouton "Recommencer"
 */
function reinitialiser() {

  // Vider les champs de saisie
  document.getElementById("poids").value  = "";
  document.getElementById("taille").value = "";

  // Cacher la zone résultat
  document.getElementById("zone-resultat").style.display = "none";

  // Remettre la valeur IMC à --
  document.getElementById("valeur-imc").textContent = "--";

  // Supprimer tout message d'erreur
  var erreur = document.getElementById("msg-erreur");
  if (erreur) erreur.remove();

  // Remonter en haut de page
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================
   Initialisation Cordova
   (attend que le device soit prêt)
   ============================================ */
document.addEventListener("deviceready", function() {
  console.log("Cordova prêt — Application IMC démarrée");
}, false);