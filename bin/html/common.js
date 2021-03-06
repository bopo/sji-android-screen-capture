function setTouchHandler(htmlImgElement, touchServerUrl) {
  setTimeout(function () {
    __prepareTouchServer(touchServerUrl, function/*on_ok*/() {
      htmlImgElement.touchServerUrl = touchServerUrl;
      if (!htmlImgElement.didInitEventHandler) {
        htmlImgElement.didInitEventHandler = true;
        __setTouchHandler(htmlImgElement);
      }
    }, 5/*retry times*/);
  }, 100);
}

function __prepareTouchServer(touchServerUrl, on_ok, retryCounter) {
  console.log('prepare touch server');
  $.ajax(touchServerUrl, {timeout: 10 * 1000})
      .done(function (result) {
        console.log('prepare touch server result: ' + result);
        if (result === 'OK') {
          on_ok();
        } else if (result === 'preparing' || result === 'device is not being live viewed') {
          if (retryCounter >= 2) {
            setTimeout(function () {
              __prepareTouchServer(touchServerUrl, on_ok, retryCounter - 1);
            }, 500);
          }
        }
      })
      .fail(function (jqXHR, textStatus) {
        console.log('prepare touch server error: ' + textStatus);
      });
}

function __setTouchHandler(htmlImgElement) {
  var $htmlImgElement = $(htmlImgElement);
  $htmlImgElement
      .on('mousedown', function (e) {
        saveOrSendMouseAction(e);
        $htmlImgElement.mousemove(function (e) {
          saveOrSendMouseAction(e);
        }).mouseout(function (e) {
              saveOrSendMouseAction(e);
              $htmlImgElement.unbind('mousemove').unbind('mouseout');
            });
      })
      .on('mouseup', function (e) {
        saveOrSendMouseAction(e);
        $htmlImgElement.unbind('mousemove').unbind('mouseout');
      })
      .on('dragstart', function () {
        return false; //disable drag
      })
  ;

  var evtAry = [];

  function saveOrSendMouseAction(e) {
    if (e.offsetX === undefined) {
      e.offsetX = e.clientX - $htmlImgElement.offset().left;
    }
    if (e.offsetY === undefined) {
      e.offsetY = e.clientY - $htmlImgElement.offset().top;
    }
    e.xPer = Math.max(0, e.offsetX / $htmlImgElement.outerWidth());
    e.yPer = Math.min(1, e.offsetY / $htmlImgElement.outerHeight());
    if (evtAry.length) {
      evtAry.push(e);
    } else {
      sendMouseAction(e);
    }
  }

  function sendMouseAction(e) {
    console.log('send touch event: ' + e.type + ' ' + e.xPer + ' ' + e.yPer);
    $.ajax(htmlImgElement.touchServerUrl + '&type=' + e.type.slice(5, 6)/*d:down, u:up: o:out, m:move*/ + '&x=' + e.xPer + '&y=' + e.yPer,
        {timeout: 2000})
        .done(function () {
          if ((e = evtAry.shift())) {
            if (e.type === 'mousemove') {
              //get latest mousemove
              var _e = e;
              do {
                if (_e.type === 'mousemove') {
                  e = _e;
                } else {
                  break;
                }
              }
              while ((_e = evtAry.shift()));
            }
            sendMouseAction(e);
          }
        })
        .fail(function (jqXHR, textStatus) {
          console.log('send touch event error: ' + textStatus);
          evtAry = [];
        })
  }
}

function rotateLocally(viewer) {
  'use strict';
  var j, clsAry = viewer.className.split(/ +/);
  if ((j = clsAry.indexOf('rotate90')) >= 0) {
    clsAry[j] = 'rotate270';
  } else if ((j = clsAry.indexOf('rotate270')) >= 0) {
    clsAry[j] = 'rotate180';
  } else if ((j = clsAry.indexOf('rotate180')) >= 0) {
    clsAry[j] = '';
  } else {
    clsAry.push('rotate90');
  }
  viewer.style.display = 'none';
  viewer.className = clsAry.join(' ');
  viewer.style.display = '';
}

function scaleLocally(viewerContainer) {
  'use strict';
  var j, clsAry = viewerContainer.className.split(/ +/);
  if ((j = clsAry.indexOf('scale50')) >= 0) {
    clsAry[j] = 'scale25';
  } else if ((j = clsAry.indexOf('scale25')) >= 0) {
    clsAry[j] = '';
  } else {
    clsAry.push('scale50');
  }
  viewerContainer.style.display = 'none';
  viewerContainer.className = clsAry.join(' ');
  viewerContainer.style.display = '';
}
