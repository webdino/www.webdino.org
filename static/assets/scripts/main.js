// Load fonts from Typekit
try { Typekit.load({ async: true }); } catch (ex) {}

// Load Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

// Track page view
ga('create', 'UA-6459738-14', 'auto');
ga('send', 'pageview');

window.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // Track outbound links
  [].forEach.call(document.querySelectorAll('a[href^="http"]'), function($link) {
    $link.addEventListener('click', function(event) {
      ga('send', 'event', 'Outbound Link', 'click', $link.href, {
        'transport': 'beacon',
        'hitCallback': function() { document.location = $link.href; }
      });

      // Fallback when the `hitCallback` function doesn't work for some reason
      window.setTimeout(function() { document.location = $link.href; }, 1000);

      event.preventDefault();
      event.stopPropagation();

      return false;
    });
  });

  // Activate mobile navigation UI
  function activate_drawer() {
    var $body = document.body;
    var $drawer = document.querySelector('#drawer');

    document.querySelector('#header .mobile[role="button"]').addEventListener('mousedown', function(event) {
      $body.classList.add('menu-expanded');
      $drawer.setAttribute('aria-expanded', 'true');
    });

    $drawer.querySelector('.mobile[role="button"]').addEventListener('mousedown', function(event) {
      $body.classList.remove('menu-expanded');
      $drawer.setAttribute('aria-expanded', 'false');
    });

    $drawer.addEventListener('mousedown', function(event) {
      if ($drawer.getAttribute('aria-expanded') === 'true') {
        $body.classList.remove('menu-expanded');
        $drawer.setAttribute('aria-expanded', 'false');
        event.stopPropagation();
      }
    });

    $drawer.querySelector('.inner').addEventListener('mousedown', function(event) {
      event.stopPropagation();
    });
  }

  // Activate Ajax form submission
  // https://www.netlify.com/docs/form-handling/#ajax-form-submissions
  function activate_contact_form() {
    var $form = document.querySelector('form[name="contact"]');

    if (!$form) {
      return;
    }

    $form.addEventListener('submit', function(event) {
      event.preventDefault();

      var data = [];
      var xhr = new XMLHttpRequest();
      var $main = $form.querySelector('.main');
      var $submit = $form.querySelector('.submit');
      var $thanks = $form.querySelector('.thanks');
      var $error = $form.querySelector('.error');

      $submit.querySelector('button').disabled = true;

      // Use an old-school way for IE
      for (var i = 0, elements = $form.querySelectorAll('[name]'); i < elements.length; i++) {
        if (elements[i].name === 'privacy') {
          continue;
        }

        data.push([encodeURIComponent(elements[i].name), encodeURIComponent(elements[i].value)].join('='))
      }

      xhr.addEventListener('load', function() { $thanks.hidden = false; $thanks.focus(); });
      xhr.addEventListener('error', function() { $error.hidden = false; $error.focus(); });
      xhr.addEventListener('abort', function() { $error.hidden = false; $error.focus(); });
      xhr.addEventListener('loadend', function() { $main.hidden = $submit.hidden = true; });
      xhr.open('POST', $form.action);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(data.join('&'));
    })
  }

  activate_drawer();
  activate_contact_form();
}, { once: true });
