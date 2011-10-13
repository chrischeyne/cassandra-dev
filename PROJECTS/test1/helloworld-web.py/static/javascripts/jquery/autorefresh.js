// -*- JavaScript -*-
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//                                   Jiao Lin
//                      California Institute of Technology
//                         (C) 2008 All Rights Reserved  
//
// {LicenseText}
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//


autorefresh = {};
autorefresh.seconds_remained = 0;

(function(d) {

  d.start = function (timeout) {
    d.seconds_remained = timeout;
    d.update();
  };
  
  d.update = function () {

    if (d.seconds_remained==1) {
      window.location.reload();
    } else {
      d.seconds_remained -= 1;
      window.status=timestr(d.seconds_remained);
      // wait 1 second to refresh
      setTimeout("autorefresh.update()",1000);
    }
  };

  // data
  d.seconds_remained = 0;

  // helpers
  function timestr(seconds) {
    curmin=Math.floor(seconds/60);
    cursec=seconds%60;
    if (curmin!=0)
      curtime=curmin+" minutes and "+cursec+" seconds left until page refresh!";
    else
      curtime=cursec+" seconds left until page refresh!";
    return curtime;
  }

 }) (autorefresh);

// End of file
