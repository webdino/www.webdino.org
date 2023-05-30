window.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /**
   * Activate mobile navigation UI.
   */
  function activate_drawer() {
    var $body = document.body;
    var $drawer = document.querySelector('#drawer');

    document.querySelector('#header .mobile[role="button"]').addEventListener('mousedown', function (event) {
      $body.classList.add('menu-expanded');
      $drawer.setAttribute('aria-expanded', 'true');
    });

    $drawer.querySelector('.mobile[role="button"]').addEventListener('mousedown', function (event) {
      $body.classList.remove('menu-expanded');
      $drawer.setAttribute('aria-expanded', 'false');
    });

    $drawer.addEventListener('mousedown', function (event) {
      if ($drawer.getAttribute('aria-expanded') === 'true') {
        $body.classList.remove('menu-expanded');
        $drawer.setAttribute('aria-expanded', 'false');
        event.stopPropagation();
      }
    });

    $drawer.querySelector('.inner').addEventListener('mousedown', function (event) {
      event.stopPropagation();
    });
  }

  /**
   * Activate Ajax form submission
   * @see https://www.netlify.com/docs/form-handling/#ajax-form-submissions
   */
  function activate_contact_form() {
    var $form = document.querySelector('form[name="contact"]');

    if (!$form) {
      return;
    }

    $form.addEventListener('submit', function (event) {
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

        data.push([encodeURIComponent(elements[i].name), encodeURIComponent(elements[i].value)].join('='));
      }

      xhr.addEventListener('load', function () { $thanks.hidden = false; $thanks.focus(); });
      xhr.addEventListener('error', function () { $error.hidden = false; $error.focus(); });
      xhr.addEventListener('abort', function () { $error.hidden = false; $error.focus(); });
      xhr.addEventListener('loadend', function () { $main.hidden = $submit.hidden = true; });
      xhr.open('POST', $form.action);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(data.join('&'));
    });
  }

  /**
   * Activate the image zoom functionality on blog posts.
   */
  function activate_image_zoom() {
    // Skip IE support
    if (typeof NodeList.prototype.forEach !== 'function' || typeof Object.assign !== 'function') {
      return;
    }

    document.querySelectorAll('article.post figure img').forEach(function ($img) {
      $img.classList.add('can-zoom');

      $img.addEventListener('click', function () {
        const rect = $img.getBoundingClientRect();
        const $base = document.createElement('div');
        const $container = $base.appendChild(document.createElement('div'));
        const $_img = $container.appendChild($img.cloneNode(true));

        $base.classList.add('image-zoom-base');

        Object.assign($container.style, {
          top: rect.top + 'px',
          left: rect.left + 'px',
          width: rect.width + 'px',
          height: rect.height + 'px',
        });

        function onclick() {
          close();
        }

        function onkeydown(event) {
          if (event.key === 'Escape') {
            close();
          }
        }

        function close() {
          document.removeEventListener('keydown', onkeydown);
          $base.removeEventListener('click', onclick);
          $base.classList.remove('active');

          window.setTimeout(function () {
            document.body.removeChild($base);
            document.body.classList.remove('overlay-visible');
          }, 600);
        }

        document.addEventListener('keydown', onkeydown);
        $base.addEventListener('click', onclick);

        document.body.appendChild($base);
        document.body.classList.add('overlay-visible');

        window.setTimeout(function () {
          $base.classList.add('active');
        }, 100);
      });
    });
  }

  activate_drawer();
  activate_contact_form();
  activate_image_zoom();
}, { once: true });
