var FNC = FNC || (function () {
	var self = {};
	self.model = {};
	self.view = {};
	self.events = {};
	return self;
}());

FNC.model = {
	getObjects : function () {
		FNC.model.touches = {
			red : 0,
			green : 0
		};
		FNC.model.boutAssignment = {
			red : null,
			green : null
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
			for (key in FNC.model.boutAssignment) {
				if (FNC.model.boutAssignment.hasOwnProperty(key)) {
					FNC.model.boutAssignment[key] = null;
				}
			}
			return false;
		}
		$currentFencers.each(function (index) {
			FNC.model.boutAssignment[$(this).attr("data-strip-side")] = $(this).attr("data-fencer-seed");
		});
	}
};

FNC.view = {
	getObjects : function () {
		FNC.view.$modalScreen = $('.modal-screen');
		FNC.view.$messageModal = $('.message-modal');
		FNC.view.$touchCounter = $('.touch-counter');
		FNC.view.$touches = {
			red : $('[data-touches="red"]'),
			green : $('[data-touches="green"]')
		};
		FNC.view.$fencersOnStrip = {};
		FNC.view.$fencerScoreCell = {
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
		var red = FNC.model.boutAssignment.red,
			green = FNC.model.boutAssignment.green;
		FNC.view.$fencerScoreCell.red = $('#scoring-grid tbody tr:nth-child(' + red + ') td:nth-of-type(' + green + ')');
		FNC.view.$fencerScoreCell.green = $('#scoring-grid tbody tr:nth-child(' + green + ') td:nth-of-type(' + red + ')');
	},
	recordTouches : function (color) {
		FNC.view.$touches[color].text(FNC.model.touches[color]);
		//also show score on scoresheet
		
	}
};

FNC.events = {
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
			FNC.model.touches[color] += (($(this).hasClass('plus')) ? 1 : -1);
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


//bind plus to sibling counter
//bind minus to reverse sibling counter
//bind change to copy match to scoring paper

$(document).ready(function () {
	FNC.model.getObjects();
	FNC.model.getTournaments();
	FNC.view.getObjects();
	FNC.events.initializeEvents();
});
