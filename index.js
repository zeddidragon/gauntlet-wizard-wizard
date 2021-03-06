const buttons = 'abxy'.split('')

const A = 0
const B = 1
const X = 2
const Y = 3

const delay = 1000 

function noop(){}

var combo = []
var timeout
var states = [false, false, false, false]
var selected
var cooldowns = []

var activeSpells = {}
const spells = {
  ice: {
    x: {
      name: 'Beam',
      cooldown: 0
    },
    y: {
      name: 'Achoo',
      cooldown: 3000
    },
    b: {
      name: 'Sphere',
      cooldown: 20000
    }
  },
  fire: {
    x: {
      name: 'Dodge',
      cooldown: 6000
    },
    y: {
      name: 'Bolt',
      cooldown: 0
    },
    b: {
      name: 'Mortar',
      cooldown: 2000
    }
  },
  lightning: {
    x: {
      name: 'Chain',
      cooldown: 0
    },
    y: {
      name: 'Blast',
      cooldown: 0
    },
    b: {
      name: 'Barrier',
      cooldown: 20000
    }
  },
  demon: {
    x: {
      name: 'Hellfire',
      cooldown: 0
    },
    y: {
      name: 'Searing',
      cooldown: 5000
    },
    b: {
      name: 'Orb',
      cooldown: 20000
    }
  },
  channeling: {
    x: {
      name: 'Rift',
      cooldown: 6000
    },
    y: {
      name: 'Repeater',
      cooldown: 0
    },
    b: {
      name: 'Barrage',
      cooldown: 10000
    }
  },
  void: {
    x: {
      name: 'Torrent',
      cooldown: 0
    },
    y: {
      name: 'Vaacum',
      cooldown: 8000
    },
    b: {
      name: 'Stealth',
      cooldown: 12000
    }
  },
}

spellbooks = {
  merlins: {
    x: 'ice',
    y: 'fire',
    b: 'lightning'
  },
  sinister: {
    x: 'demon',
    y: 'fire',
    b: 'lightning'
  },
  mystic: {
    x: 'ice',
    y: 'channeling',
    b: 'lightning'
  },
  hollow: {
    x: 'ice',
    y: 'fire',
    b: 'void'
  }
}

function wasPressed(pad, i) {
  var state = pad.buttons[i].value
  if(state && !states[i]) {
    return states[i] = true
  } else if(!state && states[i]) {
    states[i] = false
  }
}

function pollPad() {
  const pad = navigator.getGamepads()[0]

  if(Math.abs(pad.axes[2]) + Math.abs(pad.axes[3]) > 0.2 && selected) {
    // Make cooldown
    var parent = getNodeRaw(selected)
    var amount = activeSpells[selected[0]][selected[1]].cooldown
    if(cooldowns.indexOf(parent) < 0 && amount) {
      var cooldownbar;
      var cooldown = $('div', 'cooldown', [
        cooldownbar = $('div', 'bar')
      ])
      cooldownbar.setAttribute('style', 'animation-duration: ' + amount + 'ms;')
      parent.appendChild(cooldown)
      cooldowns.push(parent)
      setTimeout(function() {
        parent.removeChild(cooldown)
        cooldowns.splice(cooldowns.indexOf(parent), 1)
      }, amount)
    }
  }

  for(var i = 1; i < 5; i++) {
    var state = pad.buttons[i].value
    if(!wasPressed(pad, i)) continue
    combo.push(i)

    if(combo.length === 1) {
      // Flash school
      getNode(combo).classList.add('flash')
      var _combo = combo.slice(0)
      setTimeout(function() {
        getNode(_combo).classList.remove('flash')
      }, delay)
      timeout = setTimeout(function(){
        combo = []
      }, delay)
    } else if(combo.length === 2) {
      // Select spell
      clear('flash')
      clear('active')
      clearTimeout(timeout)
      getNode(combo).classList.add('active')
      selected = getButtons(combo)
      combo = []
    }
  }
}

