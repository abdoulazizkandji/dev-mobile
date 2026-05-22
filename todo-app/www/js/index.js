// todo app - tidiane

var tasks        = JSON.parse(localStorage.getItem("tasks") || "[]");
var filtre       = "all";
var selectedTask = null;

// --- drag vars ---
var dragCard    = null;   // l element .task-card en cours de drag
var dragStartX  = 0;
var dragCurrX   = 0;
var isDragging  = false;  // true des qu on a bougé de plus de 5px
var SEUIL       = 100;    // px minimum pour supprimer

function sauvegarder() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getHeure(id) {
    var d = new Date(id);
    return d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0");
}

function getPrioLabel(p) {
    if (p === "high")   return "Priorité haute";
    if (p === "medium") return "Priorité moyenne";
    return "Priorité faible";
}

// ============================================
//  RENDU
// ============================================
function afficher() {
    var liste = tasks.filter(function(t) {
        if (filtre === "done") return  t.done;
        if (filtre === "todo") return !t.done;
        return true;
    });

    var html = "";

    if (liste.length === 0) {
        html = "<li class='empty'>Aucune tâche ici 📋</li>";
    } else {
        for (var i = 0; i < liste.length; i++) {
            var t = liste[i];
            var isSelected = (t.id === selectedTask);
            var selClass   = isSelected ? " selected" : "";
            var doneClass  = t.done ? " done" : "";
            var checkClass = t.done ? " checked" : "";
            var checkIcon  = t.done ? "✓" : "";
            var tagHtml    = t.done
                ? "<span class='task-tag tag-termine'>✓ Terminé</span>"
                : "<span class='task-tag tag-encours'>⏳ En cours</span>";

            html += "<li class='task-item " + t.priority + selClass + "' data-id='" + t.id + "'>";
            html += "  <div class='task-delete-bg'><span>🗑</span> Supprimer</div>";
            html += "  <div class='task-card'>";
            html += "    <div class='task-row'>";
            html += "      <div class='prio-bar'></div>";
            html += "      <div class='task-time'>" + getHeure(t.id) + "</div>";
            html += "      <div class='task-body'>";
            html += "        <div class='task-name" + doneClass + "'>" + $("<div>").text(t.text).html() + "</div>";
            html += "        <div class='task-sub'>" + getPrioLabel(t.priority) + "</div>";
            html += "      </div>";
            html += "      " + tagHtml;
            html += "      <button class='check-btn" + checkClass + "'>" + checkIcon + "</button>";
            html += "    </div>";
            if (isSelected) {
                html += "  <div class='task-action-row'>";
                html += "    <button class='btn-close'>Fermer</button>";
                html += "    <button class='btn-complete'>Compléter</button>";
                html += "  </div>";
            }
            html += "  </div>"; // .task-card
            html += "</li>";
        }
    }

    $("#taskList").html(html);

    if (filtre === "all") {
        $("#taskList").sortable("enable");
    } else {
        $("#taskList").sortable("disable");
    }

    majStats();
    bindDrag();
}

function majStats() {
    var total   = tasks.length;
    var encours = tasks.filter(function(t){ return !t.done; }).length;
    var faites  = tasks.filter(function(t){ return  t.done; }).length;
    var pct     = total > 0 ? Math.round(faites / total * 100) : 0;

    $("#statTotal").text(total);
    $("#statEnCours").text(encours);
    $("#progBar").css("width", pct + "%");
    $("#progText").text(faites + " / " + total + " tâche" + (total > 1 ? "s" : "") + " (" + pct + "%)");
}

// ============================================
//  DRAG TO DELETE
//  La carte suit le doigt/curseur vers la droite
//  Si on relâche après SEUIL px → suppression
//  Sinon → rebond en place
// ============================================
function bindDrag() {
    document.querySelectorAll(".task-card").forEach(function(card) {

        // ---- TOUCH ----
        card.addEventListener("touchstart", function(e) {
            // ignorer si on touche check-btn ou les boutons d action
            if (e.target.closest(".check-btn, .btn-close, .btn-complete")) return;
            dragCard   = card;
            dragStartX = e.touches[0].clientX;
            dragCurrX  = 0;
            isDragging = false;
            card.style.transition = "none";
        }, { passive: true });

        card.addEventListener("touchmove", function(e) {
            if (dragCard !== card) return;

            var dx = e.touches[0].clientX - dragStartX;
            var dy = e.touches[0].clientY - (e.touches[0].clientY); // pas utilisé

            // uniquement vers la droite
            if (dx <= 0) return;

            // detecter si c est un vrai drag (pas un tap)
            if (dx > 5) isDragging = true;

            e.preventDefault(); // bloque le scroll pendant le drag

            dragCurrX = dx;
            card.style.transform = "translateX(" + dx + "px)";

            // la carte s'assombrit progressivement
            var ratio = Math.min(dx / SEUIL, 1);
            card.style.opacity = 1 - ratio * 0.4;

        }, { passive: false });

        card.addEventListener("touchend", function() {
            if (dragCard !== card) return;
            relacher(card);
        }, { passive: true });

        // ---- MOUSE (pour tester sur navigateur) ----
        card.addEventListener("mousedown", function(e) {
            if (e.target.closest(".check-btn, .btn-close, .btn-complete")) return;
            dragCard   = card;
            dragStartX = e.clientX;
            dragCurrX  = 0;
            isDragging = false;
            card.style.transition = "none";

            function onMouseMove(ev) {
                if (dragCard !== card) return;
                var dx = ev.clientX - dragStartX;
                if (dx <= 0) return;
                if (dx > 5) isDragging = true;
                dragCurrX = dx;
                card.style.transform = "translateX(" + dx + "px)";
                var ratio = Math.min(dx / SEUIL, 1);
                card.style.opacity = 1 - ratio * 0.4;
            }

            function onMouseUp() {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                if (dragCard === card) relacher(card);
            }

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });

    });
}

