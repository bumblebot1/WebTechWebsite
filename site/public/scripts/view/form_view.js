"use strict";

/**
 * This file defines a view which allows the user to send messages.
 */

/**
 * This constructs a new FormView object.
 *
 * @param model     the game model.
 * @param form      the element which contains the input elements.
 * @param messenger the messenger to send messages from.
 */
var FormView = function (model, form, messenger) {
  var input = form.querySelector("input[type='text']");
  var submit = form.querySelector("input[type='submit']");
  submit.addEventListener("click", function (event) {
    var player = model.currentPlayer;
    var body = input.value;

    var message = new MessageMessage(model.id, player, body);

    messenger.send(message);

    input.value = "";
    event.preventDefault();
    event.stopPropagation();
  });
};
