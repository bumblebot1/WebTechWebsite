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
 * @param user_id   the id of the user sending messages.
 */
var FormView = function (model, form, messenger, user_id) {
  var self = this;
  this.model = model;
  this.user_id = user_id;

  var input = form.querySelector("input[type='text']");
  var submit = form.querySelector("input[type='submit']");
  submit.addEventListener("click", function (event) {
    var player = self.getPlayer();
    var body = input.value;

    var message = new MessageMessage(model.id, player, body);

    messenger.send(message);

    input.value = "";
    event.preventDefault();
    event.stopPropagation();
  });
};

/**
 * This method returns the player with the specified user_id.
 *
 * @return the player with the specified user_id.
 */
FormView.prototype.getPlayer = function () {
  if (!this.user_id) return this.model.currentPlayer;

  if (this.model.users[Colour["red"]].token_id == this.user_id)
    return this.model.users[Colour["red"]];
  else
    return this.model.users[Colour["white"]];
};
