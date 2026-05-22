// ===== DONNÉES PAR DÉFAUT =====
var CONTACTS_DEFAUT = [
  { id: 1, prenom: "Alassane",  nom: "BAH",   tel: "+221 77 123 45 67", email: "alassane.bah@ird.fr",  adresse: "ESP, Dakar",  groupe: "Travail" },
  { id: 2, prenom: "Tidiane",   nom: "SOW",   tel: "+221 76 234 56 78", email: "tidiane.sow@ucad.sn",  adresse: "ESP, Dakar",  groupe: "École"   },
  { id: 3, prenom: "Mandicou",  nom: "BA",    tel: "+221 77 345 67 89", email: "mandicou.ba@ird.fr",   adresse: "ESP, Dakar",  groupe: "Travail" },
  { id: 4, prenom: "Mohamadou", nom: "KEITA", tel: "+221 78 456 78 90", email: "m.keita@esp.sn",       adresse: "Dakar",       groupe: "École"   },
  { id: 5, prenom: "Fatou",     nom: "DIOP",  tel: "+221 77 567 89 01", email: "fatou.diop@gmail.com", adresse: "Sacré-Coeur", groupe: "Famille" },
];

var contacts = [];
var prochainId = 6;
var contactDetailId = null;
var donneesOriginales = null;

// ===== LOCALSTORAGE =====
function sauvegarder() {
  localStorage.setItem("contacts", JSON.stringify(contacts));
  localStorage.setItem("prochainId", String(prochainId));
}

function charger() {
  var raw = localStorage.getItem("contacts");
  if (raw) {
    contacts = JSON.parse(raw);
    prochainId = parseInt(localStorage.getItem("prochainId")) || contacts.length + 1;
  } else {
    contacts = CONTACTS_DEFAUT.slice();
    prochainId = 6;
    sauvegarder();
  }
}

// ===== COULEURS =====
var COULEURS = {
  "Travail": "#1a6ed8",
  "Famille": "#27ae60",
  "Amis":    "#e67e22",
  "École":   "#8e44ad",
  "":        "#636e72"
};

function couleur(groupe) {
  return COULEURS[groupe] || "#636e72";
}

function initiales(prenom, nom) {
  return (prenom[0] || "").toUpperCase() + (nom[0] || "").toUpperCase();
}

// ===== AFFICHER LA LISTE =====
function afficherListe(liste) {
  var conteneur = document.getElementById("liste-contacts");
  document.getElementById("footer-count").textContent = liste.length + " contact(s)";

  if (liste.length === 0) {
    conteneur.innerHTML =
      '<div class="empty-state"><div class="emoji">📭</div><p>Aucun contact trouvé</p></div>';
    return;
  }

  var tries = liste.slice().sort(function(a, b) { return a.nom.localeCompare(b.nom); });
  var groupes = {};
  tries.forEach(function(c) {
    var lettre = c.nom[0].toUpperCase();
    if (!groupes[lettre]) groupes[lettre] = [];
    groupes[lettre].push(c);
  });

  var html = "";
  Object.keys(groupes).sort().forEach(function(lettre) {
    html += '<div class="lettre-header">' + lettre + '</div>';
    groupes[lettre].forEach(function(c) {
      var badge = c.groupe ? '<span class="contact-badge">' + c.groupe + '</span>' : "";
      html +=
        '<div class="contact-item" data-id="' + c.id + '">' +
          '<div class="avatar" style="background:' + couleur(c.groupe) + '">' + initiales(c.prenom, c.nom) + '</div>' +
          '<div class="contact-info">' +
            '<div class="contact-name">' + c.prenom + " " + c.nom + '</div>' +
            '<div class="contact-phone">' + c.tel + '</div>' +
          '</div>' +
          badge +
        '</div>';
    });
  });

  conteneur.innerHTML = html;
}

// ===== RECHERCHE =====
$(document).on("input", "#recherche", function() {
  var q = $(this).val().toLowerCase();
  var resultats = contacts.filter(function(c) {
    return (c.prenom + " " + c.nom).toLowerCase().indexOf(q) !== -1 ||
           c.tel.indexOf(q) !== -1 ||
           (c.email || "").toLowerCase().indexOf(q) !== -1;
  });
  afficherListe(resultats);
});

// ===== CLIC SUR UN CONTACT =====
$(document).on("click", "#liste-contacts .contact-item", function() {
  ouvrirDetail(parseInt($(this).data("id")));
});

