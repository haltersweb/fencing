//To get fencers from tournament
//add id to correct event table
//load jQuery

var fencerJSON = {},
      tableRows = $('#fencer tr.evenrow, #fencer tr.oddrow');
	  
tableRows.each(function(i) {
    tempDataArray = [];
    $(this).children('td').each(function(j,tdElem) {
        tempDataArray.push($(tdElem).text());
    });
    fencerJSON[i] = {name : tempDataArray[0], club : tempDataArray[1], rating : tempDataArray[2]};
});
