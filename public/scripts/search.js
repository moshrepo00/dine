$('#diner-search').on('input', function() {
  var search = $(this).serialize();
  if(search === "search=") {
    search = "all"
  }
  $.get('/diners?' + search, function(data) {
    $('#diner-grid').html('');
    data.forEach(function(diner) {
      $('#diner-grid').append(`
        <div class="col-md-3 col-sm-6">
          <div class="thumbnail">
            <img src="${ diner.image }">
            <div class="caption">
              <h4>${ diner.name }</h4>
            </div>
            <p>
              <a href="/diners/${ diner._id }" class="btn btn-primary">More Info</a>
            </p>
          </div>
        </div>
      `);
    });
  });
});

$('#diner-search').submit(function(event) {
  event.preventDefault();
});