// ===== OUVRIR DÉTAIL =====
function ouvrirDetail(id) {
  var c = contacts.find(function(x) { return x.id === id; });
  if (!c) return;
  contactDetailId = id;

  var av = document.getElementById("d-avatar");
  av.textContent = initiales(c.prenom, c.nom);
  av.style.background = couleur(c.groupe);

  $("#d-nom-complet").text(c.prenom + " " + c.nom);
  $("#d-groupe").text(c.groupe || "Sans groupe");
  $("#d-tel").text(c.tel);
  $("#d-email").text(c.email || "—");
  $("#d-adresse").text(c.adresse || "—");

  $.mobile.navigate("#page-detail");
}

// ===== BOUTON MODIFIER → direct au formulaire =====
$(document).on("click", "#btn-modifier", function() {
  var c = contacts.find(function(x) { return x.id === contactDetailId; });
  if (!c) return false;

  donneesOriginales = {
    prenom:  c.prenom,
    nom:     c.nom,
    tel:     c.tel,
    email:   c.email   || "",
    adresse: c.adresse || "",
    groupe:  c.groupe  || ""
  };

  $("#form-titre").text("Modifier le contact");
  $("#contact-id").val(c.id);
  $("#f-prenom").val(c.prenom);
  $("#f-nom").val(c.nom);
  $("#f-tel").val(c.tel);
  $("#f-email").val(c.email || "");
  $("#f-adresse").val(c.adresse || "");
  $("#f-groupe").val(c.groupe || "").selectmenu("refresh");

  $.mobile.navigate("#page-form");
  return false;
});

// ===== BOUTON AJOUTER =====
$(document).on("click", "#btn-goto-add", function() {
  donneesOriginales = null;
  $("#form-titre").text("Nouveau contact");
  $("#contact-id").val("");
  $("#f-prenom, #f-nom, #f-tel, #f-email, #f-adresse").val("");
  $("#f-groupe").val("").selectmenu("refresh");
});

// ===== ENREGISTRER =====
$(document).on("click", "#btn-save", function() {
  var prenom  = $("#f-prenom").val().trim();
  var nom     = $("#f-nom").val().trim();
  var tel     = $("#f-tel").val().trim();
  var email   = $("#f-email").val().trim();
  var adresse = $("#f-adresse").val().trim();
  var groupe  = $("#f-groupe").val();
  var idExist = $("#contact-id").val();

  if (!prenom || !nom || !tel) {
    alert("Prénom, Nom et Téléphone sont obligatoires !");
    return false;
  }

  if (idExist && donneesOriginales) {
    var aucunChangement =
      prenom  === donneesOriginales.prenom  &&
      nom     === donneesOriginales.nom     &&
      tel     === donneesOriginales.tel     &&
      email   === donneesOriginales.email   &&
      adresse === donneesOriginales.adresse &&
      groupe  === donneesOriginales.groupe;

    if (aucunChangement) {
      $.mobile.navigate("#page-detail");
      return false;
    }

    if (!confirm("Confirmer les modifications ?")) return false;

    var idx = contacts.findIndex(function(c) { return c.id == idExist; });
    contacts[idx] = {
      id: parseInt(idExist), prenom: prenom, nom: nom,
      tel: tel, email: email, adresse: adresse, groupe: groupe
    };

  } else {
    contacts.push({
      id: prochainId++, prenom: prenom, nom: nom,
      tel: tel, email: email, adresse: adresse, groupe: groupe
    });
  }

  sauvegarder();
  $.mobile.navigate("#page-liste");
  return false;
});

// ===== SUPPRIMER (fonction globale appelée via onclick) =====
function supprimerContact() {
  var c = contacts.find(function(x) { return x.id === contactDetailId; });
  if (!c) return;
  if (!confirm("Supprimer " + c.prenom + " " + c.nom + " ?")) return;
  contacts = contacts.filter(function(x) { return x.id !== contactDetailId; });
  sauvegarder();
  $.mobile.navigate("#page-liste");
}

// ===== RAFRAÎCHIR AU RETOUR SUR LA LISTE =====
$(document).on("pageshow", "#page-liste", function() {
  var q = $("#recherche").val().toLowerCase();
  var resultats = q
    ? contacts.filter(function(c) {
        return (c.prenom + " " + c.nom).toLowerCase().indexOf(q) !== -1 ||
               c.tel.indexOf(q) !== -1 ||
               (c.email || "").toLowerCase().indexOf(q) !== -1;
      })
    : contacts;
  afficherListe(resultats);
});

charger();