function relacher(card) {
    dragCard = null;

    if (isDragging && dragCurrX >= SEUIL) {
        // supprimer : la carte file vers la droite
        card.style.transition = "transform 0.2s ease, opacity 0.2s";
        card.style.transform  = "translateX(120%)";
        card.style.opacity    = "0";

        var li = card.closest(".task-item");
        var id = parseInt(li.getAttribute("data-id"));

        setTimeout(function() {
            tasks = tasks.filter(function(t){ return t.id !== id; });
            if (selectedTask === id) selectedTask = null;
            sauvegarder();
            afficher();
        }, 210);

    } else {
        // rebondir en place
        card.style.transition = "transform 0.25s cubic-bezier(.25,1.4,.5,1), opacity 0.2s";
        card.style.transform  = "translateX(0)";
        card.style.opacity    = "1";
    }

    isDragging = false;
    dragCurrX  = 0;
}

// ============================================
//  ACTIONS
// ============================================
function ajouterTache() {
    var texte = $("#taskInput").val().trim();
    if (!texte) {
        $("#taskInput").css("border-color", "#f44336");
        setTimeout(function(){ $("#taskInput").css("border-color",""); }, 700);
        return;
    }
    tasks.unshift({
        id:       Date.now(),
        text:     texte,
        done:     false,
        priority: $("#prioritySelect").val()
    });
    sauvegarder();
    fermerModal();
    afficher();
}

function toggleTache(id) {
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) { tasks[i].done = !tasks[i].done; break; }
    }
    sauvegarder();
    afficher();
}

function completerTache(id) {
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) { tasks[i].done = true; break; }
    }
    selectedTask = null;
    sauvegarder();
    afficher();
}

function majOrdre() {
    var newOrder = [];
    $("#taskList .task-item").each(function() {
        var id = parseInt($(this).data("id"));
        var t  = tasks.find(function(x){ return x.id === id; });
        if (t) newOrder.push(t);
    });
    var visIds = newOrder.map(function(t){ return t.id; });
    var reste  = tasks.filter(function(t){ return visIds.indexOf(t.id) === -1; });
    tasks = newOrder.concat(reste);
    sauvegarder();
}

function ouvrirModal() {
    $("#taskInput").val("");
    $("#prioritySelect").val("medium");
    $("#addZone").show();
    setTimeout(function(){ $("#taskInput").focus(); }, 200);
}

function fermerModal() {
    $("#addZone").hide();
    $("#taskInput").blur();
}

// ============================================
//  INIT
// ============================================
function init() {
    var options = { day: "numeric", month: "long", year: "numeric" };
    $("#dateLabel").text(new Date().toLocaleDateString("fr-FR", options));

    $("#taskList").sortable({
        handle:      ".prio-bar",   // drag jQuery UI uniquement sur la bande coloree
        placeholder: "sort-ph",
        tolerance:   "pointer",
        update:      majOrdre
    });

    $("#editDialog").dialog({
        autoOpen: false,
        modal: true,
        width: 290,
        title: "Modifier",
        buttons: {
            "OK": function() {
                var v = $("#editInput").val().trim();
                if (v) {
                    for (var i = 0; i < tasks.length; i++) {
                        if (tasks[i].id === window._editId) { tasks[i].text = v; break; }
                    }
                    sauvegarder();
                    afficher();
                }
                $(this).dialog("close");
            },
            "Annuler": function() { $(this).dialog("close"); }
        }
    });

    // tap sur la carte → sélectionner (seulement si pas de drag)
    $("#taskList").on("click", ".task-card", function(e) {
        if ($(e.target).is(".check-btn")) return;
        if (isDragging) return; // ignorer le tap apres un drag
        var id = parseInt($(this).closest(".task-item").data("id"));
        selectedTask = (selectedTask === id) ? null : id;
        afficher();
    });

    // double tap → éditer
    $("#taskList").on("dblclick", ".task-name", function() {
        var id = parseInt($(this).closest(".task-item").data("id"));
        var t  = tasks.find(function(x){ return x.id === id; });
        if (!t) return;
        window._editId = id;
        $("#editInput").val(t.text);
        $("#editDialog").dialog("open");
    });

    // checkbox
    $("#taskList").on("click", ".check-btn", function(e) {
        e.stopPropagation();
        var id = parseInt($(this).closest(".task-item").data("id"));
        toggleTache(id);
    });

    // fermer / compléter
    $("#taskList").on("click", ".btn-close", function() {
        selectedTask = null;
        afficher();
    });

    $("#taskList").on("click", ".btn-complete", function() {
        var id = parseInt($(this).closest(".task-item").data("id"));
        completerTache(id);
    });

    // filtres
    $(".f-btn").on("click", function() {
        $(".f-btn").removeClass("active");
        $(this).addClass("active");
        filtre = $(this).data("f");
        selectedTask = null;
        afficher();
    });

    // modal
    $("#fabBtn").on("click", ouvrirModal);
    $("#cancelBtn").on("click", fermerModal);
    $("#addBtn").on("click", ajouterTache);
    $("#taskInput").on("keypress", function(e){ if (e.which === 13) ajouterTache(); });
    $("#addZone").on("click", function(e){ if ($(e.target).is("#addZone")) fermerModal(); });

    // thème
    $("#themeBtn").on("click", function() {
        $("body").toggleClass("dark");
        $(this).text($("body").hasClass("dark") ? "☀️" : "🌙");
    });

    afficher();
}

document.addEventListener("deviceready", init, false);
if (!window.cordova) { $(function(){ init(); }); }
