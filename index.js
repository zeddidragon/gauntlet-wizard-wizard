const buttons = 'abxy'.split('')

const A = 0
const B = 1
const X = 2
const Y = 3

const delay = 500

var combo = []
var timeout
var states = [false, false, false, false]

function pollPad() {
  const pad = navigator.getGamepads()[0]
  for(var i = 1; i < 5; i++) {
    var state = pad.buttons[i].value
    if(state && !states[i]) {
      states[i] = true
    } else if(!state && states[i]) {
      states[i] = false
      continue
    } else {
      continue
    }
    combo.push(i)
    if(combo.length === 1) {
      getNode(combo).classList.add('flash')
      var _combo = combo.slice(0)
      setTimeout(function() {
        getNode(_combo).classList.remove('flash')
      }, delay)
      timeout = setTimeout(function(){
        combo = []
      }, delay)
    } else if(combo.length === 2) {
      clear('flash')
      clear('active')
      clearTimeout(timeout)
      getNode(combo).classList.add('active')
      combo = []
    }
  }
  window.requestAnimationFrame(pollPad)
}

function getNode(combo) {
  var query = combo
    .map(function(btn){ return '.' + buttons[btn] })
    .join(' ')
  return document.body.querySelector('.buttons' + query) ||
    document.getElementById('dummy')
}

function clear(cls) {
  const elements = document.body.querySelectorAll('.' + cls)
  for(var i = 0; i < elements.length; i++) {
    elements[i].classList.remove(cls)
  }
}

pollPad()
