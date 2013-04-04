/*jslint browser: true, maxerr: 50, indent: 2, nomen: false, regexp: false */
/*global window, console, $ */
var FNC = FNC || (function () {
  'use strict';
  var self = {};
  self.model = {
    getObjects : function () {
      FNC.model.red = {
        touches : 0,
        boutAssignment : null
      };
      FNC.model.green = {
        touches : 0,
        boutAssignment : null
      };
    },
    tourneyData : {},
    getTournaments : function () {
      $.getJSON("data/tournaments.json")
        .done(function (data) {
          console.log("Test JSON Data: " + data.tournaments[0].events[0].fencers[0].name);
          FNC.model.tourneyData = data.tournaments[0];
          FNC.view.buildTourneyPage();
        })
        .fail(function (jqxhr, textStatus, error) {
          var err = textStatus + ', ' + error;
          console.log("Request Failed: " + err);
        });
    },
    setBoutAssignment : function ($currentFencers) {
      if (!$currentFencers) {
        //nullify FNC.model.boutAssignment
        var key;
        for (key in FNC.model) {
          if (FNC.model.hasOwnProperty(key)) {
            FNC.model[key].boutAssignment = null;
          }
        }
        return false;
      }
      $currentFencers.each(function (index) {
        FNC.model[$(this).attr("data-strip-side")].boutAssignment = $(this).attr("data-fencer-seed");
      });
    }
  };
  self.view = {
    getObjects : function () {
      FNC.view.$modalScreen = $('.modal-screen');
      FNC.view.$messageModal = $('.message-modal');
      FNC.view.$touchCounter = $('.touch-counter');
      FNC.view.$touchCounterTouches = {
        red : $('[data-touches="red"]'),
        green : $('[data-touches="green"]')
      };
      FNC.view.$fencersOnStrip = {};
      FNC.view.$boutScoringCell = {
        red : null,
        green : null
      };
    },
    buildTourneyPage : function () {
      $('body').attr('data-tournament-index', FNC.model.tourneyData.id);
      FNC.view.buildFencerList();
    },
    buildFencerList : function () {
      var html = '';
      $.each(FNC.model.tourneyData.events[0].fencers, function (index, fencer) {
        html += '<li data-fencer-index=' + index + '><dl>';
        html += '<dt class="draggable fencer">' + fencer.name + '</dt><dd>' + fencer.club + '</dd>';
        html += '</dl></li>';
      });
      $('#fencers').html(html);
      FNC.view.dragDropFencers();
    },
    dragDropFencers : function () {
      var scorepadFencerPopulator = {};
      $('.draggable').draggable({ opacity: 0.7, helper: "clone", containment: "document", cursor: "pointer", revert: false, revertDuration: 300,
        start: function () {
          scorepadFencerPopulator = {
            index : $(this).closest('li').attr('data-fencer-index'),
            text : $(this).text()
          };
        }
      });
      $('.drop-fencer').droppable({ hoverClass: "hover", tolerance: "pointer", accept: ".fencer",
        drop: function () {
          $(this).attr('data-fencer-reference', scorepadFencerPopulator.index);
          $(this).text(scorepadFencerPopulator.text);
        }
      });
    },
    assignMessageModal : function (message) {
      FNC.view.$messageModal.find('p').text(message);
      FNC.view.$messageModal.toggleClass('invisible');
    },
    assignFencerCells : function () {
      var red = FNC.model.red.boutAssignment,
        green = FNC.model.green.boutAssignment;
      FNC.view.$boutScoringCell.red = $('#scoring-grid tbody tr:nth-child(' + red + ') td:nth-of-type(' + green + ')');
      FNC.view.$boutScoringCell.green = $('#scoring-grid tbody tr:nth-child(' + green + ') td:nth-of-type(' + red + ')');
    },
    recordTouches : function (color) {
      FNC.view.$touchCounterTouches[color].text(FNC.model[color].touches);
      //also show score on scoresheet
    }
  };
  self.events = {
    offCanvasEvents : function () {
      $('.show-list').click(function (evt) {
        evt.preventDefault();
        $('#container').toggleClass('show-left');
      });
    },
    assignStripSide : function () {
      $('[data-strip-side]').click(function (evt) {
        if ($(this).attr('data-strip-side') === "green") {
          $(this).attr('data-strip-side', '');
          return;
        }
        var color = ($(this).attr('data-strip-side') === '') ? "red" : "green";
        $(this).attr('data-strip-side', color);
      });
    },
    scoringButtons : function () {
      $('.touch-counter div a').click(function (evt) {
        evt.preventDefault();
        var color = $(this).parent().attr('class');
        FNC.model[color].touches += (($(this).hasClass('plus')) ? 1 : -1);
        FNC.view.recordTouches(color);
      });
    },
    toggleModalScreen : function () {
      $('[data-modal-screen-toggle="true"]').click(function (evt) {
        evt.preventDefault();
        FNC.view.$modalScreen.toggleClass('invisible');
      });
    },
    toggleMessageModal : function () {
      $('[data-message-modal-toggle="true"]').click(function (evt) {
        FNC.view.$messageModal.toggleClass('invisible');
      });
    },
    toggleTouchCounter : function () {
      $('[data-touch-counter-toggle="true"]').click(function (evt) {
        var $currentFencers = $('[data-strip-side*="r"]'),
          uniqueRed = 0;
        if ($currentFencers.length !== 2) {
          FNC.view.assignMessageModal("Select two strip opponents first");
          return false;
        }
        $currentFencers.each(function (index, elem) {
          uniqueRed += (($(elem).attr("data-strip-side") === "red") ? 1 : 0);
        });
        if (uniqueRed !== 1) {
          FNC.view.assignMessageModal("Each opponent must have unique color");
          return false;
        }
        FNC.view.$touchCounter.toggleClass('invisible');
        if (FNC.view.$touchCounter.hasClass('invisible')) {
          FNC.model.setBoutAssignment();
          return false;
        }
        FNC.view.$fencersOnStrip = $currentFencers;
        FNC.model.setBoutAssignment(FNC.view.$fencersOnStrip);
        FNC.view.assignFencerCells();
      });
    },
    initializeEvents : function () {
      FNC.events.offCanvasEvents();
      FNC.events.assignStripSide();
      FNC.events.scoringButtons();
      FNC.events.toggleModalScreen();
      FNC.events.toggleMessageModal();
      FNC.events.toggleTouchCounter();
    }
  };
  return self;
}());





//bind plus to sibling counter
//bind minus to reverse sibling counter
//bind change to copy match to scoring paper

$(document).ready(function () {
  'use strict';
  FNC.model.getObjects();
  FNC.model.getTournaments();
  FNC.view.getObjects();
  FNC.events.initializeEvents();
});
