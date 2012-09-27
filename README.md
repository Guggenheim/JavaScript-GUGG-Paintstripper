Guggenheim Paintstripper
========================

## Usage

### Creating an object:

    $('.selector').paintstripper();

Because it can take a little while for the images to download and the 
Paintstripper object to be set up, it is probably best to hide the images or the 
entire object and display them when the window has loaded. For example:

CSS:

    .paintstripper img {
        visibility: hidden;
    }

Javascript:

    $(document).ready(function () {
        $('.paintstripper').paintstripper();
    });

    $(window).load(function () {
        $('.paintstripper img').css({visibility: 'visible'});
    });

Note: if you destroy the object the images will probably return to their hidden
state. If this is not what you want you will have to unhide them again after 
destruction.

#### Options:

* ```height```: Height for the object
* ```width```: Width for the object

Height and/or width will be determined from the element properties if they are
not passed as options.

Example:

    $('.selector').paintstripper({width: 500, height: 500});

### Methods

#### ```ratio```

    $('.selector').paintstripper('ratio');

The ratio by which the images have been resized from their original dimensions 
to fit into the Paintstripper object. For instance, if the Paintstripper object 
has a height and width of 200px, and the images have an original height of 
800px as their largest dimension, ```ratio``` will return 0.25.

#### ```max_zoom```

    $('.selector').paintstripper('max_zoom');

The maximum amount that the images may be zoomed based on the difference between
their original size and their resizing to fit within the Paintstripper object 
dimensions (i.e., the inverse of ```ratio```). For instance, if the 
Paintstripper object has a height and width of 200px, and the images have an 
original height of 800px as their largest dimension, ```max_zoom``` will 
return 4. 

Since the value returned is a ratio, multiple by 100 to express it as a 
percentage.

#### ```destroy```

    $('.selector').paintstripper('destroy');

When a Paintstripper object is destroyed all added elements are removed and 
original elements are returned to their original properties. For instance, if
the object was created with ```height``` and ```width``` options different from
its natural dimensions (or dimensions set by other CSS), after destruction the
element will return to those original dimensions.





