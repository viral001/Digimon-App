//rewritten pokedex code comes here
var dR = (function($) {
  //immediate stuff here
  var repository = [];
  var apiUrl = 'https://rickandmortyapi.com/api/character/?status=dead';
  var urlInfo = {pages: 1, next: apiUrl};

  //filter the repository by checking whether a given string in lowercase is part ...
  //of the value (in lowercase) of the name property of objects in the repository.
  //returns an array of objects whose name value correspond to the given string or an empty one
  function filterByName(inputNameString) {
  	return repository.filter(function (repositoryObj){
  		return repositoryObj.name.toLowerCase().indexOf(inputNameString.toLowerCase()) != -1;
  	})
  }

  function updateList(inputNameString)  {
    //clear list
    $('#data-list').empty();

    var filteredData = dR.filterByName(inputNameString);
    //add new results
    $.each(filteredData, function(i,obj ){
      dR.addListItem(obj);
    });

  }

  function updateUrl(info){
    urlInfo.pages = info.pages;
    urlInfo.next = info.next;
  }

  function add(mortuus){
    if (typeof(mortuus) === 'object') {
				repository.push(mortuus);
      } else {
        console.log('Please add an object');
      }
  }

  function getAll() {
    return repository;
  }

  function addListItem(mortuusObj) {
    //append a <li> with a <button> inside:
    $('#data-list').append('<li class="mortuus-list__item"><button class="list-item__button"></button></li>');
    //set button text and functionality:
    $('.list-item__button').last()
      .text(mortuusObj.name)
      .click(function(event){
        showDetails(mortuusObj);
      });
  }

  function urlReset() {
    urlInfo.next = apiUrl;
  }

  function loadList() {
    var d = $.Deferred();

    //if urlInfo.next is empty it will reset to the start
    if (!urlInfo.next){
      urlReset();
    }

    $.ajax(urlInfo.next, {
      method: 'GET',
      dataType: 'json',
      timeout: 4000
    }).then(function(response){
        //update the url
        var meta = response.info;
        updateUrl(meta);

        //iterate through the response:
        var results = response.results;
        $.each(results, function(i){
            var deadObj = {
              name: results[i].name,
              detailsUrl: results[i].url
              };
            add(deadObj);
            d.resolve();
          });
        }).catch(function(err){
          console.log('Sorry! Error: '+ err.statusText)
          d.reject();
      });
      return d.promise();
  }

  async function loadListRepeater() {
      for (i = 1; i < urlInfo.pages; i++) {
        const test = await loadList();
      }
  }

  function loadDetails(repositoryObject) {
    var d = $.Deferred();
    var url = repositoryObject.detailsUrl;

    $.ajax(url, {
      method: 'GET',
      dataType: 'json',
      timeout: 2000
    }).then( function(response) {
      repositoryObject.species = response.species;
      repositoryObject.gender = response.gender;
      repositoryObject.origin = response.origin.name;
      repositoryObject.location = response.location.name;
      repositoryObject.imageUrl = response.image;
      //success
      d.resolve();
    }).catch( function(err) {
      //failure
      console.log('Sorry! Error: '+ err.statusText);
      d.reject();
    })

    return d.promise();
  }

  function showDetails(mortuusObj) {
    loadDetails(mortuusObj).then(function() {
		  showModal(mortuusObj);
    })
  }

  //1. create a modal, 2. append children incl classes,
  // 3. add fixed content, 4. add flexible content, 5. show it all
  function showModal(mortuusObj) {
    // 1
    $('#modal-container')
      .empty()
      .append('<div class="modal"></div>');
    //2
    $('.modal')
        .append('<button class="modal-close">close</button>')
        .append('<h3 class="modal-title"></h3>')
        .append('<img class="modal-img">')
        .append('<p class="modal-birth"></p>')
        .append('<p class="modal-death"></p>')
        .append('<p class="modal-species"></p>');
    //3
    $('.modal-close').click(function() {hideModal();});
    $('.modal-title').text(mortuusObj.name);
    $('.modal-img').attr('src', mortuusObj.imageUrl);
    //4
    $('.modal-birth').text(getBirthText(mortuusObj));
    $('.modal-death').text(getDeathText(mortuusObj));
    $('.modal-species').text(getSpeciesText(mortuusObj));
    //5
    $('#modal-container').addClass('is-visible');
  }
  //modal EventListeners:
  $('#modal-container').click(function() {hideModal();});
  $(document).keydown(function (e) {
    if (e.key === "Escape") {
      hideModal();
    }
  })

  function hideModal() {
    $('#modal-container').removeClass('is-visible');
  }

  // modal-output modification:
  function getPossesivePronoun(mortuusObj) {
    if (mortuusObj.gender === "Female") {
      return "Her";
    } else if (mortuusObj.gender === "Male") {
      return "His";
    } else {
      return mortuusObj.name + '´s';
    }
  }

  function getBirthText(mortuusObj) {
    if (mortuusObj.origin === "unknown") {
      return mortuusObj.name + '´s birthplace is not known.';
    }
    return mortuusObj.name + ' recieved the gift of life on ' + mortuusObj.origin + '.';
  }

  function getDeathText(mortuusObj) {
    if (mortuusObj.location === "unknown") {
      return mortuusObj.name + ' went missing.';
    }
    return getPossesivePronoun(mortuusObj) + ' final place of rest is ' + mortuusObj.location + '.';
  }

  function getSpeciesText(mortuusObj) {
    if (mortuusObj.species === "unknown") {
      return getPossesivePronoun(mortuusObj)+ ' family values the time they had together.';
    }
    return getPossesivePronoun(mortuusObj)+ ' ' + mortuusObj.species +' family values the time they had together.';
  }
  //modal modification end

  function printList() {
    var repo = dR.getAll();
    $.each(repo, function(i,obj ){
      dR.addListItem(obj);
  });}

  $(document).ready(function(){
    //Starter:
    //1. Load the first 20 Items, then show them.
    //2. Only then load and show the rest.
    dR.loadList().then(function(){ //1.
      dR.printList();
    }).then(function(){ //2.
      dR.loadListRepeater().then(function(){
          dR.printList();
        });
      });
    //real time search function:
    $('.search').attr('oninput', 'dR.updateList(this.value)');
  //end $(document).ready :
  });

  return {
    printList: printList,
    updateList: updateList,
    filterByName: filterByName,
    showModal: showModal,
    updateUrl: updateUrl,
    showDetails: showDetails,
    addListItem: addListItem,
    getAll: getAll,
    loadList: loadList,
    loadListRepeater: loadListRepeater
  }
})(jQuery);
