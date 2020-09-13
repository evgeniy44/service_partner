"use strict";
window.odometerOptions = {
  auto: true, // Don't automatically initialize everything with class 'odometer'
  selector: '.number.animated-element', // Change the selector used to automatically find things to be animated
  format: '( ddd).dd', // Change how digit groups are formatted, and how many digits are shown after the decimal point
  duration: 1000, // Change how long the javascript expects the CSS animation to take
  theme: 'default', // Specify the theme (if you have more than one theme css file on the page)
  animation: 'count' // Count is a simpler animation method which just increments the value,
                     // use it when you're looking for something more subtle.
};
var map = null;
var marker = null;
var menu_position = null;
jQuery(document).ready(function($){
	//search form
	$(".search-container .template-search").on("click", function(event){
		event.preventDefault();
		$(this).parent().children(".search").toggle();
	});
	//mobile menu
	$("#header").on("click", ".mobile-menu-switch", function(event){
		event.preventDefault();
		if(!$(".mobile-menu").is(":visible"))
			$(".mobile-menu-divider").css("display", "block");
		$(".mobile-menu").slideToggle(500, function(){
			if(!$(".mobile-menu").is(":visible"))
				$(".mobile-menu-divider").css("display", "none");
		});
	});
	//header toggle
	$("#header-top-bar-container").on("click", ".header-toggle", function(event){
		event.preventDefault();
		$(this).prev().slideToggle();
		$(this).toggleClass("active");
	});

	//parallax
	if(!navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/))
		$(".parallax").parallax({
			speed: 100,
			startPosition: 0/*,
			startPosition: -1500*/
		});
	else
		$(".parallax").addClass("cover");

	$(".accordion.wide").on("accordionchange", function(event, ui){
		$("html, body").animate({scrollTop: $("#"+$(ui.newHeader).attr("id")).offset().top}, 400);
	});
	$(".tabs:not('.no-scroll')").on("tabsbeforeactivate", function(event, ui){
		$("html, body").animate({scrollTop: $("#"+$(ui.newTab).children("a").attr("id")).offset().top}, 400);
	});
	$(".tabs").tabs({
		event: 'change',
		show: true,
		create: function(){
			$("html, body").scrollTop(0);
		},
		activate: function(event, ui){
			ui.oldPanel.find("[name='submit'], [name='name'], [name='email'], [name='message']").qtip('hide');
		}
	});

	//hashchange
	$(window).on("hashchange", function(event){
		var hashSplit = $.param.fragment().split("-");
		var hashString = "";
		for(var i=0; i<hashSplit.length-1; i++)
			hashString = hashString + hashSplit[i] + (i+1<hashSplit.length-1 ? "-" : "");
		if(hashSplit[0].substr(0,7)!="filter=")
		{
			$('.ui-accordion .ui-accordion-header#accordion-' + decodeURIComponent($.param.fragment())).trigger("change");
			$('.ui-accordion .ui-accordion-header#accordion-' + decodeURIComponent(hashString)).trigger("change");
		}
		$('.tabs .ui-tabs-nav [href="#' + decodeURIComponent(hashString) + '"]').trigger("change");
		$('.tabs .ui-tabs-nav [href="#' + decodeURIComponent($.param.fragment()) + '"]').trigger("change");
		if(hashSplit[0].substr(0,7)!="filter=")
			$('.tabs .ui-accordion .ui-accordion-header#accordion-' + decodeURIComponent($.param.fragment())).trigger("change");
		$(".testimonials-list, .our-clients-list").trigger('configuration', ['debug', false, true]);
		$(document).scroll();
		
		if(hashSplit[0].substr(0,7)=="comment")
		{
			if($(location.hash).length)
			{
				var offset = $(location.hash).offset();
				$("html, body").animate({scrollTop: offset.top-10}, 400);
			}
		}
		
		// get options object from hash
		var hashOptions = $.deparam.fragment();

		if(hashSplit[0].substr(0,7)=="filter")
		{
			var filterClass = decodeURIComponent($.param.fragment()).substr(7, decodeURIComponent($.param.fragment()).length);
			// apply options from hash
			$(".isotope-filters a").removeClass("selected");
			if($('.isotope-filters a[href="#filter-' + filterClass + '"]').length)
				$('.isotope-filters a[href="#filter-' + filterClass + '"]').addClass("selected");
			else
				$(".isotope-filters li:first a").addClass("selected");
			
			$(".isotope").isotope({filter: (filterClass!="*" ? "." : "") + filterClass});
		}
	}).trigger("hashchange");
	
	$('body.dont-scroll').on("touchmove", {}, function(event){
	  event.preventDefault();
	});
	
	if($("#map").length)
	{
		//google map
		var coordinate = new google.maps.LatLng(51.112265,17.033787);
		var mapOptions = {
			zoom: 16,
			center: coordinate,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			streetViewControl: false,
			mapTypeControl: false,
			scrollwheel: parseInt($("#map").data("scroll-wheel"), 10),
			draggable: parseInt($("#map").data("draggable"), 10),
			styles: [ { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#8ccaf1" } ] },{ "featureType": "poi", "stylers": [ { "visibility": "off" } ] },{ "featureType": "transit", "stylers": [ { "visibility": "off" } ] },{ "featureType": "water", "elementType": "labels", "stylers": [ { "color": "#ffffff" }, { "visibility": "simplified" } ] } ]
		};
		
		
		map = new google.maps.Map(document.getElementById("map"),mapOptions);
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(51.112265,17.033787),
			map: map,
			icon: new google.maps.MarkerImage("images/map_pointer.png", new google.maps.Size(38, 48), null, new google.maps.Point(18, 48))
		});
	}
	
	//window resize
	function windowResize()
	{
		if(map!=null)
			map.setCenter(coordinate);
		$(".testimonials-list").trigger('configuration', ['debug', false, true]);

		if($(".re-smart-column").length && $(".header").width()>462)
		{
			var topOfWindow = $(window).scrollTop();
			$(".re-smart-column").each(function(){
				var row = $(this).parent();
				var wrapper = $(this).children().first();
				var childrenHeight = 0;
				wrapper.children().each(function(){
					childrenHeight += $(this).outerHeight(true);
				});
				if(childrenHeight<$(window).height() && row.offset().top-20<topOfWindow && row.offset().top-20+row.outerHeight()-childrenHeight>topOfWindow)
				{
					wrapper.css({"position": "fixed", "bottom": "auto", "top": "20px", "width": $(this).width() + "px"});
					$(this).css({"height": childrenHeight+"px"});
				}
				else if(childrenHeight<$(window).height() && row.offset().top-20+row.outerHeight()-childrenHeight<=topOfWindow && (row.outerHeight()-childrenHeight>0))
				{
					wrapper.css({"position": "absolute", "bottom": "0", "top": (row.outerHeight()-childrenHeight) + "px", "width": "auto"});
					$(this).css({"height": childrenHeight+"px"});
				}
				else if(childrenHeight>=$(window).height() && row.offset().top+20+childrenHeight<topOfWindow+$(window).height() && row.offset().top+20+row.outerHeight()>topOfWindow+$(window).height())
				{	
					wrapper.css({"position": "fixed", "bottom": "20px", "top": "auto", "width": $(this).width() + "px"});
					$(this).css({"height": childrenHeight+"px"});
				}
				else if(childrenHeight>=$(window).height() && row.offset().top+20+row.outerHeight()<=topOfWindow+$(window).height() && (row.outerHeight()-childrenHeight>0))
				{
					wrapper.css({"position": "absolute", "bottom": "0", "top": (row.outerHeight()-childrenHeight) + "px", "width": "auto"});
					$(this).css({"height": childrenHeight+"px"});
				}
				else
					wrapper.css({"position": "static", "bottom": "auto", "top": "auto", "width": "auto"});
			});
		}
		$(".our-clients-list").each(function(){
			var self = $(this);
			self.trigger("configuration", {
				items: {
					visible: ($(".header").width()>750 ? 6 : ($(".header").width()>462 ? 4 : 2))
				},
				scroll: {
					items: ($(".header").width()>750 ? 6 : ($(".header").width()>462 ? 4 : 2))
				},
				pagination: {
					items: ($(".header").width()>750 ? 6 : ($(".header").width()>462 ? 4 : 2))
				}
			});
		});
		if($(".header").width()>300)
		{
			if(!$(".header-top-bar").is(":visible"))
				$(".header-toggle").trigger("click");
		}
	}
	$(window).resize(windowResize);
	window.addEventListener('orientationchange', windowResize);	
	
	//scroll top
	$("a[href='#top']").on("click", function() {
		$("html, body").animate({scrollTop: 0}, "slow");
		return false;
	});
	
	//hint
	$(".comment-form input[type='text'], .contact-form input[type='text'], .comment-form textarea, .contact-form textarea, .search input[type='text'], .search_form input[type='text'], .cost-calculator-container input[placeholder]").hint();
	
	//reply scroll
	$(".comment-details .more").on("click", function(event){
		event.preventDefault();
		var offset = $("#comment-form").offset();
		$("html, body").animate({scrollTop: offset.top-90}, 400);
		$("#cancel-comment").css('display', 'inline');
	});
	
	//cancel comment button
	$("#cancel-comment").on("click", function(event){
		event.preventDefault();
		$(this).css('display', 'none');
	});
	
	//fancybox
	$(".prettyPhoto").prettyPhoto({
		show_title: false,
		slideshow: 3000,
		overlay_gallery: true,
		social_tools: ''
	});
	
	//contact form
	if($(".contact-form").length)
	{
		$(".contact-form").each(function(){
			$(this)[0].reset();
		});
	}
	$(".contact-form").submit(function(event){
		event.preventDefault();
		var data = $(this).serializeArray();
		var self = $(this);
		//if($(this).find(".total-cost").length)
		//	data.push({name: 'total-cost', value: $(this).find(".total-cost").val()});
		self.find(".block").block({
			message: false,
			overlayCSS: {
				opacity:'0.3',
				"backgroundColor": "#FFF"
			}
		});
		
		$.ajax({
			url: self.attr("action"),
			data: data,
			type: "post",
			dataType: "json",
			success: function(json){
				self.find("[name='submit'], [name='name'], [name='email'], [name='message']").qtip('destroy');
				if(typeof(json.isOk)!="undefined" && json.isOk)
				{
					if(typeof(json.submit_message)!="undefined" && json.submit_message!="")
					{
						self.find("[name='submit']").qtip(
						{
							style: {
								classes: 'ui-tooltip-success'
							},
							content: { 
								text: json.submit_message 
							},
							position: { 
								my: "right center",
								at: "left center" 
							}
						}).qtip('show');
						self[0].reset();
						self.find(".cost-slider-input").trigger("change");
						self.find(".cost-dropdown").selectmenu("refresh");
						self.find("input[type='text'], textarea").trigger("focus").trigger("blur");
					}
				}
				else
				{
					if(typeof(json.submit_message)!="undefined" && json.submit_message!="")
					{
						self.find("[name='submit']").qtip(
						{
							style: {
								classes: 'ui-tooltip-error'
							},
							content: { 
								text: json.submit_message 
							},
							position: { 
								my: "right center",
								at: "left center" 
							}
						}).qtip('show');
					}
					if(typeof(json.error_name)!="undefined" && json.error_name!="")
					{
						self.find("[name='name']").qtip(
						{
							style: {
								classes: 'ui-tooltip-error'
							},
							content: { 
								text: json.error_name 
							},
							position: { 
								my: "bottom center",
								at: "top center" 
							}
						}).qtip('show');
					}
					if(typeof(json.error_email)!="undefined" && json.error_email!="")
					{
						self.find("[name='email']").qtip(
						{
							style: {
								classes: 'ui-tooltip-error'
							},
							content: { 
								text: json.error_email 
							},
							position: { 
								my: "bottom center",
								at: "top center" 
							}
						}).qtip('show');
					}
					if(typeof(json.error_message)!="undefined" && json.error_message!="")
					{
						self.find("[name='message']").qtip(
						{
							style: {
								classes: 'ui-tooltip-error'
							},
							content: { 
								text: json.error_message 
							},
							position: { 
								my: "bottom center",
								at: "top center" 
							}
						}).qtip('show');
					}
				}
				self.find(".block").unblock();
			}
		});
	});

	if($(".header-container").hasClass("sticky"))
		menu_position = $(".header-container").offset().top;
	function animateElements()
	{
		$('.animated-element, .sticky, .re-smart-column').each(function(){
			var elementPos = $(this).offset().top;
			var topOfWindow = $(window).scrollTop();
			if($(this).hasClass("re-smart-column"))
			{
				var row = $(this).parent();
				var wrapper = $(this).children().first();
				var childrenHeight = 0;
				wrapper.children().each(function(){
					childrenHeight += $(this).outerHeight(true);
				});
				if(childrenHeight<$(window).height() && row.offset().top-20<topOfWindow && row.offset().top-20+row.outerHeight()-childrenHeight>topOfWindow)
				{
					wrapper.css({"position": "fixed", "bottom": "auto", "top": "20px", "width": $(this).width() + "px"});
					$(this).css({"height": childrenHeight+"px"});
				}
				else if(childrenHeight<$(window).height() && row.offset().top-20+row.outerHeight()-childrenHeight<=topOfWindow && (row.outerHeight()-childrenHeight>0))
				{
					wrapper.css({"position": "absolute", "bottom": "0", "top": (row.outerHeight()-childrenHeight) + "px", "width": "auto"});
					$(this).css({"height": childrenHeight+"px"});
				}
				else if(childrenHeight>=$(window).height() && row.offset().top+20+childrenHeight<topOfWindow+$(window).height() && row.offset().top+20+row.outerHeight()>topOfWindow+$(window).height())
				{	
					wrapper.css({"position": "fixed", "bottom": "20px", "top": "auto", "width": $(this).width() + "px"});
					$(this).css({"height": childrenHeight+"px"});
				}
				else if(childrenHeight>=$(window).height() && row.offset().top+20+row.outerHeight()<=topOfWindow+$(window).height() && (row.outerHeight()-childrenHeight>0))
				{
					wrapper.css({"position": "absolute", "bottom": "0", "top": (row.outerHeight()-childrenHeight) + "px", "width": "auto"});
					$(this).css({"height": childrenHeight+"px"});
				}
				else
					wrapper.css({"position": "static", "bottom": "auto", "top": "auto", "width": "auto"});
			}
			else if($(this).hasClass("sticky"))
			{
				if(menu_position!=null)
				{
					if(menu_position<topOfWindow)
						$(this).addClass("move");
					else
						$(this).removeClass("move");
				}
			}
			else if(elementPos<topOfWindow+$(window).height()-20) 
			{
				if($(this).hasClass("number") && !$(this).hasClass("progress") && $(this).is(":visible"))
				{
					var self = $(this);
					self.addClass("progress");
					if(typeof(self.data("value"))!="undefined")
					{
						var value = parseFloat(self.data("value").toString().replace(" ",""));
						self.text(0);
						self.text(value);
					}
				}
				else if(!$(this).hasClass("progress"))
				{
					var elementClasses = $(this).attr('class').split(' ');
					var animation = "fadeIn";
					var duration = 600;
					var delay = 0;
					if($(this).hasClass("scroll-top"))
					{
						if(topOfWindow<$(document).height()/2)
						{
							if($(this).hasClass("fadeIn") || $(this).hasClass("fadeOut"))
								animation = "fadeOut";
							else
								animation = "";
							$(this).removeClass("fadeIn")
						}
						else
							$(this).removeClass("fadeOut")
					}
					for(var i=0; i<elementClasses.length; i++)
					{
						if(elementClasses[i].indexOf('animation-')!=-1)
							animation = elementClasses[i].replace('animation-', '');
						if(elementClasses[i].indexOf('duration-')!=-1)
							duration = elementClasses[i].replace('duration-', '');
						if(elementClasses[i].indexOf('delay-')!=-1)
							delay = elementClasses[i].replace('delay-', '');
					}
					$(this).addClass(animation);
					$(this).css({"animation-duration": duration + "ms"});
					$(this).css({"animation-delay": delay + "ms"});
					$(this).css({"transition-delay": delay + "ms"});
				}
			}
		});
	}
	setTimeout(animateElements, 1);
	$(window).scroll(animateElements);
});