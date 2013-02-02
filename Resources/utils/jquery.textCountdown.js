/* text version of countdown adapted from Martin Conte Mac Donell <Reflejo@gmail.com>
 * Dual licensed under the MIT and GPL licenses.
 * http://docs.jquery.com/License

 * startTime is the number of seconds the timer is for
 */
jQuery.fn.countdown = function(startTime, callback)
{
  var minutes, seconds, interval;
  var div = this;

  var formatTime = function(minutes, seconds) {
    var out = "";
    if (minutes < 10) out += "0";
    out += minutes + ":";
    if (seconds < 10) out += "0";
    out += seconds;
    return out;
  }

  // Starts the timer
  var setStart = function() 
  {
      minutes = Math.floor(startTime/60);
      seconds = startTime % 60;

      div.append(formatTime(minutes, seconds));
    }

  // Ticks the timer
  var moveStep = function() {
      seconds--;

      if (seconds == -1) {
        minutes--;
        seconds = 59;
      }
      else if (seconds == 0 && minutes == 0) {
        // do end of timer fcn
        callback();
        clearInterval(interval);
      }
      div.text(formatTime(minutes, seconds));
    }

  setStart();
  interval = setInterval(moveStep, 1000);
};