function getButtons(combo) {
  return combo.map(function(btn){ return buttons[btn] })
}

function getNode(combo) {
  return getNodeRaw(getButtons(combo))
}

function getNodeRaw(combo) {
  var query = combo
    .map(function(btn) { return '.' + btn })
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

function $top() {
  return document.getElementById('top')
}

function $middle() {
  return document.getElementById('middle')
}

function $books() {
  return document.getElementById('books')
}

function reset() {
  $top().innerHTML = ''
  $middle().innerHTML = ''
}

function $(name, classes, content) {
  var ret = document.createElement(name)
  if(Array.isArray(content)) {
    for(var i = 0; i < content.length; i++) {
      ret.appendChild(content[i])
    }
  } else if(content) {
    ret.innerHTML = content
  }
  classes || (classes = [])
  if(!Array.isArray(classes)) classes = [classes]
  for(var i = 0; i < classes.length; i++)  {
    ret.classList.add(classes[i])
  }
  return ret
}

function structure(cls, name) {
  var struct = spells[name]
  return $('section', cls, [
    $('h3', null, name),
    $('div', ['buttons', cls], [
      $('div', 'row', [
        $('div', ['button', 'y'], struct.y.name)
      ]),
      $('div', 'row', [
        $('div', ['button', 'x'], struct.x.name),
        $('div', ['button', 'b'], struct.b.name)
      ])
    ])
  ])
}

function build(struct) {
  activeSpells = {
    x: spells[struct.x],
    y: spells[struct.y],
    b: spells[struct.b],
  }
  reset()
  $top().appendChild(structure('y', struct.y)) 
  $middle().appendChild(structure('x', struct.x)) 
  $middle().appendChild(structure('b', struct.b)) 
}

var books = ['merlins', 'sinister', 'mystic', 'hollow']
function buildMenu() {
  books.forEach(function(book){
    var btn = $('div', 'book', book)
    btn.setAttribute('name', book)
    btn.addEventListener('click', function() {
      selectSpellbook(book)
    })
    $books().appendChild(btn)
  })
}

function selectSpellbook(book) {
  var btn = document.querySelector('.book[name="' + book + '"]')
  clear('current')
  btn.classList.add('current')
  build(spellbooks[book])
  localStorage.setItem('spellbook', book)
}

function buildInstructions() {
  var node = document.getElementById('instructions')
  if(node) return
  var node = document.createElement('h2')
  node.id = 'instructions'
  node.textContent = 'Click in the window and use buttons until this text goes away.'
  document.body.appendChild(node)
}

function removeInstructions() {
  var instructions = document.getElementById('instructions')
  instructions && instructions.parentNode.removeChild(instructions)
  var error = document.getElementById('error')
  error && error.parentNode.removeChild(error)
}

function appendError(e) {
  var node = document.getElementById('error')
  if(node) return
  var node = document.createElement('h2')
  node.id = 'error'
  node.textContent = e.message
  document.body.appendChild(node)
}

function tryPoll() {
  try {
    pollPad()
    requestAnimationFrame(tryPoll)
    return true
  } catch(e) {
    console.error(e.stack)
    appendError(e)
    requestAnimationFrame(retry)
  }
}

function retry() {
  buildInstructions()
  if(tryPoll()) removeInstructions()
}


window.addEventListener('mousedown', function(e) {
  if(e.ctrlKey) {
    overwolf.windows.dragResize('MainWindow', 'BottomRight')
  } else {
    overwolf.windows.dragMove('MainWindow')
  }
})

window.addEventListener('mouseup', function() {
  isMoving = false
})

overwolf.windows.setTopmost('MainWindow', true, noop)


window.onload = function init() {
  buildMenu()
  selectSpellbook(localStorage.getItem('spellbook') || 'merlins')
  buildInstructions()
  retry()
}
