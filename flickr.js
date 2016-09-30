var PER_ROW = 3,
    base_endpoint = "https://api.flickr.com/services/rest/?api_key=a5e95177da353f58113fd60296e1d250&user_id=24662369@N07&format=json&nojsoncallback=1",
    search_endpoint = base_endpoint +"&method=flickr.photos.search&text=",
    expand_endpoint = base_endpoint +"&method=flickr.photos.getInfo&photo_id=",
    default_endpoint = base_endpoint +"&method=flickr.people.getPublicPhotos"

/**
 * Simple template replacement engine.
 *
 * @param values is a map containing key -> value pairs for the template
 * @param template is a String representation of the template.
 * @return String representation of the processed template.
 */
function generate(values, template) {
    var re = /\{\{([^%>]+)?\}\}/g, match

    while (match = re.exec(template)) {
        var value = values[match[1]]

        if (value) {
            // assert: contains replacement value
            template = template.replace(match[0], value)
        }
    }

    return template
}

function container() {
    return $("#search-container")
}

function currentPage() {
    return $('body').data('current-page')
}

function searchValue() {
    return $('#search-box').val()
}

function footer() {
    return $("footer")
}

/**
 * Construct a URL for the Flickr image.
 *
 * @param farmId
 * @param serverId
 * @param id
 * @param secret
 * @param size
 * @returns {string}
 */
function image(farmId, serverId, id, secret, size) {
    // size: s 75x75
    //       q 150x150
    //       z 640 on longest side
    //       - 500 on longest side
    //       o original
    return "https://farm"+ farmId +".staticflickr.com/"+ serverId
        +"/"+ id +"_"+ secret +"_"+ size +".jpg"
}

/**
 * Performs Flickr search and renders results.
 *
 * @param event represents the mouse event.
 */
function search(event) {
    container().empty()
    loading(true)

    _setPage(0)
    $.ajax({ url: url(searchValue(), 0) }).then(function(response) {
        render(response.photos.photo)
        footer().html(pager(currentPage(), response.photos.pages))
    })

    return false
}

/**
 * Helper function to build the request URL with the appropriate parameters.
 *
 * @param query optional search query
 * @param page to load
 * @returns {string}
 */
function url(query, page) {
    var result = (query) ? (search_endpoint + query) : default_endpoint

    if (page) {
        // append the page we're looking at.
        result += '&page='+ page
    }

    return result
}

function _setPage(page) {
    $('body').data('current-page', page)
}

/**
 * Called to render the specified page in the Flickr account
 *
 * @param page
 */
function loadPage(page) {
    _setPage(page)
    container().empty()
    loading(true)

    $.ajax({url: url(searchValue(), currentPage())}).then(function (response) {
        render(response.photos.photo)
        footer().html(pager(currentPage(), response.photos.pages))
    })
}

/**
 * Helper function to safely lookup a value in a specified object.
 *
 * @param path to value
 * @param object to look value up
 * @returns value or undefined if not found.
 */
function getIn(path, object) {
    var ref = object

    for (var i = 0; i < path.length && !!ref; i++) {
        // dig into the object to safely get a value.
        ref = ref[path[i]]
    }

    return ref
}

/**
 * Close the modal (if open).
 */
function close() {
    $('.modal').remove()
}

/**
 * Load extra information about the specified photo and display in the modal.
 *
 * @param photoId to load from Flickr.
 */
function getInfo(photoId) {
    loading(true)
    $.ajax({ url: expand_endpoint + photoId }).then(function(response) {
        loading(false)

        $('body').append(
            generate(
                {
                    title: getIn(['photo', 'title', '_content'], response),
                    description: getIn(['photo', 'description', '_content'], response),
                    taken: getIn(['photo', 'dates', 'taken'], response),
                    views: getIn(['photo', 'views'], response)
                },
                $('#description-modal').html()
            )
        )
    })
}

/**
 * Construct or update the pager at the bottom of the page.
 *
 * @param curentPage
 * @param size
 * @returns {*|jQuery|HTMLElement}
 */
function pager(curentPage, size) {
    var result = $('<div>')

    for (var i = 0; i < size; i++) {
        var selected = i === curentPage ? 'selected' : ''
        result.append('<a href="#" class="'+ selected +'" onclick="loadPage('+ i +')">'+ (i+1) +'</a>')
    }

    return result
}

/**
 * Called to render the specified array of photos in the content area.
 *
 * @param photos
 */
function render(photos) {
    loading(false)

    var template = $("#image-template").html(),
        results = $('<div>'), content

    hasResults(photos.length)

    for (var i = 0; i < photos.length; i++) {
        if (i % PER_ROW === 0) {
            // create a new row for images.
            content = $('<div class="row">')
            results.append(content)
        }

        var photo = photos[i]
        photo.url = image(photo.farm, photo.server, photo.id, photo.secret, 'q')
        content.append(generate(photo, template))
    }

    container().append(results)
}

/**
 * Helper function to show or hide the no results message.
 *
 * @param hide True if the no search results message should be hidden, otherwise false.
 */
function hasResults(hide) {
    if (hide) {
        // display the no search results message.
        $('#search-no-results').hide()
    } else {
        // ensure the no results message is hidden.
        $('#search-no-results').show()
    }
}

/**
 * Show or hide the loading indicator
 *
 * @param show
 */
function loading(show) {
    hasResults(true)

    if (show) {
        $('#loading').show()
    } else {
        $('#loading').hide()
    }
}

// todo: move this elsewhere
$.ajax({ url: url(searchValue(), currentPage()) }).then(function(response) {
    render(response.photos.photo)
    footer().html(pager(currentPage(), response.photos.pages))
})