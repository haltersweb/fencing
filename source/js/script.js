/*jslint browser: true, maxerr: 50, indent: 2, nomen: false, regexp: false */
/*global window, console, $ */
var FNC = FNC || (function () {
  'use strict';
  var self = {};
  self.model = {
    getObjects : function () { //FNC.model
      FNC.model.red = {
        touches : 0,
        boutAssignment : null
      };
      FNC.model.green = {
        touches : 0,
        boutAssignment : null
      };
    },
    fencerData : [],
    /*
      {
        fencerId : null,
        vScore : 0,
        tsScore : 0,
        trScore : 0,
        indicator : 0,
        place : 0
      }
    */
    tourneyData : {}, //FNC.model
    getTournaments : function () { //FNC.model
      var eventId = prompt("Enter the event number (86450).");
      $.getJSON("data/" + eventId + ".json")
        .done(function (data) {
          console.log("Test JSON Data: " + data.event.preregs[0].competitor.first_name + " " + data.event.preregs[0].competitor.last_name);
          FNC.model.tourneyData = data.event;
          FNC.view.buildTourneyPage();
        })
        .fail(function (jqxhr, textStatus, error) {
          var err = textStatus + ', ' + error;
          console.log("Request Failed: " + err);
        });
    },
    initializeFencingData : function () {
      for (var i = 0; i < 8; i++) {
        FNC.model.fencerData[i] = {
          fencerId : null,
          vScore : 0,
          tsScore : 0,
          trScore : 0,
          indicator : 0,
          place : 0
        }
      }
    },
    setFencingData_Id : function (index,id) {
      FNC.model.fencerData[index].fencerId = id;
    },
    setBoutAssignment : function ($currentFencers) { //FNC.model
      //nullify FNC.model.boutAssignment at end of bout
      if (!$currentFencers) {
        var key;
        for (key in FNC.model) {
          if (FNC.model.hasOwnProperty(key)) {
            FNC.model[key].boutAssignment = null;
          }
        }
        //also, need to dehighlight green / red names
        return false;
      }
      $currentFencers.each(function (index) {
        FNC.model[$(this).attr("data-strip-side")].boutAssignment = $(this).attr("data-fencer-seed");
      });
    }
  };
  self.view = {
    getObjects : function () { //FNC.view
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
    buildTourneyPage : function () { //FNC.view
      $('body').attr('data-tournament-id', FNC.model.tourneyData.tournament_id).attr('data-event-id', FNC.model.tourneyData.id);
      FNC.view.buildFencerList();
    },
    buildFencerList : function () { //FNC.view
      var html = '';
      $.each(FNC.model.tourneyData.preregs, function (index, fencer) {
        html += '<li data-competitor-id=' + fencer.competitor.id + '><dl>';
        html += '<dt class="draggable fencer">' + fencer.competitor.first_name + ' ' + fencer.competitor.last_name + '</dt><dd>' + fencer.club.initials + ' ' + fencer.club.name + '</dd>';
        html += '</dl></li>';
      });
      $('#fencers').html(html);
      FNC.view.dragDropFencers();
    },
    dragDropFencers : function () { //FNC.view
      var scorepadFencerPopulator = {};
      $('.draggable').draggable({ opacity: 0.7, helper: "clone", containment: "document", cursor: "pointer", revert: false, revertDuration: 300,
        start: function () {
          //console.log('dragging');
          scorepadFencerPopulator = {
            id : $(this).closest('li').attr('data-competitor-id'),
            text : $(this).text()
          };
        }
      });
      $('.drop-fencer').droppable({ hoverClass: "hover", tolerance: "pointer", accept: ".fencer",
        drop: function () {
          //console.log('dropping');
          var $parent = $(this).parent(),
              seed = $parent.attr('data-fencer-seed'),
              id = scorepadFencerPopulator.id;
          $parent.attr('data-competitor-id', id);
          $(this).text(scorepadFencerPopulator.text);
          FNC.model.setFencingData_Id((seed - 1), id);
        }
      });
    },
    assignMessageModal : function (message) { //FNC.view
      FNC.view.$messageModal.find('p').text(message);
      FNC.view.$messageModal.toggleClass('invisible');
    },
    assignFencerCells : function () { //FNC.view
      var red = FNC.model.red.boutAssignment,
        green = FNC.model.green.boutAssignment;
      FNC.view.$boutScoringCell.red = $('#scoring-grid tbody tr:nth-child(' + red + ') td:nth-of-type(' + green + ')');
      FNC.view.$boutScoringCell.green = $('#scoring-grid tbody tr:nth-child(' + green + ') td:nth-of-type(' + red + ')');
    },
    recordTouches : function (color) { //FNC.view
      FNC.view.$touchCounterTouches[color].text(FNC.model[color].touches);
      FNC.view.$boutScoringCell[color].text(FNC.model[color].touches);
    },
    showVictor : function () {
      if (FNC.model.red.touches > FNC.model.green.touches) {
        FNC.view.$boutScoringCell.red.addClass("victory");
        FNC.view.$boutScoringCell.green.removeClass("victory");
        return true;
      }
      FNC.view.$boutScoringCell.red.removeClass("victory");
      FNC.view.$boutScoringCell.green.addClass("victory");
    }
  };
  self.events = {
    offCanvasEvents : function () { //FNC.events
      $('.show-list').click(function (evt) {
        evt.preventDefault();
        $('#container').toggleClass('show-left');
      });
    },
    assignStripSide : function () { //FNC.events
      $('[data-strip-side]').click(function (evt) {
        if ($(this).attr('data-strip-side') === "green") {
          $(this).attr('data-strip-side', '');
          return;
        }
        var color = ($(this).attr('data-strip-side') === '') ? "red" : "green";
        $(this).attr('data-strip-side', color);
      });
    },
    scoringButtons : function () { //FNC.events
      $('.touch-counter div a').click(function (evt) {
        evt.preventDefault();
        var color = $(this).parent().attr('class');
        FNC.model[color].touches += (($(this).hasClass('plus')) ? 1 : -1);
        FNC.view.recordTouches(color);
      });
    },
    toggleModalScreen : function () { //FNC.events
      $('[data-modal-screen-toggle="true"]').click(function (evt) {
        evt.preventDefault();
        FNC.view.$modalScreen.toggleClass('invisible');
      });
    },
    toggleMessageModal : function () { //FNC.events
      $('[data-message-modal-toggle="true"]').click(function (evt) {
        FNC.view.$messageModal.toggleClass('invisible');
      });
    },
    toggleTouchCounter : function () { //FNC.events
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
          FNC.model.setBoutAssignment(null);
          FNC.view.showVictor();
          return false;
        }
        FNC.view.$fencersOnStrip = $currentFencers;
        FNC.model.setBoutAssignment(FNC.view.$fencersOnStrip);
        FNC.view.assignFencerCells();
      });
    },
    initializeEvents : function () { //FNC.events
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

$(document).ready(function () {
  'use strict';
  FNC.model.initializeFencingData();
  FNC.model.getObjects();
  FNC.model.getTournaments();
  FNC.view.getObjects();
  FNC.events.initializeEvents();
});
