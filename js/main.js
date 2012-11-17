$(function() {
	var $container = $('#pageImages');

	$container.isotope({
		itemSelector : '.page',
		layoutMode : 'masonry'
	});
});