"use strict";

/**
 * This file defines a view which displays the remaining time for a move.
 */

/**
 * This constructs a new TimerView object.
 *
 * @param timer_view the element which displays the time.
 */
var TimerView = function (timer_view) {
  var self = this;
  this.timer_view = timer_view;
  this.listeners = [];
  this.emitTimeUp = function () {
    for (var i = 0; i < self.listeners.length; i++) {
      self.listeners[i]();
    }
  };
};

/**
 * This method starts the timer.
 *
 * @param duration the time for the timer to count down from in ms.
 */
TimerView.prototype.start = function (duration) {
  var self = this;
  var time_left = duration;
  this.reset(time_left);
  this.intervalId = window.setInterval(function () {
    time_left -= 1000;
    self.display(time_left);
    if (time_left <= 0) {
      window.clearInterval(self.intervalId);
      self.emitTimeUp();
    }
  }, 1000);
};

/**
 * This method resets the timer.
 *
 * @param time the time to display in ms.
 */
TimerView.prototype.reset = function (time) {
  if (this.intervalId) {
    window.clearInterval(this.intervalId);
    this.intervalId = null;
  }
  this.display(time);
};

/**
 * This method displays the specified time in the timer view.
 *
 * @param time the time to display given in ms.
 */
TimerView.prototype.display = function (time) {
  var minutes = Math.floor(time / 60000);
  minutes = (minutes < 10 ? "0" : "") + minutes;
  var seconds = Math.floor((time % 60000) / 1000);
  seconds = (seconds < 10 ? "0" : "") + seconds;

  this.timer_view.innerHTML = minutes + ":" + seconds;
};

/**
 * This method registers a time out listener.
 *
 * @param listener the listener to register.
 */
TimerView.prototype.registerListener = function (listener) {
  this.listeners.push(listener);
};

/**
 * This method de-registers a time out listener.
 *
 * @param listener the listener to de-register.
 */
TimerView.prototype.deregisterListener = function (listener) {
  var index = this.listeners.indexOf(listener);
  if (index >= 0) {
    this.listeners.splice(index, 1);
  }
};
